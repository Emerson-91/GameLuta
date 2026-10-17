#!/usr/bin/env python3
"""Ajusta o sprite de Emerson para deixa-lo mais encorpado/gordinho (barriga arredondada de brawler).
Morfologia: alarga o tronco e a regiao da barriga/cintura com curva suave, preservando nitidez pixel-art.
"""
import json
import os
from PIL import Image
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR_DIR = os.path.join(ROOT, 'assets', 'images', 'sprites')
META_JSON = os.path.join(SPR_DIR, 'meta.json')
META_JS = os.path.join(ROOT, 'js', 'sprite_data.js')

def morph_chubby(img, belly_boost=18, forward_belly_bias=0.85):
    """
    Expande suavemente a barriga e o tronco de Emerson para frente e pros lados.
    """
    img = img.convert('RGBA')
    w, h = img.size
    arr = np.array(img)
    alpha = arr[:, :, 3]
    
    # Encontra topo e base do corpo
    y_idx = np.where(alpha.max(axis=1) > 20)[0]
    if len(y_idx) == 0:
        return img
    top_y, bot_y = y_idx[0], y_idx[-1]
    body_h = bot_y - top_y
    
    # Cria tela com margem extra
    pad_w = belly_boost * 3
    new_w = w + pad_w * 2
    out_arr = np.zeros((h, new_w, 4), dtype=np.uint8)
    
    for y in range(h):
        row = arr[y]
        xs = np.where(row[:, 3] > 20)[0]
        if len(xs) == 0:
            continue
            
        rel_y = (y - top_y) / float(body_h)
        
        # Curva de intensidade:
        # Tronco comeca em rel_y ~ 0.28, barriga tem pico em 0.50 - 0.62, quadris em 0.70
        if 0.25 <= rel_y <= 0.82:
            # Curva de sino para a barriguinha saliente
            bell = np.exp(-((rel_y - 0.55) ** 2) / (2 * (0.14 ** 2)))
            # Expansao total da linha
            w_add = int(round(belly_boost * bell))
            # Barriga empurrando para a frente (direcao da face = direita)
            fwd_add = int(round(w_add * forward_belly_bias))
            back_add = w_add - fwd_add
        else:
            w_add = 0
            fwd_add = 0
            back_add = 0
            
        x_min, x_max = xs[0], xs[-1] + 1
        row_segment = row[x_min:x_max]
        orig_w = x_max - x_min
        target_w = orig_w + w_add
        
        if target_w <= 0:
            continue
            
        # Rescale horizontal mantendo pixel art
        seg_2d = row_segment[np.newaxis, :, :]  # shape: (1, orig_w, 4)
        seg_im = Image.fromarray(seg_2d, mode='RGBA')
        rescaled_im = seg_im.resize((target_w, 1), Image.Resampling.BILINEAR)
        rescaled_2d = np.array(rescaled_im)[0]
        
        # Posicionamento no novo canvas (com deslocamento para frente)
        dst_x = pad_w + x_min - back_add
        out_arr[y, dst_x:dst_x + target_w] = rescaled_2d

    res = Image.fromarray(out_arr, mode='RGBA')
    # Corta bordas vazias
    bbox = res.getbbox()
    if bbox:
        res = res.crop((bbox[0], 0, bbox[2], h))
    return res

def anchor_x(frame, pose):
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
    meta = {}
    if os.path.exists(META_JSON):
        with open(META_JSON) as f:
            meta = json.load(f)
            
    poses = ['idle', 'punch', 'crouch', 'jump']
    info = {}
    
    # Boosts customizados para cada pose do Emerson
    boosts = {
        'idle': 34,     # barriga evidente na pose em pé
        'punch': 30,    # barriga visível ao socar
        'crouch': 28,   # barriga saliente ao agachar
        'jump': 26      # corpo encorpado no pulo
    }
    
    for pose in poses:
        src_path = os.path.join(SPR_DIR, f'emerson_{pose}.png')
        img = Image.open(src_path)
        chubby_img = morph_chubby(img, belly_boost=boosts[pose], forward_belly_bias=0.82)
        chubby_img.save(src_path, optimize=True)
        info[pose] = {
            'w': chubby_img.width,
            'h': chubby_img.height,
            'ax': anchor_x(chubby_img, pose)
        }
        
    meta['emerson'] = info
    with open(META_JSON, 'w') as f:
        json.dump(meta, f, indent=1, sort_keys=True)
    with open(META_JS, 'w') as f:
        f.write('// Gerado automaticamente por tools/slice_sheet.py - nao editar manualmente\n')
        f.write('window.SPRITE_META = ' + json.dumps(meta, indent=1, sort_keys=True) + ';\n')
        
    print("Emerson chubby updated:", json.dumps(info))

if __name__ == '__main__':
    main()
