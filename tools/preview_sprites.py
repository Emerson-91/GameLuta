#!/usr/bin/env python3
"""Monta uma imagem de preview com as 4 poses de um ou mais personagens.
Uso: python3 tools/preview_sprites.py <saida.png> <char_id> [char_id ...]
"""
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR = os.path.join(ROOT, 'assets', 'images', 'sprites')
POSES = ['idle', 'punch', 'crouch', 'jump']

out, ids = sys.argv[1], sys.argv[2:]
rows = []
for cid in ids:
    ims = [Image.open(os.path.join(SPR, f'{cid}_{p}.png')) for p in POSES]
    W = sum(i.width for i in ims) + 20 * len(ims)
    H = max(i.height for i in ims) + 10
    row = Image.new('RGBA', (W, H), (40, 44, 70, 255))
    x = 10
    for i in ims:
        row.paste(i, (x, H - i.height - 5), i)
        x += i.width + 20
    rows.append(row)
W = max(r.width for r in rows)
H = sum(r.height for r in rows)
canvas = Image.new('RGBA', (W, H), (20, 20, 30, 255))
y = 0
for r in rows:
    canvas.paste(r, (0, y))
    y += r.height
canvas.save(out)
print(out, canvas.size)
