#!/usr/bin/env python3
"""Turn any video/GIF into a chunky pixel-art GIF for your README.

  python3 tools/pixelate.py clip.mp4                       # -> assets/scene.gif
  python3 tools/pixelate.py clip.mp4 -o assets/scene.gif --width 160 --colors 16 --fps 12 --start 5 --duration 6

Needs: ffmpeg on PATH, and `pip install pillow numpy`.
Tips: 4-8 seconds loops best. --width is the *pixel-grid* width (smaller = chunkier).
Output is scaled up with nearest-neighbour so pixels stay crisp on GitHub.
"""
import argparse, glob, math, os, subprocess, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('-o', '--out', default='assets/scene.gif')
ap.add_argument('--width', type=int, default=160, help='pixel-grid width')
ap.add_argument('--ratio', default='16:9', help='crop to this aspect, e.g. 16:9 or 2:1')
ap.add_argument('--scale', type=int, default=5, help='upscale factor of final GIF')
ap.add_argument('--colors', type=int, default=16); ap.add_argument('--fps', type=int, default=12)
ap.add_argument('--start', type=float, default=0); ap.add_argument('--duration', type=float, default=6)
ap.add_argument('--saturation', type=float, default=1.15); ap.add_argument('--contrast', type=float, default=1.05)
ap.add_argument('--dither', action='store_true', help='ordered dithering (more retro, bigger file)')
ap.add_argument('--corners', type=int, default=5, help='rounded-corner radius in pixel-grid units (0 = square)')
a = ap.parse_args()

rw, rh = map(int, a.ratio.split(':')); gw = a.width; gh = round(gw * rh / rw)
with tempfile.TemporaryDirectory() as tmp:
    vf = f"fps={a.fps},crop='if(gt(iw/ih,{rw}/{rh}),ih*{rw}/{rh},iw)':'if(gt(iw/ih,{rw}/{rh}),ih,iw*{rh}/{rw})',scale={gw}:{gh}:flags=area"
    subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(a.start), '-t', str(a.duration), '-i', a.src, '-vf', vf, f'{tmp}/f_%04d.png'], check=True)
    files = sorted(glob.glob(f'{tmp}/f_*.png'))
    if not files: raise SystemExit('no frames extracted, check the path / --start')
    frames = [ImageEnhance.Contrast(ImageEnhance.Color(Image.open(f).convert('RGB')).enhance(a.saturation)).enhance(a.contrast) for f in files]
    # one shared palette for the whole clip (stops colour flicker): quantize a mosaic of sampled frames
    step = max(1, len(frames) // 12); sample = frames[::step]
    mosaic = Image.new('RGB', (gw, gh * len(sample)))
    for i, fr in enumerate(sample): mosaic.paste(fr, (0, i * gh))
    pal_img = mosaic.quantize(colors=a.colors, method=Image.MEDIANCUT, dither=Image.NONE)
    TRANS = a.colors  # index after the real colours
    pal = pal_img.getpalette()[:a.colors * 3] + [255, 0, 255]; pal += [0] * (768 - len(pal))
    pal_img.putpalette(pal)
    # rounded-corner mask in grid units
    r = a.corners; mask = np.zeros((gh, gw), bool)
    for cx, cy, bx, by in [(0, 0, 1, 1), (gw - 1, 0, -1, 1), (0, gh - 1, 1, -1), (gw - 1, gh - 1, -1, -1)]:
        for dx in range(r):
            for dy in range(r):
                if math.hypot(r - .5 - dx, r - .5 - dy) > r: mask[cy + dy * by, cx + dx * bx] = True
    big_mask = Image.fromarray((mask * 255).astype(np.uint8)).resize((gw * a.scale, gh * a.scale), Image.NEAREST)
    out = []
    for fr in frames:
        q = fr.quantize(palette=pal_img, dither=Image.Dither.ORDERED if hasattr(Image.Dither, 'ORDERED') and a.dither else Image.NONE)
        big = q.resize((gw * a.scale, gh * a.scale), Image.NEAREST)
        if r: big.paste(TRANS, mask=big_mask)
        out.append(big)
    os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
    out[0].save(a.out, save_all=True, append_images=out[1:], duration=round(1000 / a.fps), loop=0, transparency=TRANS if r else None, disposal=2)
print(f'wrote {a.out}: {len(out)} frames, {gw}x{gh} grid, {os.path.getsize(a.out) / 1e6:.2f} MB')
