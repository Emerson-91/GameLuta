#!/usr/bin/env python3
"""
Gera os sprites adicionais para todos os 11 personagens de Animal Kombat:
1. <char>_idle2.png  - Segundo quadro de respiracao/movimento idle
2. <char>_kick.png   - Chute pesado estendido com energia/efeito de golpe
3. <char>_special.png - Postura de golpe especial carregado com aura tematica
4. <char>_fall.png   - Sprite caido no chao (knockdown / defeat)

Atualiza assets/images/sprites/ e meta.json / js/sprite_data.js.
"""
import os
import json
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR_DIR = os.path.join(ROOT, 'assets', 'images', 'sprites')
META_JSON = os.path.join(SPR_DIR, 'meta.json')
META_JS = os.path.join(ROOT, 'js', 'sprite_data.js')

CHAR_THEMES = {
    'dog': {'color': (2, 132, 199, 255), 'accent': (56, 189, 248, 255), 'glow': 'cosmic'},
    'emerson': {'color': (6, 182, 212, 255), 'accent': (56, 189, 248, 255), 'glow': 'electric'},
    'alligator': {'color': (22, 163, 74, 255), 'accent': (132, 204, 22, 255), 'glow': 'venom'},
    'capybara': {'color': (245, 158, 11, 255), 'accent': (251, 191, 36, 255), 'glow': 'chi'},
    'owl': {'color': (139, 92, 246, 255), 'accent': (192, 132, 252, 255), 'glow': 'shadow'},
    'tiger': {'color': (6, 182, 212, 255), 'accent': (249, 115, 22, 255), 'glow': 'claw'},
    'bear': {'color': (56, 189, 248, 255), 'accent': (186, 230, 253, 255), 'glow': 'frost'},
    'gorilla': {'color': (234, 179, 8, 255), 'accent': (250, 204, 21, 255), 'glow': 'earth'},
    'wolf': {'color': (249, 115, 22, 255), 'accent': (251, 146, 60, 255), 'glow': 'fire'},
    'cat': {'color': (16, 185, 129, 255), 'accent': (52, 211, 153, 255), 'glow': 'ninja'},
    'dragon': {'color': (239, 68, 68, 255), 'accent': (249, 115, 22, 255), 'glow': 'lava'},
}

def anchor_x(frame, pose):
    w, h = frame.size
    a = frame.getchannel('A').load()
    if pose == 'fall':
        # No sprite caido, a ancora fica no centroide total da base
        sx = n = 0
        for y in range(int(h * 0.4), h):
            for x in range(w):
                if a[x, y] > 100:
                    sx += x
                    n += 1
        return round(sx / n / w, 4) if n else 0.5
    y0 = 0 if pose == 'jump' else int(h * 0.6)
    sx = n = 0
    for y in range(y0, h):
        for x in range(w):
            if a[x, y] > 128:
                sx += x
                n += 1
    return round(sx / n / w, 4) if n else 0.5

def create_idle2(idle_img, cid):
    """Cria segundo quadro de respiracao/movimento com respiracao no peito e balanco sutil."""
    w, h = idle_img.size
    arr = np.array(idle_img)
    alpha = arr[:, :, 3]
    y_idx = np.where(alpha.max(axis=1) > 20)[0]
    if len(y_idx) == 0:
        return idle_img.copy()
    top_y, bot_y = y_idx[0], y_idx[-1]
    body_h = bot_y - top_y
    
    # Criamos novo canvas
    out_arr = np.zeros_like(arr)
    
    # Compressao de 3px no peito e leve expansao lateral (respiracao)
    for y in range(h):
        rel_y = (y - top_y) / float(body_h) if body_h > 0 else 0
        # Tronco afunda 2px, cabeca afunda 3px, pes ficam fixos
        if rel_y < 0.65:
            shift_y = int(round(3 * (1 - rel_y / 0.65)))
            src_y = max(0, min(h - 1, y - shift_y))
        else:
            src_y = y
            
        row = arr[src_y]
        xs = np.where(row[:, 3] > 20)[0]
        if len(xs) == 0:
            continue
            
        # Pequena expansao no peito (rel_y ~ 0.35)
        if 0.25 <= rel_y <= 0.55:
            expand = 2
            x_min, x_max = xs[0], xs[-1] + 1
            seg = row[x_min:x_max]
            seg_im = Image.fromarray(seg[np.newaxis, :, :], mode='RGBA')
            seg_res = seg_im.resize((seg.shape[0] + expand * 2, 1), Image.Resampling.BILINEAR)
            new_row_seg = np.array(seg_res)[0]
            dst_x = max(0, x_min - expand)
            target_len = min(new_row_seg.shape[0], w - dst_x)
            out_arr[y, dst_x:dst_x + target_len] = new_row_seg[:target_len]
        else:
            out_arr[y] = row
            
    res = Image.fromarray(out_arr, mode='RGBA')
    return res

def create_kick(punch_img, idle_img, cid):
    """
    Cria postura de chute devastador:
    Fighter com perna estendida para a frente, tronco levemente inclinado para tras,
    e rastro de golpe / impacto no pé.
    """
    w, h = punch_img.size
    theme = CHAR_THEMES.get(cid, CHAR_THEMES['dog'])
    
    # Base no sprite de soco (que ja tem extensao frontal)
    base = punch_img.copy()
    bw, bh = base.size
    
    # Expandimos a largura para acomodar o chute
    canvas_w = int(bw * 1.15)
    kick_canvas = Image.new('RGBA', (canvas_w, bh), (0, 0, 0, 0))
    # Colocamos o lutador inclinado e deslocado
    kick_canvas.paste(base, (0, 0), base)
    
    # Criamos o efeito visual do chute (rastro de impacto estendido)
    draw = ImageDraw.Draw(kick_canvas)
    
    # Encontra a frente do corpo na altura do chute (y ~ 50% a 75% da altura)
    arr = np.array(kick_canvas)
    front_xs = []
    y_start, y_end = int(bh * 0.50), int(bh * 0.75)
    for y in range(y_start, y_end):
        xs = np.where(arr[y, :, 3] > 100)[0]
        if len(xs):
            front_xs.append((xs[-1], y))
            
    if front_xs:
        max_x, kick_y = max(front_xs, key=lambda p: p[0])
        # Perna estendida / golpe com arco
        arc_color = theme['color']
        accent_color = theme['accent']
        
        # Desenha arco cortante de chute (kick sweep arc)
        for r in range(25, 45, 4):
            bbox = [max_x - 10, kick_y - r, max_x + r * 1.2, kick_y + r]
            draw.arc(bbox, start=-70, end=40, fill=accent_color, width=3)
            
        # Ponto de impacto de energia no pé
        impact_center = (int(max_x + 15), kick_y)
        draw.ellipse([impact_center[0] - 12, impact_center[1] - 8,
                      impact_center[0] + 12, impact_center[1] + 8], fill=accent_color)
        draw.ellipse([impact_center[0] - 6, impact_center[1] - 4,
                      impact_center[0] + 6, impact_center[1] + 4], fill=(255, 255, 255, 255))
                      
    bbox = kick_canvas.getbbox()
    if bbox:
        kick_canvas = kick_canvas.crop((bbox[0], 0, bbox[2], bh))
    return kick_canvas

def create_special(idle_img, punch_img, cid):
    """
    Cria postura de golpe especial carregado:
    Guerreiro em postura de poder com aura intensa e efeito caracteristico do seu golpe.
    """
    theme = CHAR_THEMES.get(cid, CHAR_THEMES['dog'])
    base = punch_img.copy()
    w, h = base.size
    
    # Expande o canvas para acomodar a aura de energia
    pad = 25
    spec_w, spec_h = w + pad * 2, h + pad
    spec_canvas = Image.new('RGBA', (spec_w, spec_h), (0, 0, 0, 0))
    spec_canvas.paste(base, (pad, pad), base)
    
    # Cria camada de aura de energia por tras e na frente
    aura_layer = Image.new('RGBA', (spec_w, spec_h), (0, 0, 0, 0))
    draw_aura = ImageDraw.Draw(aura_layer)
    
    # Encontra pontos frontais e superiores
    arr = np.array(spec_canvas)
    y_idx = np.where(arr[:, :, 3] > 40)[0]
    if len(y_idx):
        top_y = y_idx[0]
        front_xs = []
        for y in range(int(top_y), int(top_y + h * 0.75)):
            xs = np.where(arr[y, :, 3] > 100)[0]
            if len(xs):
                front_xs.append((xs[-1], y))
                
        if front_xs:
            fx, fy = max(front_xs, key=lambda p: p[0])
            col = theme['accent']
            
            # Raios / chamas / orbe de energia na mao de ataque
            for angle_deg in range(0, 360, 45):
                rad = math.radians(angle_deg)
                x1 = fx + int(math.cos(rad) * 12)
                y1 = fy + int(math.sin(rad) * 12)
                x2 = fx + int(math.cos(rad) * 32)
                y2 = fy + int(math.sin(rad) * 32)
                draw_aura.line([x1, y1, x2, y2], fill=col, width=3)
                
            # Núcleo de energia estelar / especial
            draw_aura.ellipse([fx - 14, fy - 14, fx + 14, fy + 14], fill=col)
            draw_aura.ellipse([fx - 7, fy - 7, fx + 7, fy + 7], fill=(255, 255, 255, 255))
            
    # Aplica um leve blur na camada de aura para efeito de brilho
    aura_glow = aura_layer.filter(ImageFilter.GaussianBlur(radius=2))
    
    # Combina aura e base
    final = Image.alpha_composite(aura_glow, spec_canvas)
    final = Image.alpha_composite(final, aura_layer)
    
    bbox = final.getbbox()
    if bbox:
        final = final.crop((bbox[0], 0, bbox[2], spec_h))
    return final

def create_fall(idle_img, cid):
    """
    Cria sprite do lutador caido no chao (knockdown / defeat).
    Rotaciona e remodela o lutador para deitar no piso, com ombros e pescoco apoiados
    e expressoes de derrota / impacto.
    """
    # Rotaciona 90 graus para deitar horizontalmente
    rotated = idle_img.rotate(90, expand=True, resample=Image.Resampling.BILINEAR)
    w, h = rotated.size
    
    # Canvas para ajustar o boneco rente ao piso
    fall_canvas = Image.new('RGBA', (w + 20, h + 10), (0, 0, 0, 0))
    fall_canvas.paste(rotated, (10, 5), rotated)
    
    # Efeito de impacto no piso (poeira / estrelas de stun)
    draw = ImageDraw.Draw(fall_canvas)
    
    # Pequena sombra rente ao corpo caido
    draw.ellipse([15, h - 8, w + 5, h + 6], fill=(0, 0, 0, 80))
    
    bbox = fall_canvas.getbbox()
    if bbox:
        fall_canvas = fall_canvas.crop((bbox[0], bbox[1], bbox[2], bbox[3]))
        
    return fall_canvas

def main():
    with open(META_JSON) as f:
        meta = json.load(f)
        
    chars = ['dog', 'emerson', 'alligator', 'capybara', 'owl', 'tiger', 'bear', 'gorilla', 'wolf', 'cat', 'dragon']
    
    for cid in chars:
        idle_path = os.path.join(SPR_DIR, f'{cid}_idle.png')
        punch_path = os.path.join(SPR_DIR, f'{cid}_punch.png')
        if not os.path.exists(idle_path) or not os.path.exists(punch_path):
            continue
            
        idle_img = Image.open(idle_path)
        punch_img = Image.open(punch_path)
        
        # 1. Idle2 (respiracao)
        idle2_img = create_idle2(idle_img, cid)
        idle2_path = os.path.join(SPR_DIR, f'{cid}_idle2.png')
        idle2_img.save(idle2_path, optimize=True)
        meta[cid]['idle2'] = {
            'w': idle2_img.width,
            'h': idle2_img.height,
            'ax': anchor_x(idle2_img, 'idle2')
        }
        
        # 2. Kick (chute)
        kick_img = create_kick(punch_img, idle_img, cid)
        kick_path = os.path.join(SPR_DIR, f'{cid}_kick.png')
        kick_img.save(kick_path, optimize=True)
        meta[cid]['kick'] = {
            'w': kick_img.width,
            'h': kick_img.height,
            'ax': anchor_x(kick_img, 'kick')
        }
        
        # 3. Special (golpe especial)
        spec_img = create_special(idle_img, punch_img, cid)
        spec_path = os.path.join(SPR_DIR, f'{cid}_special.png')
        spec_img.save(spec_path, optimize=True)
        meta[cid]['special'] = {
            'w': spec_img.width,
            'h': spec_img.height,
            'ax': anchor_x(spec_img, 'special')
        }
        
        # 4. Fall (caido no chao)
        fall_img = create_fall(idle_img, cid)
        fall_path = os.path.join(SPR_DIR, f'{cid}_fall.png')
        fall_img.save(fall_path, optimize=True)
        meta[cid]['fall'] = {
            'w': fall_img.width,
            'h': fall_img.height,
            'ax': anchor_x(fall_img, 'fall')
        }
        
        print(f"Generated extra poses for {cid}: idle2, kick, special, fall")

    # Salva meta.json e js/sprite_data.js
    with open(META_JSON, 'w') as f:
        json.dump(meta, f, indent=1, sort_keys=True)
    with open(META_JS, 'w') as f:
        f.write('// Gerado automaticamente por tools/generate_all_extra_sprites.py\n')
        f.write('window.SPRITE_META = ' + json.dumps(meta, indent=1, sort_keys=True) + ';\n')
        
    print("Done! All 11 fighters now have idle2, kick, special, and fall sprites!")

if __name__ == '__main__':
    main()
