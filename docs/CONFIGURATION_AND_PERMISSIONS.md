# Configuration & Permissions — MT98 Performance Optimizer

**Project**: `mt98-performance-optimizer`  
**Version**: 2.0.2

---

## Userscript Metadata

```javascript
// ==UserScript==
// @name         MT98 Performance Optimizer
// @namespace    https://github.com/parhamghahremani
// @version      2.0.2
// @description  Performance and scrolling optimization for MT98
// @author       parham
// @match        https://mt98.ir/*
// @match        https://www.mt98.ir/*
// @run-at       document-start
// @grant        none
// @icon         data:image/svg+xml;base64,...
// @downloadURL  https://github.com/parhamghahremani/userscripts/raw/main/mt98-performance-optimizer/versions/mt98-performance-optimizer-v2.0.2.user.js
// @updateURL    https://github.com/parhamghahremani/userscripts/raw/main/mt98-performance-optimizer/versions/mt98-performance-optimizer-v2.0.2.user.js
// @supportURL   https://github.com/parhamghahremani/userscripts/issues
// @homepageURL  https://github.com/parhamghahremani/userscripts/tree/main/mt98-performance-optimizer
// @license      MIT
// ==/UserScript==
```

---

## Metadata Field Analysis

| Field | Value | Rationale |
|-------|-------|-----------|
| `@name` | MT98 Performance Optimizer | User-visible name in Tampermonkey |
| `@namespace` | https://github.com/parhamghahremani | Unique identifier, GitHub profile |
| `@version` | 2.0.2 | Semantic version, matches package.json + Git tag |
| `@description` | Performance and scrolling optimization for MT98 | Concise purpose |
| `@author` | parham | Attribution |
| `@match` | https://mt98.ir/*, https://www.mt98.ir/* | Precise scope — only MT98 domains |
| `@run-at` | document-start | Critical: CSS must inject before first paint |
| `@grant` | none | No GM APIs needed; CSP compatible; maximum compatibility |
| `@icon` | Base64 SVG | Custom UI icon in Tampermonkey dashboard |
| `@downloadURL` | Versioned GitHub raw URL | Tampermonkey update checks |
| `@updateURL` | Versioned GitHub raw URL | Tampermonkey update checks |
| `@supportURL` | GitHub issues | User support channel |
| `@homepageURL` | GitHub repo tree | Project home |
| `@license` | MIT | Open source license |

---

## Permissions Analysis

### `@grant none` — Implications

| Capability | Available? | Notes |
|------------|------------|-------|
| `GM_xmlhttpRequest` | ❌ | Not needed |
| `GM_fetch` | ❌ | Not needed (v2.0.x) |
| `GM_getValue` / `GM_setValue` | ❌ | No persistent storage needed |
| `GM_addStyle` | ❌ | Using native `createElement('style')` |
| `GM_registerMenuCommand` | ❌ | No menu commands |
| `GM_notification` | ❌ | Not needed |
| `GM_openInTab` | ❌ | Not needed |
| `unsafeWindow` | ❌ | Not accessed |

**Benefits of `@grant none`**:
- Works under strict CSP (`script-src 'self'`)
- No permission prompt in Tampermonkey
- Maximum browser compatibility
- No elevated privileges required

---

## Cross-Origin Requests (`@connect`)

**Current**: None required (v2.0.x uses no fetch/XHR)

**If needed in future** (e.g., infinite scroll re-added):
```javascript
// @connect mt98.ir
// @connect www.mt98.ir
// @connect dozigame.ir  // CDN for thumbnails
```

---

## Configuration Object (CONFIG)

All runtime behavior controlled via `CONFIG` object at top of script:

```javascript
const CONFIG = {
    // Image optimization
    optimizeImages: true,           // Master switch for image optimizations
    optimizeLargeImages: true,      // Master switch for large image content-visibility
    largeImageHeight: 600,          // Min rendered height (px) for content-visibility
    lazyDistance: 1.5,              // Viewport multiplier for lazy-loading trigger

    // Scroll optimization
    scrollEndDelay: 120,            // ms to keep mt98-scrolling class after scroll ends

    // Batch processing
    idleDelay: 300,                 // ms timeout for requestIdleCallback
    batchSize: 100,                 // Max nodes processed per idle callback

    // Behavioral flags (v2.0.1+)
    respectReducedMotion: true,     // Use prefers-reduced-motion media query
    protectAboveFold: true,         // Protect first 2 viewports from lazy loading
};
```

### Tuning Guidelines

| Parameter | Increase If | Decrease If |
|-----------|-------------|-------------|
| `largeImageHeight` | Too many images getting content-visibility (layout shifts) | Large images not optimized |
| `lazyDistance` | Above-fold images incorrectly lazy-loaded | Below-fold images loading too eagerly |
| `scrollEndDelay` | Scroll class flickers on fast flings (mobile) | Scroll class lingers too long |
| `idleDelay` | Batch processing too slow on low-end devices | Idle callbacks fire too aggressively |
| `batchSize` | Main thread blocked during processing | Too many idle callbacks overhead |

---

## CSS Selectors Used

### Injected Classes (Script → Page)

| Class | Applied To | Purpose |
|-------|------------|---------|
| `mt98-scrolling` | `<html>` | Toggle scroll-time CSS |
| `mt98-large-image` | `<img>` | Large image content-visibility |
| `mt98-lazy-frame` | `<iframe>` | Off-screen iframe optimization |

### CSS Rules Injected

| Selector | Properties | Conditions |
|----------|------------|------------|
| `html` | `scroll-behavior: auto`, `scroll-snap-type: none` | Always |
| `*`, `*::before`, `*::after` | Animation/transition kill | `@media (prefers-reduced-motion: reduce)` |
| `.mt98-scrolling *` | Shadows, filters, backdrop-filter disabled | During scroll |
| `img` | `image-rendering: auto` | Always |
| `.mt98-large-image` | `content-visibility: auto`, `contain-intrinsic-size` | Large images after load |
| `.mt98-lazy-frame` | `content-visibility: auto`, `contain-intrinsic-size` | Off-screen iframes |

---

## Feature Flags (Config-Driven)

| Feature | Config Key | Default | Description |
|---------|------------|---------|-------------|
| Image async decode | `optimizeImages` | `true` | `decoding="async"` on all images |
| 3-tier lazy loading | `optimizeImages` | `true` | Viewport-based loading/priority |
| Large image optimization | `optimizeLargeImages` | `true` | `content-visibility` for tall images |
| Iframe lazy loading | `optimizeImages` | `true` | Off-screen iframes |
| Reduced motion respect | `respectReducedMotion` | `true` | CSS media query |
| Above-fold protection | `protectAboveFold` | `true` | First 2 viewports eager+high |

---

## Version-Specific Configuration

### v2.0.0 (Baseline)
- 7 config options (no `respectReducedMotion`, `protectAboveFold`)
- `largeImageHeight: 600`, `scrollEndDelay: 120`

### v2.0.1 (Incremental)
- Added `respectReducedMotion: true`
- Added `protectAboveFold: true` (2 viewport protection)
- 3-tier loading system introduced

### v2.0.2 (Metadata)
- No config changes
- Icon, author, GitHub URLs added

### v2.1.x (Rolled Back)
- 13 additional options (infinite scroll, AVIF, preconnect, etc.)
- `largeImageHeight: 1000`, `scrollEndDelay: 300`
- `disableAllScrollEffects: true` (permanent CSS disable)

---

## CSP Compatibility

Script designed for strict CSP environments:

```http
Content-Security-Policy: script-src 'self'; style-src 'self'; img-src 'self' data: https:; ...
```

**Compliance**:
- ✅ No inline event handlers
- ✅ Style injected via `createElement('style')` (allowed by Tampermonkey)
- ✅ No `eval`, `new Function`, `setTimeout(string)`
- ✅ No external script loads (`@require` not used)
- ✅ `@grant none` — no extension APIs
- ✅ All network requests via native browser fetch (if re-added, needs `@connect`)

---

## Tampermonkey-Specific Notes

| Setting | Value | Notes |
|---------|-------|-------|
| `@run-at document-start` | Required | CSS before paint |
| `@noframes` | Not used | Works in iframes if needed |
| `@unwrap` | Not used | No special unwrapping |
| `@antifeature` | None | No tracking, ads, etc. |
| `@compatible` | Not declared | Firefox + Android assumed |

---

## Update Mechanism

- **Tampermonkey checks**: `@updateURL` (JSON metadata) + `@downloadURL` (script file)
- **Both point to**: Versioned file in `parhamghahremani/userscripts` repo
- **Versioned URL pattern**: `.../versions/mt98-performance-optimizer-v{version}.user.js`
- **Build script updates**: `dist/` file gets versioned URLs automatically

---

## Related Files

- `src/mt98-performance-optimizer.user.js` — Source with metadata + CONFIG
- `build.js` — Updates download/update URLs during build
- `package.json` — Version sync
- `CHANGELOG.md` — Version history