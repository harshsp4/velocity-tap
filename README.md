# Velocity Tap

**Mechanical keyboard sounds for Firefox.** 17 authentic sound packs.

![Velocity Tap](icons/icon-128.png)

## Features

- **17 sound packs** — NK Cream, Alpacas, Box Navy, Holy Pandas, Cherry MX Blue, Topre, Buckling Spring, Typewriter, and more
- **Per-key samples** — Each key has its own sound; release sounds (`-up`) supported where available
- **Fallback variations** — Multiple fallback sounds rotate for unassigned keys
- **Works everywhere** — All `<input>`, `<textarea>`, and `contenteditable` elements
- **Zero dependencies** — Pure WebExtension (Manifest V3), no external binaries, fully offline
- **Lightweight** — ~1.4 MB total, lazy-loads sounds on first keystroke
- **Settings persist** — Volume, enable/disable, and sound pack selection sync via `storage.sync`

## Sound Packs

| Pack | Release Sounds |
|------|----------------|
| NK Cream | ✅ |
| NK Cream (MonkeyType) | ❌ |
| Alpacas | ✅ |
| Gateron Black Inks | ✅ |
| Blue Alps | ✅ |
| Kailh Box Navies | ✅ |
| Buckling Spring | ✅ |
| Cherry MX Blue | ✅ |
| Holy Pandas | ✅ |
| Cherry MX Blacks | ✅ |
| Cherry MX Blue (alt) | ✅ |
| Cherry MX Browns | ✅ |
| osu! | ❌ |
| Gateron Red Inks | ✅ |
| Topre | ✅ |
| Turquoise Tealios | ✅ |
| Typewriter | ❌ |

## Installation

### From Firefox Add-ons (Recommended)
1. Visit the [AMO listing](#) (once published)
2. Click **Add to Firefox**

### From Source (Development)
```bash
# Clone
git clone https://github.com/harshsp4/velocity-tap.git
cd velocity-tap

# Temporary install (for testing)
# Firefox → about:debugging → This Firefox → Load Temporary Add-on → manifest.json

# Permanent install (production)
# Firefox → about:addons → Gear → Install Add-on From File → velocity-tap-extension.zip
```

### Build ZIP for AMO
```bash
cd velocity-tap
zip -r ../velocity-tap-extension.zip .
```

## Usage

Click the extension icon to open the popup:
- **Enable Sounds** — Master toggle
- **Sound Pack** — Choose from 17 packs (shows "no release sounds" where applicable)
- **Volume** — 0–100% slider

Settings sync across Firefox instances via your Mozilla account.

## Architecture

```
velocity-tap/
├── manifest.json          # Manifest V3
├── background.js          # Service worker (install defaults)
├── content.js             # Content script — keydown/keyup → Web Audio API
├── popup/
│   ├── popup.html         # Settings UI
│   ├── popup.js           # Storage sync
│   └── popup.css          # Styles
├── icons/                 # 16/32/48/128px + SVG
└── sounds/                # 17 packs, ~1.4 MB total
    ├── nkcream2/
    ├── alpacas/
    └── ... (15 more)
```

**How it works:**
1. Content script attaches to all frames at `document_start`
2. Listens for `keydown`/`keyup` on editable elements
3. Maps `event.key` → sound filename (e.g., `Enter` → `enter.wav`, `a` → `a.wav`)
4. Loads `.wav` via `browser.runtime.getURL()` → `AudioContext.decodeAudioData()`
5. Plays via `AudioBufferSourceNode` + `GainNode` (volume control)

## Privacy

- **No data collection** — `data_collection_permissions.required: ["none"]`
- **No network requests** — All sounds bundled locally
- **No analytics, no tracking, no external connections**

## License

- **Extension code:** MIT License
- **Sound assets:** Bundled for personal use

## Credits

- **Icon:** Custom SVG (keyboard ⌨)
- **Inspiration:** Mechanical keyboard community

## Contributing

PRs welcome for:
- Additional sound packs (add to `sounds/` with `config.json`)
- UI improvements
- Bug fixes

## Support

- **Issues:** [GitHub Issues](https://github.com/harshsp4/velocity-tap/issues)