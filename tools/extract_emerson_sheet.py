#!/usr/bin/env python3
"""
tools/extract_emerson_sheet.py
Extracts and crops the authentic kick, knockdown, and fall sprites for Emerson from the user-uploaded sprite sheet.
- Removes fake transparency checkerboard (neutral gray/white squares).
- Isolate:
  1. kick: Side kick pose with cyan electrical aura around fists.
  2. knockdown: Knockback in the air pose with arms raised and cyan energy.
  3. fall: Knocked out flat on the ground pose.
- Rescales with high-fidelity Lanczos filtering to match Emerson's standard 300px scale.
- Aligns horizontal anchors (ax) and floor levels.
- Updates assets/images/sprites/meta.json and js/sprite_data.js.
"""

import os
import json
from collections import deque
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR = os.path.join(ROOT, 'assets', 'images', 'sprites')
META_JSON = os.path.join(SPR, 'meta.json')
META_JS = os.path.join(ROOT, 'js', 'sprite_data.js')

SRC_IMAGE = '/home/emerson/.gemini/antigravity-ide/brain/7dcac250-4cdd-4541-9cc9-9392ffe8599e/.user_uploaded/media_1792198821089.jpg'


def extract_sprites():
    im = Image.open(SRC_IMAGE).convert('RGB')
    arr = np.array(im)
    h, w = arr.shape[:2]

    r = arr[:, :, 0].astype(int)
    g = arr[:, :, 1].astype(int)
    b = arr[:, :, 2].astype(int)

    # Checkerboard detection: neutral gray between 135 and 240
    max_diff = np.maximum(np.maximum(np.abs(r - g), np.abs(r - b)), np.abs(g - b))
    brightness = (r + g + b) // 3
    is_checker = (max_diff <= 8) & (brightness >= 135) & (brightness <= 240)

    # Flood fill outer background
    is_bg = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        if is_checker[0, x]: q.append((0, x)); is_bg[0, x] = True
        if is_checker[h - 1, x]: q.append((h - 1, x)); is_bg[h - 1, x] = True
    for y in range(h):
        if is_checker[y, 0]: q.append((y, 0)); is_bg[y, 0] = True
        if is_checker[y, w - 1]: q.append((y, w - 1)); is_bg[y, w - 1] = True

    while q:
        cy, cx = q.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not is_bg[ny, nx] and is_checker[ny, nx]:
                is_bg[ny, nx] = True
                q.append((ny, nx))

    # Clear internal checkerboard holes between limbs
    visited = is_bg.copy()
    for y in range(h):
        for x in range(w):
            if is_checker[y, x] and not visited[y, x]:
                comp = []
                cq = deque([(y, x)])
                visited[y, x] = True
                while cq:
                    py, px = cq.popleft()
                    comp.append((py, px))
                    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                        ny, nx = py + dy, px + dx
                        if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_checker[ny, nx]:
                            visited[ny, nx] = True
                            cq.append((ny, nx))
                if len(comp) > 15:
                    for py, px in comp:
                        is_bg[py, px] = True

    alpha = (~is_bg).astype(np.uint8) * 255
    clean_arr = np.dstack([arr, alpha])

    # 1. Kick pose (Left side: x <= 485, y <= 560)
    kick_a = clean_arr.copy()
    kick_a[:, 485:] = 0
    kick_a[560:, :] = 0
    ys, xs = np.nonzero(kick_a[:, :, 3] > 0)
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1
    kick_raw = Image.fromarray(kick_a[y0:y1, x0:x1])

    # Standard scale matching standing height (306px)
    scale = 306 / kick_raw.height
    kick_img = kick_raw.resize((int(kick_raw.width * scale), 306), Image.Resampling.LANCZOS)
    kick_arr = np.array(kick_img)
    support_foot = kick_arr[int(306 * 0.8):, :, 3] > 80
    ys_sf, xs_sf = np.nonzero(support_foot)
    kick_ax = round(float(xs_sf.mean()) / kick_img.width, 4)

    # 2. Knockdown pose (Top-right: y <= 510, x >= 485)
    kd_a = clean_arr.copy()
    kd_a[510:, :] = 0
    kd_a[:, :485] = 0
    ys, xs = np.nonzero(kd_a[:, :, 3] > 0)
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1
    kd_raw = Image.fromarray(kd_a[y0:y1, x0:x1])
    kd_img = kd_raw.resize((int(kd_raw.width * scale), int(kd_raw.height * scale)), Image.Resampling.LANCZOS)
    kd_ax = 0.50

    # 3. Fall pose (Bottom-right: y >= 520, x >= 430)
    fall_a = clean_arr.copy()
    fall_a[:520, :] = 0
    fall_a[:, :430] = 0
    ys, xs = np.nonzero(fall_a[:, :, 3] > 0)
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1
    fall_raw = Image.fromarray(fall_a[y0:y1, x0:x1])
    fall_img = fall_raw.resize((int(fall_raw.width * scale), int(fall_raw.height * scale)), Image.Resampling.LANCZOS)
    fall_ax = 0.50

    # Save sprite files
    poses = {
        'kick': (kick_img, kick_ax),
        'knockdown': (kd_img, kd_ax),
        'fall': (fall_img, fall_ax),
    }

    for name, (img, ax) in poses.items():
        out_path = os.path.join(SPR, f'emerson_{name}.png')
        img.save(out_path)
        print(f"Saved emerson_{name}.png: size={img.size}, ax={ax}")

    # Update meta.json and js/sprite_data.js
    with open(META_JSON, 'r') as f:
        meta = json.load(f)

    if 'emerson' not in meta:
        meta['emerson'] = {}

    for name, (img, ax) in poses.items():
        meta['emerson'][name] = {'w': img.width, 'h': img.height, 'ax': ax}

    with open(META_JSON, 'w') as f:
        json.dump(meta, f, indent=2)

    with open(META_JS, 'w') as f:
        f.write('// Auto-generated metadata for all fighters\n')
        f.write('window.SPRITE_META = ')
        f.write(json.dumps(meta, indent=2))
        f.write(';\n')

    print("Successfully updated meta.json and js/sprite_data.js for Emerson!")


if __name__ == '__main__':
    extract_sprites()
