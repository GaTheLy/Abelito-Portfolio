"""Generate app/opengraph-image.png — the card that shows when the site is
shared on LinkedIn, Slack, X or iMessage.

Static PNG rather than Next's runtime ImageResponse: the card only changes when
the headline or the palette does, so paying for per-request rendering (and
shipping the fonts to the edge) buys nothing.

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
INK = (23, 22, 15)
GREEN = (30, 77, 59)
FAINT = (139, 133, 116)
LABEL = (110, 106, 92)
DIVIDER = (221, 216, 202)

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


def main() -> None:
    img = Image.new("RGB", (W, H), CANVAS)
    d = ImageDraw.Draw(img)

    # Figure first, so type can sit over the transparent margin if it ever needs to.
    cutout = Image.open(ROOT / "public/assets/abel-2-cutout.webp").convert("RGBA")
    target_h = 566
    fw = round(cutout.width * target_h / cutout.height)
    cutout = cutout.resize((fw, target_h), Image.LANCZOS)
    img.paste(cutout, (W - fw - 40, H - target_h), cutout)

    eyebrow = load("mono.ttf", 19, wght=400)
    head = load("news.ttf", 68, wght=300, opsz=40)
    metric = load("grotesk.ttf", 38, wght=400)
    small = load("mono.ttf", 16, wght=400)

    y = PAD
    tracked(d, (PAD, y), "ABELITO FALEYRIO VISESE", eyebrow, FAINT, 1.9)
    y += 30
    tracked(d, (PAD, y), "AI ENGINEER AT DATASAUR", eyebrow, FAINT, 1.9)

    y += 74
    for line in ["I build the system", "around the model."]:
        d.text((PAD - 3, y), line, font=head, fill=INK)
        y += 78

    y += 34
    d.line([(PAD, y), (PAD + 560, y)], fill=DIVIDER, width=1)

    y += 34
    proof = [("97.4%", "congestion accuracy"), ("<2s", "phoneme scoring"), ("~80%", "admin cut")]
    TRACK, GUTTER = 1.2, 38
    x = PAD
    for value, label in proof:
        text = label.upper()
        d.text((x, y), value, font=metric, fill=GREEN)
        tracked(d, (x + 2, y + 50), text, small, LABEL, TRACK)
        # Columns are measured, not on a fixed pitch — a fixed one silently
        # overlapped the moment a label got long.
        label_w = d.textlength(text, font=small) + TRACK * len(text)
        x += max(d.textlength(value, font=metric), label_w) + GUTTER

    out = ROOT / "app/opengraph-image.png"
    img.save(out, optimize=True)
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB, {W}x{H})")


if __name__ == "__main__":
    main()
