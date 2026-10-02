# Setup

## 1. Create the repo
Create a **public** repo named exactly like your username (`Sakshamcozykun/Sakshamcozykun`), push everything in this folder, and the README shows on your profile.

## 2. Fill the placeholders
Search `README.md` for `YOUR_`:

| Placeholder | Put here |
|---|---|
| `YOUR_TILES_REPO` | full URL of the Tiles Privacy repo |
| `YOUR_LAN_TRANSFER_REPO` | full URL of LAN Transfer Buddy |
| `YOUR_FOOD_DELIVERY_REPO` | full URL of Food Delivery System |
| `YOUR_SAKSHAMOS_REPO` | full URL of SakshamOS |
| `YOUR_LINKEDIN` | `https://linkedin.com/in/...` |
| `YOUR_EMAIL` | your email address |
| `YOUR_PORTFOLIO` | portfolio / design work URL |
| `YOUR_OSDC_ORG` | OSDC GitHub org or site URL |

The three project one-liners other than Tiles are my guesses from the names. Rewrite them.

## 3. Turn on the Actions
Settings > Actions > General > Workflow permissions: **Read and write**. Then Actions tab > `update-chakra-map` > **Run workflow**.
Optional: for private contributions, create a PAT (`read:user`) and save it as repo secret `GH_PAT`.

## 4. Replace the GIF (3 steps, no README edits)
1. Put any GIF at `assets/gif/current.gif` (same name, overwrite).
2. Commit and push. The `frame-gif` Action builds `assets/gif/framed.gif` (about a minute).
3. Done. The README already points at `framed.gif`.

Offline alternative: `pip install pillow numpy && python3 tools/frame_gif.py`, then commit `framed.gif`.

GIF guidelines: 16:9 looks best (other ratios are centre-cropped), 10-15 fps, under ~5 MB, about 4-8 seconds. Turn a video into a pixel GIF first with
`python3 tools/pixelate.py clip.mp4 --width 192 --scale 4 --start 5 --duration 6 -o assets/gif/current.gif`.
Frame options (scanlines, labels, colours) are the config block at the top of `tools/frame_gif.py`. Each new `framed.gif` adds its size to repo history.

## 5. Edit things later
- Bio, stack, contact: plain Markdown in `README.md`.
- Add a project: copy one `<td>` block in section 02.
- Colours and pixel art: `assets/*.svg` are hand-editable; or tweak `scripts/lib.mjs` / `scripts/build-assets.mjs` and run `node scripts/build-assets.mjs`.

## What is generated vs custom
| Part | Source |
|---|---|
| Contribution pixels, totals, streaks | **GitHub-generated** (GraphQL API via the Action) -> `chakra-map.svg` |
| Repo links, project names | **GitHub-native** links and text in the README |
| Bio, stack, contact, footer | Plain Markdown (works with images off) |
| `framed.gif` | Your GIF + a frame drawn in code (`tools/frame_gif.py`) |
| hero, labels, cartridges, leaf, vine, corner, cursor, status dot | Custom SVG made from pixel rectangles (no AI art) |
