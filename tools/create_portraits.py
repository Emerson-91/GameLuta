#!/usr/bin/env python3
"""
Gera os retratos de selecao de arcade (1024x1024) para:
- Bear (Ursus)
- Gorilla (Kongo)
- Cat (Kage)
Mantendo a mesma estetica epica, visual vibrante e formato de portrait_alligator/portrait_wolf.
"""
import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont

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
    # Moldura externa arcade
    border_w = 28
    draw.rectangle([0, 0, w, border_w], fill=(12, 14, 20))
    draw.rectangle([0, h - border_w, w, h], fill=(12, 14, 20))
    draw.rectangle([0, 0, border_w, h], fill=(12, 14, 20))
    draw.rectangle([w - border_w, 0, w, h], fill=(12, 14, 20))
    
    # Linha neon brilhante interna
    draw.rectangle([border_w, border_w, w - border_w, h - border_w], outline=theme_color, width=4)
    # Cantoneiras
    c_len = 50
    for cx, cy in [(border_w, border_w), (w - border_w, border_w), (border_w, h - border_w), (w - border_w, h - border_w)]:
        draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(220, 220, 230), outline=(0, 0, 0), width=2)

def draw_name_banner(draw, text, w, h, main_color, accent_color):
    try:
        font = ImageFont.truetype(FONT_PATH, 72)
    except:
        font = ImageFont.load_default()
        
    bbox = font.getbbox(text)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    bx = (w - tw) // 2
    by = h - 140
    
    # Placa de fundo do nome
    pad_x, pad_y = 35, 12
    draw.rectangle([bx - pad_x, by - pad_y, bx + tw + pad_x, by + th + pad_y + 10], fill=(10, 12, 18), outline=accent_color, width=3)
    
    # Sombra e texto em camadas para efeito 3D arcade
    for ox, oy in [(-3, -3), (3, -3), (-3, 3), (3, 3), (0, 4), (4, 0)]:
        draw.text((bx + ox, by + oy), text, font=font, fill=(0, 0, 0))
    for ox, oy in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
        draw.text((bx + ox, by + oy), text, font=font, fill=main_color)
    draw.text((bx, by), text, font=font, fill=accent_color)

def generate_bear_portrait():
    w, h = 1024, 1024
    im = Image.new('RGB', (w, h), (10, 16, 28))
    
    # Fundo de tempestade de gelo e neblina do artico
    np.random.seed(42)
    bg_arr = np.zeros((h, w, 3), dtype=np.float32)
    # Gradiente vertical escuro
    for y in range(h):
        r = 10 + 20 * (1 - y / h)
        g = 20 + 35 * (1 - y / h)
        b = 40 + 70 * (1 - y / h)
        bg_arr[y, :] = [r, g, b]
    im = Image.fromarray(bg_arr.astype(np.uint8))
    
    # Particulas de neve e gelo brilhante
    draw = ImageDraw.Draw(im)
    for _ in range(250):
        px = np.random.randint(20, w - 20)
        py = np.random.randint(20, h - 20)
        pr = np.random.randint(2, 6)
        alpha = np.random.randint(120, 255)
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(186, 230, 253))
        
    # Coloca o modelo de Ursus em alta resolucao no centro
    spr = Image.open(os.path.join(SPR_DIR, 'bear_idle.png')).convert('RGBA')
    # Escala para busto / 3/4 grande (cobre 82% da altura)
    scale = (h * 0.95) / spr.height
    nw, nh = int(spr.width * scale), int(spr.height * scale)
    spr_large = spr.resize((nw, nh), Image.Resampling.LANCZOS)
    
    # Glow ciano ao redor de Ursus
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gx = (w - nw) // 2 + 30
    gy = h - nh - 10
    glow.paste(spr_large, (gx, gy), spr_large)
    glow_blur = glow.filter(ImageFilter.GaussianBlur(radius=18))
    # Colore o glow em ciano
    glow_arr = np.array(glow_blur)
    glow_arr[:, :, 0] = np.clip(glow_arr[:, :, 0] * 0.2, 0, 255)
    glow_arr[:, :, 1] = np.clip(glow_arr[:, :, 1] * 0.8, 0, 255)
    glow_arr[:, :, 2] = np.clip(glow_arr[:, :, 2] * 1.0, 0, 255)
    glow_colored = Image.fromarray(glow_arr)
    
    im.paste(glow_colored, (0, 0), glow_colored)
    im.paste(spr_large, (gx, gy), spr_large)
    
    # Vignette dramatica
    im = add_vignette(im, radius=0.72, intensity=0.90)
    
    # Moldura e Titulo
    draw = ImageDraw.Draw(im)
    draw_arcade_frame(draw, w, h, (56, 189, 248))
    draw_name_banner(draw, "URSUS", w, h, (14, 165, 233), (186, 230, 253))
    
    out_path = os.path.join(OUT_DIR, 'portrait_bear.jpg')
    im.save(out_path, 'JPEG', quality=95)
    print("Generated portrait_bear.jpg")

def generate_gorilla_portrait():
    w, h = 1024, 1024
    im = Image.new('RGB', (w, h), (18, 14, 10))
    
    # Fundo de templo com tochas e fagulhas douradas
    np.random.seed(88)
    bg_arr = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        r = 35 + 30 * (1 - y / h)
        g = 22 + 20 * (1 - y / h)
        b = 10 + 10 * (1 - y / h)
        bg_arr[y, :] = [r, g, b]
    im = Image.fromarray(bg_arr.astype(np.uint8))
    
    draw = ImageDraw.Draw(im)
    # Fagulhas douradas de fogo/forca
    for _ in range(220):
        px = np.random.randint(20, w - 20)
        py = np.random.randint(20, h - 20)
        pr = np.random.randint(2, 6)
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(250, 204, 21))
        
    spr = Image.open(os.path.join(SPR_DIR, 'gorilla_idle.png')).convert('RGBA')
    scale = (h * 0.95) / spr.height
    nw, nh = int(spr.width * scale), int(spr.height * scale)
    spr_large = spr.resize((nw, nh), Image.Resampling.LANCZOS)
    
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gx = (w - nw) // 2 + 20
    gy = h - nh - 10
    glow.paste(spr_large, (gx, gy), spr_large)
    glow_blur = glow.filter(ImageFilter.GaussianBlur(radius=18))
    glow_arr = np.array(glow_blur)
    glow_arr[:, :, 0] = np.clip(glow_arr[:, :, 0] * 1.0, 0, 255)
    glow_arr[:, :, 1] = np.clip(glow_arr[:, :, 1] * 0.8, 0, 255)
    glow_arr[:, :, 2] = np.clip(glow_arr[:, :, 2] * 0.1, 0, 255)
    glow_colored = Image.fromarray(glow_arr)
    
    im.paste(glow_colored, (0, 0), glow_colored)
    im.paste(spr_large, (gx, gy), spr_large)
    
    im = add_vignette(im, radius=0.72, intensity=0.90)
    
    draw = ImageDraw.Draw(im)
    draw_arcade_frame(draw, w, h, (234, 179, 8))
    draw_name_banner(draw, "KONGO", w, h, (202, 138, 4), (254, 240, 138))
    
    out_path = os.path.join(OUT_DIR, 'portrait_gorilla.jpg')
    im.save(out_path, 'JPEG', quality=95)
    print("Generated portrait_gorilla.jpg")

def generate_cat_portrait():
    w, h = 1024, 1024
    im = Image.new('RGB', (w, h), (10, 20, 16))
    
    # Fundo de nevoeiro noturno ninja com luar esmeralda
    np.random.seed(105)
    bg_arr = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        r = 10 + 15 * (1 - y / h)
        g = 28 + 40 * (1 - y / h)
        b = 22 + 25 * (1 - y / h)
        bg_arr[y, :] = [r, g, b]
    im = Image.fromarray(bg_arr.astype(np.uint8))
    
    draw = ImageDraw.Draw(im)
    # Luar de fundo (circulo esmeralda suave)
    draw.ellipse([w//2 - 220, 80, w//2 + 220, 520], fill=(16, 185, 129, 60))
    # Fagulhas verdes de sombra
    for _ in range(200):
        px = np.random.randint(20, w - 20)
        py = np.random.randint(20, h - 20)
        pr = np.random.randint(2, 5)
        draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(52, 211, 153))
        
    spr = Image.open(os.path.join(SPR_DIR, 'cat_idle.png')).convert('RGBA')
    scale = (h * 0.95) / spr.height
    nw, nh = int(spr.width * scale), int(spr.height * scale)
    spr_large = spr.resize((nw, nh), Image.Resampling.LANCZOS)
    
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    gx = (w - nw) // 2 + 15
    gy = h - nh - 10
    glow.paste(spr_large, (gx, gy), spr_large)
    glow_blur = glow.filter(ImageFilter.GaussianBlur(radius=18))
    glow_arr = np.array(glow_blur)
    glow_arr[:, :, 0] = np.clip(glow_arr[:, :, 0] * 0.1, 0, 255)
    glow_arr[:, :, 1] = np.clip(glow_arr[:, :, 1] * 1.0, 0, 255)
    glow_arr[:, :, 2] = np.clip(glow_arr[:, :, 2] * 0.6, 0, 255)
    glow_colored = Image.fromarray(glow_arr)
    
    im.paste(glow_colored, (0, 0), glow_colored)
    im.paste(spr_large, (gx, gy), spr_large)
    
    im = add_vignette(im, radius=0.72, intensity=0.90)
    
    draw = ImageDraw.Draw(im)
    draw_arcade_frame(draw, w, h, (16, 185, 129))
    draw_name_banner(draw, "KAGE", w, h, (5, 150, 105), (110, 231, 183))
    
    out_path = os.path.join(OUT_DIR, 'portrait_cat.jpg')
    im.save(out_path, 'JPEG', quality=95)
    print("Generated portrait_cat.jpg")

if __name__ == '__main__':
    generate_bear_portrait()
    generate_gorilla_portrait()
    generate_cat_portrait()
    print("All portraits generated successfully!")
