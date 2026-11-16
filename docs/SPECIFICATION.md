# Specification — MT98 Performance Optimizer

**Project**: `mt98-performance-optimizer`  
**Version**: 2.0.2  
**Target Site**: `mt98.ir` (and `www.mt98.ir`)  
**Target Browsers**: Firefox Desktop (Windows 11), Firefox for Android  
**Userscript Manager**: Tampermonkey (latest)

---

## Purpose

Reduce paint/compositing cost, scroll-time visual effects, and unnecessary image work on MT98 pages to improve scrolling performance, especially on Firefox Android where GPU resources are constrained.

---

## Functional Requirements

### FR1: Scroll-Time Visual Effect Reduction
- **Trigger**: User physically scrolls the page
- **Action**: Add `mt98-scrolling` class to `<html>` during scroll, remove after `scrollEndDelay` (default 120ms)
- **CSS Effects Disabled During Scroll**:
  - `box-shadow`
  - `text-shadow`
  - `filter` / `-webkit-filter`
  - `backdrop-filter` / `-webkit-backdrop-filter`
  - `background-attachment: fixed` → forced to `scroll`
- **Implementation**: Passive scroll listener + `requestAnimationFrame` + timeout

### FR2: Image Optimization
- **Async Decoding**: All `<img>` elements get `decoding="async"`
- **3-Tier Lazy Loading** (based on viewport position):
  - **Tier 1 (0–2 viewports)**: `loading="eager"`, `fetchPriority="high"` — Above-fold protection
  - **Tier 2 (2–lazyDistance viewports)**: `loading="eager"`, `fetchPriority="auto"` — Middle zone
  - **Tier 3 (>lazyDistance viewports)**: `loading="lazy"`, `fetchPriority="low"` — Below-fold
- **Default `lazyDistance`**: 1.5 viewports

### FR3: Large Image Optimization
- **Threshold**: Images with rendered height ≥ `largeImageHeight` (default 600px)
- **Action**: Add `mt98-large-image` class → `content-visibility: auto` + `contain-intrinsic-size: auto <height>px`
- **Timing**: Applied after image loads (natural dimensions known)

### FR4: Iframe Optimization
- **Condition**: Off-screen iframes (> `lazyDistance` viewports below)
- **Action**: `loading="lazy"` + `mt98-lazy-frame` class → `content-visibility: auto` + `contain-intrinsic-size: auto 300px`

### FR5: Reader Page Conservative Handling
- **Detection**: Path matches `/readerpage\.php/` or `/\/reader(?:\/|$)/`
- **Behavior**: `optimizeImages = false`, `optimizeLargeImages = false` on reader pages
- **Rationale**: Reader pages have different layout; aggressive optimization caused image disappearance

### FR6: Reduced Motion Respect
- **Mechanism**: `@media (prefers-reduced-motion: reduce)` CSS media query
- **Effect**: Only users with OS-level reduced motion preference get animations/transitions disabled
- **Default**: `respectReducedMotion: true`

### FR7: Emergency Disable
- **Mechanism**: URL parameter `?mt98perf=off`
- **Behavior**: Script exits immediately, no CSS injected, no observers attached

### FR8: Batch DOM Processing
- **Mechanism**: `requestIdleCallback` (fallback: `setTimeout`)
- **Batch Size**: `batchSize` (default 100 nodes per idle callback)
- **Queue**: New images/iframes queued via MutationObserver, processed incrementally

### FR9: Dynamic Content Handling
- **MutationObserver**: Observes `document.body` for `childList` + `subtree`
- **Filters**: Only queues `<img>` and `<iframe>` elements (direct or in subtree)
- **Deduplication**: `WeakSet` tracking prevents re-processing

### FR10: Cleanup on Unload
- **Events**: `pagehide` (once, passive)
- **Actions**: Clear scroll timer, cancel animation frame, disconnect observer

---

## Non-Functional Requirements

### NFR1: Performance
- **Startup Cost**: Minimal — single style element injection at document-start
- **Runtime Overhead**: Passive listeners only; heavy work deferred to idle callbacks
- **Memory**: `WeakSet` tracking allows GC; no strong references to DOM nodes

### NFR2: Compatibility
- **CSP Compatible**: `@grant none` — no GM APIs requiring special permissions
- **No Frame Breaking**: `@noframes` not used; works in iframes if needed
- **Firefox Android Focus**: Optimized for mobile GPU constraints (shadow/filter cost)

### NFR3: Maintainability
- **Single File**: IIFE userscript, no build step required for basic use
- **Configurable**: All thresholds/timing in `CONFIG` object
- **Documented**: Inline comments explain rationale for each optimization

### NFR4: Safety
- **No Aggressive DOM Mutation**: Only sets attributes/classes, never removes/replaces elements
- **Error Boundaries**: All DOM operations wrapped in try/catch
- **Geometry Errors Ignored**: `getBoundingClientRect()` failures caught silently

---

## Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC1 | Style element `#mt98-performance-optimizer` injected at document-start | Playwright test + manual inspection |
| AC2 | `mt98-scrolling` class added during scroll, removed after delay | Playwright test + manual scroll |
| AC3 | Images get `decoding="async"` | Playwright test |
| AC4 | Above-fold images (0-2 viewports) get `loading="eager"`, `fetchPriority="high"` | Manual test + console inspection |
| AC5 | Below-fold images (>1.5 viewports) get `loading="lazy"`, `fetchPriority="low"` | Manual test + console inspection |
| AC6 | Large images (≥600px rendered) get `content-visibility: auto` class | Playwright test |
| AC7 | Reader pages (`/readerpage.php`, `/reader/`) skip image optimization | Playwright test |
| AC8 | `prefers-reduced-motion: reduce` disables animations via CSS | Manual test (OS setting) |
| AC9 | `?mt98perf=off` completely disables script | Playwright test |
| AC10 | MutationObserver queues new images/iframes | Manual test (dynamic content) |
| AC11 | No console errors from script | Playwright test |
| AC12 | Script works on Firefox Android | Manual test (required) |

---

## Constraints & Boundaries

| Constraint | Detail |
|------------|--------|
| `@run-at` | `document-start` — CSS must inject before first paint |
| `@grant` | `none` — No `GM_*` APIs, no cross-origin requests |
| `@match` | Only `https://mt98.ir/*` and `https://www.mt98.ir/*` |
| Dependencies | Zero runtime dependencies — vanilla JS only |
| Build | Optional — `npm run build` creates versioned releases only |

---

## Version History Reference

- **v2.0.0** (2026-11-05): Baseline — conservative, stable
- **v2.0.1** (2026-11-13): `respectReducedMotion`, `protectAboveFold`
- **v2.0.2** (2026-11-14): Custom icon, author metadata, GitHub URLs
- **v2.1.x** (2026-11-13): Rolled back — regressions (image loss, layout breaks, dozigame.ir connections)

---

## Future Considerations (Not in Current Scope)

- Infinite scroll / pagination intercept (was in v2.1.x, removed)
- AVIF fallback for WebP images
- CDN preconnect / DNS prefetch
- Trust seal (Enamad) iframe deferral
- Chapter navigation prefetch (reader pages)
- `content-visibility: visible` force mode
- Below-fold acceleration
- Touch target optimization (48×48px)

These may be re-added incrementally after thorough testing on v2.0.x baseline.