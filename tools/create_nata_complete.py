#!/usr/bin/env python3
"""
Gera o pacote completo de sprites e portrait para Natã (O Mestre do Frontend / Código):
- Assets:
  - assets/images/sprites/nata_idle.png (já existe, base)
  - assets/images/sprites/nata_idle2.png (respiração)
  - assets/images/sprites/nata_punch.png (soco desenvolvedor com tags <code />)
  - assets/images/sprites/nata_crouch.png (agachado)
  - assets/images/sprites/nata_jump.png (pulo de combate)
  - assets/images/sprites/nata_special.png (postura Hadouken de código carregando)
  - assets/images/sprites/nata_fly.png (voo / dash com rastro de estilo)
- Retrato Arcade:
  - assets/images/portrait_nata.jpg (1024x1024 com moldura arcade neon, matriz de código HTML/CSS e banner)
"""
import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR_DIR = os.path.join(ROOT, 'assets', 'images', 'sprites')
IMG_DIR = os.path.join(ROOT, 'assets', 'images')
FONT_BOLD = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'

def load_idle():
    return Image.open(os.path.join(SPR_DIR, 'nata_idle.png')).convert('RGBA')

def create_idle2():
    im = load_idle()
    w, h = im.size
    arr = np.array(im)
    out = arr.copy()
    # Respiracao: afunda levemente os ombros e cabeca em 2px
    split_y = 190
    for y in range(split_y):
        shift = int(round(2 * (1 - y / split_y)))
        src_y = max(0, min(h - 1, y - shift))
        out[y] = arr[src_y]
    res = Image.fromarray(out, 'RGBA')
    res.save(os.path.join(SPR_DIR, 'nata_idle2.png'))
    print("nata_idle2.png gerado")

def create_punch():
    """Gera pose de soco direto com braco estendido e explosao de tags <div />, { css }"""
    im = load_idle()
    w, h = im.size
    
    # Canvas mais largo para o soco
    pw = int(w * 1.55)
    canvas = Image.new('RGBA', (pw, h), (0, 0, 0, 0))
    
    # Corpo inclinado para a frente
    lean = im.rotate(6, resample=Image.Resampling.BICUBIC, center=(int(w*0.4), h - 10))
    canvas.paste(lean, (10, 0), lean)
    
    draw = ImageDraw.Draw(canvas)
    
    # Braco estendido para frente (nivel do ombro/peito: y ~ 95 a 115)
    shoulder_x = int(w * 0.72)
    shoulder_y = 96
    fist_x = shoulder_x + int(w * 0.55)
    fist_y = shoulder_y + 2
    
    # Contorno e pele do braco musculoso
    # Braco musculoso com manga laranja
    draw.polygon([
        (shoulder_x - 4, shoulder_y - 12),
        (shoulder_x + 18, shoulder_y - 16),
        (shoulder_x + 22, shoulder_y + 16),
        (shoulder_x - 6, shoulder_y + 12)
    ], fill=(234, 88, 12, 255)) # manga laranja
    
    # Biceps e antebraco
    draw.polygon([
        (shoulder_x + 12, shoulder_y - 10),
        (fist_x - 22, shoulder_y - 9),
        (fist_x - 2, shoulder_y - 6),
        (fist_x - 2, shoulder_y + 10),
        (fist_x - 22, shoulder_y + 11),
        (shoulder_x + 14, shoulder_y + 12)
    ], fill=(245, 170, 130, 255))
    
    # Luva preta com munhequeira azul
    draw.rectangle([fist_x - 24, shoulder_y - 9, fist_x - 14, shoulder_y + 10], fill=(37, 99, 235, 255)) # munhequeira
    draw.ellipse([fist_x - 14, shoulder_y - 10, fist_x + 12, shoulder_y + 10], fill=(20, 20, 25, 255)) # luva preta
    # Detalhe dourado da luva
    draw.line([(fist_x - 4, shoulder_y - 6), (fist_x + 6, shoulder_y - 6)], fill=(234, 179, 8, 255), width=2)
    
    # Efeito de soco de programador: onda de impacto ciano/laranja com brackets < / >
    accent = (56, 189, 248)
    for r in range(20, 48, 6):
        bbox = [fist_x - r * 0.4, fist_y - r, fist_x + r * 1.1, fist_y + r]
        draw.arc(bbox, start=-75, end=75, fill=(*accent, 220), width=3)
    
    # Brackets de codigo desenhados no impacto: < >
    # Símbolo '<'
    draw.line([(fist_x + 18, fist_y - 16), (fist_x + 30, fist_y - 4)], fill=(249, 115, 22, 255), width=3)
    draw.line([(fist_x + 30, fist_y - 4), (fist_x + 18, fist_y + 8)], fill=(249, 115, 22, 255), width=3)
    # Símbolo '>'
    draw.line([(fist_x + 36, fist_y - 16), (fist_x + 24, fist_y - 4)], fill=(56, 189, 248, 255), width=3)
    draw.line([(fist_x + 24, fist_y - 4), (fist_x + 36, fist_y + 8)], fill=(56, 189, 248, 255), width=3)

    bbox = canvas.getbbox()
    res = canvas.crop(bbox) if bbox else canvas
    res.save(os.path.join(SPR_DIR, 'nata_punch.png'))
    print("nata_punch.png gerado")

def create_crouch():
    im = load_idle()
    w, h = im.size
    # Reduz altura comprimindo as pernas e abaixando o tronco
    cw = int(w * 1.1)
    ch = int(h * 0.76)
    res = im.resize((cw, ch), Image.Resampling.LANCZOS)
    res.save(os.path.join(SPR_DIR, 'nata_crouch.png'))
    print("nata_crouch.png gerado")

def create_jump():
    im = load_idle()
    w, h = im.size
    # Pulo: pernas mais recolhidas, ligeira rotacao
    rot = im.rotate(8, resample=Image.Resampling.BICUBIC, expand=True)
    # Reduz ligeiramente a parte de baixo
    res = rot.resize((int(rot.width * 0.95), int(rot.height * 0.92)), Image.Resampling.LANCZOS)
    res.save(os.path.join(SPR_DIR, 'nata_jump.png'))
    print("nata_jump.png gerado")

def create_special():
    """Postura de carregar HADOUKEN de código com ambas as mãos na lateral e esfera de energia dev"""
    im = load_idle()
    w, h = im.size
    
    canvas = Image.new('RGBA', (int(w * 1.4), h), (0, 0, 0, 0))
    # Tronco inclinado para tras carregando energia
    rot = im.rotate(-6, resample=Image.Resampling.BICUBIC, center=(int(w*0.5), h - 10))
    canvas.paste(rot, (25, 0), rot)
    
    draw = ImageDraw.Draw(canvas)
    
    # Centro da esfera de energia Hadouken nas maos (lateral direita):
    ball_x = int(w * 0.88)
    ball_y = 135
    
    # Orbe de plasma Hadouken HTML5 / CSS3
    for rad, alpha in [(42, 40), (32, 90), (22, 180), (14, 255)]:
        draw.ellipse([ball_x - rad, ball_y - rad, ball_x + rad, ball_y + rad], 
                     fill=(249, 115, 22, alpha), outline=(56, 189, 248, alpha), width=2)
    # Centro branco puro
    draw.ellipse([ball_x - 8, ball_y - 8, ball_x + 8, ball_y + 8], fill=(255, 255, 255, 255))
    
    # Fagulhas e simbolos de codigo orbitando a esfera: { } < > /
    for angle in (-60, -20, 25, 70, 130, 200, 260):
        rad = math.radians(angle)
        dist = 36
        px = ball_x + math.cos(rad) * dist
        py = ball_y + math.sin(rad) * dist
        draw.line([ball_x + math.cos(rad)*15, ball_y + math.sin(rad)*15, px, py], fill=(56, 189, 248, 220), width=2)
        draw.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(255, 255, 255, 255))

    bbox = canvas.getbbox()
    res = canvas.crop(bbox) if bbox else canvas
    res.save(os.path.join(SPR_DIR, 'nata_special.png'))
    print("nata_special.png gerado")

def create_fly():
    im = load_idle()
    rot = im.rotate(14, resample=Image.Resampling.BICUBIC, expand=True)
    rot.save(os.path.join(SPR_DIR, 'nata_fly.png'))
    print("nata_fly.png gerado")

def generate_portrait_nata():
    """Gera portrait 1024x1024 no padrão épico dos outros personagens"""
    w, h = 1024, 1024
    im = Image.new('RGB', (w, h), (10, 15, 28))
    
    # Fundo Cyber Matrix com gradiente azul escuro / ciano / laranja
    bg_arr = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        r = 12 + 25 * (1 - y / h)
        g = 18 + 30 * (1 - y / h)
        b = 35 + 50 * (1 - y / h)
        bg_arr[y, :] = [r, g, b]
    im = Image.fromarray(bg_arr.astype(np.uint8))
    
    draw = ImageDraw.Draw(im)
    
    # Grid de linhas cibernéticas sutis
    for x in range(0, w, 40):
        draw.line([(x, 0), (x, h)], fill=(15, 35, 60), width=1)
    for y in range(0, h, 40):
        draw.line([(0, y), (w, y)], fill=(15, 35, 60), width=1)
        
    # Chuva de partículas de código luminosas (laranja HTML e azul CSS)
    np.random.seed(42)
    code_snippets = ['<div>', '</div>', '{ flex }', '<style>', 'npm run', 'git push', '<css>', 'const', '=>', 'border', '★']
    try:
        code_font = ImageFont.truetype(FONT_BOLD, 22)
    except:
        code_font = ImageFont.load_default()
        
    for _ in range(35):
        cx = np.random.randint(40, w - 80)
        cy = np.random.randint(40, h - 180)
        snippet = np.random.choice(code_snippets)
        col = (249, 115, 22) if np.random.rand() > 0.5 else (56, 189, 248)
        draw.text((cx, cy), snippet, font=code_font, fill=(*col, 90))
        
    # Halo luminoso circular atrás do busto de Natã
    draw.ellipse([w//2 - 270, 70, w//2 + 270, 610], fill=(249, 115, 22, 60), outline=(56, 189, 248), width=3)
    
    # Busto de Natã ampliado e focado
    idle = load_idle()
    # Pega apenas da cintura para cima (busto)
    bust = idle.crop((0, 0, idle.width, int(idle.height * 0.62)))
    scale = (h * 0.72) / bust.height
    nw, nh = int(bust.width * scale), int(bust.height * scale)
    bust_lg = bust.resize((nw, nh), Image.Resampling.NEAREST)
    
    # Glow colorido ao redor de Natã
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gx = (w - nw) // 2
    gy = h - nh - 110
    glow.paste(bust_lg, (gx, gy), bust_lg)
    glow_blur = glow.filter(ImageFilter.GaussianBlur(radius=20))
    glow_arr = np.array(glow_blur)
    glow_arr[:, :, 0] = np.clip(glow_arr[:, :, 0] * 1.0, 0, 255) # Laranja HTML
    glow_arr[:, :, 1] = np.clip(glow_arr[:, :, 1] * 0.6, 0, 255)
    glow_arr[:, :, 2] = np.clip(glow_arr[:, :, 2] * 0.1, 0, 255)
    glow_colored = Image.fromarray(glow_arr)
    
    im.paste(glow_colored, (0, 0), glow_colored)
    im.paste(bust_lg, (gx, gy), bust_lg)
    
    # Vignette arcade
    cx_f, cy_f = w / 2, h / 2
    max_d = math.hypot(cx_f, cy_f) * 0.75
    y_g, x_g = np.ogrid[:h, :w]
    d_g = np.hypot(x_g - cx_f, y_g - cy_f)
    v_mask = np.clip((d_g - max_d * 0.45) / (max_d * 0.55), 0, 1) * 0.88
    mask_im = Image.fromarray((v_mask * 255).astype(np.uint8))
    im.paste(Image.new('RGB', (w, h), (0, 0, 0)), (0, 0), mask_im)
    
    # Moldura Arcade e Banner de Herói
    draw = ImageDraw.Draw(im)
    border_w = 28
    draw.rectangle([0, 0, w, border_w], fill=(12, 14, 20))
    draw.rectangle([0, h - border_w, w, h], fill=(12, 14, 20))
    draw.rectangle([0, 0, border_w, h], fill=(12, 14, 20))
    draw.rectangle([w - border_w, 0, w, h], fill=(12, 14, 20))
    draw.rectangle([border_w, border_w, w - border_w, h - border_w], outline=(249, 115, 22), width=4)
    
    # Cantoneiras
    for c_x, c_y in [(border_w, border_w), (w - border_w, border_w), (border_w, h - border_w), (w - border_w, h - border_w)]:
        draw.ellipse([c_x - 8, c_y - 8, c_x + 8, c_y + 8], fill=(220, 220, 230), outline=(0, 0, 0), width=2)
        
    # Banner arcade inferior com nome e título
    try:
        font_name = ImageFont.truetype(FONT_BOLD, 78)
        font_sub = ImageFont.truetype(FONT_BOLD, 26)
    except:
        font_name = font_sub = ImageFont.load_default()
        
    name_text = "NATÃ"
    sub_text = "MESTRE DO FRONTEND"
    
    bbox_n = font_name.getbbox(name_text)
    tw_n, th_n = bbox_n[2] - bbox_n[0], bbox_n[3] - bbox_n[1]
    bbox_s = font_sub.getbbox(sub_text)
    tw_s, th_s = bbox_s[2] - bbox_s[0], bbox_s[3] - bbox_s[1]
    
    banner_w = max(tw_n, tw_s) + 70
    banner_h = th_n + th_s + 38
    bx = (w - banner_w) // 2
    by = h - 170
    
    draw.rectangle([bx, by, bx + banner_w, by + banner_h], fill=(10, 14, 22), outline=(56, 189, 248), width=3)
    
    # Nome 3D em camadas
    nx = (w - tw_n) // 2
    ny = by + 8
    for ox, oy in [(-3, -3), (3, -3), (-3, 3), (3, 3), (0, 4)]:
        draw.text((nx + ox, ny + oy), name_text, font=font_name, fill=(0, 0, 0))
    draw.text((nx, ny), name_text, font=font_name, fill=(249, 115, 22))
    
    # Subtítulo
    sx = (w - tw_s) // 2
    sy = ny + th_n + 12
    draw.text((sx, sy), sub_text, font=font_sub, fill=(56, 189, 248))
    
    out_p = os.path.join(IMG_DIR, 'portrait_nata.jpg')
    im.save(out_p, 'JPEG', quality=95)
    print("portrait_nata.jpg gerado com sucesso!")

if __name__ == '__main__':
    create_idle2()
    create_punch()
    create_crouch()
    create_jump()
    create_special()
    create_fly()
    generate_portrait_nata()
    print("Todos os sprites base e portrait de Natã gerados com sucesso!")
