#!/usr/bin/env python3
"""
Gera os retratos de selecao focados SOMENTE NO BUSTO para:
- Unicao (Super Cao)
- Emerson (Mestre dos Servidores)

Garante enquadramento perfeito (cabeca, ombros, peito e punhos em guarda)
para caber com impacto visual nos cards de selecao (72x82) e no preview card (140px).
"""
import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'assets', 'images')
SPR_DIR = os.path.join(ROOT, 'assets', 'images', 'sprites')
FONT_PATH = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'

def add_vignette(im, radius=0.75, intensity=0.85):
    w, h = im.size
    cx, cy = w / 2, h / 2
    max_d = math.hypot(cx, cy) * radius
    y, x = np.ogrid[:h, :w]
    d = np.hypot(x - cx, y - cy)
    v = np.clip((d - max_d * 0.4) / (max_d * 0.6), 0, 1) * intensity
    v_mask = Image.fromarray((v * 255).astype(np.uint8))
    black = Image.new('RGB', (w, h), (0, 0, 0))
    im.paste(black, (0, 0), v_mask)
    return im

def draw_arcade_frame(draw, w, h, theme_color):
    border_w = 26
    draw.rectangle([0, 0, w, border_w], fill=(12, 14, 20))
    draw.rectangle([0, h - border_w, w, h], fill=(12, 14, 20))
    draw.rectangle([0, 0, border_w, h], fill=(12, 14, 20))
    draw.rectangle([w - border_w, 0, w, h], fill=(12, 14, 20))
    
    draw.rectangle([border_w, border_w, w - border_w, h - border_w], outline=theme_color, width=4)
    for cx, cy in [(border_w, border_w), (w - border_w, border_w), (border_w, h - border_w), (w - border_w, h - border_w)]:
        draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(220, 220, 230), outline=(0, 0, 0), width=2)

def draw_hero_card_banner(draw, name_text, subtitle_text, w, h, main_color, accent_color):
    try:
        font_name = ImageFont.truetype(FONT_PATH, 68)
        font_sub = ImageFont.truetype(FONT_PATH, 28)
    except:
        font_name = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    bbox_n = font_name.getbbox(name_text)
    tw_n, th_n = bbox_n[2] - bbox_n[0], bbox_n[3] - bbox_n[1]
    
    bbox_s = font_sub.getbbox(subtitle_text)
    tw_s, th_s = bbox_s[2] - bbox_s[0], bbox_s[3] - bbox_s[1]
    
    max_w = max(tw_n, tw_s)
    bx = (w - max_w) // 2
    by = h - 145
    
    pad_x, pad_y = 35, 10
    total_h = th_n + th_s + 20
    # Placa de fundo
    draw.rectangle([bx - pad_x, by - pad_y, bx + max_w + pad_x, by + total_h + pad_y], 
                   fill=(10, 14, 22), outline=accent_color, width=3)
    
    # Nome principal
    nx = (w - tw_n) // 2
    for ox, oy in [(-3, -3), (3, -3), (-3, 3), (3, 3), (0, 4), (4, 0)]:
        draw.text((nx + ox, by + oy), name_text, font=font_name, fill=(0, 0, 0))
    draw.text((nx, by), name_text, font=font_name, fill=accent_color)
    
    # Subtítulo (SUPER CÃO / MESTRE DOS SERVIDORES)
    sy = by + th_n + 12
    sx = (w - tw_s) // 2
    draw.text((sx, sy), subtitle_text, font=font_sub, fill=(255, 255, 255))

def generate_unicao_bust_portrait():
    w, h = 1024, 1024
    im = Image.new('RGB', (w, h), (8, 14, 28))
    
    # Fundo cósmico com gradiente e estrelas celestiais
    np.random.seed(111)
    bg_arr = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        r = 10 + 15 * (1 - y / h)
        g = 25 + 35 * (1 - y / h)
        b = 60 + 90 * (1 - y / h)
        bg_arr[y, :] = [r, g, b]
    im = Image.fromarray(bg_arr.astype(np.uint8))
    
    draw = ImageDraw.Draw(im)
    # Aura cósmica circular suave atrás da cabeça
    draw.ellipse([w//2 - 320, 80, w//2 + 320, 720], fill=(2, 132, 199, 90))
    draw.ellipse([w//2 - 240, 140, w//2 + 240, 620], fill=(56, 189, 248, 120))
    
    # Estrelas e partículas de energia astral
    for _ in range(260):
        px = np.random.randint(20, w - 20)
        py = np.random.randint(20, h - 20)
        pr = np.random.randint(2, 6)
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(224, 242, 254))
        
    # Carrega sprite de Unicao
    spr = Image.open(os.path.join(SPR_DIR, 'dog_idle.png')).convert('RGBA')
    
    # Corta estritamente o BUSTO (cabeca, orelhas, focinho, peito e punhos)
    # Y de 0 a 185 contem a cabeca completa, peito titã e os punhos em guarda!
    bust = spr.crop((0, 0, spr.width, 185))
    
    # Escala para preencher 75% da altura da tela, focando totalmente no busto
    target_h = int(h * 0.76)
    scale = target_h / bust.height
    target_w = int(bust.width * scale)
    bust_large = bust.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Glow azul/ciano atrás do busto
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gx = (w - target_w) // 2
    gy = 70  # Centralizado perfeitamente para enquadrar cabeca e peito no card
    glow.paste(bust_large, (gx, gy), bust_large)
    glow_blur = glow.filter(ImageFilter.GaussianBlur(radius=20))
    glow_arr = np.array(glow_blur)
    glow_arr[:, :, 0] = np.clip(glow_arr[:, :, 0] * 0.1, 0, 255)
    glow_arr[:, :, 1] = np.clip(glow_arr[:, :, 1] * 0.7, 0, 255)
    glow_arr[:, :, 2] = np.clip(glow_arr[:, :, 2] * 1.0, 0, 255)
    glow_colored = Image.fromarray(glow_arr)
    
    im.paste(glow_colored, (0, 0), glow_colored)
    im.paste(bust_large, (gx, gy), bust_large)
    
    # Vignette dramatica
    im = add_vignette(im, radius=0.74, intensity=0.88)
    
    # Moldura e Banner atualizado: UNICÃO / SUPER CÃO (Sem vira-lata!)
    draw = ImageDraw.Draw(im)
    draw_arcade_frame(draw, w, h, (56, 189, 248))
    draw_hero_card_banner(draw, "UNICÃO", "SUPER CÃO", w, h, (2, 132, 199), (56, 189, 248))
    
    out_dog = os.path.join(OUT_DIR, 'portrait_dog.jpg')
    im.save(out_dog, 'JPEG', quality=95)
    out_unicao = os.path.join(OUT_DIR, 'portrait_unicao.jpg')
    im.save(out_unicao, 'JPEG', quality=95)
    print("Generated bust portrait_dog.jpg and portrait_unicao.jpg")

def generate_emerson_bust_portrait():
    w, h = 1024, 1024
    im = Image.new('RGB', (w, h), (10, 16, 22))
    
    # Fundo Data Center Matrix (azul escuro e verde terminal)
    np.random.seed(333)
    bg_arr = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        r = 12 + 10 * (1 - y / h)
        g = 28 + 40 * (1 - y / h)
        b = 45 + 50 * (1 - y / h)
        bg_arr[y, :] = [r, g, b]
    im = Image.fromarray(bg_arr.astype(np.uint8))
    
    draw = ImageDraw.Draw(im)
    # Servidor / Matrix stream circular no fundo
    draw.ellipse([w//2 - 320, 80, w//2 + 320, 720], fill=(6, 182, 212, 75))
    
    # Linhas de matriz binaria no fundo
    for col in range(25):
        cx = 50 + col * 38
        for row in range(35):
            cy = 40 + row * 26
            if np.random.random() < 0.45:
                char_bin = "1" if np.random.random() < 0.5 else "0"
                draw.text((cx, cy), char_bin, fill=(16, 185, 129, 90))
                
    # Fagulhas de energia estatica / raios de processador
    for _ in range(180):
        px = np.random.randint(20, w - 20)
        py = np.random.randint(20, h - 20)
        pr = np.random.randint(2, 5)
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(103, 232, 249))
        
    # Carrega sprite de Emerson
    spr = Image.open(os.path.join(SPR_DIR, 'emerson_idle.png')).convert('RGBA')
    
    # Corta estritamente o BUSTO (cabeca com barba detalhada, ombros largos, peito com logo e punhos com energia)
    # Y de 0 a 185 contem perfeitamente cabeca, barba, peito e punhos
    bust = spr.crop((0, 0, spr.width, 185))
    
    target_h = int(h * 0.76)
    scale = target_h / bust.height
    target_w = int(bust.width * scale)
    bust_large = bust.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Glow ciano/eletrico de servidor
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gx = (w - target_w) // 2
    gy = 70
    glow.paste(bust_large, (gx, gy), bust_large)
    glow_blur = glow.filter(ImageFilter.GaussianBlur(radius=20))
    glow_arr = np.array(glow_blur)
    glow_arr[:, :, 0] = np.clip(glow_arr[:, :, 0] * 0.05, 0, 255)
    glow_arr[:, :, 1] = np.clip(glow_arr[:, :, 1] * 0.9, 0, 255)
    glow_arr[:, :, 2] = np.clip(glow_arr[:, :, 2] * 1.0, 0, 255)
    glow_colored = Image.fromarray(glow_arr)
    
    im.paste(glow_colored, (0, 0), glow_colored)
    im.paste(bust_large, (gx, gy), bust_large)
    
    im = add_vignette(im, radius=0.74, intensity=0.88)
    
    # Moldura e Banner atualizado: EMERSON / MESTRE DOS SERVIDORES
    draw = ImageDraw.Draw(im)
    draw_arcade_frame(draw, w, h, (6, 182, 212))
    draw_hero_card_banner(draw, "EMERSON", "MESTRE DOS SERVIDORES", w, h, (8, 145, 178), (245, 158, 11))
    
    out_emerson = os.path.join(OUT_DIR, 'portrait_emerson.jpg')
    im.save(out_emerson, 'JPEG', quality=95)
    print("Generated bust portrait_emerson.jpg")

if __name__ == '__main__':
    generate_unicao_bust_portrait()
    generate_emerson_bust_portrait()
    print("All bust portraits generated successfully!")
