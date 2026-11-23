# ARMORY 360

**Build your battle-ready airsoft loadout in 3D.**

**Live Site:** [https://armory360official.github.io/Armory360/](https://armory360official.github.io/Armory360/)

---

## Overview

**Armory 360** is an interactive 3D airsoft loadout builder and gear configurator powered by Three.js. Users can customize a 3D player model by gender, height, weight, and tactical pose, test-fit helmets, eyewear, plate carriers, gloves, and airsoft replicas, and calculate their full kit total before purchasing directly through Evike.com.

---

## Key Features

* **Interactive 3D Loadout Viewer:** Real-time 360-degree camera orbit, zoom, and inspection built with Three.js (`GLTFLoader` & `AnimationMixer`).
* **Body & Gender Customization:** Toggle between Male and Female models with independent Height and Weight/Build sliders.
* **Tactical Pose Switcher:** Preview gear across multiple rigged stances including Idle, Firing Rifle, Strafe Right, Pistol Idle, Grenade Throw, Reloading, Prone Firing Rifle, and Prone Reloading.
* **Live Kit Cost Calculator:** Automatically totals equipped gear prices and links directly to product listings for checkout.
* **Dynamic Catalog Support:** Loads gear categories (`Airsoft Guns`, `Parts & Accessories`, `Tactical & Apparel`) via `catalog.json` with built-in fallback data.

---

## Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **3D Engine:** Three.js (`WebGLRenderer`, `OrbitControls`, `GLTFLoader`, `AnimationMixer`)
* **Hosting:** GitHub Pages
* **Catalog Tooling:** Python (`update_catalog.py`)

---

## Credits & Third-Party Attributions

* **3D Character Models:** Base human models used under [CC BY 4.0](https://creativecommons.org) (modified and rigged for web display; see site footer for full creator links).
* **Character Rigging & Poses:** Animated via [Mixamo](https://mixamo.com).
* **Retailer & Gear Data:** Product names, imagery, and checkout links reference [Evike.com](https://evike.com). Armory 360 is an independent loadout planning tool and is not officially affiliated with or endorsed by Evike.com unless explicitly stated.

---

## License & Copyright

Copyright (c) 2026 **Armory 360**. **All Rights Reserved.**

Unauthorized copying, modification, distribution, or commercial reuse of the custom source code, UI design, and original assets in this repository is strictly prohibited without prior written permission.
