#!/usr/bin/env python3
"""
tools/create_andrey_walk.py
Generates clean, properly articulated walk and back sprites for Andrey.
- Cleans and isolates andrey_idle.png from andrey_raw_idle.jpeg (removing all floor lines and baseboards).
- Articulates legs from the true anatomical hip line (below jersey at y=192).
- Seamless pelvis/groin fill so no holes or gaps appear between legs.
- Generates andrey_walk1.png, andrey_walk2.png, andrey_back1.png, andrey_back2.png, and andrey_idle2.png.
- Accurately aligns ground floor and horizontal anchors (ax) to eliminate jitter/teleportation.
- Updates assets/images/sprites/meta.json and js/sprite_data.js.
"""

import os
import json
import math
from collections import deque
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR = os.path.join(ROOT, 'assets', 'images', 'sprites')
META_JSON = os.path.join(SPR, 'meta.json')
META_JS = os.path.join(ROOT, 'js', 'sprite_data.js')

PAD = 150


def clean_idle():
    """Produce a pristine andrey_idle.png with complete sneakers and solid pants."""
    raw = Image.open(os.path.join(SPR, 'andrey_raw_idle.jpeg')).convert('RGBA')
    raw_arr = np.array(raw)
    h_raw, w_raw, _ = raw_arr.shape
    rgb = raw_arr[:, :, :3]

    # Mask background (off-white wall, floor, and dark baseboard line at y>980)
    is_wall = (rgb[:, :, 0] > 200) & (rgb[:, :, 1] > 200) & (rgb[:, :, 2] > 200)
    is_floor = (rgb[:, :, 0] > 175) & (rgb[:, :, 1] > 175) & (rgb[:, :, 2] > 185) & (np.arange(h_raw)[:, None] > 980)
    is_baseboard = (np.arange(h_raw)[:, None] > 980) & (np.arange(h_raw)[:, None] < 1060) & (rgb[:, :, 0] > 130) & (rgb[:, :, 1] > 140) & (rgb[:, :, 2] > 160)
    # Outside Andrey bounds (x < 250 or x > 1180) is definitely room background
    is_side_bg = (np.arange(w_raw)[None, :] < 250) | (np.arange(w_raw)[None, :] > 1180)
    bg_cand = is_wall | is_floor | is_baseboard | is_side_bg

    is_bg = np.zeros((h_raw, w_raw), dtype=bool)
    q = deque()

    # Border seed pixels
    for x in range(w_raw):
        if bg_cand[0, x]: q.append((0, x)); is_bg[0, x] = True
        if bg_cand[h_raw - 1, x]: q.append((h_raw - 1, x)); is_bg[h_raw - 1, x] = True
    for y in range(h_raw):
        if bg_cand[y, 0]: q.append((y, 0)); is_bg[y, 0] = True
        if bg_cand[y, w_raw - 1]: q.append((y, w_raw - 1)); is_bg[y, w_raw - 1] = True

    while q:
        cy, cx = q.popleft()
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h_raw and 0 <= nx < w_raw and not is_bg[ny, nx] and bg_cand[ny, nx]:
                is_bg[ny, nx] = True
                q.append((ny, nx))

    # Also flood fill the background area between legs:
    for y in range(920, 1150):
        for x in range(600, 740):
            if bg_cand[y, x] and not is_bg[y, x]:
                hole_q = deque([(y, x)])
                is_bg[y, x] = True
                while hole_q:
                    hy, hx = hole_q.popleft()
                    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                        ny, nx = hy + dy, hx + dx
                        if 900 <= ny < 1160 and 550 <= nx < 780 and not is_bg[ny, nx] and bg_cand[ny, nx]:
                            is_bg[ny, nx] = True
                            hole_q.append((ny, nx))

    # Character alpha: everything that is not bg
    char_alpha = (~is_bg).astype(np.uint8) * 255

    # Crop to bounding box of character
    ys, xs = np.nonzero(char_alpha)
    y0, y1 = ys.min(), ys.max() + 1
    x0, x1 = xs.min(), xs.max() + 1

    cropped_rgb = rgb[y0:y1, x0:x1]
    cropped_a = char_alpha[y0:y1, x0:x1]
    clean_img = Image.fromarray(np.dstack([cropped_rgb, cropped_a]), 'RGBA')

    # Scale to match standard sprite height (320px)
    target_h = 320
    scale = target_h / clean_img.height
    target_w = int(clean_img.width * scale)
    clean_img = clean_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

    clean_img.save(os.path.join(SPR, 'andrey_idle.png'))
    print(f"Cleaned andrey_idle.png saved: {clean_img.size}")
    return clean_img


def build_articulated_walk(clean_img):
    arr = np.array(clean_img)
    h, w, _ = arr.shape
    yy, xx = np.mgrid[0:h, 0:w]

    # Anatomical landmark points:
    # Teal jersey ends at y=188. Black pants start at y=189.
    # Hip joint articulation line is at y=192.
    hip_y = 192
    split_x = 106 # center line between legs
    crotch_y = 207
    fp = (132, 192) # front (lead) hip pivot
    bp = (78, 192)  # back (rear) hip pivot
    torso_pivot = (split_x, hip_y)

    # Reference idle anchor x (center of feet in idle):
    lower = arr[int(h * 0.6):, :, 3] > 80
    lys, lxs = np.nonzero(lower)
    idle_ax_pixel = float(lxs.mean()) if len(lxs) else w * 0.44

    def layer(m):
        out = arr.copy()
        out[~m] = 0
        return Image.fromarray(out, 'RGBA')

    # 1. Torso: everything above hip_y + 10 (preserves jersey & top of pants)
    torso_m = yy <= (hip_y + 10)
    # 2. Front Leg (lead leg on right side):
    front_m = (yy >= hip_y - 2) & (xx >= split_x)
    # 3. Back Leg (rear leg on left side):
    back_m = (yy >= hip_y - 2) & (xx < split_x)
    # 4. Pelvis / crotch patch: seamless groin fill
    pelvis_m = (yy >= hip_y - 4) & (yy <= crotch_y + 6) & (xx >= bp[0] - 12) & (xx <= fp[0] + 12)

    torso_img = layer(torso_m)
    front_img = layer(front_m)
    back_img = layer(back_m)
    pelvis_img = layer(pelvis_m)

    cw, ch = w + PAD * 2, h + PAD * 2

    def render_pose(front_angle, back_angle, torso_angle=0.0, shift_x=0, shift_y=0):
        def place(img, ang, piv, offset=(0, 0)):
            temp = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
            temp.paste(img, (PAD, PAD))
            px = piv[0] + PAD
            py = piv[1] + PAD
            return temp.rotate(ang, resample=Image.Resampling.BILINEAR, center=(px, py),
                               translate=(offset[0], offset[1]))

        cv = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        bl = place(back_img, back_angle + torso_angle, bp, (shift_x, shift_y))
        pl = place(pelvis_img, torso_angle, torso_pivot, (shift_x, shift_y))
        tr = place(torso_img, torso_angle, torso_pivot, (shift_x, shift_y))
        fl = place(front_img, front_angle + torso_angle, fp, (shift_x, shift_y))

        # Back leg behind, then pelvis patch, then torso, then front leg in foreground
        cv.alpha_composite(bl)
        cv.alpha_composite(pl)
        cv.alpha_composite(tr)
        cv.alpha_composite(fl)

        alpha = np.array(cv)[:, :, 3] > 80
        ys, xs = np.nonzero(alpha)
        x0, x1 = xs.min(), xs.max() + 1
        y0, y1 = ys.min(), ys.max() + 1

        cropped = cv.crop((x0, y0, x1, y1))

        # Anchor calculation:
        # Align canvas anchor to idle center + shift_x
        canvas_anchor_x = idle_ax_pixel + PAD + shift_x
        ax = (canvas_anchor_x - x0) / cropped.width
        ax = round(max(0.0, min(1.0, float(ax))), 4)

        return cropped, ax

    # 1. walk1: Forward stride 1 - Lead leg forward (+16°), rear leg trailing (-16°), torso (+2°)
    walk1_img, ax_w1 = render_pose(front_angle=16, back_angle=-16, torso_angle=2, shift_x=2, shift_y=0)

    # 2. walk2: Forward stride 2 - Lead leg back support (-18°), rear leg swings through (+18°), torso (+1°), bob (-2px)
    walk2_img, ax_w2 = render_pose(front_angle=-18, back_angle=18, torso_angle=1, shift_x=0, shift_y=-2)

    # 3. back1: Backward retreat 1 - Guarded stance: Lead leg forward (+10°), rear leg reaches back (-18°), torso lean (-3°)
    back1_img, ax_b1 = render_pose(front_angle=10, back_angle=-18, torso_angle=-3, shift_x=-2, shift_y=0)

    # 4. back2: Backward retreat 2 - Passing retreat: Lead leg pulls back (-16°), rear leg plants (+12°), torso lean (-3°), bob (-2px)
    back2_img, ax_b2 = render_pose(front_angle=-16, back_angle=12, torso_angle=-3, shift_x=-2, shift_y=-2)

    # 5. idle2: Subtle breathing bounce (2px upper torso compression, identical footprint & anchor)
    out_idle2 = arr.copy()
    split_y = 188
    for y in range(split_y):
        shift = int(round(2 * (1 - y / split_y)))
        src_y = max(0, min(h - 1, y - shift))
        out_idle2[y] = arr[src_y]
    idle2_img = Image.fromarray(out_idle2, 'RGBA')
    ax_i2 = round(idle_ax_pixel / w, 4)

    poses = {
        'walk1': (walk1_img, ax_w1),
        'walk2': (walk2_img, ax_w2),
        'back1': (back1_img, ax_b1),
        'back2': (back2_img, ax_b2),
        'idle2': (idle2_img, ax_i2),
    }

    # Save sprites
    for name, (img, ax) in poses.items():
        out_path = os.path.join(SPR, f'andrey_{name}.png')
        img.save(out_path)
        print(f"Generated andrey_{name}.png: size={img.size}, ax={ax}")

    # Update metadata
    with open(META_JSON, 'r') as f:
        meta = json.load(f)

    if 'andrey' not in meta:
        meta['andrey'] = {}

    meta['andrey']['idle'] = {'w': clean_img.width, 'h': clean_img.height, 'ax': ax_i2}
    for name, (img, ax) in poses.items():
        meta['andrey'][name] = {'w': img.width, 'h': img.height, 'ax': ax}

    with open(META_JSON, 'w') as f:
        json.dump(meta, f, indent=2)

    with open(META_JS, 'w') as f:
        f.write('// Auto-generated metadata for all fighters\n')
        f.write('window.SPRITE_META = ')
        f.write(json.dumps(meta, indent=2))
        f.write(';\n')

    print("Successfully updated meta.json and js/sprite_data.js for Andrey!")


if __name__ == '__main__':
    clean = clean_idle()
    build_articulated_walk(clean)
