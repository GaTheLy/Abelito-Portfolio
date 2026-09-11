"""Generate app/opengraph-image.jpg — the card that shows when the site is
shared on LinkedIn, Slack, X or iMessage.

A static image rather than Next's runtime ImageResponse: the card only changes
when the facts on it do, so per-request rendering (and shipping the fonts to
the edge) buys nothing. Those facts mirror content/work.ts — update them there
first, then here.

    python3 scripts/og.py

Needs the three site fonts as .ttf. They aren't vendored — grab them once:

    curl -sfL "https://github.com/google/fonts/raw/main/ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf" -o /tmp/news.ttf
    curl -sfL "https://github.com/google/fonts/raw/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf" -o /tmp/grotesk.ttf
    curl -sfL "https://github.com/google/fonts/raw/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf" -o /tmp/mono.ttf
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
PAD = 74

CANVAS = (241, 238, 230)
RAISED = (251, 250, 246)
INK = (23, 22, 15)
BODY = (61, 58, 49)
GREEN = (30, 77, 59)
VERMILION = (214, 74, 43)
LABEL = (110, 106, 92)
DIVIDER = (221, 216, 202)
RULE = (207, 201, 184)

FONT_DIR = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp")
ROOT = Path(__file__).resolve().parent.parent


def load(name: str, size: int, wght: float | None = None, opsz: float | None = None):
    font = ImageFont.truetype(str(FONT_DIR / name), size)
    axes = []
    try:
        for axis in font.get_variation_axes():
            tag = axis["name"] if isinstance(axis["name"], str) else axis["name"].decode()
            if "opsz" in tag.lower() or "Optical" in tag:
                axes.append(opsz if opsz is not None else axis["default"])
            elif "wght" in tag.lower() or "Weight" in tag:
                axes.append(wght if wght is not None else axis["default"])
            else:
                axes.append(axis["default"])
        if axes:
            font.set_variation_by_axes(axes)
    except OSError:
        pass  # static font — the requested size is all we get
    return font


def tracked(draw, xy, text, font, fill, spacing=0.0):
    """PIL has no letter-spacing; the mono labels need it to match the site."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + spacing
    return x


def fit(d, text, name, size, max_w, **axes):
    """Largest size <= `size` at which `text` fits `max_w` — a long line must
    shrink rather than run under the photo."""
    while True:
        font = load(name, size, **axes)
        if d.textlength(text, font=font) <= max_w or size <= 12:
            return font
        size -= 1


def main() -> None:
    img = Image.new("RGB", (W, H), CANVAS)
    d = ImageDraw.Draw(img)

    cutout = Image.open(ROOT / "public/assets/abel-2-cutout.webp").convert("RGBA")
    target_h = 566
    fw = round(cutout.width * target_h / cutout.height)
    cutout = cutout.resize((fw, target_h), Image.LANCZOS)
    photo_x = W - fw - 40
    img.paste(cutout, (photo_x, H - target_h), cutout)
    max_w = photo_x - PAD - 28  # everything on the left stops short of the photo

    # "Now" pill: the site's current-role marker, vermilion dot on green mono.
    pill_font = load("mono.ttf", 17, wght=500)
    pill = "NOW AT DATASAUR"
    tw = d.textlength(pill, font=pill_font) + 1.6 * len(pill)
    x0, y0, ph = PAD, 70, 40
    d.rounded_rectangle([x0, y0, x0 + tw + 58, y0 + ph], radius=ph // 2, fill=RAISED, outline=RULE, width=2)
    d.ellipse([x0 + 18, y0 + 15, x0 + 28, y0 + 25], fill=VERMILION)
    tracked(d, (x0 + 40, y0 + 10), pill, pill_font, GREEN, 1.6)

    name = "Abelito Faleyrio Visese"
    d.text((PAD - 3, 150), name, font=fit(d, name, "news.ttf", 70, max_w, wght=300, opsz=48), fill=INK)

    role, scope = "AI Engineer", " · LLM & NLP systems"
    role_font = load("grotesk.ttf", 42, wght=600)
    scope_font = load("grotesk.ttf", 42, wght=400)
    d.text((PAD, 242), role, font=role_font, fill=GREEN)
    rx = PAD + d.textlength(role, font=role_font)
    if rx + d.textlength(scope, font=scope_font) <= PAD + max_w:
        d.text((rx, 242), scope, font=scope_font, fill=LABEL)

    y = 330
    d.line([(PAD, y), (PAD + max_w, y)], fill=DIVIDER, width=2)

    # Track record. Every line mirrors content/work.ts — change it there first.
    rows = [
        ("PREVIOUSLY", "KinetixPro · Axrail · Apple Developer Academy"),
        ("CERTIFIED", "AWS Certified Developer — Associate"),
        ("EDUCATION", "BSc Computer Science, cum laude"),
        ("AWARD", "1st place, Hackfest 2025"),
    ]
    key_font = load("mono.ttf", 16, wght=500)
    KEY_W = 168
    y += 34
    for key, value in rows:
        tracked(d, (PAD, y + 6), key, key_font, LABEL, 1.6)
        d.text((PAD + KEY_W, y), value, font=fit(d, value, "grotesk.ttf", 23, max_w - KEY_W, wght=400), fill=BODY)
        y += 52

    # JPEG, not PNG: the batik in the photo made the PNG 330 KB, and WhatsApp
    # drops link-preview images over ~300 KB without a word.
    out = ROOT / "app/opengraph-image.jpg"
    img.convert("RGB").save(out, quality=85, optimize=True, progressive=True)
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB, {W}x{H})")


if __name__ == "__main__":
    main()
