#!/usr/bin/env python3
"""
tools/extract_andrey_walk.py
Extracts the authentic pixel-art walking frames for Andrey from the user-uploaded image.
- Removes neutral gray/white checkerboard background via flood fill + internal gap clearing.
- Crops the two authentic walking poses (with emerald energy flames on fists and Mighty Ducks jersey).
- Scales with high-fidelity Lanczos filtering to match Andrey's standard 320px height scale.
- Aligns horizontal anchors (ax) to ensure smooth locomotion without jitter.
- Updates assets/images/sprites/andrey_walk1.png, andrey_walk2.png, andrey_back1.png, andrey_back2.png, meta.json, and js/sprite_data.js.
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

SRC_IMAGE = '/home/emerson/.gemini/antigravity-ide/brain/7dcac250-4cdd-4541-9cc9-9392ffe8599e/.user_uploaded/media_1792200678019.jpg'


def extract_andrey_walk():
    im = Image.open(SRC_IMAGE).convert('RGB')
    arr = np.array(im)
    h, w = arr.shape[:2]

    r = arr[:, :, 0].astype(int)
    g = arr[:, :, 1].astype(int)
    b = arr[:, :, 2].astype(int)
    max_diff = np.maximum(np.maximum(np.abs(r - g), np.abs(r - b)), np.abs(g - b))
    brightness = (r + g + b) // 3
    is_checker = (max_diff <= 8) & (brightness >= 135) & (brightness <= 240)

    # Flood fill outer background from 4 borders
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

    # Clear internal checkerboard holes between legs and arms
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

    # Left pose (walk1): x in [32:526], y in [73:703]
    left_crop = Image.fromarray(clean_arr[73:703, 32:526])

    # Right pose (walk2): x in [552:976], y in [73:709]
    right_crop = Image.fromarray(clean_arr[73:709, 552:976])

    # Scale to standard height ~320px
    scale = 320 / right_crop.height
    w1_img = left_crop.resize((int(left_crop.width * scale), int(left_crop.height * scale)), Image.Resampling.LANCZOS)
    w2_img = right_crop.resize((int(right_crop.width * scale), 320), Image.Resampling.LANCZOS)

    # Torso centers in raw coordinates: walk1 ~ 232.1, walk2 ~ 205.1
    ax1 = round((232.1 * scale) / w1_img.width, 4)
    ax2 = round((205.1 * scale) / w2_img.width, 4)

    # Save sprites
    w1_path = os.path.join(SPR, 'andrey_walk1.png')
    w2_path = os.path.join(SPR, 'andrey_walk2.png')
    b1_path = os.path.join(SPR, 'andrey_back1.png')
    b2_path = os.path.join(SPR, 'andrey_back2.png')

    w1_img.save(w1_path)
    w2_img.save(w2_path)
    # Walking backward cycles the retreat support frame and passing frame
    w2_img.save(b1_path)
    w1_img.save(b2_path)

    print(f"Saved andrey_walk1.png: size={w1_img.size}, ax={ax1}")
    print(f"Saved andrey_walk2.png: size={w2_img.size}, ax={ax2}")
    print(f"Saved andrey_back1.png: size={w2_img.size}, ax={ax2}")
    print(f"Saved andrey_back2.png: size={w1_img.size}, ax={ax1}")

    # Update metadata
    with open(META_JSON, 'r') as f:
        meta = json.load(f)

    if 'andrey' not in meta:
        meta['andrey'] = {}

    meta['andrey']['walk1'] = {'w': w1_img.width, 'h': w1_img.height, 'ax': ax1}
    meta['andrey']['walk2'] = {'w': w2_img.width, 'h': w2_img.height, 'ax': ax2}
    meta['andrey']['back1'] = {'w': w2_img.width, 'h': w2_img.height, 'ax': ax2}
    meta['andrey']['back2'] = {'w': w1_img.width, 'h': w1_img.height, 'ax': ax1}

    with open(META_JSON, 'w') as f:
        json.dump(meta, f, indent=2)

    with open(META_JS, 'w') as f:
        f.write('// Auto-generated metadata for all fighters\n')
        f.write('window.SPRITE_META = ')
        f.write(json.dumps(meta, indent=2))
        f.write(';\n')

    print("Successfully updated meta.json and js/sprite_data.js for Andrey walk frames!")


if __name__ == '__main__':
    extract_andrey_walk()
