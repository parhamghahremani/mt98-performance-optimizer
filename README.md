# MT98 Performance Optimizer

**Version**: 2.0.2  
**Author**: parham  
**License**: MIT  
**Target**: Firefox Desktop + Firefox Android  
**Site**: [mt98.ir](https://mt98.ir)

---

## Overview

Userscript for optimizing scrolling performance and reducing resource usage on MT98 (mt98.ir). Designed primarily for Firefox Android where GPU constraints make scroll jank noticeable on long pages.

### Key Optimizations

| Feature | Description |
|---------|-------------|
| **Scroll-time effect reduction** | Disables shadows, filters, backdrop-filter during scroll via `mt98-scrolling` class |
| **Image async decoding** | All images get `decoding="async"` for non-blocking decode |
| **Smart lazy loading** | 3-tier system: above-fold (eager+high), middle (eager+auto), below-fold (lazy+low) |
| **Large image optimization** | `content-visibility: auto` + `contain-intrinsic-size` for images ≥600px |
| **Iframe lazy loading** | Off-screen iframes get lazy loading + content-visibility |
| **Reduced motion respect** | Only disables animations for users with OS-level preference |
| **Reader page protection** | Conservative handling — no optimization on reader pages |
| **Emergency disable** | Add `?mt98perf=off` to URL to completely disable |

---

## Installation

### Via Tampermonkey (Recommended)

1. Install [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) in Firefox
2. Click to install: [mt98-performance-optimizer.user.js](https://github.com/parhamghahremani/mt98-performance-optimizer/raw/main/dist/mt98-performance-optimizer.user.js)
3. Confirm installation in Tampermonkey

### Manual Installation

1. Download `dist/mt98-performance-optimizer.user.js`
2. Open Tampermonkey dashboard → Utilities → Import
3. Select the file

---

## Configuration

All behavior controlled via `CONFIG` object at top of script:

```javascript
const CONFIG = {
    optimizeImages: true,           // Master switch for image optimizations
    optimizeLargeImages: true,      // Master switch for large image optimization
    largeImageHeight: 600,          // Min rendered height (px) for content-visibility
    lazyDistance: 1.5,              // Viewport multiplier for lazy trigger
    scrollEndDelay: 120,            // ms to keep scroll class after scroll ends
    idleDelay: 300,                 // ms timeout for requestIdleCallback
    batchSize: 100,                 // Max nodes per idle callback
    respectReducedMotion: true,     // Use prefers-reduced-motion media query
    protectAboveFold: true,         // Protect first 2 viewports from lazy loading
};
```

To customize, edit the script in Tampermonkey and modify `CONFIG` values.

---

## How It Works

### Scroll Optimization
When you scroll, the script adds `mt98-scrolling` class to `<html>`. CSS rules scoped to this class disable expensive GPU effects (shadows, filters, backdrop-filter) only during active scrolling. Class removed 120ms after scroll stops.

### Image Loading Tiers
```
Viewport top (0)          → Tier 1: eager + high priority
        ↓ 2 viewports
Viewport + 2 VPs          → Tier 2: eager + auto priority
        ↓ 1.5 viewports
Viewport + 3.5 VPs        → Tier 3: lazy + low priority
```

### Large Images
Images rendering ≥600px tall get `content-visibility: auto`, allowing Firefox to skip paint/layout for off-screen images. `contain-intrinsic-size` prevents layout shift when they scroll into view.

### Reader Pages
URLs matching `/readerpage.php` or `/reader/` skip all image optimizations to prevent chapter images from disappearing.

---

## Emergency Disable

Add `?mt98perf=off` to any MT98 URL:
```
https://mt98.ir/?mt98perf=off
https://mt98.ir/category/something?mt98perf=off
```
Script exits immediately — no CSS injected, no observers attached.

---

## Compatibility

| Browser | Status |
|---------|--------|
| Firefox Desktop (Windows 11) | Tested via Playwright |
| Firefox Android | **Primary target** — needs manual test |
| Tampermonkey (latest) | Compatible |
| `@grant none` | CSP compatible |

---

## Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
cd mt98-performance-optimizer
npm install
```

### Commands
```bash
npm run lint          # Check code style
npm run format        # Auto-format
npm test              # Run Playwright tests
npm run build         # Create versioned release
npm run version:patch # Bump patch version
npm run version:minor # Bump minor version
npm run version:major # Bump major version
```

### Project Structure
```
src/mt98-performance-optimizer.user.js   # Source (EDIT THIS)
dist/mt98-performance-optimizer.user.js  # Build output (latest)
versions/mt98-performance-optimizer-v*.user.js  # Versioned releases
tests/run-tests.spec.js                  # Playwright tests
docs/                                    # Documentation
backups/                                 # Local backups (gitignored)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.2 | 2026-11-14 | Custom icon, author metadata, GitHub URLs |
| 2.0.1 | 2026-11-13 | Reduced motion respect, above-fold protection, 3-tier loading |
| 2.0.0 | 2026-11-05 | Baseline: scroll optimization, image optimization, batch processing |

**Note**: v2.1.x was rolled back due to regressions (image loss, layout breaks).

---

## Documentation

- [Specification](docs/SPECIFICATION.md) — Requirements & acceptance criteria
- [Architecture](docs/ARCHITECTURE.md) — Module breakdown & data flow
- [Development Guide](docs/DEVELOPMENT_GUIDE.md) — Editing, build, testing workflow
- [Configuration & Permissions](docs/CONFIGURATION_AND_PERMISSIONS.md) — Metadata, grants, CONFIG
- [Compatibility](docs/COMPATIBILITY.md) — Browser/API compatibility matrix
- [Manual Test Plan](docs/MANUAL_TEST_PLAN.md) — User test checklist
- [Development Log](docs/DEVELOPMENT_LOG.md) — Milestones & issues
- [Decisions](docs/DECISIONS.md) — Key technical decisions
- [Known Issues](docs/KNOWN_ISSUES.md) — Confirmed defects & workarounds
- [References](docs/REFERENCES.md) — Official docs & research sources

---

## Support

- **Issues**: [GitHub Issues](https://github.com/parhamghahremani/mt98-performance-optimizer/issues)
- **Source**: [GitHub Repository](https://github.com/parhamghahremani/mt98-performance-optimizer)

---

## License

MIT License — see [LICENSE](LICENSE) if present, otherwise standard MIT terms.