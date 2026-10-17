#!/usr/bin/env python3
"""
Gera sprites ARTICULADOS a partir do sprite idle real de cada lutador.
O idle e cortado em 3 camadas (tronco+bracos+cabeca, perna da frente, perna de tras)
e cada camada e girada em torno da articulacao do quadril, preservando os pixels originais.

Poses geradas:
  kick       - chute frontal alto: tronco inclinado para tras, perna da frente estendida
  walk1/2    - passada para frente (perna frente/tras alternando)
  back1/2    - andar para tras (tronco recuado em guarda, passada curta)
  knockdown  - corpo sendo arremessado (no ar, caindo de costas)
  fall       - caido DE COSTAS NO CHAO (tronco deitado, pernas articuladas, poeira, estrelas)

Atualiza assets/images/sprites/meta.json e js/sprite_data.js.
"""
import os
import json
import math
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR = os.path.join(ROOT, 'assets', 'images', 'sprites')
META_JSON = os.path.join(SPR, 'meta.json')
META_JS = os.path.join(ROOT, 'js', 'sprite_data.js')

CHARS = ['dog', 'emerson', 'alligator', 'capybara', 'owl', 'tiger', 'bear', 'gorilla', 'wolf', 'cat', 'dragon', 'nata']
ALL_POSES = ['idle', 'idle2', 'punch', 'kick', 'special', 'crouch', 'jump', 'fall', 'fly',
             'walk1', 'walk2', 'back1', 'back2', 'knockdown']

ACCENT = {
    'dog': (56, 189, 248), 'emerson': (6, 182, 212), 'alligator': (132, 204, 22),
    'capybara': (251, 191, 36), 'owl': (192, 132, 252), 'tiger': (249, 115, 22),
    'bear': (186, 230, 253), 'gorilla': (250, 204, 21), 'wolf': (251, 146, 60),
    'cat': (52, 211, 153), 'dragon': (239, 68, 68), 'nata': (249, 115, 22),
}

# Ajustes manuais onde a cauda tampa o vao entre as pernas
OVERRIDE = {
    'alligator': {'split': 104, 'crotch': 200},
    'dragon': {'split': 108, 'crotch': 205},
}

PAD = 260  # margem do canvas de trabalho


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


def analyze(cid, a):
    h, w = a.shape
    ref_y = int(h * 0.90)
    rs = sorted(runs(a[ref_y]), key=lambda r: r[1] - r[0], reverse=True)[:2]
    rs.sort()
    back, front = rs
    split = (back[1] + front[0]) // 2
    crotch = ref_y
    for y in range(ref_y, int(h * 0.35), -1):
        if a[y, max(0, split - 1):split + 2].any():
            crotch = y
            break
    if cid in OVERRIDE:
        split = OVERRIDE[cid]['split']
        crotch = OVERRIDE[cid]['crotch']
    hip_y = int(crotch - h * 0.10)
    row = a[hip_y]
    xs = np.where(row)[0]
    right = xs.max() if len(xs) else w - 1
    left = xs.min() if len(xs) else 0
    front_pivot = (int((split + min(right, front[1] + 10)) / 2), hip_y)
    back_pivot = (int((max(left, back[0] - 10) + split) / 2), hip_y)
    return dict(w=w, h=h, split=split, crotch=crotch, hip_y=hip_y,
                front=front, back=back, fp=front_pivot, bp=back_pivot, ref_y=ref_y)


class Rig:
    """Separa o idle em camadas e permite recompor com rotacoes nas articulacoes."""

    def __init__(self, cid):
        self.cid = cid
        self.src = Image.open(os.path.join(SPR, f'{cid}_idle.png')).convert('RGBA')
        arr = np.array(self.src)
        self.alpha = arr[:, :, 3] > 100
        self.info = analyze(cid, self.alpha)
        h, w = self.alpha.shape
        i = self.info
        yy, xx = np.mgrid[0:h, 0:w]
        overlap = 8
        front_m = (yy >= i['hip_y'] - overlap) & (xx >= i['split'])
        back_m = (yy >= i['hip_y'] - overlap) & (xx < i['split'])
        torso_m = yy < i['hip_y']
        self.front = self._layer(arr, front_m)
        self.back = self._layer(arr, back_m)
        self.torso = self._layer(arr, torso_m)
        # "bola" da articulacao: pixels originais em volta de cada quadril (cobre a fenda)
        r = int(w * 0.09)
        self.front_joint = self._layer(arr, (xx - i['fp'][0]) ** 2 + (yy - i['fp'][1]) ** 2 <= r * r)
        self.back_joint = self._layer(arr, (xx - i['bp'][0]) ** 2 + (yy - i['bp'][1]) ** 2 <= r * r)
        # ancora original (centroide dos pes)
        lower = self.alpha[int(h * 0.6):]
        ys, xs = np.nonzero(lower)
        self.anchor = (float(xs.mean()) if len(xs) else w / 2, float(h))

    @staticmethod
    def _layer(arr, mask):
        out = arr.copy()
        out[~mask] = 0
        return Image.fromarray(out, 'RGBA')

    def canvas(self):
        w, h = self.src.size
        return Image.new('RGBA', (w + PAD * 2, h + PAD * 2), (0, 0, 0, 0))

    @staticmethod
    def place(layer, angle, pivot, dest):
        """Gira 'layer' (coordenadas do idle) em 'angle' graus (anti-horario) em torno de
        'pivot' e posiciona o pivot em 'dest' (coordenadas do canvas com margem)."""
        w, h = layer.size
        big = Image.new('RGBA', (w + PAD * 2, h + PAD * 2), (0, 0, 0, 0))
        big.paste(layer, (PAD, PAD))
        px, py = pivot[0] + PAD, pivot[1] + PAD
        rot = big.rotate(angle, resample=Image.Resampling.NEAREST, center=(px, py),
                         translate=(dest[0] - px, dest[1] - py))
        return rot


def rotate_point(p, angle, pivot):
    """Rotacao anti-horaria visual (eixo y para baixo)."""
    a = math.radians(angle)
    dx, dy = p[0] - pivot[0], p[1] - pivot[1]
    return (pivot[0] + dx * math.cos(a) + dy * math.sin(a),
            pivot[1] - dx * math.sin(a) + dy * math.cos(a))


def compose(rig, torso_ang=0.0, torso_pivot=None, front_ang=0.0, back_ang=0.0,
            body_shift=(0, 0), front_first=False):
    """Recompõe a figura. Retorna (imagem no canvas, funcao de transformacao do tronco)."""
    i = rig.info
    if torso_pivot is None:
        torso_pivot = ((i['fp'][0] + i['bp'][0]) / 2, i['hip_y'])
    tp_dest = (torso_pivot[0] + PAD + body_shift[0], torso_pivot[1] + PAD + body_shift[1])

    def T(p):  # transforma ponto do idle pela transformacao do tronco
        q = rotate_point(p, torso_ang, torso_pivot)
        return (q[0] - torso_pivot[0] + tp_dest[0], q[1] - torso_pivot[1] + tp_dest[1])

    fp_dest, bp_dest = T(i['fp']), T(i['bp'])
    cv = rig.canvas()
    torso = Rig.place(rig.torso, torso_ang, torso_pivot, tp_dest)
    back = Rig.place(rig.back, torso_ang + back_ang, i['bp'], bp_dest)
    front = Rig.place(rig.front, torso_ang + front_ang, i['fp'], fp_dest)
    bj = Rig.place(rig.back_joint, torso_ang, i['bp'], bp_dest)
    fj = Rig.place(rig.front_joint, torso_ang, i['fp'], fp_dest)

    order = [back, bj, torso, fj, front] if not front_first else [front, fj, torso, bj, back]
    for layer in order:
        cv.alpha_composite(layer)
    return cv, T


def finalize(cv, anchor_canvas_x, floor=None):
    """Recorta a imagem com o chao na base. Retorna (img, ax relativo)."""
    bbox = cv.getbbox()
    x0, y0, x1, y1 = bbox
    if floor is not None:
        y1 = int(floor)
    img = cv.crop((x0, y0, x1, y1))
    ax = (anchor_canvas_x - x0) / img.width
    return img, round(max(0.0, min(1.0, ax)), 4)


def lowest_y(cv):
    a = np.array(cv)[:, :, 3] > 100
    ys = np.nonzero(a.any(axis=1))[0]
    return int(ys.max()) + 1


# ------------------------------------------------------------------ poses

def make_kick(rig):
    i = rig.info
    # angulo atual da perna da frente (pivot -> pe), medido a partir da vertical
    foot = ((i['front'][0] + i['front'][1]) / 2, i['ref_y'])
    leg_ang = math.degrees(math.atan2(foot[0] - i['fp'][0], foot[1] - i['fp'][1]))
    # queremos a perna apontando ~12 graus acima da horizontal (chute alto)
    front_ang = 90 + 12 - leg_ang
    back_foot = ((i['back'][0] + i['back'][1]) / 2, float(i['h']))
    cv, T = compose(rig, torso_ang=9, torso_pivot=back_foot, front_ang=front_ang, back_ang=-4)
    d = ImageDraw.Draw(cv)
    # ponto do pe estendido
    leg_len = math.hypot(foot[0] - i['fp'][0], foot[1] - i['fp'][1])
    hip = T(i['fp'])
    tip_ang = math.radians(12 + 9)
    tip = (hip[0] + math.cos(tip_ang) * leg_len, hip[1] - math.sin(tip_ang) * leg_len)
    col = ACCENT[rig.cid]
    # rastro de velocidade do chute (por baixo da perna, de onde ela veio)
    for k, r in enumerate(range(int(leg_len * 0.75), int(leg_len * 1.08), 6)):
        d.arc([hip[0] - r, hip[1] - r, hip[0] + r, hip[1] + r], start=8, end=62,
              fill=(*col, 170 - k * 18), width=3)
    for ang in (-35, -12, 10, 32):
        a = math.radians(ang)
        d.line([tip[0] + math.cos(a) * 10, tip[1] + math.sin(a) * 10,
                tip[0] + math.cos(a) * 30, tip[1] + math.sin(a) * 30], fill=(255, 255, 255, 230), width=2)
    floor = T(back_foot)[1]
    anchor = T(rig.anchor)[0]
    return finalize(cv, anchor, floor)


def make_walk(rig, front_ang, back_ang, torso_ang=0.0, lean_x=0):
    cv, T = compose(rig, torso_ang=torso_ang, front_ang=front_ang, back_ang=back_ang,
                    body_shift=(lean_x, 0))
    floor = lowest_y(cv)
    anchor = T(rig.anchor)[0]
    return finalize(cv, anchor, floor)


def make_knockdown(rig):
    i = rig.info
    # corpo arremessado para tras, pernas subindo
    cv, T = compose(rig, torso_ang=48, front_ang=-40, back_ang=-20)
    floor = lowest_y(cv)
    anchor = T((i['split'], i['hip_y']))[0]
    return finalize(cv, anchor, floor)


def make_fall(rig):
    """Lutador DEITADO DE COSTAS no chao: tronco na horizontal (cabeca para tras),
    perna da frente com joelho dobrado para cima, perna de tras esticada no piso."""
    i = rig.info
    cv, T = compose(rig, torso_ang=93, front_ang=20, back_ang=-8, front_first=False)
    floor = lowest_y(cv)
    d = ImageDraw.Draw(cv)
    bbox = cv.getbbox()
    x0, _, x1, _ = bbox
    # sombra de contato e poeira do impacto rente ao chao
    d.ellipse([x0 + 6, floor - 7, x1 - 6, floor + 5], fill=(0, 0, 0, 90))
    rng = np.random.default_rng(len(rig.cid))
    for px in range(x0 + 4, x1 - 10, 26):
        s = int(rng.integers(10, 20))
        d.ellipse([px, floor - s // 2 - 2, px + s * 2, floor + 3], fill=(148, 163, 184, 140))
        d.ellipse([px + 4, floor - s // 3 - 2, px + s * 2 - 6, floor + 1], fill=(203, 213, 225, 170))
    # estrelas de atordoamento sobre a cabeca (cabeca fica do lado esquerdo)
    head = T((i['w'] * 0.6, i['h'] * 0.12))
    for k, (ox, oy) in enumerate([(-18, -30), (4, -42), (26, -30)]):
        sx, sy = head[0] + ox, head[1] + oy
        pts = []
        for j in range(10):
            r = 8 if j % 2 == 0 else 3.5
            a = math.radians(-90 + j * 36)
            pts.append((sx + math.cos(a) * r, sy + math.sin(a) * r))
        d.polygon(pts, fill=(251, 191, 36, 250), outline=(120, 53, 15, 255))
    anchor = T((i['split'], i['hip_y']))[0]
    return finalize(cv, anchor, floor + 5)


# ------------------------------------------------------------------ metadata

def calc_anchor_x(frame, pose):
    a = np.array(frame)[:, :, 3] > 100
    fh, fw = a.shape
    y0 = 0 if pose in ('jump', 'fly', 'fall', 'knockdown') else int(fh * 0.6)
    ys, xs = np.nonzero(a[y0:])
    return round(float(xs.mean()) / fw, 4) if len(xs) else 0.5


def main():
    with open(META_JSON) as f:
        old_meta = json.load(f)
    generated = {}
    for cid in CHARS:
        rig = Rig(cid)
        out = {
            'kick': make_kick(rig),
            'walk1': make_walk(rig, front_ang=14, back_ang=-14),
            'walk2': make_walk(rig, front_ang=-20, back_ang=20),
            'back1': make_walk(rig, front_ang=8, back_ang=-18, torso_ang=5, lean_x=-4),
            'back2': make_walk(rig, front_ang=-16, back_ang=10, torso_ang=5, lean_x=-4),
            'knockdown': make_knockdown(rig),
            'fall': make_fall(rig),
        }
        generated[cid] = {}
        for pose, (img, ax) in out.items():
            img.save(os.path.join(SPR, f'{cid}_{pose}.png'))
            generated[cid][pose] = {'w': img.width, 'h': img.height, 'ax': ax}
        print(f'[{cid}] info={rig.info["split"], rig.info["hip_y"]} poses ok')

    meta = {}
    for c in CHARS:
        meta[c] = {}
        for p in ALL_POSES:
            if c in generated and p in generated[c]:
                meta[c][p] = generated[c][p]
            elif c in old_meta and p in old_meta[c]:
                meta[c][p] = old_meta[c][p]
            else:
                path = os.path.join(SPR, f'{c}_{p}.png')
                if os.path.exists(path):
                    im = Image.open(path).convert('RGBA')
                    meta[c][p] = {'w': im.width, 'h': im.height, 'ax': calc_anchor_x(im, p)}
    with open(META_JSON, 'w') as f:
        json.dump(meta, f, indent=2)
    with open(META_JS, 'w') as f:
        f.write('// Auto-generated metadata for all 11 fighters (14 poses incl. walk, kick, knockdown, fall)\n')
        f.write('window.SPRITE_META = ')
        f.write(json.dumps(meta, indent=2))
        f.write(';\n')
    print('meta.json e js/sprite_data.js atualizados')


if __name__ == '__main__':
    main()
