# Changelog — MT98 Performance Optimizer

All notable changes to this project will be documented in this format.

## [2.0.2] - 2026-11-14

### Added
- **Custom icon**: Added SVG-based `@icon` for Tampermonkey/GreaseMonkey UI display
- **Author metadata**: Added `@author parham` and updated `@namespace` to GitHub profile
- **GitHub URLs**: Updated `@downloadURL`, `@updateURL`, `@supportURL`, `@homepageURL` to point to `https://github.com/parhamghahremani/userscripts`

### Changed
- **Version bump**: 2.0.1 → 2.0.2 (patch for metadata/icon updates only, no functional changes)

---

## [2.0.1] - 2026-11-13

### Rollback to v2.0.0 Base
- **Rolled back to v2.0.0** stable baseline after v2.1.x introduced regressions (images disappearing, layout breaks, excessive connections to dozigame.ir)
- v2.0.0 was the last version with no reported issues on image display or layout

### Added (Incremental Improvements)
- **Respect prefers-reduced-motion**: Replaced global `*, *::before, *::after` animation/transition kill with `@media (prefers-reduced-motion: reduce)` that only affects users who explicitly prefer reduced motion. Preserves normal site animations for other users.
- **Above-fold image protection**: First 2 viewports now get eager loading + high fetchPriority (no lazy). Added 3-tier system: 0-2 viewports = eager+high, 2-lazyDistance = eager+auto, >lazyDistance = lazy+low.
- **Configuration additions**: `respectReducedMotion: true`, `protectAboveFold: true` (both default true)

### Changed
- **Scroll strategy**: Kept v2.0.0 scroll-time toggle (`mt98-scrolling` class) instead of permanent CSS disabling. Simpler, no flash issues on this site.
- **Reader pages**: Remain conservative (no optimization) per v2.0.0 design.
- **Removed v2.1.x features**: Infinite scroll, AVIF fallback, preconnect CDN, trust seal defer, chapter nav prefetch, content-visibility:visible, below-fold acceleration, touch target optimization. Will be re-added incrementally after testing.

### Configuration (CONFIG object)
| Option | Default | Description |
|--------|---------|-------------|
| `optimizeImages` | `true` | Enable image async decode + lazy loading |
| `optimizeLargeImages` | `true` | Enable content-visibility for large images |
| `largeImageHeight` | `600` | Min rendered height (px) for content-visibility |
| `lazyDistance` | `1.5` | Viewport multiplier for lazy-loading trigger |
| `scrollEndDelay` | `120` | ms to keep `mt98-scrolling` class after scroll ends |
| `idleDelay` | `300` | ms timeout for `requestIdleCallback` |
| `batchSize` | `100` | Max nodes processed per idle callback |
| `respectReducedMotion` | `true` | **NEW** Use prefers-reduced-motion media query |
| `protectAboveFold` | `true` | **NEW** Protect first 2 viewports from lazy loading |

### Technical Details
- **@run-at**: `document-start` — CSS injected before paint
- **@grant**: `none` — no GM APIs required, CSP compatible
- **Passive listeners**: scroll, resize, load, pagehide
- **WeakSet tracking**: Prevents re-processing elements
- **Firefox Android focus**: Optimized for mobile GPU constraints
- **Simpler architecture**: No fetch/history/DOMParser dependencies

---

## [2.1.1] - 2026-11-13

### Fixed
- **Base Optimization CSS**: Removed global `*, *::before, *::after` reset that broke all animations/transitions site-wide. Replaced with `@media (prefers-reduced-motion: reduce)` that only affects users who explicitly prefer reduced motion.
- **Scroll Effects Disabling**: Fixed over-aggressive greedy class matching (`[class*="scroll"]`, `[class*="animate"]`, etc.) that broke legitimate UI elements. Now surgically targets only expensive GPU effects (`box-shadow`, `filter`, `backdrop-filter`, `text-shadow`) globally, and specific known animation containers (`.reveal`, `.scroll-reveal`, `[data-aos]`, etc.).
- **Reader Page Optimization**: Changed from blanket optimization of ALL images on reader pages to selective targeting only chapter content images (`.chapter-content img`, `.chapter-images img`, `#chapter-content img`, `.reading-content img`). Prevents cover images, thumbnails, and UI images from disappearing or causing layout breaks.
- **Content Visibility Default**: Changed `forceContentVisibilityVisible` default from `true` to `false`. Using `content-visibility: visible` globally caused layout breaks on complex pages; `auto` is safer default.
- **Above-Fold Image Protection**: Strengthened to protect first 2 viewports completely (eager loading + high priority). Added 3-tier system: 0-2 viewports = eager+high, 2-3 viewports = eager+low, 3+ viewports = lazy+low.
- **Touch Target Optimization**: Limited to chapter navigation and pagination only. Removed broad `.chapter-list a`, `.chapters a` selectors that affected content links and caused layout issues.

### Changed
- **CONFIG defaults**: `forceContentVisibilityVisible: false` (was `true`)

### Technical Details
- All fixes maintain v2.1.0 features: infinite scroll, AVIF fallback, preconnect CDN, trust seal defer, chapter nav prefetch, below-fold acceleration
- Script remains CSP-compatible, `@grant: none`, `@run-at: document-start`
- Firefox Android focus maintained

---

## [2.1.0] - 2026-11-13

### Added
- **Scroll flash elimination (Sarrast v1.2.2 pattern)**: New `disableAllScrollEffects: true` config (default) permanently disables all scroll-only effects via static CSS (`html.mt98-disable-scroll-effects *`). No more `mt98-scrolling` class toggling, no timing issues, zero flash possible because effects never exist to flash back in.
- **Preconnect CDN**: `preconnectCDN: true` adds `<link rel="preconnect" href="https://dozigame.ir">` and DNS prefetch for faster thumbnail loads.
- **Trust seal deferral**: `deferTrustSeal: true` moves Enamad iframe to footer with `loading="lazy"`.
- **Infinite scroll / pagination intercept**: `infiniteScroll: true` intercepts pagination clicks, fetches next page via `fetch()`, appends cards, updates URL via `history.pushState()`. Includes IntersectionObserver trigger and loading indicator.
- **Next-page thumbnail prefetching**: `prefetchNextPage: true` extracts thumbnail URLs from next page during idle time and adds `<link rel="prefetch" as="image">`.
- **Aggressive reader page optimization**: `optimizeReaderImages: true` enables `content-visibility: visible` + `contain-intrinsic-size: auto 5000px` for chapter images (3000-5000px). Marks body with `reader-page` class for CSS targeting.
- **Chapter navigation prefetch**: `prefetchChapterNav: true` prefetches next/prev chapter page HTML on reader pages.
- **AVIF fallback for WebP**: `avifFallback: true` converts `<img src="...webp">` to `<picture><source type="image/avif"><img>` for better compression.
- **Content-visibility: visible**: `forceContentVisibilityVisible: true` uses `visible` instead of `auto` to prevent content discard on scroll back (trade-off: higher memory, zero re-render).
- **Below-fold acceleration**: `accelerateBelowFold: true` forces `content-visibility: visible` and eager loading for sections within 2 viewports.
- **Touch target optimization**: `touchTargetOptimization: true` adds CSS ensuring minimum 48×48px tap targets for chapter nav, pagination, buttons on mobile.
- **Increased thresholds**: `largeImageHeight: 1000` (was 600), `scrollEndDelay: 300ms` (was 120ms) for better mobile fling handling.
- **Build script**: `npm run build` creates versioned releases in `versions/` and `dist/`.

### Changed
- **Scroll strategy**: Completely replaced scroll-time toggle with permanent CSS disabling (like Sarrast v1.2.2). Legacy mode still available via `disableAllScrollEffects: false`.
- **Reader page handling**: No longer conservative — now aggressively optimizes chapter images with massive intrinsic size.
- **Image priority**: Above-fold images get `fetchPriority="high"`, below-fold get `low`.
- **CONFIG schema**: 13 new options added (see table below).

### Configuration (CONFIG object)
| Option | Default | Description |
|--------|---------|-------------|
| `optimizeImages` | `true` | Enable image async decode + lazy loading |
| `optimizeLargeImages` | `true` | Enable content-visibility for large images |
| `largeImageHeight` | `1000` | Min rendered height (px) for content-visibility (increased from 600) |
| `lazyDistance` | `1.5` | Viewport multiplier for lazy-loading trigger |
| `scrollEndDelay` | `300` | ms to keep `mt98-scrolling` class after scroll ends (increased from 120) |
| `idleDelay` | `300` | ms timeout for `requestIdleCallback` |
| `batchSize` | `100` | Max nodes processed per idle callback |
| `disableAllScrollEffects` | `true` | **NEW** Permanently disable scroll-only effects via static CSS |
| `preconnectCDN` | `true` | **NEW** Preconnect to dozigame.ir CDN |
| `deferTrustSeal` | `true` | **NEW** Defer Enamad trust seal iframe |
| `infiniteScroll` | `true` | **NEW** Enable infinite scroll / pagination intercept |
| `prefetchNextPage` | `true` | **NEW** Prefetch next-page thumbnails |
| `optimizeReaderImages` | `true` | **NEW** Aggressive reader page image optimization |
| `prefetchChapterNav` | `true` | **NEW** Prefetch next/prev chapter pages |
| `avifFallback` | `true` | **NEW** Convert WebP to picture with AVIF source |
| `forceContentVisibilityVisible` | `true` | **NEW** Use content-visibility: visible instead of auto |
| `accelerateBelowFold` | `true` | **NEW** Below-fold section loading acceleration |
| `touchTargetOptimization` | `true` | **NEW** Minimum 48x48px touch targets on mobile |

### Technical Details
- **@run-at**: `document-start` — CSS injected before paint
- **@grant**: `none` — no GM APIs required, CSP compatible
- **Passive listeners**: scroll, resize, load, pagehide
- **WeakSet tracking**: Prevents re-processing elements
- **Firefox Android focus**: Optimized for mobile GPU constraints
- **IntersectionObserver**: Used for infinite scroll trigger
- **fetch/history/DOMParser**: Used for infinite scroll and prefetching

---

## [2.0.0] - 2026-11-05

### Added
- **Complete rewrite** as a structured userscript project
- **Scroll-time optimization**: `mt98-scrolling` class toggles off shadows, filters, backdrop-filters during scroll
- **Image optimization**: `decoding="async"`, conditional `loading="lazy"` + `fetchPriority="low"` for below-fold images
- **Large image optimization**: `content-visibility: auto` with `contain-intrinsic-size` for images ≥600px rendered height
- **Iframe optimization**: Lazy-loading + content-visibility for off-screen iframes
- **Batch DOM processing**: `requestIdleCallback` with configurable batch size (100 nodes/pass)
- **MutationObserver**: Efficiently queues new images/iframes for optimization
- **Reader page detection**: Conservative handling for `/readerpage.php` and `/reader/` paths
- **Emergency disable**: `?mt98perf=off` URL parameter
- **Cleanup on pagehide**: Properly disconnects observers, clears timers
- **Resize/orientation handling**: Re-queues content on viewport change
- **ESLint + Prettier + Playwright** tooling setup
- **Versioned releases** in `versions/` folder

### Configuration (CONFIG object)
| Option | Default | Description |
|--------|---------|-------------|
| `optimizeImages` | `true` | Enable image async decode + lazy loading |
| `optimizeLargeImages` | `true` | Enable content-visibility for large images |
| `largeImageHeight` | `600` | Min rendered height (px) for content-visibility |
| `lazyDistance` | `1.5` | Viewport multiplier for lazy-loading trigger |
| `scrollEndDelay` | `120` | ms to keep `mt98-scrolling` class after scroll ends |
| `idleDelay` | `300` | ms timeout for `requestIdleCallback` |
| `batchSize` | `100` | Max nodes processed per idle callback |

### Technical Details
- **@run-at**: `document-start` — CSS injected before paint
- **@grant**: `none` — no GM APIs required, CSP compatible
- **Passive listeners**: scroll, resize, load, pagehide
- **WeakSet tracking**: Prevents re-processing elements
- **Firefox Android focus**: Optimized for mobile GPU constraints

---

## Versioning Rules
- **Patch** (x.y.Z): Bug fixes, timing tweaks, selector adjustments
- **Minor** (x.Y.z): New optimization techniques, config schema changes
- **Major** (X.y.z): Breaking architecture changes, @match domain changes