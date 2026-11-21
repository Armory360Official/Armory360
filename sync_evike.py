import json
import os
import re
import time
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

CATALOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "catalog.json")
BASE_URL = "https://evike.com"

CATEGORIES = {
    "1": {"k": "rifle", "l": "Airsoft Guns", "url": "https://evike.com/shop/21/"},
    "2": {"k": "parts", "l": "Parts & Accessories", "url": "https://evike.com/shop/28/"},
    "3": {"k": "tactical", "l": "Tactical & Apparel", "url": "https://evike.com/shop/30/"},
}

def load_catalog():
    if os.path.exists(CATALOG_FILE):
        with open(CATALOG_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else data.get("categories", [])
    return []

def save_catalog(data):
    with open(CATALOG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def scrape_category(start_url, max_pages=3):
    found = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1366, "height": 900})
        page = context.new_page()

        for page_num in range(1, max_pages + 1):
            url = f"{start_url}?page={page_num}"
            print(f"Opening page {page_num} in browser: {url}")
            page.goto(url, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(4000)  # allow Cloudflare check & products to render

            html = page.content()
            soup = BeautifulSoup(html, "html.parser")
            links = soup.select("a[href*='/products/']")
            new_on_page = 0

            for a in links:
                href = a.get("href", "")
                parts = [part for part in href.split("/") if part]
                if "products" not in parts:
                    continue
                idx = parts.index("products")
                if idx + 1 >= len(parts) or not parts[idx + 1].isdigit():
                    continue

                prod_id = int(parts[idx + 1])
                name = a.get_text(" ", strip=True)
                if not name or len(name) < 4 or prod_id in found:
                    continue

                price = 0.0
                img_url = ""
                card = a.find_parent(["div", "li", "article", "tr"])
                if card:
                    m = re.search(r"\$\s*([\d,]+\.\d{2})", card.get_text(" ", strip=True))
                    if m:
                        price = float(m.group(1).replace(",", ""))
                    img = card.find("img")
                    if img:
                        src = img.get("data-src") or img.get("src") or ""
                        if src and "blank" not in src.lower():
                            img_url = urljoin(BASE_URL, src)

                item = {
                    "id": prod_id,
                    "n": name,
                    "p": price,
                    "c": "#2b2e2a",
                    "url": f"{BASE_URL}/products/{prod_id}/",
                }
                if img_url:
                    item["image"] = img_url

                found[prod_id] = item
                new_on_page += 1

            print(f"  Found {new_on_page} products on page {page_num}.")
            if new_on_page == 0:
                break
            time.sleep(2.0)

        browser.close()
    return found

def main():
    print("\n=== Armory 360 Evike Catalog Sync (Browser Mode) ===")
    for num, info in CATEGORIES.items():
        print(f"  {num}: {info['l']}")
    choice = input("\nPick a category to sync (1, 2, or 3): ").strip()

    if choice not in CATEGORIES:
        print("Invalid choice.")
        return

    cat = CATEGORIES[choice]
    pages_in = input("How many pages to scan? (Enter 3 to test): ").strip()
    max_pages = int(pages_in) if pages_in.isdigit() and int(pages_in) > 0 else 3

    live_items = scrape_category(cat["url"], max_pages=max_pages)
    if not live_items:
        print("\n0 items returned. Existing catalog untouched.")
        return

    catalog = load_catalog()
    existing = next((c for c in catalog if c.get("k") == cat["k"]), None)
    old_map = {item["id"]: item for item in existing["i"]} if existing else {}

    merged = []
    added = 0
    for prod_id, fresh in live_items.items():
        if prod_id in old_map:
            kept = old_map[prod_id]
            kept["n"] = fresh["n"]
            if fresh["p"] > 0:
                kept["p"] = fresh["p"]
            if fresh.get("image") and not kept.get("image"):
                kept["image"] = fresh["image"]
            merged.append(kept)
        else:
            merged.append(fresh)
            added += 1

    removed = len(set(old_map.keys()) - set(live_items.keys()))

    if existing:
        existing["i"] = merged
    else:
        catalog.append({"k": cat["k"], "l": cat["l"], "i": merged})

    save_catalog(catalog)
    print(f"\nDone syncing {cat['l']}!")
    print(f"  Active items: {len(merged)} | Newly added: {added} | Removed: {removed}")
    print(f"  Saved to: {CATALOG_FILE}")

if __name__ == "__main__":
    main()