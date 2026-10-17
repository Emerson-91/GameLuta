#!/usr/bin/env python3
"""
tools/extract_emerson_special.py
Extracts Emerson's authentic Kamehameha Network Cable Special Attack sprite from the user upload.
- Removes neutral gray/white checkerboard background via flood fill + internal gap clearing.
- Scales cleanly with Lanczos filtering to match Emerson's standard 300px scale.
- Aligns horizontal anchor (ax) to Emerson's stance/feet center.
- Updates assets/images/sprites/emerson_special.png, meta.json, and js/sprite_data.js.
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

SRC_IMAGE = '/home/emerson/.gemini/antigravity-ide/brain/7dcac250-4cdd-4541-9cc9-9392ffe8599e/.user_uploaded/media_1792198974816.jpg'


def extract_special():
    im = Image.open(SRC_IMAGE).convert('RGB')
    arr = np.array(im)
    h, w = arr.shape[:2]

    r = arr[:, :, 0].astype(int)
    g = arr[:, :, 1].astype(int)
    b = arr[:, :, 2].astype(int)
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

    # Clear internal checkerboard holes between cables & limbs
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

    char_alpha = (~is_bg).astype(np.uint8) * 255
    clean_arr = np.dstack([arr, char_alpha])

    # Crop to character bounding box
    ys, xs = np.nonzero(char_alpha > 0)
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1

    cropped_raw = Image.fromarray(clean_arr[y0:y1, x0:x1])

    # Scale by 0.50 to match Emerson's standard 300px scale
    w_raw, h_raw = cropped_raw.size
    target_w = int(w_raw * 0.50)
    target_h = int(h_raw * 0.50)
    special_img = cropped_raw.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Feet center in raw: x in [0, 307] -> center = 153.5
    ax = round(153.5 / w_raw, 4)

    out_path = os.path.join(SPR, 'emerson_special.png')
    special_img.save(out_path)
    print(f"Saved {out_path}: size={special_img.size}, ax={ax}")

    # Update metadata
    with open(META_JSON, 'r') as f:
        meta = json.load(f)

    if 'emerson' not in meta:
        meta['emerson'] = {}

    meta['emerson']['special'] = {
        'w': special_img.width,
        'h': special_img.height,
        'ax': ax
    }

    with open(META_JSON, 'w') as f:
        json.dump(meta, f, indent=2)

    with open(META_JS, 'w') as f:
        f.write('// Auto-generated metadata for all fighters\n')
        f.write('window.SPRITE_META = ')
        f.write(json.dumps(meta, indent=2))
        f.write(';\n')

    print("Successfully updated meta.json and js/sprite_data.js!")


if __name__ == '__main__':
    extract_special()
