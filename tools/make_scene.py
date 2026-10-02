"""Procedural pixel-art twilight scene -> assets/scene.gif  (seamless loop).
Run: python3 tools/make_scene.py
"""
import math, random
import numpy as np
from PIL import Image, ImageDraw

W, H, SCALE, N, MS = 192, 108, 4, 96, 80
HOR = 80  # horizon row

def hx(s): s = s.lstrip('#'); return tuple(int(s[i:i+2], 16) for i in (0, 2, 4))
SKY = ['#151433', '#241e4b', '#3c2a5f', '#6b3b70', '#b4587b', '#ef8a80', '#ffc29b']
PAL = SKY + ['#fff0d6',            # 7  sun / stars
             '#7a4479', '#52305f', '#33234b', '#1c1534',  # 8-11 far..fg mountains / silhouette
             '#ffd3c6', '#e08e9c',                         # 12-13 cloud light / shade
             '#ffc4d6', '#ff90b2',                         # 14-15 petals
             '#ffa3c0', '#ffd6e2',                         # 16-17 blossom
             '#ff6f91',                                    # 18 scarf
             '#ff00ff']                                    # 19 transparent key
TRANS = 19
pal_flat = [c for h in PAL for c in hx(h)]
pal_flat += [0] * (768 - len(pal_flat))

BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0
yy, xx = np.mgrid[0:H, 0:W]
thr = BAYER[yy % 4, xx % 4]

# --- sky: dithered vertical gradient + sun halo
SUN = (128, 66); SR = 10
v = np.clip(yy / HOR, 0, 1) ** 1.25 * 6.0
halo = np.clip(1 - np.hypot(xx - SUN[0], (yy - SUN[1]) * 1.1) / 62, 0, 1) ** 1.6 * 2.6
sky = np.clip(np.floor(v + halo + thr), 0, 6).astype(np.uint8)
base = sky.copy()
base[np.hypot(xx - SUN[0], yy - SUN[1]) <= SR] = 7

def poly_layer(color, fn):
    g = np.zeros((H, W), bool)
    for x in range(W): g[int(fn(x)):, x] = True
    return g, color
def ridge(a, f1, f2, p1, p2, b):
    return lambda x: b - a * (0.6 * math.sin(x * f1 + p1) + 0.4 * math.sin(x * f2 + p2) + 1)
layers = [poly_layer(8, ridge(10, .035, .09, 1.0, 2.0, 80)),
          poly_layer(9, ridge(9, .05, .13, 4.0, .5, 86)),
          poly_layer(10, ridge(6, .07, .2, 2.5, 1.2, 92))]
for g, c in layers: base[g] = c
base[96:, :] = 11  # foreground ground

img0 = Image.fromarray(base, 'P'); img0.putpalette(pal_flat)
bd = ImageDraw.Draw(img0)
def R(x0, y0, x1, y1, c): bd.rectangle([x0, y0, x1, y1], fill=c)

# --- torii gate on the mid ridge (right)
tx, ty = 156, 70
R(tx - 12, ty - 2, tx + 12, ty, 11); R(tx - 14, ty - 4, tx - 12, ty - 2, 11); R(tx + 12, ty - 4, tx + 14, ty - 2, 11)  # kasagi
R(tx - 9, ty + 3, tx + 9, ty + 4, 11)                                                                                  # nuki
R(tx - 8, ty, tx - 6, ty + 28, 11); R(tx + 6, ty, tx + 8, ty + 28, 11)                                                  # pillars

# --- lone figure on the hill, facing the sun (scarf is animated per frame)
fx, fy = 100, 93
R(fx - 1, fy - 12, fx + 1, fy - 10, 11); R(fx - 1, fy - 9, fx + 1, fy - 3, 11)            # head, torso
R(fx - 2, fy - 8, fx + 2, fy - 6, 11); R(fx - 1, fy - 2, fx, fy + 2, 11); R(fx + 1, fy - 2, fx + 2, fy + 2, 11)

# --- sakura branch top-left
rnd = random.Random(7)
def line(p, q, w=2):
    n = int(max(abs(q[0] - p[0]), abs(q[1] - p[1]))) + 1
    for i in range(n + 1):
        x = p[0] + (q[0] - p[0]) * i / n; y = p[1] + (q[1] - p[1]) * i / n
        R(round(x), round(y), round(x) + w - 1, round(y) + w - 1, 11)
line((-4, 6), (50, 24), 3); line((20, 15), (34, 4)); line((34, 20), (52, 8)); line((46, 22), (74, 28)); line((60, 25), (66, 38)); line((10, 11), (6, 28))
for (cx, cy) in [(34, 4), (52, 8), (74, 28), (66, 38), (6, 28), (28, 18), (44, 14), (58, 24), (14, 14), (22, 8), (68, 30)]:
    for _ in range(26):
        a, r = rnd.random() * 6.28, rnd.random() * 8
        px, py = round(cx + math.cos(a) * r), round(cy + math.sin(a) * r * .8)
        if 0 <= px < W and 0 <= py < H: bd.point((px, py), fill=16 if rnd.random() < .6 else 17)

# --- stars + clouds + petals definitions
stars = [(rnd.randrange(W), rnd.randrange(2, 38), rnd.randrange(3)) for _ in range(26)]
stars = [s for s in stars if not (s[0] < 80 and s[1] < 42)]
def cloud(x, y, w):
    return [(x, y, x + w, y + 1, 12), (x + 2, y + 2, x + w - 3, y + 3, 13), (x + 4, y - 1, x + w - 8, y - 1, 12)]
cloud_set = cloud(8, 24, 26) + cloud(58, 40, 20) + cloud(34, 56, 30)   # period = W/2 (tiled twice)
petals = []
for i in range(34):
    petals.append(dict(x0=rnd.random() * W, y0=rnd.random() * H, ky=rnd.choice([1, 1, 2]), kx=rnd.choice([0, 1, 1]),
                       m=rnd.choice([1, 2, 3]), ph=rnd.random(), amp=rnd.uniform(3, 9), c=rnd.choice([14, 14, 15])))

frames = []
for t in range(N):
    f = img0.copy(); d = ImageDraw.Draw(f); u = t / N
    for (sx, sy, ph) in stars:                                   # twinkle
        if (math.sin(2 * math.pi * (u * 2 + ph / 3)) > -.2): d.point((sx, sy), fill=7)
    off = -(W / 2) * u                                            # clouds drift left, seamless
    for k in range(3):
        for (x0, y0, x1, y1, c) in cloud_set:
            xo = round(x0 + off + k * (W / 2)); xe = round(x1 + off + k * (W / 2))
            d.rectangle([xo, y0, xe, y1], fill=c)
    for i in range(6):                                            # scarf flutter
        wv = round(math.sin(2 * math.pi * (u * 3) - i * .8) * (1 + i * .25))
        d.rectangle([fx - 2 - i, fy - 8 + wv, fx - 2 - i, fy - 7 + wv], fill=18)
    for p in petals:
        y = (p['y0'] + p['ky'] * H * u) % H
        x = (p['x0'] - p['kx'] * W * u + p['amp'] * math.sin(2 * math.pi * (p['m'] * u + p['ph']))) % W
        d.point((round(x), round(y)), fill=p['c'])
        if p['ky'] == 2: d.point((round(x) + 1, round(y)), fill=p['c'])
    big = f.resize((W * SCALE, H * SCALE), Image.NEAREST)
    # pixel-stepped rounded corners (transparent)
    m = Image.new('L', (W, H), 255); md = ImageDraw.Draw(m); r = 6
    for cx_, cy_, bx, by in [(0, 0, 1, 1), (W - 1, 0, -1, 1), (0, H - 1, 1, -1), (W - 1, H - 1, -1, -1)]:
        for dx in range(r):
            for dy in range(r):
                if math.hypot(r - 0.5 - dx, r - 0.5 - dy) > r: md.point((cx_ + dx * bx, cy_ + dy * by), fill=0)
    mb = m.resize((W * SCALE, H * SCALE), Image.NEAREST)
    big.paste(TRANS, mask=Image.eval(mb, lambda a: 255 - a))
    frames.append(big)

frames[0].save('assets/scene.gif', save_all=True, append_images=frames[1:], duration=MS, loop=0,
               transparency=TRANS, disposal=2, optimize=False)
print('wrote assets/scene.gif', len(frames), 'frames')
