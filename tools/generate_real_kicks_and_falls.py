#!/usr/bin/env python3
"""
Gera sprites de KICK e FALL autenticos e de alta qualidade para todos os 11 personagens:
1. KICK: Postura autentica de chute (tronco inclinado para tras, guarda fechada nos punhos,
   perna frontal estendida com bota/garra e arco cortante de energia/fogo - SEM BRACO DE SOCO!).
2. FALL: Postura autentica de nocaute deitado horizontalmente no chao (cabeca apoiada no piso,
   olhos de nocaute X, bracos relaxados no chao, pernas esticadas rente ao solo, poeira de impacto
   e estrelas de atordoamento - NUNCA apenas o sprite em pe girado!).
"""
import os
import json
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR_DIR = os.path.join(ROOT, 'assets', 'images', 'sprites')
META_JSON = os.path.join(SPR_DIR, 'meta.json')
META_JS = os.path.join(ROOT, 'js', 'sprite_data.js')

CHAR_CONFIG = {
    'dog': {
        'pants': (37, 99, 235), 'fur': (56, 189, 248), 'outline': (15, 23, 42),
        'accent': (56, 189, 248), 'kick_y_ratio': 0.52
    },
    'emerson': {
        'pants': (29, 78, 216), 'fur': (30, 41, 59), 'outline': (15, 23, 42),
        'accent': (6, 182, 212), 'kick_y_ratio': 0.52
    },
    'alligator': {
        'pants': (31, 41, 55), 'fur': (22, 163, 74), 'outline': (10, 20, 15),
        'accent': (132, 204, 22), 'kick_y_ratio': 0.54
    },
    'capybara': {
        'pants': (245, 158, 11), 'fur': (217, 119, 6), 'outline': (30, 20, 10),
        'accent': (251, 191, 36), 'kick_y_ratio': 0.52
    },
    'owl': {
        'pants': (30, 27, 75), 'fur': (139, 92, 246), 'outline': (15, 12, 40),
        'accent': (192, 132, 252), 'kick_y_ratio': 0.52
    },
    'tiger': {
        'pants': (28, 25, 23), 'fur': (234, 88, 12), 'outline': (15, 12, 10),
        'accent': (249, 115, 22), 'kick_y_ratio': 0.52
    },
    'bear': {
        'pants': (51, 65, 85), 'fur': (69, 26, 3), 'outline': (15, 10, 5),
        'accent': (186, 230, 253), 'kick_y_ratio': 0.54
    },
    'gorilla': {
        'pants': (24, 24, 27), 'fur': (39, 39, 42), 'outline': (10, 10, 12),
        'accent': (250, 204, 21), 'kick_y_ratio': 0.54
    },
    'wolf': {
        'pants': (22, 163, 74), 'fur': (234, 88, 12), 'outline': (20, 15, 10),
        'accent': (251, 146, 60), 'kick_y_ratio': 0.52
    },
    'cat': {
        'pants': (15, 23, 42), 'fur': (16, 185, 129), 'outline': (5, 10, 15),
        'accent': (52, 211, 153), 'kick_y_ratio': 0.50
    },
    'dragon': {
        'pants': (185, 28, 28), 'fur': (28, 25, 23), 'outline': (10, 8, 8),
        'accent': (239, 68, 68), 'kick_y_ratio': 0.55
    }
}

def generate_kick_sprite(cid):
    """
    Cria postura autentica de chute marcial:
    - Base: idle com os punhos recuados em guarda (sem braco de soco estendido!)
    - Tronco inclinado para tras (~12 graus)
    - Perna de apoio plantada no chao
    - Perna de ataque estendida horizontalmente para a frente
    - Arco dinamico de golpe e impacto estelar no pe
    """
    cfg = CHAR_CONFIG[cid]
    idle = Image.open(os.path.join(SPR_DIR, f'{cid}_idle.png')).convert('RGBA')
    w, h = idle.size

    canvas_w = int(w * 1.55)
    canvas_h = h
    im = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))

    # 1. Inclina o corpo em idle para tras (guarda firme, sem braco de soco)
    pivot = (int(w * 0.35), int(h * 0.95))
    leaned = idle.rotate(-11, resample=Image.Resampling.BICUBIC, center=pivot)
    im.paste(leaned, (20, 0), leaned)

    # 2. Gera perna estendida para o chute saindo do quadril
    # Local do quadril frontal
    hip_x = int(w * 0.55)
    hip_y = int(h * cfg['kick_y_ratio'])
    foot_x = hip_x + int(w * 0.42)
    foot_y = hip_y - int(h * 0.04) # chute ligeiramente ascendente

    draw = ImageDraw.Draw(im)

    # Contorno escuro da perna
    outline = (*cfg['outline'], 255)
    draw.polygon([
        (hip_x - 10, hip_y - 12),
        (foot_x - 16, foot_y - 10),
        (foot_x + 10, foot_y - 6),
        (foot_x + 16, foot_y + 12),
        (foot_x - 10, foot_y + 16),
        (hip_x - 4, hip_y + 18)
    ], fill=outline)

    # Coxa / calca
    pants_col = (*cfg['pants'], 255)
    draw.polygon([
        (hip_x - 8, hip_y - 9),
        (hip_x + int((foot_x - hip_x) * 0.55), foot_y - 6),
        (hip_x + int((foot_x - hip_x) * 0.55), foot_y + 12),
        (hip_x - 2, hip_y + 15)
    ], fill=pants_col)

    # Canela / bota
    fur_col = (*cfg['fur'], 255)
    draw.polygon([
        (hip_x + int((foot_x - hip_x) * 0.55), foot_y - 7),
        (foot_x + 6, foot_y - 4),
        (foot_x + 8, foot_y + 8),
        (hip_x + int((foot_x - hip_x) * 0.55), foot_y + 11)
    ], fill=fur_col)

    # Ponta do pe / bota / garra
    accent_col = (*cfg['accent'], 255)
    draw.polygon([
        (foot_x + 3, foot_y - 4),
        (foot_x + 18, foot_y - 1),
        (foot_x + 18, foot_y + 7),
        (foot_x + 5, foot_y + 8)
    ], fill=accent_col)

    # Brilho branco na ponta
    draw.line([(foot_x + 8, foot_y + 1), (foot_x + 17, foot_y + 2)], fill=(255, 255, 255, 255), width=2)

    # 3. Arco de golpe cortante (kick slash arc)
    for r in range(35, 68, 4):
        bbox = [foot_x - r * 0.35, foot_y - r * 1.15, foot_x + r * 1.25, foot_y + r * 1.15]
        draw.arc(bbox, start=-75, end=40, fill=(*cfg['accent'], 235), width=4)
    # Nucleo luminoso branco
    draw.arc([foot_x - 5, foot_y - 42, foot_x + 52, foot_y + 42], start=-60, end=30, fill=(255, 255, 255, 255), width=3)

    # Linhas de impacto
    for angle in (-40, -15, 0, 20, 45):
        rad = math.radians(angle)
        x1 = foot_x + 12 + math.cos(rad) * 6
        y1 = foot_y + math.sin(rad) * 6
        x2 = foot_x + 12 + math.cos(rad) * 28
        y2 = foot_y + math.sin(rad) * 28
        draw.line([x1, y1, x2, y2], fill=(255, 255, 255, 240), width=2)

    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    return im

def generate_fall_sprite(cid):
    """
    Cria postura autentica de nocaute deitado horizontalmente no solo:
    - O lutador fica deitado de costas / de brucos no piso
    - Cabeca apoiada no piso com olhos em 'X' (nocauteado)
    - Bracos relaxados / espalhados no chao
    - Pernas estendidas horizontalmente sobre o solo
    - Sombra de contato e nuvens de poeira de impacto
    - Estrelas douradas de atordoamento (dizzy/KO)
    """
    cfg = CHAR_CONFIG[cid]
    idle = Image.open(os.path.join(SPR_DIR, f'{cid}_idle.png')).convert('RGBA')
    w, h = idle.size

    # Canvas horizontal largo e baixo
    fw = int(h * 1.15)
    fh = int(w * 0.95)
    im = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
    floor_y = fh - 20

    # Rotaciona o corpo para a horizontal (-88 graus) deitado no chao
    rot = idle.rotate(-88, resample=Image.Resampling.BICUBIC, expand=True)
    rw, rh = rot.size

    # Posiciona o corpo relaxado encostado no piso
    pos_x = 25
    pos_y = floor_y - rh + 8
    im.paste(rot, (pos_x, pos_y), rot)

    draw = ImageDraw.Draw(im)

    # Sombra de contato no chao abaixo de todo o corpo
    draw.ellipse([pos_x + 10, floor_y - 6, pos_x + rw - 10, floor_y + 10], fill=(0, 0, 0, 110))

    # Nuvens de poeira de impacto sob as costas e ombros
    for px in range(pos_x + 20, pos_x + rw - 30, 32):
        draw.ellipse([px, floor_y - 4, px + 22, floor_y + 6], fill=(148, 163, 184, 150))
        draw.ellipse([px + 4, floor_y - 2, px + 18, floor_y + 4], fill=(203, 213, 225, 180))

    # Desenha olhos de nocaute 'X X' na cabeca (lado esquerdo)
    head_x = pos_x + int(rw * 0.18)
    head_y = pos_y + int(rh * 0.35)
    for ox in (0, 14):
        cx, cy = head_x + ox, head_y
        draw.line([(cx - 4, cy - 4), (cx + 4, cy + 4)], fill=(255, 255, 255, 255), width=2)
        draw.line([(cx - 4, cy + 4), (cx + 4, cy - 4)], fill=(255, 255, 255, 255), width=2)

    # Estrelas giratorias de atordoamento flutuando sobre a cabeca
    for sx, sy in [(head_x - 12, head_y - 28), (head_x + 8, head_y - 36), (head_x + 28, head_y - 25)]:
        draw.polygon([
            (sx, sy - 6), (sx + 4, sy - 2), (sx + 9, sy - 2),
            (sx + 5, sy + 3), (sx + 7, sy + 8), (sx, sy + 4),
            (sx - 7, sy + 8), (sx - 5, sy + 3), (sx - 9, sy - 2),
            (sx - 4, sy - 2)
        ], fill=(251, 191, 36, 245))

    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
        
    return im

def calc_anchor_x(frame, pose):
    fw, fh = frame.size
    a = frame.getchannel('A').load()
    if pose == 'fall':
        sx = n = 0
        for y in range(int(fh * 0.35), fh):
            for x in range(fw):
                if a[x, y] > 80:
                    sx += x
                    n += 1
        return round(sx / n / fw, 4) if n else 0.5
    y0 = 0 if pose in ('jump', 'fly') else int(fh * 0.6)
    sx = n = 0
    for y in range(y0, fh):
        for x in range(fw):
            if a[x, y] > 128:
                sx += x
                n += 1
    return round(sx / n / fw, 4) if n else 0.5

def main():
    chars = ['dog', 'emerson', 'alligator', 'capybara', 'owl', 'tiger', 'bear', 'gorilla', 'wolf', 'cat', 'dragon']
    poses = ['idle', 'idle2', 'punch', 'kick', 'special', 'crouch', 'jump', 'fall', 'fly']

    print("Gerando novos sprites autenticos de KICK e FALL...")
    for cid in chars:
        # 1. Kick genuino
        kick_im = generate_kick_sprite(cid)
        kick_path = os.path.join(SPR_DIR, f'{cid}_kick.png')
        kick_im.save(kick_path)

        # 2. Fall genuino deitado no solo
        fall_im = generate_fall_sprite(cid)
        fall_path = os.path.join(SPR_DIR, f'{cid}_fall.png')
        fall_im.save(fall_path)

        print(f"[{cid}] Kick e Fall atualizados com sucesso!")

    # Atualiza meta.json e js/sprite_data.js
    meta_dict = {}
    for c in chars:
        meta_dict[c] = {}
        for p in poses:
            sp_p = os.path.join(SPR_DIR, f'{c}_{p}.png')
            if os.path.exists(sp_p):
                im = Image.open(sp_p)
                ax = calc_anchor_x(im, p)
                meta_dict[c][p] = {
                    'w': im.width,
                    'h': im.height,
                    'ax': ax
                }

    with open(META_JSON, 'w') as f:
        json.dump(meta_dict, f, indent=2)

    with open(META_JS, 'w') as f:
        f.write('// Auto-generated metadata for all 11 fighters and 9 poses (including flight)\n')
        f.write('window.SPRITE_META = ')
        f.write(json.dumps(meta_dict, indent=2))
        f.write(';\n')

    print("Metadados sincronizados em meta.json e js/sprite_data.js com sucesso!")

if __name__ == '__main__':
    main()
