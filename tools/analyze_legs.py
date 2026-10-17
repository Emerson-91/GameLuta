#!/usr/bin/env python3
"""Analisa o sprite idle de cada lutador e localiza quadril (crotch) e divisao das pernas."""
import os
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR = os.path.join(ROOT, 'assets', 'images', 'sprites')
CHARS = ['dog', 'emerson', 'alligator', 'capybara', 'owl', 'tiger', 'bear', 'gorilla', 'wolf', 'cat', 'dragon']


def runs(row):
    out, start = [], None
    for x, v in enumerate(row):
        if v and start is None:
            start = x
        elif not v and start is not None:
            out.append((start, x - 1)); start = None
    if start is not None:
        out.append((start, len(row) - 1))
    return out


def analyze(cid):
    im = Image.open(os.path.join(SPR, f'{cid}_idle.png')).convert('RGBA')
    a = np.array(im)[:, :, 3] > 100
    h, w = a.shape
    # Linha de referencia logo acima dos pes: dois maiores blocos = pernas
    ref_y = int(h * 0.90)
    rs = sorted(runs(a[ref_y]), key=lambda r: r[1] - r[0], reverse=True)[:2]
    rs.sort()
    if len(rs) < 2:
        return None
    back, front = rs
    split = (back[1] + front[0]) // 2
    # Sobe ate a coluna de divisao ficar opaca -> virilha
    crotch = ref_y
    for y in range(ref_y, int(h * 0.35), -1):
        if a[y, max(0, split - 1):split + 2].any():
            crotch = y
            break
    return dict(w=w, h=h, split=split, crotch=crotch, back=back, front=front)


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(ROOT), 'tmp_analysis.png')
    tiles = []
    for c in CHARS:
        r = analyze(c)
        print(c, r)
        im = Image.open(os.path.join(SPR, f'{c}_idle.png')).convert('RGBA')
        d = ImageDraw.Draw(im)
        d.line([(0, r['crotch']), (im.width, r['crotch'])], fill=(255, 0, 0, 255), width=2)
        d.line([(r['split'], 0), (r['split'], im.height)], fill=(0, 255, 0, 255), width=2)
        tiles.append(im)
    W = sum(t.width for t in tiles)
    sheet = Image.new('RGBA', (W, 300), (40, 44, 60, 255))
    x = 0
    for t in tiles:
        sheet.paste(t, (x, 0), t); x += t.width
    sheet.save('/home/emerson/.gemini/antigravity-ide/brain/7dcac250-4cdd-4541-9cc9-9392ffe8599e/scratch/analysis.png')
