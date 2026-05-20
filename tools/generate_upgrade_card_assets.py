from pathlib import Path
import math
import random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "ui" / "relic_cards"
OUT.mkdir(parents=True, exist_ok=True)

FRAME_W, FRAME_H = 512, 672
EMBLEM = 256


RARITIES = {
    "common": {
        "base": (16, 22, 28),
        "top": (42, 48, 54),
        "accent": (176, 186, 196),
        "glow": (168, 178, 188),
    },
    "rare": {
        "base": (6, 20, 38),
        "top": (18, 48, 76),
        "accent": (86, 196, 255),
        "glow": (86, 196, 255),
    },
    "relic": {
        "base": (34, 22, 8),
        "top": (82, 55, 14),
        "accent": (255, 210, 88),
        "glow": (255, 225, 126),
    },
    "legendary": {
        "base": (42, 8, 16),
        "top": (92, 20, 34),
        "accent": (255, 86, 104),
        "glow": (255, 76, 96),
    },
}


EMBLEMS = {
    "singularity_spin_core": {
        "accent": (210, 145, 255),
        "secondary": (255, 86, 104),
        "kind": "singularity",
    },
    "combo_constellation": {
        "accent": (126, 247, 255),
        "secondary": (180, 145, 255),
        "kind": "constellation",
    },
    "aegis_star_mirror": {
        "accent": (255, 216, 120),
        "secondary": (126, 247, 210),
        "kind": "aegis",
    },
    "garbage_alchemy_core": {
        "accent": (125, 226, 167),
        "secondary": (255, 208, 92),
        "kind": "alchemy",
    },
    "perfect_rift_crown": {
        "accent": (255, 88, 108),
        "secondary": (255, 228, 142),
        "kind": "crown",
    },
}


def rgba(rgb, a):
    return (*rgb, a)


def lerp(a, b, t):
    return int(a + (b - a) * t)


def gradient_card(theme, mask):
    img = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    pix = img.load()
    rng = random.Random(1807)
    for y in range(FRAME_H):
        t = y / (FRAME_H - 1)
        for x in range(FRAME_W):
            if mask.getpixel((x, y)) == 0:
                continue
            cx = abs(x / FRAME_W - 0.5)
            vignette = 1 - min(0.46, cx * 0.72 + abs(t - 0.48) * 0.22)
            noise = rng.randint(-4, 4)
            r = lerp(theme["top"][0], theme["base"][0], t) + noise
            g = lerp(theme["top"][1], theme["base"][1], t) + noise
            b = lerp(theme["top"][2], theme["base"][2], t) + noise
            pix[x, y] = (
                max(0, min(255, int(r * vignette))),
                max(0, min(255, int(g * vignette))),
                max(0, min(255, int(b * vignette))),
                218,
            )
    return img


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def draw_polyline(draw, points, fill, width=2):
    for a, b in zip(points, points[1:]):
        draw.line((a, b), fill=fill, width=width)


def draw_frame(rarity, theme):
    mask = rounded_mask((FRAME_W, FRAME_H), 38)
    img = gradient_card(theme, mask)
    d = ImageDraw.Draw(img, "RGBA")
    accent = theme["accent"]
    glow = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")

    for radius, alpha in [(36, 84), (48, 42), (64, 20)]:
        gd.rounded_rectangle((18, 18, FRAME_W - 18, FRAME_H - 18), radius=radius, outline=rgba(theme["glow"], alpha), width=7)
    glow = glow.filter(ImageFilter.GaussianBlur(5))
    img.alpha_composite(glow)

    # Inner safe panels and subtle magic circuitry.
    d.rounded_rectangle((34, 34, FRAME_W - 34, FRAME_H - 34), radius=25, outline=rgba(accent, 110), width=3)
    d.rounded_rectangle((52, 56, FRAME_W - 52, 238), radius=24, fill=rgba(accent, 18), outline=rgba(accent, 38), width=2)
    d.rounded_rectangle((56, 388, FRAME_W - 56, FRAME_H - 54), radius=20, fill=(0, 0, 0, 42), outline=rgba(accent, 42), width=2)

    # Emblem halo area.
    for r, alpha in [(84, 28), (62, 34), (42, 22)]:
        d.ellipse((FRAME_W / 2 - r, 103 - r, FRAME_W / 2 + r, 103 + r), outline=rgba(accent, alpha), width=2)
    for angle in range(0, 360, 45):
        rad = math.radians(angle)
        x1 = FRAME_W / 2 + math.cos(rad) * 50
        y1 = 103 + math.sin(rad) * 50
        x2 = FRAME_W / 2 + math.cos(rad) * 72
        y2 = 103 + math.sin(rad) * 72
        d.line((x1, y1, x2, y2), fill=rgba(accent, 26), width=2)

    # Corner metalwork.
    c = rgba(accent, 160)
    pale = rgba((245, 245, 235), 90)
    for sx in [1, -1]:
        for sy in [1, -1]:
            ox = 34 if sx == 1 else FRAME_W - 34
            oy = 34 if sy == 1 else FRAME_H - 34
            d.line((ox, oy + sy * 42, ox, oy, ox + sx * 42, oy), fill=c, width=4)
            d.line((ox + sx * 18, oy + sy * 18, ox + sx * 54, oy + sy * 18), fill=pale, width=1)
            d.line((ox + sx * 18, oy + sy * 18, ox + sx * 18, oy + sy * 54), fill=pale, width=1)

    # Bottom and title separators.
    d.line((72, 376, FRAME_W / 2 - 22, 376), fill=rgba(accent, 105), width=2)
    d.line((FRAME_W / 2 + 22, 376, FRAME_W - 72, 376), fill=rgba(accent, 105), width=2)
    d.polygon([(FRAME_W / 2, 367), (FRAME_W / 2 + 9, 376), (FRAME_W / 2, 385), (FRAME_W / 2 - 9, 376)], fill=rgba(accent, 125))
    d.line((74, FRAME_H - 48, FRAME_W - 74, FRAME_H - 48), fill=rgba(accent, 90), width=3)

    # Rarity-specific extra treatment.
    if rarity == "rare":
        d.arc((64, 72, FRAME_W - 64, 224), 200, 345, fill=rgba(accent, 125), width=3)
        d.arc((78, 86, FRAME_W - 78, 210), 18, 160, fill=rgba(accent, 72), width=2)
    elif rarity == "relic":
        for a in range(0, 360, 60):
            rad = math.radians(a)
            x = FRAME_W / 2 + math.cos(rad) * 92
            y = 103 + math.sin(rad) * 92
            d.polygon([(x, y - 8), (x + 8, y), (x, y + 8), (x - 8, y)], fill=rgba(accent, 95))
    elif rarity == "legendary":
        for a in range(0, 360, 30):
            rad = math.radians(a)
            x1 = FRAME_W / 2 + math.cos(rad) * 86
            y1 = 103 + math.sin(rad) * 86
            x2 = FRAME_W / 2 + math.cos(rad) * 116
            y2 = 103 + math.sin(rad) * 116
            d.line((x1, y1, x2, y2), fill=rgba(accent, 80), width=2)
        d.rounded_rectangle((26, 26, FRAME_W - 26, FRAME_H - 26), radius=30, outline=rgba(accent, 120), width=2)

    return img


def glow_layer(size, color, shapes):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    for shape, box, alpha, width in shapes:
        if shape == "ellipse":
            d.ellipse(box, outline=rgba(color, alpha), width=width)
        elif shape == "line":
            d.line(box, fill=rgba(color, alpha), width=width)
        elif shape == "polygon":
            d.polygon(box, outline=rgba(color, alpha))
    return img.filter(ImageFilter.GaussianBlur(5))


def draw_emblem(name, spec):
    img = Image.new("RGBA", (EMBLEM, EMBLEM), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    accent = spec["accent"]
    secondary = spec["secondary"]
    cx = cy = EMBLEM // 2

    d.ellipse((34, 34, 222, 222), outline=rgba(accent, 72), width=3)
    d.ellipse((56, 56, 200, 200), outline=rgba(secondary, 46), width=2)
    img.alpha_composite(glow_layer((EMBLEM, EMBLEM), accent, [("ellipse", (44, 44, 212, 212), 150, 10)]))

    kind = spec["kind"]
    if kind == "singularity":
        for r, off in [(72, 0), (55, 50), (38, 100)]:
            d.arc((cx - r, cy - r, cx + r, cy + r), off, off + 250, fill=rgba(accent, 185), width=5)
        d.polygon([(cx, 42), (cx + 28, cy), (cx, 214), (cx - 28, cy)], fill=rgba(secondary, 95), outline=rgba(accent, 220))
        d.ellipse((cx - 17, cy - 17, cx + 17, cy + 17), fill=rgba((255, 255, 255), 150))
    elif kind == "constellation":
        pts = [(62, 154), (94, 78), (130, 124), (166, 64), (196, 148), (134, 188)]
        draw_polyline(d, pts, rgba(accent, 190), 4)
        for x, y in pts:
            d.ellipse((x - 8, y - 8, x + 8, y + 8), fill=rgba((245, 255, 255), 210), outline=rgba(secondary, 240), width=2)
        d.polygon([(cx, 66), (cx + 22, cy), (cx, 190), (cx - 22, cy)], outline=rgba(accent, 210), fill=rgba(accent, 44))
    elif kind == "aegis":
        shield = [(cx, 44), (196, 76), (180, 166), (cx, 214), (76, 166), (60, 76)]
        d.polygon(shield, fill=rgba(accent, 68), outline=rgba(accent, 230))
        star = []
        for i in range(10):
            r = 48 if i % 2 == 0 else 18
            a = math.radians(-90 + i * 36)
            star.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
        d.polygon(star, fill=rgba(secondary, 95), outline=rgba((255, 255, 255), 155))
    elif kind == "alchemy":
        for x, y, s in [(70, 84, 25), (168, 78, 21), (74, 174, 22), (178, 170, 27)]:
            d.rounded_rectangle((x - s, y - s, x + s, y + s), radius=7, fill=rgba(accent, 52), outline=rgba(accent, 200), width=3)
        d.ellipse((78, 78, 178, 178), outline=rgba(secondary, 190), width=5)
        d.polygon([(cx, 70), (cx + 42, cy), (cx, 186), (cx - 42, cy)], fill=rgba(secondary, 70), outline=rgba(accent, 225))
    elif kind == "crown":
        crown = [(54, 166), (78, 86), (116, 138), (cx, 56), (140, 138), (178, 86), (202, 166)]
        d.line(crown, fill=rgba(secondary, 230), width=8, joint="curve")
        d.line(crown, fill=rgba(accent, 245), width=4, joint="curve")
        d.polygon([(cx, 38), (cx + 30, cy), (cx, 218), (cx - 30, cy)], fill=rgba(accent, 100), outline=rgba((255, 255, 255), 155))
        d.ellipse((cx - 13, cy - 13, cx + 13, cy + 13), fill=rgba(secondary, 210))

    d.rounded_rectangle((26, 26, 230, 230), radius=18, outline=rgba(accent, 42), width=2)
    return img


def main():
    for rarity, theme in RARITIES.items():
        draw_frame(rarity, theme).save(OUT / f"upgrade_card_{rarity}.png")
    for name, spec in EMBLEMS.items():
        draw_emblem(name, spec).save(OUT / f"upgrade_emblem_{name}.png")
    print(f"Generated {len(RARITIES)} card frames and {len(EMBLEMS)} legendary emblems in {OUT}")


if __name__ == "__main__":
    main()
