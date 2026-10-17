#!/usr/bin/env python3
"""Recorta sprite sheets (fundo magenta) em 4 poses: idle, punch, crouch, jump.

Uso: python3 tools/slice_sheet.py <char_id> <sheet_image>
Gera assets/images/sprites/<char_id>_<pose>.png e atualiza js/sprite_data.js

A segmentacao usa componentes conectados (e nao colunas), pois as poses
podem se sobrepor horizontalmente (ex.: cauda de uma pose invadindo o soco).
"""
import json
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'assets', 'images', 'sprites')
META_JSON = os.path.join(OUT_DIR, 'meta.json')
META_JS = os.path.join(ROOT, 'js', 'sprite_data.js')
POSES = ['idle', 'punch', 'crouch', 'jump']
MAX_H = 300  # altura maxima do frame salvo (px)


def key_out(img):
    """Remove fundo magenta com transicao suave e remove 'spill' rosa das bordas."""
    img = img.convert('RGBA')
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            mag = min(r, b) - g  # quanto o pixel e "magenta"
            if mag > 120:
                px[x, y] = (0, 0, 0, 0)
            elif mag > 60:
                a = int(255 * (120 - mag) / 60)
                m = g + 40
                px[x, y] = (min(r, m), g, min(b, m), a)
    return img


def components(img):
    """Lista de componentes conectados (pixels com alpha > 40)."""
    w, h = img.size
    a = img.getchannel('A').load()
    seen = bytearray(w * h)
    comps = []
    for y in range(h):
        for x in range(w):
            if a[x, y] > 40 and not seen[y * w + x]:
                seen[y * w + x] = 1
                stack = [(x, y)]
                pts = []
                x0 = x1 = x
                y0 = y1 = y
                while stack:
                    cx, cy = stack.pop()
                    pts.append((cx, cy))
                    if cx < x0: x0 = cx
                    if cx > x1: x1 = cx
                    if cy < y0: y0 = cy
                    if cy > y1: y1 = cy
                    for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                        if 0 <= nx < w and 0 <= ny < h:
                            i = ny * w + nx
                            if not seen[i] and a[nx, ny] > 40:
                                seen[i] = 1
                                stack.append((nx, ny))
                comps.append({'pts': pts, 'bbox': [x0, y0, x1, y1]})
    return comps


def bbox_dist(b1, b2):
    dx = max(0, max(b1[0], b2[0]) - min(b1[2], b2[2]))
    dy = max(0, max(b1[1], b2[1]) - min(b1[3], b2[3]))
    return (dx * dx + dy * dy) ** 0.5


def split_poses(img):
    comps = components(img)
    comps.sort(key=lambda c: len(c['pts']), reverse=True)
    if len(comps) < 4:
        return None
    main = comps[:4]
    min_main = len(main[3]['pts'])
    for m in main:
        m['members'] = [m]
    # pedacos soltos (ex.: chifre brilhante, faiscas) vao para a pose mais proxima
    for c in comps[4:]:
        if len(c['pts']) < 25:
            continue
        best = min(main, key=lambda m: bbox_dist(m['bbox'], c['bbox']))
        if bbox_dist(best['bbox'], c['bbox']) < 60:
            best['members'].append(c)
    if min_main < len(main[0]['pts']) * 0.12:
        print('AVISO: uma das poses parece pequena demais, confira o resultado')
    main.sort(key=lambda m: (m['bbox'][0] + m['bbox'][2]) / 2)

    src = img.load()
    frames = []
    for m in main:
        xs = [mm['bbox'][0] for mm in m['members']] + [mm['bbox'][2] for mm in m['members']]
        ys = [mm['bbox'][1] for mm in m['members']] + [mm['bbox'][3] for mm in m['members']]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        fr = Image.new('RGBA', (x1 - x0 + 1, y1 - y0 + 1), (0, 0, 0, 0))
        dst = fr.load()
        for mm in m['members']:
            for (x, y) in mm['pts']:
                dst[x - x0, y - y0] = src[x, y]
        frames.append(fr)
    return frames


def anchor_x(frame, pose):
    """Centro horizontal do corpo: pes para poses no chao, centroide total no pulo."""
    w, h = frame.size
    a = frame.getchannel('A').load()
    y0 = 0 if pose == 'jump' else int(h * 0.6)
    sx = n = 0
    for y in range(y0, h):
        for x in range(w):
            if a[x, y] > 128:
                sx += x
                n += 1
    return round(sx / n / w, 4) if n else 0.5


def main():
    char_id, sheet = sys.argv[1], sys.argv[2]
    os.makedirs(OUT_DIR, exist_ok=True)
    img = key_out(Image.open(sheet))
    frames = split_poses(img)
    if not frames:
        print(f'ERRO: nao encontrei 4 poses em {sheet}')
        sys.exit(1)

    meta = {}
    if os.path.exists(META_JSON):
        with open(META_JSON) as f:
            meta = json.load(f)

    # mesma escala para todas as poses (baseada na altura do idle)
    scale = min(1.0, MAX_H / frames[0].height)
    info = {}
    for pose, fr in zip(POSES, frames):
        nw, nh = max(1, round(fr.width * scale)), max(1, round(fr.height * scale))
        fr = fr.resize((nw, nh), Image.LANCZOS)
        fr.save(os.path.join(OUT_DIR, f'{char_id}_{pose}.png'), optimize=True)
        info[pose] = {'w': nw, 'h': nh, 'ax': anchor_x(fr, pose)}
    meta[char_id] = info

    with open(META_JSON, 'w') as f:
        json.dump(meta, f, indent=1, sort_keys=True)
    with open(META_JS, 'w') as f:
        f.write('// Gerado automaticamente por tools/slice_sheet.py - nao editar manualmente\n')
        f.write('window.SPRITE_META = ' + json.dumps(meta, indent=1, sort_keys=True) + ';\n')
    print(char_id, json.dumps(info))


if __name__ == '__main__':
    main()
