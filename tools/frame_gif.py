#!/usr/bin/env python3
"""Wrap ANY gif in the pixel CRT frame.

    python3 tools/frame_gif.py                       # assets/gif/current.gif -> assets/gif/framed.gif
    python3 tools/frame_gif.py --in my.gif --out out.gif

Your source GIF is never modified. The README only ever references assets/gif/framed.gif,
and the GitHub Action (.github/workflows/frame-gif.yml) rebuilds it whenever current.gif changes.
Needs: pip install pillow numpy
"""
import argparse, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageSequence

# ------------------------------------------------------------------ config (edit freely)
VW, VH = 192, 108            # inner screen in "cells" (1 cell = PX px)  -> 768x432 inner
PX = 4                       # pixel size of the frame art
INDICATOR = 'PLAYING'        # text in the bottom strip
LABEL = 'MEDIA'              # text in the top strip
SCANLINES = False            # True = subtle CRT scanlines over the GIF (this alters the GIF slightly)
DITHER = False               # True = Floyd-Steinberg when reducing colours (photos); False keeps pixel art crisp
BLINK_MS = 1000              # status dot blink period
COLORS = dict(black='#0a0c0b', beige='#cfc5a8', cream='#e9e0c9', beige3='#a89f85', navy='#142031',
              orange='#e9873f', orangeD='#a8582a', olive='#8b9b5a', olive2='#a7b672', forest='#2d4630', forest2='#3b5a3a')
# ------------------------------------------------------------------

TOP, BOT, SIDE = 10, 12, 8
TW, TH = VW + 2 * SIDE, VH + TOP + BOT
VX0, VY0, VX1, VY1 = SIDE, TOP, SIDE + VW - 1, TOP + VH - 1
rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
C = {k: rgb(v) for k, v in COLORS.items()}

FONT = {'A':'01110,10001,11111,10001,10001','D':'11110,10001,10001,10001,11110','E':'11111,10000,11110,10000,11111','G':'01111,10000,10011,10001,01111','I':'11111,00100,00100,00100,11111','L':'10000,10000,10000,10000,11111','M':'10001,11011,10101,10001,10001','N':'10001,11001,10101,10011,10001','P':'11110,10001,11110,10000,10000','Y':'10001,01010,00100,00100,00100','C':'01111,10000,10000,10000,01111','R':'11110,10001,11110,10100,10010','T':'11111,00100,00100,00100,00100','O':'01110,10001,10001,10001,01110','S':'01111,10000,01110,00001,11110','U':'10001,10001,10001,10001,01110','B':'11110,10001,11110,10001,11110','F':'11111,10000,11110,10000,10000','H':'10001,10001,11111,10001,10001','V':'10001,10001,10001,01010,00100','W':'10001,10001,10101,11011,10001','X':'10001,01010,00100,01010,10001','K':'10010,10100,11000,10100,10010','J':'00111,00010,00010,10010,01100','Q':'01110,10001,10101,10010,01101','Z':'11111,00010,00100,01000,11111','-':'00000,00000,11111,00000,00000',' ':'00000,00000,00000,00000,00000'}

def text(px, t, x, y, col):
    for ch in t.upper():
        g = FONT.get(ch)
        if g:
            for j, row in enumerate(g.split(',')):
                for i, b in enumerate(row):
                    if b == '1': px[y + j, x + i] = (*col, 255)
        x += 6

def build_base(dot_on):
    """Static frame art at cell resolution -> RGBA array (TH, TW, 4); transparent where the GIF shows / outside the shell."""
    px = np.zeros((TH, TW, 4), np.uint8)
    put = lambda x, y, c: px.__setitem__((y, x), (*c, 255)) if 0 <= x < TW and 0 <= y < TH else None
    def rect(x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1): put(x, y, c)
    R = 4  # stair-step corner radius
    shell = np.zeros((TH, TW), bool)
    for y in range(TH):
        for x in range(TW):
            dx, dy = min(x, TW - 1 - x), min(y, TH - 1 - y)
            shell[y, x] = dx >= R or dy >= R or dx + dy >= R
    for y in range(TH):
        for x in range(TW):
            if shell[y, x]: put(x, y, C['beige'])
    for y in range(TH):
        for x in range(TW):
            if shell[y, x] and (x in (0, TW - 1) or y in (0, TH - 1) or not (shell[y - 1, x] and shell[y + 1, x] and shell[y, x - 1] and shell[y, x + 1])): put(x, y, C['black'])
    rect(R, 1, TW - 1 - R, 1, C['cream']); rect(1, R, 1, TH - 1 - R, C['cream'])               # plastic highlight
    rect(R, TH - 2, TW - 1 - R, TH - 2, C['beige3']); rect(TW - 2, R, TW - 2, TH - 1 - R, C['beige3'])  # plastic shade
    # screen bezel (inset look)
    rect(VX0 - 2, VY0 - 2, VX1 + 2, VY0 - 2, C['beige3']); rect(VX0 - 2, VY0 - 2, VX0 - 2, VY1 + 2, C['beige3'])
    rect(VX0 - 2, VY1 + 2, VX1 + 2, VY1 + 2, C['cream']); rect(VX1 + 2, VY0 - 2, VX1 + 2, VY1 + 2, C['cream'])
    for x in range(VX0 - 1, VX1 + 2): put(x, VY0 - 1, C['black']); put(x, VY1 + 1, C['black'])
    for y in range(VY0 - 1, VY1 + 2): put(VX0 - 1, y, C['black']); put(VX1 + 1, y, C['black'])
    # top strip: label + speaker grill
    text(px, LABEL, 16, 3, C['navy'])
    for k in range(9):
        rect(TW - 50 + k * 4, 3, TW - 50 + k * 4, 6, C['beige3'])
    # screws
    for sx, sy in [(3, 3), (TW - 6, 3), (3, TH - 6), (TW - 6, TH - 6)]:
        rect(sx, sy, sx + 2, sy + 2, C['beige3']); rect(sx, sy + 1, sx + 2, sy + 1, C['black'])
    # bottom strip: d-pad, indicator, buttons
    cy = (VY1 + 3 + TH - 3) // 2
    cx = 22
    rect(cx - 3, cy - 1, cx + 3, cy + 1, C['black']); rect(cx - 1, cy - 3, cx + 1, cy + 3, C['black']); put(cx, cy, C['beige3'])
    total = 3 + 3 + len(INDICATOR) * 6 - 1; x0 = (TW - total) // 2
    rect(x0, cy - 1, x0 + 2, cy + 1, C['orange'] if dot_on else C['orangeD'])
    text(px, INDICATOR, x0 + 6, cy - 2, C['navy'])
    bx = TW - 26
    for (dx, dy), col in {(0, -3): C['beige3'], (0, 2): C['beige3'], (-3, -1): C['olive'], (3, -1): C['orange']}.items(): rect(bx + dx, cy + dy, bx + dx + 1, cy + dy + 1, col)
    # vines creeping over the plastic only (never over the screen)
    def free(x, y): return 0 <= x < TW and 0 <= y < TH and shell[y, x] and not (VX0 - 2 <= x <= VX1 + 2 and VY0 - 2 <= y <= VY1 + 2) and not (y in (0, TH - 1) or x in (0, TW - 1))
    def vine(x, y, n, dx, dy, seed):
        rr = np.random.default_rng(seed)
        for i in range(n):
            w = round(math.sin(i * .55 + seed))
            px_, py_ = (x + w, y + i * dy) if dx == 0 else (x + i * dx, y + w)
            if free(px_, py_): put(px_, py_, C['forest2'])
            if i % 3 == 1:
                s = 1 if rr.random() > .5 else -1; col = C['olive'] if rr.random() > .35 else C['olive2']
                for lx, ly in ([(px_ + s, py_), (px_ + 2 * s, py_ - 1)] if dx == 0 else [(px_, py_ + s), (px_ - 1, py_ + 2 * s)]):
                    if free(lx, ly): put(lx, ly, col)
    vine(3, 1, 10, 0, 1, 2); vine(3, 9, 30, 0, 1, 3); vine(12, 1, 6, 1, 0, 4)
    vine(TW - 4, TH - 2, 36, 0, -1, 5); vine(TW - 5, TH - 2, 14, 0, -1, 6)
    for y in range(VY0, VY1 + 1):
        for x in range(VX0, VX1 + 1): px[y, x] = (0, 0, 0, 0)
    px[~shell] = (0, 0, 0, 0)
    return px, shell

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='src', default='assets/gif/current.gif'); ap.add_argument('--out', default='assets/gif/framed.gif')
    a = ap.parse_args()
    if not os.path.exists(a.src): sys.exit(f'missing {a.src}: drop a GIF there first')
    im = Image.open(a.src); sw, sh = im.size
    if sw > VW * PX: print(f'warn: source is {sw}px wide; it will be scaled to {VW * PX}px')
    frames, durs = [], []
    for fr in ImageSequence.Iterator(im):
        d = fr.info.get('duration', 100); durs.append(d if d >= 20 else 100)
        rgba = fr.convert('RGBA'); bg = Image.new('RGBA', rgba.size, (0, 0, 0, 255)); bg.alpha_composite(rgba)
        frames.append(bg.convert('RGB'))
    n = len(frames); fps = 1000 / (sum(durs) / n)
    if fps > 15: print(f'warn: {fps:.0f} fps is heavy; 10-15 fps keeps the file small')
    # cover-crop to the screen's aspect ratio, then scale (crisp for pixel art, smooth for photos)
    ar = VW / VH; IW, IH = VW * PX, VH * PX
    def fit(f):
        w, h = f.size
        if w / h > ar: nw = round(h * ar); f = f.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else: nh = round(w / ar); f = f.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
        pixel_art = (IW % f.size[0] == 0) or f.size[0] <= IW // 2 or f.size[0] == IW
        return f.resize((IW, IH), Image.NEAREST if pixel_art else Image.LANCZOS)
    frames = [fit(f) for f in frames]
    if SCANLINES:
        for i, f in enumerate(frames):
            arr = np.asarray(f).astype(np.float32); arr[(np.arange(IH) // 2) % 2 == 0] *= .88; frames[i] = Image.fromarray(arr.astype(np.uint8))
    bases = []
    for on in (True, False):
        cell, shell = build_base(on)
        big = Image.fromarray(cell, 'RGBA').resize((TW * PX, TH * PX), Image.NEAREST); bases.append(big)
    corner = Image.fromarray(np.kron(~shell, np.ones((PX, PX), bool)).astype(np.uint8) * 255, 'L')
    # one shared palette: frame colours first (exact), the rest quantised from the GIF
    fixed = list(dict.fromkeys(C.values())); K = 255 - len(fixed)
    step = max(1, n // 12); sm = [f.resize((IW // 3, IH // 3)) for f in frames[::step]]
    mosaic = Image.new('RGB', (IW // 3, (IH // 3) * len(sm)))
    for i, f in enumerate(sm): mosaic.paste(f, (0, i * (IH // 3)))
    src_pal = mosaic.quantize(colors=K, method=Image.MEDIANCUT, dither=Image.Dither.NONE).getpalette()[:K * 3]
    flat = [v for c in fixed for v in c] + src_pal; flat += [255, 0, 255]; TRANS = len(flat) // 3 - 1
    flat += flat[-6:-3] * (256 - len(flat) // 3)
    pal = Image.new('P', (1, 1)); pal.putpalette(flat[:768])
    out, t = [], 0
    for f, d in zip(frames, durs):
        base = bases[0] if (t % BLINK_MS) < BLINK_MS // 2 else bases[1]; t += d
        comp = Image.new('RGBA', (TW * PX, TH * PX), (0, 0, 0, 255)); comp.paste(f, (VX0 * PX, VY0 * PX)); comp.alpha_composite(base)
        q = comp.convert('RGB').quantize(palette=pal, dither=Image.Dither.FLOYDSTEINBERG if DITHER else Image.Dither.NONE)
        q.paste(TRANS, mask=corner); out.append(q)
    os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
    out[0].save(a.out, save_all=True, append_images=out[1:], duration=durs, loop=0, transparency=TRANS, disposal=1, optimize=False)
    mb = os.path.getsize(a.out) / 1e6
    print(f'wrote {a.out}: {n} frames, {TW * PX}x{TH * PX}px, {mb:.2f} MB')
    if mb > 5: print('warn: over 5 MB. Use fewer frames, a lower fps, or run tools/pixelate.py first')

if __name__ == '__main__':
    main()
