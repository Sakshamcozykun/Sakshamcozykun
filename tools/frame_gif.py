#!/usr/bin/env python3
"""Turn ANY gif into the framed pixel-screen player used in the README.

    python3 tools/frame_gif.py                         # assets/gif/current.gif -> assets/gif/framed.svg (+ framed.gif)
    python3 tools/frame_gif.py --in my.gif --out assets/gif/framed

What it does
  1. reads your GIF (never modifies it) and cover-crops it to 16:9
  2. squashes it onto a coarse pixel grid (GRID_W x GRID_H cells) with one shared palette
  3. "pixels updating": every cell refreshes on its own little schedule (UPDATE_EVERY frames),
     like a slow handheld LCD. Moving parts shimmer into place, still parts stay calm.
  4. draws the plastic frame (bezel, screws, d-pad, PLAYING light, vines + leaves) from code
  5. writes TWO files:
       framed.svg  <- the README uses this one. An SVG animates by itself on GitHub:
                      no play/pause overlay, no controls, it just runs.
       framed.gif  <- optional fallback (WRITE_GIF). Same picture as a classic GIF.

Needs: pip install pillow numpy
"""
import argparse, base64, io, math, os, sys
import numpy as np
from PIL import Image, ImageSequence

# ------------------------------------------------------------------ config (edit freely)
GRID_W, GRID_H = 128, 72     # the screen is this many "pixels" (keep 16:9). Smaller = chunkier + smaller file
CELL = 5                     # output px per grid cell (the SVG scales to any width; GIF is TW*CELL px wide)
UPDATE_EVERY = 3             # each pixel refreshes every N source frames. 1 = off (plain playback)
UPDATE_PATTERN = 'random'    # 'random' = shimmer, 'ordered' = tidy dither-like refresh
LCD_GRID = True              # faint gaps between pixels, like a real tiny LCD
PALETTE_COLORS = 56          # colours for the picture itself (frame colours are extra). 32-64 is plenty
MAX_FRAMES = 96              # longer GIFs are thinned to this many frames to keep the file small
INDICATOR = 'PLAYING'        # text in the bottom strip
LABEL = 'MEDIA'              # text in the top strip
WRITE_SVG = True             # README uses this
WRITE_GIF = True             # fallback copy (adds repo size). Set False if you only want the SVG
BLINK_MS = 1000              # status dot blink period
COLORS = dict(black='#0a0c0b', beige='#cfc5a8', cream='#e9e0c9', beige3='#a89f85', navy='#142031',
              orange='#e9873f', orangeD='#a8582a', olive='#8b9b5a', olive2='#a7b672', forest='#2d4630', forest2='#3b5a3a')
# ------------------------------------------------------------------

VW, VH = GRID_W, GRID_H
TOP, BOT, SIDE = 10, 12, 8
TW, TH = VW + 2 * SIDE, VH + TOP + BOT
VX0, VY0, VX1, VY1 = SIDE, TOP, SIDE + VW - 1, TOP + VH - 1
rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
C = {k: rgb(v) for k, v in COLORS.items()}
BAYER4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]])

FONT = {'A':'01110,10001,11111,10001,10001','D':'11110,10001,10001,10001,11110','E':'11111,10000,11110,10000,11111','G':'01111,10000,10011,10001,01111','I':'11111,00100,00100,00100,11111','L':'10000,10000,10000,10000,11111','M':'10001,11011,10101,10001,10001','N':'10001,11001,10101,10011,10001','P':'11110,10001,11110,10000,10000','Y':'10001,01010,00100,00100,00100','C':'01111,10000,10000,10000,01111','R':'11110,10001,11110,10100,10010','T':'11111,00100,00100,00100,00100','O':'01110,10001,10001,10001,01110','S':'01111,10000,01110,00001,11110','U':'10001,10001,10001,10001,01110','B':'11110,10001,11110,10001,11110','F':'11111,10000,11110,10000,10000','H':'10001,10001,11111,10001,10001','V':'10001,10001,10001,01010,00100','W':'10001,10001,10101,11011,10001','X':'10001,01010,00100,01010,10001','K':'10010,10100,11000,10100,10010','J':'00111,00010,00010,10010,01100','Q':'01110,10001,10101,10010,01101','Z':'11111,00010,00100,01000,11111','-':'00000,00000,11111,00000,00000',' ':'00000,00000,00000,00000,00000'}


def text(px, t, x, y, col):
    for ch in t.upper():
        g = FONT.get(ch)
        if g:
            for j, row in enumerate(g.split(',')):
                for i, b in enumerate(row):
                    if b == '1': px[y + j, x + i] = (*col, 255)
        x += 6


def build_base():
    """Static frame art at cell resolution -> RGBA (TH, TW, 4). Screen area is transparent
    except where vines/leaves grow over it. Returns (pixels, shell_mask, dot_x, dot_cy)."""
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
    rect(R, 1, TW - 1 - R, 1, C['cream']); rect(1, R, 1, TH - 1 - R, C['cream'])                          # plastic highlight
    rect(R, TH - 2, TW - 1 - R, TH - 2, C['beige3']); rect(TW - 2, R, TW - 2, TH - 1 - R, C['beige3'])    # plastic shade
    # screen bezel (inset look)
    rect(VX0 - 2, VY0 - 2, VX1 + 2, VY0 - 2, C['beige3']); rect(VX0 - 2, VY0 - 2, VX0 - 2, VY1 + 2, C['beige3'])
    rect(VX0 - 2, VY1 + 2, VX1 + 2, VY1 + 2, C['cream']); rect(VX1 + 2, VY0 - 2, VX1 + 2, VY1 + 2, C['cream'])
    for x in range(VX0 - 1, VX1 + 2): put(x, VY0 - 1, C['black']); put(x, VY1 + 1, C['black'])
    for y in range(VY0 - 1, VY1 + 2): put(VX0 - 1, y, C['black']); put(VX1 + 1, y, C['black'])
    # top strip: label + speaker grill
    text(px, LABEL, 16, 3, C['navy'])
    for k in range(9): rect(TW - 50 + k * 4, 3, TW - 50 + k * 4, 6, C['beige3'])
    # screws
    for sx, sy in [(3, 3), (TW - 6, 3), (3, TH - 6), (TW - 6, TH - 6)]:
        rect(sx, sy, sx + 2, sy + 2, C['beige3']); rect(sx, sy + 1, sx + 2, sy + 1, C['black'])
    # bottom strip: d-pad, indicator (dot drawn dim here, blinked on top), buttons
    cy = (VY1 + 3 + TH - 3) // 2
    cx = 22
    rect(cx - 3, cy - 1, cx + 3, cy + 1, C['black']); rect(cx - 1, cy - 3, cx + 1, cy + 3, C['black']); put(cx, cy, C['beige3'])
    total = 3 + 3 + len(INDICATOR) * 6 - 1; x0 = (TW - total) // 2
    rect(x0, cy - 1, x0 + 2, cy + 1, C['orangeD'])
    text(px, INDICATOR, x0 + 6, cy - 2, C['navy'])
    bx = TW - 26
    for (dx, dy), col in {(0, -3): C['beige3'], (0, 2): C['beige3'], (-3, -1): C['olive'], (3, -1): C['orange']}.items(): rect(bx + dx, cy + dy, bx + dx + 1, cy + dy + 1, col)
    # open the screen hole (transparent)
    for y in range(VY0, VY1 + 1):
        for x in range(VX0, VX1 + 1): px[y, x] = (0, 0, 0, 0)
    px[~shell] = (0, 0, 0, 0)

    # ---- vines + leaves. over=True lets them grow OVER the screen edge (forest overlapping the UI)
    def ok(x, y, over):
        if not (1 <= x < TW - 1 and 1 <= y < TH - 1 and shell[y, x]): return False
        return over or not (VX0 - 2 <= x <= VX1 + 2 and VY0 - 2 <= y <= VY1 + 2)

    def vine(x, y, n, dx, dy, seed, over=False, every=2):
        rr = np.random.default_rng(seed)
        for i in range(n):
            w = round(1.3 * math.sin(i * .5 + seed))
            vx, vy = (x + w, y + i * dy) if dx == 0 else (x + i * dx, y + w)
            if ok(vx, vy, over): put(vx, vy, C['forest2'])
            if i % every == 1:
                s = 1 if rr.random() > .5 else -1
                col = C['olive'] if rr.random() > .35 else C['olive2']
                # a little 4-cell leaf hanging off the stem
                cells = [(s, 0), (2 * s, 0), (2 * s, -dy if dx == 0 else -dx), (3 * s, 0)] if dx == 0 else [(0, s), (0, 2 * s), (-dx, 2 * s), (0, 3 * s)]
                for k, (ox, oy) in enumerate(cells):
                    if ok(vx + ox, vy + oy, over): put(vx + ox, vy + oy, C['forest'] if k == 0 else col)
                if rr.random() < .05 and ok(vx - s, vy, over): put(vx - s, vy, C['orange'])   # tiny berry

    # on the plastic (never over the screen)
    vine(3, 1, 12, 0, 1, 2); vine(3, 9, 40, 0, 1, 3); vine(6, 20, 22, 0, 1, 7); vine(12, 1, 10, 1, 0, 4); vine(22, 1, 18, 1, 0, 8)
    vine(TW - 4, TH - 2, 44, 0, -1, 5); vine(TW - 7, TH - 2, 22, 0, -1, 6); vine(TW - 18, TH - 2, 14, -1, 0, 9)
    vine(TW - 4, 2, 24, 0, 1, 10); vine(30, TH - 2, 18, 1, 0, 11)
    # over the screen: hanging from the top edge, creeping up from the bottom corners
    vine(VX0 + 4, VY0 - 1, 22, 0, 1, 21, True); vine(VX0 + 14, VY0 - 1, 11, 0, 1, 22, True); vine(VX0 + 27, VY0 - 1, 6, 0, 1, 23, True)
    vine(VX1 - 6, VY0 - 1, 26, 0, 1, 24, True); vine(VX1 - 17, VY0 - 1, 12, 0, 1, 25, True); vine(VX1 - 31, VY0 - 1, 5, 0, 1, 26, True)
    vine(VX0 + 3, VY1 + 1, 18, 0, -1, 27, True); vine(VX0 + 11, VY1 + 1, 8, 0, -1, 28, True)
    vine(VX1 - 4, VY1 + 1, 24, 0, -1, 29, True); vine(VX1 - 13, VY1 + 1, 10, 0, -1, 30, True)
    return px, shell, x0, cy


def read_frames(path):
    im = Image.open(path); sw, sh = im.size
    if os.path.getsize(path) > 20e6: print(f'warn: input is {os.path.getsize(path) / 1e6:.0f} MB. That is big; consider tools/pixelate.py first')
    if sw > 640: print(f'warn: input is {sw}px wide (over 640). It will be shrunk to {GRID_W} cells, but a smaller source loads and encodes faster')
    frames, durs = [], []
    for fr in ImageSequence.Iterator(im):
        d = fr.info.get('duration', 100); durs.append(d if d >= 20 else 100)
        rgba = fr.convert('RGBA'); bg = Image.new('RGBA', rgba.size, (0, 0, 0, 255)); bg.alpha_composite(rgba)
        frames.append(bg.convert('RGB'))
    fps = 1000 / (sum(durs) / len(durs))
    if fps > 15: print(f'warn: {fps:.0f} fps is fast. 10-15 fps keeps the file small')
    if len(frames) > MAX_FRAMES:
        step = math.ceil(len(frames) / MAX_FRAMES)
        print(f'warn: {len(frames)} frames; keeping every {step}th to stay under {MAX_FRAMES}')
        frames, durs = frames[::step], [sum(durs[i:i + step]) for i in range(0, len(durs), step)]
    return frames, durs


def to_grid(f):
    """cover-crop to the screen aspect, then squash onto the pixel grid"""
    ar = VW / VH; w, h = f.size
    if w / h > ar: nw = round(h * ar); f = f.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = round(w / ar); f = f.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return f.resize((VW, VH), Image.BOX if f.size[0] > VW else Image.NEAREST)


def pixel_update(src, durs):
    """src: (n,H,W) palette indices. Each cell refreshes on its own schedule -> 'pixels updating'."""
    n, K = len(src), max(1, UPDATE_EVERY)
    if K == 1 or n < 2: return [src[i] for i in range(n)], list(durs)
    if UPDATE_PATTERN == 'ordered': phase = (np.tile(BAYER4, (VH // 4 + 1, VW // 4 + 1))[:VH, :VW] * K) // 16
    else: phase = np.random.default_rng(7).integers(0, K, (VH, VW))
    yy, xx = np.indices((VH, VW)); out, od = [], []
    for i in range(n):
        j = (i - ((i - phase) % K)) % n          # which source frame this cell currently shows (wraps = pixel dissolve at the loop seam)
        a = src[j, yy, xx]
        if out and np.array_equal(a, out[-1]): od[-1] += durs[i]   # identical to the last frame: just hold longer
        else: out.append(a); od.append(durs[i])
    return out, od


def png_b64(img):
    b = io.BytesIO(); img.save(b, 'PNG', optimize=True); return base64.b64encode(b.getvalue()).decode()


def write_svg(path, disp, durs, pal, base, dot_x, dot_cy):
    W, H = TW * CELL, TH * CELL; T = sum(durs); n = len(disp)
    flat = [v for c in pal for v in c]; flat += [0] * (768 - len(flat))
    pix = 'style="image-rendering:crisp-edges;image-rendering:pixelated"'
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Animated GIF playing inside a pixel handheld frame">',
             '<title>Pixel media player</title>',
             f'<defs><pattern id="lcd" width="{CELL}" height="{CELL}" patternUnits="userSpaceOnUse"><path d="M{CELL - .5} 0V{CELL}M0 {CELL - .5}H{CELL}" stroke="#000" stroke-opacity=".30" stroke-width="1"/></pattern></defs>',
             '<!-- screen backdrop + one <image> per frame; SMIL flips their visibility so it autoplays without any controls -->',
             f'<rect x="{VX0 * CELL}" y="{VY0 * CELL}" width="{VW * CELL}" height="{VH * CELL}" fill="#000"/>', '<g id="frames">']
    t = 0
    for i, (a, d) in enumerate(zip(disp, durs)):
        im = Image.fromarray(a.astype(np.uint8), 'P'); im.putpalette(flat)
        tag = f'<image x="{VX0 * CELL}" y="{VY0 * CELL}" width="{VW * CELL}" height="{VH * CELL}" {pix} preserveAspectRatio="none" href="data:image/png;base64,{png_b64(im)}"'
        if n == 1: parts.append(tag + '/>')
        else:
            k0, k1 = t / T, (t + d) / T
            vals, keys = [], []
            if t > 0: vals.append('hidden'); keys.append(0)
            vals.append('visible'); keys.append(k0 if t > 0 else 0)
            if i < n - 1: vals.append('hidden'); keys.append(k1)
            parts.append(tag + f' visibility="{"visible" if i == 0 else "hidden"}"><animate attributeName="visibility" calcMode="discrete" values="{";".join(vals)}" keyTimes="{";".join(f"{k:.5f}" for k in keys)}" dur="{T / 1000:.3f}s" repeatCount="indefinite"/></image>')
        t += d
    parts.append('</g>')
    if LCD_GRID: parts.append(f'<rect x="{VX0 * CELL}" y="{VY0 * CELL}" width="{VW * CELL}" height="{VH * CELL}" fill="url(#lcd)"/>')
    parts.append('<!-- plastic frame, vines and leaves (generated by build_base() in tools/frame_gif.py) -->')
    parts.append(f'<image x="0" y="0" width="{W}" height="{H}" {pix} href="data:image/png;base64,{png_b64(Image.fromarray(base, "RGBA"))}"/>')
    parts.append(f'<rect x="{dot_x * CELL}" y="{(dot_cy - 1) * CELL}" width="{3 * CELL}" height="{3 * CELL}" fill="{COLORS["orange"]}"><animate attributeName="opacity" calcMode="discrete" values="1;0.15" keyTimes="0;.5" dur="{BLINK_MS / 1000:.2f}s" repeatCount="indefinite"/></rect>')
    parts.append('</svg>\n')
    open(path, 'w').write('\n'.join(parts))


def write_gif(path, disp, durs, pal, base, dot_x, dot_cy):
    """Same picture as a plain GIF. Built in palette-index space so colours stay exact."""
    fixed = list(dict.fromkeys(C.values())); F = len(fixed); n = len(pal)
    dark = [tuple(int(v * .72) for v in c) for c in pal]
    full = fixed + list(pal) + dark; TRANS = len(full); full.append((255, 0, 255))
    flat = [v for c in full for v in c]; flat += [0] * (768 - len(flat))
    lut = {c: i for i, c in enumerate(fixed)}
    alpha = base[..., 3] > 0
    bidx = np.full((TH, TW), TRANS, np.uint8)
    for y, x in zip(*np.nonzero(alpha)): bidx[y, x] = lut[tuple(base[y, x, :3])]
    hole = np.zeros((TH, TW), bool); hole[VY0:VY1 + 1, VX0:VX1 + 1] = True; hole &= ~alpha
    gy, gx = np.indices((TH * CELL, TW * CELL)); gap = ((gy % CELL) == CELL - 1) | ((gx % CELL) == CELL - 1)
    hole_up = np.kron(hole, np.ones((CELL, CELL), bool))
    orange, T, t, out = lut[C['orange']], sum(durs), 0, []
    for a, d in zip(disp, durs):
        cell = bidx.copy(); cell[VY0:VY1 + 1, VX0:VX1 + 1] = np.where(hole[VY0:VY1 + 1, VX0:VX1 + 1], a + F, cell[VY0:VY1 + 1, VX0:VX1 + 1])
        if (t % BLINK_MS) < BLINK_MS // 2: cell[dot_cy - 1:dot_cy + 2, dot_x:dot_x + 3] = orange
        big = np.kron(cell, np.ones((CELL, CELL), np.uint8))
        if LCD_GRID: big = np.where(hole_up & gap, big + n, big).astype(np.uint8)
        im = Image.fromarray(big, 'P'); im.putpalette(flat); out.append(im); t += d
    out[0].save(path, save_all=True, append_images=out[1:], duration=durs, loop=0, transparency=TRANS, disposal=1, optimize=False)


def main():
    global WRITE_GIF
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='src', default='assets/gif/current.gif')
    ap.add_argument('--out', default='assets/gif/framed', help='output path WITHOUT extension')
    ap.add_argument('--no-gif', action='store_true', help='write only the SVG')
    a = ap.parse_args()
    if a.no_gif: WRITE_GIF = False
    if not os.path.exists(a.src): sys.exit(f'missing {a.src}: drop a GIF there first')
    frames, durs = read_frames(a.src)
    grid = [to_grid(f) for f in frames]
    # one shared palette for the whole clip (no colour flicker)
    step = max(1, len(grid) // 12); mosaic = Image.new('RGB', (VW, VH * len(grid[::step])))
    for i, f in enumerate(grid[::step]): mosaic.paste(f, (0, i * VH))
    pal_img = mosaic.quantize(colors=min(PALETTE_COLORS, 120), method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    raw = pal_img.getpalette(); ncol = min(PALETTE_COLORS, 120)
    pal = [tuple(raw[i * 3:i * 3 + 3]) for i in range(ncol)]
    src = np.stack([np.asarray(f.quantize(palette=pal_img, dither=Image.Dither.NONE)) for f in grid])
    disp, ddur = pixel_update(src, durs)
    base, shell, dot_x, dot_cy = build_base()
    os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
    if WRITE_SVG:
        write_svg(a.out + '.svg', disp, ddur, pal, base, dot_x, dot_cy)
        mb = os.path.getsize(a.out + '.svg') / 1e6
        print(f'wrote {a.out}.svg: {len(disp)} frames, {mb:.2f} MB')
        if mb > 4: print('warn: SVG is over 4 MB. GitHub may refuse to show it. Use fewer frames, a lower fps, a smaller GRID or fewer PALETTE_COLORS')
    if WRITE_GIF:
        write_gif(a.out + '.gif', disp, ddur, pal, base, dot_x, dot_cy)
        mb = os.path.getsize(a.out + '.gif') / 1e6
        print(f'wrote {a.out}.gif: {len(disp)} frames, {TW * CELL}x{TH * CELL}px, {mb:.2f} MB')
        if mb > 5: print('warn: GIF is over 5 MB. Use fewer frames or a lower fps')


if __name__ == '__main__':
    main()
