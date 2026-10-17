#!/usr/bin/env python3
"""
tools/extract_unicao_sheet.py
Extracts and crops the authentic special, kick, fall, and knockdown sprites for Unicão
from the user-uploaded sprite sheet.
- Removes fake checkerboard transparency.
- Isolates:
  1. special: Cosmic galaxy beam & star aura blast.
  2. kick: Martial arts flying side kick.
  3. fall & knockdown: Knocked out on back dazed pose.
- Rescales with high-fidelity Lanczos filtering to match Unicão's standard scale (300px standing height).
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

SRC_IMAGE = '/home/emerson/.gemini/antigravity-ide/brain/7dcac250-4cdd-4541-9cc9-9392ffe8599e/.user_uploaded/media_1792205318131.jpg'


def extract_sprites():
    print(f"Loading source image from {SRC_IMAGE}...")
    im = Image.open(SRC_IMAGE).convert('RGB')
    arr = np.array(im)
    h, w = arr.shape[:2]

    r = arr[:, :, 0].astype(int)
    g = arr[:, :, 1].astype(int)
    b = arr[:, :, 2].astype(int)

    # Checkerboard detection: neutral gray between 135 and 218
    diff = np.maximum(np.maximum(np.abs(r - g), np.abs(r - b)), np.abs(g - b))
    brightness = (r + g + b) // 3
    is_checker = (diff <= 8) & (brightness >= 135) & (brightness <= 218)

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
                if len(comp) > 10:
                    for py, px in comp:
                        is_bg[py, px] = True

    clean_rgba = np.dstack([arr, (~is_bg).astype(np.uint8) * 255])

    # 1. SPECIAL:
    spec_a = clean_rgba[:440, :820].copy()
    # Clear floor space between feet (below y=428, x between 125 and 225)
    spec_a[428:, 125:225] = 0
    ys, xs = np.nonzero(spec_a[:, :, 3] > 0)
    spec_cropped = Image.fromarray(spec_a[ys.min():ys.max()+1, xs.min():xs.max()+1])

    # 2. KICK:
    kick_a = clean_rgba[435:755, 60:500].copy()
    # Clear any residual foot pixels above kick head
    kick_a[:13, :75] = 0
    ys_k, xs_k = np.nonzero(kick_a[:, :, 3] > 0)
    kick_cropped = Image.fromarray(kick_a[ys_k.min():ys_k.max()+1, xs_k.min():xs_k.max()+1])

    # 3. FALL:
    fall_a = clean_rgba[450:755, 550:1000].copy()
    ys_f, xs_f = np.nonzero(fall_a[:, :, 3] > 0)
    fall_cropped = Image.fromarray(fall_a[ys_f.min():ys_f.max()+1, xs_f.min():xs_f.max()+1])

    # Scale matching standing height (kick height 300px)
    scale = 300.0 / kick_cropped.height

    kick_img = kick_cropped.resize((int(kick_cropped.width * scale), 300), Image.Resampling.LANCZOS)
    spec_img = spec_cropped.resize((int(spec_cropped.width * scale), int(spec_cropped.height * scale)), Image.Resampling.LANCZOS)
    fall_img = fall_cropped.resize((int(fall_cropped.width * scale), int(fall_cropped.height * scale)), Image.Resampling.LANCZOS)

    # Anchors
    k_arr = np.array(kick_img)
    ys_kf, xs_kf = np.nonzero(k_arr[int(kick_img.height * 0.8):, :, 3] > 80)
    lowest_ky = ys_kf.max()
    kfeet_xs = xs_kf[ys_kf >= lowest_ky - 8]
    kick_ax = round(float(np.mean(kfeet_xs)) / kick_img.width, 4)

    s_arr = np.array(spec_img)
    ys_sf, xs_sf = np.nonzero(s_arr[:, :int(spec_img.width * 0.45), 3] > 80)
    lowest_sy = ys_sf.max()
    sfeet_xs = xs_sf[ys_sf >= lowest_sy - 10]
    spec_ax = round(float(np.mean(sfeet_xs)) / spec_img.width, 4)

    fall_ax = 0.50

    # Save sprite files
    poses = {
        'special': (spec_img, spec_ax),
        'kick': (kick_img, kick_ax),
        'fall': (fall_img, fall_ax),
        'knockdown': (fall_img, fall_ax),
    }

    for name, (img, ax) in poses.items():
        out_path = os.path.join(SPR, f'dog_{name}.png')
        img.save(out_path)
        print(f"Saved dog_{name}.png: size={img.size}, ax={ax}")

    # Update meta.json
    with open(META_JSON, 'r') as f:
        meta = json.load(f)

    if 'dog' not in meta:
        meta['dog'] = {}

    for name, (img, ax) in poses.items():
        meta['dog'][name] = {'w': img.width, 'h': img.height, 'ax': ax}

    with open(META_JSON, 'w') as f:
        json.dump(meta, f, indent=2)
    print(f"Updated {META_JSON}")

    # Update js/sprite_data.js
    with open(META_JS, 'w') as f:
        f.write('// Auto-generated metadata for all fighters\n')
        f.write('window.SPRITE_META = ')
        json.dump(meta, f, indent=2)
        f.write(';\n')
    print(f"Updated {META_JS}")

    # Build preview image
    preview_poses = ['idle', 'kick', 'special', 'fall']
    ims = [Image.open(os.path.join(SPR, f'dog_{p}.png')) for p in preview_poses]
    W = sum(i.width for i in ims) + 30 * (len(ims) + 1)
    H = max(i.height for i in ims) + 40
    out = Image.new('RGBA', (W, H), (24, 28, 42, 255))
    x = 30
    for p, i in zip(preview_poses, ims):
        y = H - i.height - 20
        out.paste(i, (x, y), i)
        x += i.width + 30
    preview_path = os.path.join(ROOT, 'assets', 'images', 'preview_unicao.png')
    out.save(preview_path)
    print(f"Saved clean preview to {preview_path} size: {out.size}")


if __name__ == '__main__':
    extract_sprites()
