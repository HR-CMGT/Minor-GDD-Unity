#!/usr/bin/env python3
"""
build_device_simulator_package.py
Generates official Unity 6 Device Simulator profiles (.device) for recent mobile devices (2020-2025)
and builds both:
1. A UPM Package folder: packages/nl.hr.gdd.devicesimulator.devices/
2. A standalone .unitypackage: projectfiles/mobile_devices_unity6_simulator.unitypackage
"""

import os
import sys
import json
import hashlib
import tarfile
import io
import time

PROJECT_ROOT = r"c:\Users\hicha\Desktop\HR"
UPM_PACKAGE_DIR = os.path.join(PROJECT_ROOT, "packages", "nl.hr.gdd.devicesimulator.devices")
DEVICES_DIR = os.path.join(UPM_PACKAGE_DIR, "Editor", "Devices")
UNITYPACKAGE_OUTPUT = os.path.join(PROJECT_ROOT, "projectfiles", "mobile_devices_unity6_simulator.unitypackage")

# Deterministic GUID generator from path
def generate_guid(seed_str: str) -> str:
    m = hashlib.md5()
    m.update(seed_str.encode('utf-8'))
    return m.hexdigest()

DEVICES = [
    # --- Apple iPhones (Dynamic Island) ---
    {
        "friendlyName": "Apple iPhone 16 Pro Max",
        "filename": "Apple iPhone 16 Pro Max.device",
        "width": 1320,
        "height": 2868,
        "dpi": 460.0,
        "navBar": 0,
        "type": "dynamic_island",
        "island_w": 250,
        "island_h": 75,
        "island_top_margin": 43,
        "safe_top": 136,
        "safe_bottom": 102,
        "safe_bottom_landscape": 63,
        "model": "iPhone17,2",
        "os": "iOS 18.0",
        "cpu": "Apple A18 Pro",
        "cpu_count": 6,
        "ram": 8192
    },
    {
        "friendlyName": "Apple iPhone 16 Pro",
        "filename": "Apple iPhone 16 Pro.device",
        "width": 1206,
        "height": 2622,
        "dpi": 460.0,
        "navBar": 0,
        "type": "dynamic_island",
        "island_w": 250,
        "island_h": 75,
        "island_top_margin": 43,
        "safe_top": 136,
        "safe_bottom": 102,
        "safe_bottom_landscape": 63,
        "model": "iPhone17,1",
        "os": "iOS 18.0",
        "cpu": "Apple A18 Pro",
        "cpu_count": 6,
        "ram": 8192
    },
    {
        "friendlyName": "Apple iPhone 16 / 15 / 15 Pro",
        "filename": "Apple iPhone 16.device",
        "width": 1179,
        "height": 2556,
        "dpi": 460.0,
        "navBar": 0,
        "type": "dynamic_island",
        "island_w": 250,
        "island_h": 75,
        "island_top_margin": 43,
        "safe_top": 136,
        "safe_bottom": 102,
        "safe_bottom_landscape": 63,
        "model": "iPhone17,3",
        "os": "iOS 18.0",
        "cpu": "Apple A18",
        "cpu_count": 6,
        "ram": 8192
    },
    {
        "friendlyName": "Apple iPhone 16 Plus / 15 Pro Max / 14 Pro Max",
        "filename": "Apple iPhone 16 Plus.device",
        "width": 1290,
        "height": 2796,
        "dpi": 460.0,
        "navBar": 0,
        "type": "dynamic_island",
        "island_w": 250,
        "island_h": 75,
        "island_top_margin": 43,
        "safe_top": 136,
        "safe_bottom": 102,
        "safe_bottom_landscape": 63,
        "model": "iPhone17,4",
        "os": "iOS 18.0",
        "cpu": "Apple A18",
        "cpu_count": 6,
        "ram": 8192
    },

    # --- Apple iPhones (Sensor Notch) ---
    {
        "friendlyName": "Apple iPhone 14 / 13 / 13 Pro",
        "filename": "Apple iPhone 14.device",
        "width": 1170,
        "height": 2532,
        "dpi": 460.0,
        "navBar": 0,
        "type": "notch",
        "notch_w": 350,
        "notch_h": 102,
        "safe_top": 132,
        "safe_bottom": 102,
        "safe_bottom_landscape": 63,
        "model": "iPhone14,7",
        "os": "iOS 16.0",
        "cpu": "Apple A15 Bionic",
        "cpu_count": 6,
        "ram": 6144
    },
    {
        "friendlyName": "Apple iPhone 12 / 12 Pro",
        "filename": "Apple iPhone 12 Pro.device",
        "width": 1170,
        "height": 2532,
        "dpi": 460.0,
        "navBar": 0,
        "type": "notch",
        "notch_w": 460,
        "notch_h": 102,
        "safe_top": 132,
        "safe_bottom": 102,
        "safe_bottom_landscape": 63,
        "model": "iPhone13,3",
        "os": "iOS 14.1",
        "cpu": "Apple A14 Bionic",
        "cpu_count": 6,
        "ram": 6144
    },
    {
        "friendlyName": "Apple iPhone 13 mini / 12 mini",
        "filename": "Apple iPhone 13 mini.device",
        "width": 1080,
        "height": 2340,
        "dpi": 476.0,
        "navBar": 0,
        "type": "notch",
        "notch_w": 370,
        "notch_h": 96,
        "safe_top": 130,
        "safe_bottom": 102,
        "safe_bottom_landscape": 63,
        "model": "iPhone14,4",
        "os": "iOS 15.0",
        "cpu": "Apple A15 Bionic",
        "cpu_count": 6,
        "ram": 4096
    },
    {
        "friendlyName": "Apple iPhone SE (3rd Gen)",
        "filename": "Apple iPhone SE 3rd Gen.device",
        "width": 750,
        "height": 1334,
        "dpi": 326.0,
        "navBar": 0,
        "type": "none",
        "safe_top": 40,
        "safe_bottom": 0,
        "safe_bottom_landscape": 0,
        "model": "iPhone14,6",
        "os": "iOS 15.4",
        "cpu": "Apple A15 Bionic",
        "cpu_count": 6,
        "ram": 4096
    },

    # --- Apple iPads ---
    {
        "friendlyName": "Apple iPad Pro 13-inch (M4)",
        "filename": "Apple iPad Pro 13 M4.device",
        "width": 2064,
        "height": 2752,
        "dpi": 264.0,
        "navBar": 0,
        "type": "tablet",
        "safe_inset": 48,
        "model": "iPad16,5",
        "os": "iPadOS 17.5",
        "cpu": "Apple M4",
        "cpu_count": 9,
        "ram": 8192
    },
    {
        "friendlyName": "Apple iPad Pro 11-inch (M4)",
        "filename": "Apple iPad Pro 11 M4.device",
        "width": 1668,
        "height": 2420,
        "dpi": 264.0,
        "navBar": 0,
        "type": "tablet",
        "safe_inset": 48,
        "model": "iPad16,3",
        "os": "iPadOS 17.5",
        "cpu": "Apple M4",
        "cpu_count": 9,
        "ram": 8192
    },
    {
        "friendlyName": "Apple iPad Air 11-inch (M2) / 10th Gen",
        "filename": "Apple iPad Air 11.device",
        "width": 1640,
        "height": 2360,
        "dpi": 264.0,
        "navBar": 0,
        "type": "tablet",
        "safe_inset": 44,
        "model": "iPad14,8",
        "os": "iPadOS 17.4",
        "cpu": "Apple M2",
        "cpu_count": 8,
        "ram": 8192
    },
    {
        "friendlyName": "Apple iPad mini (6th Gen)",
        "filename": "Apple iPad mini 6.device",
        "width": 1488,
        "height": 2266,
        "dpi": 326.0,
        "navBar": 0,
        "type": "tablet",
        "safe_inset": 40,
        "model": "iPad14,1",
        "os": "iPadOS 15.0",
        "cpu": "Apple A15 Bionic",
        "cpu_count": 6,
        "ram": 4096
    },

    # --- Samsung Galaxy Flagships ---
    {
        "friendlyName": "Samsung Galaxy S24 Ultra",
        "filename": "Samsung Galaxy S24 Ultra.device",
        "width": 1440,
        "height": 3120,
        "dpi": 505.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 96,
        "hole_top_margin": 28,
        "safe_top": 100,
        "safe_bottom": 50,
        "model": "SM-S928B",
        "os": "Android 14.0",
        "cpu": "Snapdragon 8 Gen 3",
        "cpu_count": 8,
        "ram": 12288
    },
    {
        "friendlyName": "Samsung Galaxy S24+ / S23+",
        "filename": "Samsung Galaxy S24 Plus.device",
        "width": 1440,
        "height": 3120,
        "dpi": 513.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 96,
        "hole_top_margin": 28,
        "safe_top": 100,
        "safe_bottom": 50,
        "model": "SM-S926B",
        "os": "Android 14.0",
        "cpu": "Snapdragon 8 Gen 3",
        "cpu_count": 8,
        "ram": 12288
    },
    {
        "friendlyName": "Samsung Galaxy S24 / S23 / S22",
        "filename": "Samsung Galaxy S24.device",
        "width": 1080,
        "height": 2340,
        "dpi": 416.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 80,
        "hole_top_margin": 24,
        "safe_top": 84,
        "safe_bottom": 44,
        "model": "SM-S921B",
        "os": "Android 14.0",
        "cpu": "Snapdragon 8 Gen 3",
        "cpu_count": 8,
        "ram": 8192
    },
    {
        "friendlyName": "Samsung Galaxy S21 Ultra / S20 Ultra",
        "filename": "Samsung Galaxy S21 Ultra.device",
        "width": 1440,
        "height": 3200,
        "dpi": 515.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 90,
        "hole_top_margin": 26,
        "safe_top": 98,
        "safe_bottom": 48,
        "model": "SM-G998B",
        "os": "Android 11.0",
        "cpu": "Exynos 2100",
        "cpu_count": 8,
        "ram": 12288
    },

    # --- Samsung Foldables ---
    {
        "friendlyName": "Samsung Galaxy Z Fold 6 / 5 (Unfolded Main)",
        "filename": "Samsung Galaxy Z Fold 6 Main.device",
        "width": 1812,
        "height": 2176,
        "dpi": 374.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 60,
        "hole_top_margin": 24,
        "hole_x_offset": 300,
        "safe_top": 70,
        "safe_bottom": 44,
        "model": "SM-F956B",
        "os": "Android 14.0",
        "cpu": "Snapdragon 8 Gen 3",
        "cpu_count": 8,
        "ram": 12288
    },
    {
        "friendlyName": "Samsung Galaxy Z Fold 6 / 5 (Cover Screen)",
        "filename": "Samsung Galaxy Z Fold 6 Cover.device",
        "width": 968,
        "height": 2376,
        "dpi": 410.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 80,
        "hole_top_margin": 24,
        "safe_top": 84,
        "safe_bottom": 44,
        "model": "SM-F956B",
        "os": "Android 14.0",
        "cpu": "Snapdragon 8 Gen 3",
        "cpu_count": 8,
        "ram": 12288
    },
    {
        "friendlyName": "Samsung Galaxy Z Flip 6 / 5 (Unfolded Main)",
        "filename": "Samsung Galaxy Z Flip 6.device",
        "width": 1080,
        "height": 2640,
        "dpi": 426.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 80,
        "hole_top_margin": 24,
        "safe_top": 88,
        "safe_bottom": 48,
        "model": "SM-F741B",
        "os": "Android 14.0",
        "cpu": "Snapdragon 8 Gen 3",
        "cpu_count": 8,
        "ram": 12288
    },

    # --- Samsung Mid-range ---
    {
        "friendlyName": "Samsung Galaxy A55 / A54 5G",
        "filename": "Samsung Galaxy A55.device",
        "width": 1080,
        "height": 2340,
        "dpi": 390.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 90,
        "hole_top_margin": 26,
        "safe_top": 88,
        "safe_bottom": 48,
        "model": "SM-A556B",
        "os": "Android 14.0",
        "cpu": "Exynos 1480",
        "cpu_count": 8,
        "ram": 8192
    },

    # --- Google Pixel ---
    {
        "friendlyName": "Google Pixel 9 Pro XL / 8 Pro",
        "filename": "Google Pixel 9 Pro XL.device",
        "width": 1344,
        "height": 2992,
        "dpi": 486.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 90,
        "hole_top_margin": 28,
        "safe_top": 96,
        "safe_bottom": 50,
        "model": "Pixel 9 Pro XL",
        "os": "Android 14.0",
        "cpu": "Google Tensor G4",
        "cpu_count": 8,
        "ram": 16384
    },
    {
        "friendlyName": "Google Pixel 9 / 8",
        "filename": "Google Pixel 9.device",
        "width": 1080,
        "height": 2424,
        "dpi": 428.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 84,
        "hole_top_margin": 26,
        "safe_top": 90,
        "safe_bottom": 48,
        "model": "Pixel 9",
        "os": "Android 14.0",
        "cpu": "Google Tensor G4",
        "cpu_count": 8,
        "ram": 12288
    },
    {
        "friendlyName": "Google Pixel 7 Pro / 6 Pro",
        "filename": "Google Pixel 7 Pro.device",
        "width": 1440,
        "height": 3120,
        "dpi": 512.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 90,
        "hole_top_margin": 28,
        "safe_top": 96,
        "safe_bottom": 48,
        "model": "Pixel 7 Pro",
        "os": "Android 13.0",
        "cpu": "Google Tensor G2",
        "cpu_count": 8,
        "ram": 12288
    },
    {
        "friendlyName": "Google Pixel 7a / 6a",
        "filename": "Google Pixel 7a.device",
        "width": 1080,
        "height": 2400,
        "dpi": 429.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 84,
        "hole_top_margin": 26,
        "safe_top": 88,
        "safe_bottom": 48,
        "model": "Pixel 7a",
        "os": "Android 13.0",
        "cpu": "Google Tensor G2",
        "cpu_count": 8,
        "ram": 8192
    },

    # --- Other Top Flagships ---
    {
        "friendlyName": "OnePlus 12",
        "filename": "OnePlus 12.device",
        "width": 1440,
        "height": 3168,
        "dpi": 510.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 90,
        "hole_top_margin": 28,
        "safe_top": 98,
        "safe_bottom": 48,
        "model": "CPH2581",
        "os": "Android 14.0",
        "cpu": "Snapdragon 8 Gen 3",
        "cpu_count": 8,
        "ram": 16384
    },
    {
        "friendlyName": "Xiaomi 14 / 14 Ultra",
        "filename": "Xiaomi 14 Ultra.device",
        "width": 1440,
        "height": 3200,
        "dpi": 522.0,
        "navBar": 0,
        "type": "punch_hole",
        "hole_size": 90,
        "hole_top_margin": 28,
        "safe_top": 98,
        "safe_bottom": 48,
        "model": "24030PN60G",
        "os": "Android 14.0",
        "cpu": "Snapdragon 8 Gen 3",
        "cpu_count": 8,
        "ram": 16384
    }
]

def build_orientations(d):
    w = d["width"]
    h = d["height"]
    dev_type = d["type"]

    p_cutouts = []
    l_cutouts_left = []
    l_cutouts_right = []

    if dev_type == "dynamic_island":
        cw = d["island_w"]
        ch = d["island_h"]
        margin_top = d["island_top_margin"]
        cx = (w - cw) / 2.0
        cy = h - margin_top - ch
        p_cutouts.append({
            "serializedVersion": "2",
            "x": float(round(cx, 1)),
            "y": float(round(cy, 1)),
            "width": float(cw),
            "height": float(ch)
        })

        # Landscape Left (rotated 90 CCW: top of phone is on left)
        l_cutouts_left.append({
            "serializedVersion": "2",
            "x": float(margin_top),
            "y": float(round((w - cw) / 2.0, 1)),
            "width": float(ch),
            "height": float(cw)
        })

        # Landscape Right (rotated 90 CW: top of phone is on right)
        l_cutouts_right.append({
            "serializedVersion": "2",
            "x": float(round(h - margin_top - ch, 1)),
            "y": float(round((w - cw) / 2.0, 1)),
            "width": float(ch),
            "height": float(cw)
        })

    elif dev_type == "notch":
        cw = d["notch_w"]
        ch = d["notch_h"]
        cx = (w - cw) / 2.0
        cy = h - ch
        p_cutouts.append({
            "serializedVersion": "2",
            "x": float(round(cx, 1)),
            "y": float(round(cy, 1)),
            "width": float(cw),
            "height": float(ch)
        })

        l_cutouts_left.append({
            "serializedVersion": "2",
            "x": 0.0,
            "y": float(round((w - cw) / 2.0, 1)),
            "width": float(ch),
            "height": float(cw)
        })

        l_cutouts_right.append({
            "serializedVersion": "2",
            "x": float(round(h - ch, 1)),
            "y": float(round((w - cw) / 2.0, 1)),
            "width": float(ch),
            "height": float(cw)
        })

    elif dev_type == "punch_hole":
        size = d["hole_size"]
        margin_top = d["hole_top_margin"]
        x_offset = d.get("hole_x_offset", 0)
        cx = (w - size) / 2.0 + x_offset
        cy = h - margin_top - size
        p_cutouts.append({
            "serializedVersion": "2",
            "x": float(round(cx, 1)),
            "y": float(round(cy, 1)),
            "width": float(size),
            "height": float(size)
        })

        l_cutouts_left.append({
            "serializedVersion": "2",
            "x": float(margin_top),
            "y": float(round(cx, 1)),
            "width": float(size),
            "height": float(size)
        })

        l_cutouts_right.append({
            "serializedVersion": "2",
            "x": float(round(h - margin_top - size, 1)),
            "y": float(round(cx, 1)),
            "width": float(size),
            "height": float(size)
        })

    # Safe areas
    if dev_type == "tablet":
        safe_inset = d["safe_inset"]
        p_safe = {
            "serializedVersion": "2",
            "x": 0.0,
            "y": float(safe_inset),
            "width": float(w),
            "height": float(h - (safe_inset * 2))
        }
        l_safe = {
            "serializedVersion": "2",
            "x": 0.0,
            "y": float(safe_inset),
            "width": float(h),
            "height": float(w - (safe_inset * 2))
        }
    elif dev_type == "none":
        safe_top = d["safe_top"]
        p_safe = {
            "serializedVersion": "2",
            "x": 0.0,
            "y": 0.0,
            "width": float(w),
            "height": float(h - safe_top)
        }
        l_safe = {
            "serializedVersion": "2",
            "x": 0.0,
            "y": 0.0,
            "width": float(h),
            "height": float(w)
        }
    else:
        safe_top = d["safe_top"]
        safe_bottom = d["safe_bottom"]
        safe_bottom_ls = d.get("safe_bottom_landscape", 0)

        p_safe = {
            "serializedVersion": "2",
            "x": 0.0,
            "y": float(safe_bottom),
            "width": float(w),
            "height": float(h - safe_top - safe_bottom)
        }

        l_safe = {
            "serializedVersion": "2",
            "x": float(safe_top),
            "y": float(safe_bottom_ls),
            "width": float(h - (2 * safe_top)),
            "height": float(w - safe_bottom_ls)
        }

    return [
        {
            "orientation": 1,
            "safeArea": p_safe,
            "cutouts": p_cutouts
        },
        {
            "orientation": 3,
            "safeArea": l_safe,
            "cutouts": l_cutouts_left
        },
        {
            "orientation": 4,
            "safeArea": l_safe,
            "cutouts": l_cutouts_right
        }
    ]

def generate_device_json(d):
    orientations = build_orientations(d)
    device_obj = {
        "friendlyName": d["friendlyName"],
        "version": 1,
        "screens": [
            {
                "width": d["width"],
                "height": d["height"],
                "navigationBarHeight": d["navBar"],
                "dpi": float(d["dpi"]),
                "orientations": orientations
            }
        ],
        "systemInfo": {
            "deviceModel": d["model"],
            "deviceType": 1,
            "operatingSystem": d["os"],
            "processorCount": d["cpu_count"],
            "processorType": d["cpu"],
            "supportsAccelerometer": True,
            "supportsAudio": True,
            "supportsGyroscope": True,
            "supportsLocationService": True,
            "supportsVibration": True,
            "systemMemorySize": d["ram"]
        }
    }
    return device_obj

def generate_meta_file(guid: str, is_folder: bool = False) -> str:
    if is_folder:
        return f"""fileFormatVersion: 2
guid: {guid}
folderAsset: yes
DefaultImporter:
  externalObjects: {{}}
  userData: 
  assetBundleName: 
  assetBundleVariant: 
"""
    else:
        return f"""fileFormatVersion: 2
guid: {guid}
TextScriptImporter:
  externalObjects: {{}}
  userData: 
  assetBundleName: 
  assetBundleVariant: 
"""

def generate_cs_meta_file(guid: str) -> str:
    return f"""fileFormatVersion: 2
guid: {guid}
MonoImporter:
  externalObjects: {{}}
  serializedVersion: 2
  defaultReferences: []
  executionOrder: 0
  icon: {{instanceID: 0}}
  userData: 
  assetBundleName: 
  assetBundleVariant: 
"""

def generate_asmdef_meta_file(guid: str) -> str:
    return f"""fileFormatVersion: 2
guid: {guid}
AssemblyDefinitionImporter:
  externalObjects: {{}}
  userData: 
  assetBundleName: 
  assetBundleVariant: 
"""

def create_upm_files():
    os.makedirs(DEVICES_DIR, exist_ok=True)
    editor_dir = os.path.join(UPM_PACKAGE_DIR, "Editor")
    os.makedirs(editor_dir, exist_ok=True)

    # 1. package.json
    pkg_json = {
        "name": "nl.hr.gdd.devicesimulator.devices",
        "displayName": "HR-CMGT Mobile Device Simulator Profiles (2020-2025)",
        "version": "1.0.0",
        "unity": "6000.0",
        "unityRelease": "0b1",
        "description": "Comprehensive mobile device profiles for Unity 6 Device Simulator featuring recent flagships (Apple iPhone 12-16, iPads, Samsung Galaxy S20-S24, Z-Fold/Flip, Google Pixel 6-9, OnePlus, Xiaomi) with exact resolutions, DPIs, safe areas, Dynamic Islands, notches, and punch-hole cutouts.",
        "keywords": [
            "device simulator",
            "mobile",
            "ios",
            "android",
            "safe area",
            "notch",
            "dynamic island",
            "hr-cmgt",
            "gdd"
        ],
        "category": "Mobile Simulation",
        "author": {
            "name": "HR-CMGT Game Development",
            "url": "https://github.com/HR-CMGT/Minor-GDD-Unity"
        }
    }
    with open(os.path.join(UPM_PACKAGE_DIR, "package.json"), "w", encoding="utf-8") as f:
        json.dump(pkg_json, f, indent=2)

    # 2. README.md
    readme_content = """# HR-CMGT Mobile Device Simulator Profiles (2020–2025)

Ready-to-use device simulation profiles for **Unity 6 (6000.x)** and Unity 2022/2021 **Device Simulator**.

### Included Devices (26 Flagship Profiles)
- **Apple iOS**:
  - iPhone 16 Pro Max, iPhone 16 Pro, iPhone 16 / 15 / 15 Pro, iPhone 16 Plus / 15 Pro Max
  - iPhone 14 / 13 / 13 Pro, iPhone 12 / 12 Pro, iPhone 13 mini / 12 mini, iPhone SE (3rd Gen)
- **Apple iPadOS**:
  - iPad Pro 13" (M4), iPad Pro 11" (M4), iPad Air 11" (M2) / 10th Gen, iPad mini 6
- **Samsung Galaxy**:
  - Galaxy S24 Ultra, S24+, S24 / S23 / S22, S21 Ultra / S20 Ultra
  - Galaxy Z Fold 6 / 5 (Unfolded Main & Cover Screen), Galaxy Z Flip 6 / 5
  - Galaxy A55 / A54 5G (mid-range standard)
- **Google Pixel**:
  - Pixel 9 Pro XL / 8 Pro, Pixel 9 / 8, Pixel 7 Pro / 6 Pro, Pixel 7a / 6a
- **Other Flagships**:
  - OnePlus 12, Xiaomi 14 / 14 Ultra

### Features
- **Accurate Screen Specs**: Exact physical pixel resolutions and DPIs.
- **Hardware Cutouts**: Dynamic Islands (iPhone 14-16 Pro/Standard), Sensor Notches (iPhone 12-14), and Centered Punch-Holes (Samsung, Pixel, OnePlus, Xiaomi).
- **Safe Area Insets**: Calculated `Screen.safeArea` bounds for Portrait, Landscape Left, and Landscape Right orientations.
- **Auto-Registration**: Automatically configures Unity Editor Preferences on import so devices appear immediately in the Simulator dropdown.

### How to Use
1. Open the Game view and toggle the mode from **Game** to **Simulator**.
2. Select any device from the top-left dropdown.
3. Test rotation, safe area fitters, and UI anchor responsiveness!
"""
    with open(os.path.join(UPM_PACKAGE_DIR, "README.md"), "w", encoding="utf-8") as f:
        f.write(readme_content)

    # 3. asmdef in Editor/
    asmdef_content = {
        "name": "nl.hr.gdd.devicesimulator.devices.Editor",
        "rootNamespace": "HRCMGT.DeviceSimulator",
        "references": [],
        "includePlatforms": [
            "Editor"
        ],
        "excludePlatforms": [],
        "allowUnsafeCode": False,
        "overrideReferences": False,
        "precompiledReferences": [],
        "autoReferenced": True,
        "defineConstraints": [],
        "versionDefines": [],
        "noEngineReferences": False
    }
    with open(os.path.join(editor_dir, "nl.hr.gdd.devicesimulator.devices.Editor.asmdef"), "w", encoding="utf-8") as f:
        json.dump(asmdef_content, f, indent=2)

    # 4. DeviceSimulatorAutoConfig.cs in Editor/
    auto_config_cs = """using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

namespace HRCMGT.DeviceSimulator
{
    /// <summary>
    /// Automatically discovers and configures custom mobile device profiles for Unity 6 Device Simulator.
    /// Provides verification and quick-access menu items.
    /// </summary>
    [InitializeOnLoad]
    public static class DeviceSimulatorAutoConfig
    {
        private const string PrefKeyDeviceDirectory = "DeviceSimulator.DeviceDirectory";
        private const string InitializedPrefKey = "HRCMGT_DeviceSimulator_Initialized_v1";

        static DeviceSimulatorAutoConfig()
        {
            EditorApplication.delayCall += InitializeOnStartup;
        }

        private static void InitializeOnStartup()
        {
            if (EditorPrefs.GetBool(InitializedPrefKey, false)) return;

            string foundPath = FindDevicesDirectory();
            if (!string.IsNullOrEmpty(foundPath))
            {
                // If Unity preference isn't set yet, configure it to our folder
                string currentPref = EditorPrefs.GetString(PrefKeyDeviceDirectory, "");
                if (string.IsNullOrEmpty(currentPref) || !Directory.Exists(currentPref))
                {
                    EditorPrefs.SetString(PrefKeyDeviceDirectory, foundPath);
                }

                int count = Directory.GetFiles(foundPath, "*.device", SearchOption.AllDirectories).Length;
                Debug.Log($"<color=#4CAF50><b>[HR-CMGT Device Simulator]</b></color> Successfully configured {count} modern mobile device profiles (2020-2025) for Unity Device Simulator! Open the Simulator view in your Game Window to test.");
                EditorPrefs.SetBool(InitializedPrefKey, true);
            }
        }

        public static string FindDevicesDirectory()
        {
            // 1. Check standard Assets location
            string assetsPath = Path.Combine(Application.dataPath, "Editor", "Devices");
            if (Directory.Exists(assetsPath)) return assetsPath;

            string hrAssetsPath = Path.Combine(Application.dataPath, "HR-CMGT", "DeviceSimulator", "Devices");
            if (Directory.Exists(hrAssetsPath)) return hrAssetsPath;

            // 2. Search anywhere in project or packages
            string[] matchingDirs = Directory.GetDirectories(Application.dataPath, "Devices", SearchOption.AllDirectories);
            if (matchingDirs.Length > 0) return matchingDirs[0];

            string packagesPath = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "Packages"));
            if (Directory.Exists(packagesPath))
            {
                string[] pkgDirs = Directory.GetDirectories(packagesPath, "Devices", SearchOption.AllDirectories);
                if (pkgDirs.Length > 0) return pkgDirs[0];
            }

            return null;
        }

        [MenuItem("Tools/HR-CMGT/Mobile Device Simulator/Verify & Reload Device Profiles", priority = 10)]
        public static void VerifyDevices()
        {
            string dir = FindDevicesDirectory();
            if (string.IsNullOrEmpty(dir))
            {
                EditorUtility.DisplayDialog(
                    "Device Simulator Profiles",
                    "Could not find the 'Devices' directory in Assets or Packages.\\nPlease make sure the package or .device files are imported.",
                    "OK"
                );
                return;
            }

            string[] files = Directory.GetFiles(dir, "*.device", SearchOption.AllDirectories);
            EditorPrefs.SetString(PrefKeyDeviceDirectory, dir);

            string message = $"Found {files.Length} modern device profiles in:\\n{dir}\\n\\n" +
                             "Profiles include:\\n" +
                             "- Apple iPhone 12-16 series (Dynamic Island & Notches)\\n" +
                             "- Apple iPad Pro & Air (M2/M4)\\n" +
                             "- Samsung Galaxy S20-S24 Ultra & Fold/Flip\\n" +
                             "- Google Pixel 6-9 Pro\\n" +
                             "- OnePlus 12 & Xiaomi 14 Ultra\\n\\n" +
                             "Configured Unity Device Simulator preference successfully!";

            Debug.Log($"<color=#4CAF50><b>[HR-CMGT Device Simulator]</b></color> Verified {files.Length} device profiles.");
            EditorUtility.DisplayDialog("HR-CMGT Device Simulator Ready!", message, "Awesome");
        }

        [MenuItem("Tools/HR-CMGT/Mobile Device Simulator/Open Simulator Window", priority = 11)]
        public static void OpenSimulatorWindow()
        {
            // Open Simulator window or focus Game view
            EditorApplication.ExecuteMenuItem("Window/General/Device Simulator");
        }
    }
}
"""
    with open(os.path.join(editor_dir, "DeviceSimulatorAutoConfig.cs"), "w", encoding="utf-8") as f:
        f.write(auto_config_cs)

    # 5. Generate each .device file
    print(f"Writing {len(DEVICES)} device profiles to {DEVICES_DIR}...")
    for dev in DEVICES:
        data = generate_device_json(dev)
        out_path = os.path.join(DEVICES_DIR, dev["filename"])
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"  + {dev['filename']} ({dev['width']}x{dev['height']})")

    # Generate meta files for UPM package
    with open(os.path.join(UPM_PACKAGE_DIR, "package.json.meta"), "w", encoding="utf-8") as f:
        f.write(generate_meta_file(generate_guid("package.json")))
    with open(os.path.join(UPM_PACKAGE_DIR, "README.md.meta"), "w", encoding="utf-8") as f:
        f.write(generate_meta_file(generate_guid("README.md")))
    with open(os.path.join(UPM_PACKAGE_DIR, "Editor.meta"), "w", encoding="utf-8") as f:
        f.write(generate_meta_file(generate_guid("Editor"), is_folder=True))
    with open(os.path.join(editor_dir, "Devices.meta"), "w", encoding="utf-8") as f:
        f.write(generate_meta_file(generate_guid("Editor/Devices"), is_folder=True))
    with open(os.path.join(editor_dir, "DeviceSimulatorAutoConfig.cs.meta"), "w", encoding="utf-8") as f:
        f.write(generate_cs_meta_file(generate_guid("Editor/DeviceSimulatorAutoConfig.cs")))
    with open(os.path.join(editor_dir, "nl.hr.gdd.devicesimulator.devices.Editor.asmdef.meta"), "w", encoding="utf-8") as f:
        f.write(generate_asmdef_meta_file(generate_guid("Editor/asmdef")))

    for dev in DEVICES:
        dev_file = os.path.join(DEVICES_DIR, dev["filename"])
        meta_file = dev_file + ".meta"
        with open(meta_file, "w", encoding="utf-8") as f:
            f.write(generate_meta_file(generate_guid("device_" + dev["filename"])))

    print("UPM Package generated successfully!")

def build_unitypackage():
    """
    Constructs a valid .unitypackage (.tar.gz) containing all 26 device profiles and editor script
    targeted to Assets/Editor/Devices/ and Assets/Editor/HR-CMGT/
    """
    print(f"Building .unitypackage: {UNITYPACKAGE_OUTPUT}...")
    os.makedirs(os.path.dirname(UNITYPACKAGE_OUTPUT), exist_ok=True)

    items = []

    # Parent folder Assets/Editor (MUST be present so PackageImportTreeView can compute enabled state without NRE)
    items.append({
        "pathname": "Assets/Editor",
        "guid": generate_guid("Assets/Editor"),
        "is_dir": True,
        "meta": generate_meta_file(generate_guid("Assets/Editor"), is_folder=True),
        "content": None
    })
    items.append({
        "pathname": "Assets/Editor/Devices",
        "guid": generate_guid("Assets/Editor/Devices"),
        "is_dir": True,
        "meta": generate_meta_file(generate_guid("Assets/Editor/Devices"), is_folder=True),
        "content": None
    })
    items.append({
        "pathname": "Assets/Editor/HR-CMGT",
        "guid": generate_guid("Assets/Editor/HR-CMGT"),
        "is_dir": True,
        "meta": generate_meta_file(generate_guid("Assets/Editor/HR-CMGT"), is_folder=True),
        "content": None
    })

    # Auto config script
    editor_dir = os.path.join(UPM_PACKAGE_DIR, "Editor")
    with open(os.path.join(editor_dir, "DeviceSimulatorAutoConfig.cs"), "rb") as f:
        cs_bytes = f.read()
    items.append({
        "pathname": "Assets/Editor/HR-CMGT/DeviceSimulatorAutoConfig.cs",
        "guid": generate_guid("Assets/Editor/HR-CMGT/DeviceSimulatorAutoConfig.cs"),
        "is_dir": False,
        "meta": generate_cs_meta_file(generate_guid("Assets/Editor/HR-CMGT/DeviceSimulatorAutoConfig.cs")),
        "content": cs_bytes
    })

    # Device files
    for dev in DEVICES:
        dev_json = generate_device_json(dev)
        content_bytes = json.dumps(dev_json, indent=2).encode('utf-8')
        rel_path = f"Assets/Editor/Devices/{dev['filename']}"
        items.append({
            "pathname": rel_path,
            "guid": generate_guid(rel_path),
            "is_dir": False,
            "meta": generate_meta_file(generate_guid(rel_path), is_folder=False),
            "content": content_bytes
        })

    # Sort items by pathname so parents are always encountered before children in the tree
    items.sort(key=lambda x: x["pathname"])

    # Create tar.gz archive conforming exactly to Unity's native package format
    current_time = int(time.time())
    with tarfile.open(UNITYPACKAGE_OUTPUT, "w:gz", format=tarfile.PAX_FORMAT) as tar:
        for item in items:
            guid = item["guid"]
            pathname_bytes = item["pathname"].encode('utf-8')  # NO TRAILING NEWLINE!
            meta_bytes = item["meta"].encode('utf-8')

            # 1. Directory entry for the GUID (required by Unity unarchiver)
            dir_info = tarfile.TarInfo(name=guid)
            dir_info.type = tarfile.DIRTYPE
            dir_info.size = 0
            dir_info.mode = 0o777
            dir_info.mtime = current_time
            dir_info.uname = ""
            dir_info.gname = ""
            dir_info.uid = 0
            dir_info.gid = 0
            tar.addfile(dir_info)

            # 2. Asset file (only for files, not folders)
            if not item["is_dir"] and item["content"] is not None:
                a_info = tarfile.TarInfo(name=f"{guid}/asset")
                a_info.type = tarfile.REGTYPE
                a_info.size = len(item["content"])
                a_info.mode = 0o777
                a_info.mtime = current_time
                a_info.uname = ""
                a_info.gname = ""
                a_info.uid = 0
                a_info.gid = 0
                tar.addfile(a_info, io.BytesIO(item["content"]))

            # 3. asset.meta entry
            m_info = tarfile.TarInfo(name=f"{guid}/asset.meta")
            m_info.type = tarfile.REGTYPE
            m_info.size = len(meta_bytes)
            m_info.mode = 0o777
            m_info.mtime = current_time
            m_info.uname = ""
            m_info.gname = ""
            m_info.uid = 0
            m_info.gid = 0
            tar.addfile(m_info, io.BytesIO(meta_bytes))

            # 4. pathname entry
            p_info = tarfile.TarInfo(name=f"{guid}/pathname")
            p_info.type = tarfile.REGTYPE
            p_info.size = len(pathname_bytes)
            p_info.mode = 0o777
            p_info.mtime = current_time
            p_info.uname = ""
            p_info.gname = ""
            p_info.uid = 0
            p_info.gid = 0
            tar.addfile(p_info, io.BytesIO(pathname_bytes))

    pkg_size = os.path.getsize(UNITYPACKAGE_OUTPUT)
    print(f"Created {UNITYPACKAGE_OUTPUT} ({pkg_size} bytes, {len(items)} items)")

if __name__ == "__main__":
    create_upm_files()
    build_unitypackage()
    print("All tasks completed successfully!")
