# Setup (V2)

## 1. Push everything
Public repo named exactly like your username (`Sakshamcozykun/Sakshamcozykun`). Settings > Actions > General > Workflow permissions: **Read and write**.

## 2. Make the cartridges open your repos
The cartridge art and the text under it are both links. They point at placeholders until you fill them (that is why clicking did nothing in V1). One command:

    node scripts/set-links.mjs tiles=https://github.com/Sakshamcozykun/REPO lan=https://github.com/Sakshamcozykun/REPO food=https://github.com/Sakshamcozykun/REPO os=https://github.com/Sakshamcozykun/REPO linkedin=https://linkedin.com/in/saksham-gupta-16a14b364 email=sakshamofficalwork@gmail.com portfolio=URL osdc=URL

(or search `README.md` for `YOUR_`). Rewrite the LAN / Food / SakshamOS one-liners, they are guesses.

## 3. Chakra map (real data)
Actions tab > `update-chakra-map` > **Run workflow**. It also runs every 6 hours and whenever the script changes.
- Works out of the box for your public contributions (built-in token).
- For private contributions: create a token with `read:user`, save it as repo secret `GH_PAT`.
- Until the first successful run the image says SAMPLE DATA. In CI the script refuses to publish sample data, so a failed run leaves the old map alone.

## 4. Replace the GIF (3 steps, zero README edits)
1. Put any GIF at `assets/gif/current.gif`.
2. Commit and push. The `frame-gif` Action builds `assets/gif/framed.svg` (+ `framed.gif`) in about a minute.
3. Done. The README already points at `framed.svg`.

The player is an animated SVG, so it autoplays on GitHub with no play/pause overlay. Pixel-updating look, grid size, frame colours, labels: config block at the top of `tools/frame_gif.py`.
Local run: `pip install pillow numpy && python3 tools/frame_gif.py`.
Video to pixel GIF first: `python3 tools/pixelate.py clip.mp4 --width 192 --scale 4 --start 5 --duration 6 -o assets/gif/current.gif`.
Each new framed.svg/gif adds its size to repo history. Keep GIFs at about 4-8 s and 10-15 fps.
If SVG ever fails to animate for you, change one README line from `framed.svg` to `framed.gif`.

## 5. Regenerate pixel art
`node scripts/build-assets.mjs` redraws hero, labels, vines, cartridges. Add a project by adding a row to `PROJECTS` in that script and copying a block in README section 02.
