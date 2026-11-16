# Key Decisions — MT98 Performance Optimizer

**Project**: `mt98-performance-optimizer`  
**Format**: Decision | Rationale | Alternatives Considered | Date

---

## 1. Single-File IIFE Userscript (No Build Required for Core)

**Decision**: Core script is a single self-contained IIFE in `src/mt98-performance-optimizer.user.js`. Build step (`npm run build`) only creates versioned archives and updates update URLs.

**Rationale**:
- Tampermonkey userscripts are traditionally single files
- No transpilation needed — modern Firefox supports all used APIs
- Zero dependencies = maximum compatibility, minimum attack surface
- Easy to inspect, debug, and install manually
- Build is optional convenience, not requirement

**Alternatives**: Webpack/Rollup bundle, TypeScript compilation, modular source with build
**Rejected Because**: Overkill for ~700 lines of vanilla JS; adds complexity without benefit

**Date**: 2026-11-05 (v2.0.0)

---

## 2. `@run-at document-start` with Early CSS Injection

**Decision**: Inject performance CSS via `<style>` element at `document-start`, before `document.body` exists.

**Rationale**:
- `scroll-behavior: auto` and `scroll-snap-type: none` must apply before first paint
- Prevents layout shifts from snap points
- `will-change: auto` prevents unnecessary layer promotion from start
- Reduced motion media query must be present early

**Alternatives**: `@run-at document-end` with DOMContentLoaded, `@run-at document-idle`
**Rejected Because**: Too late — paint already happened, scroll snap already applied

**Date**: 2026-11-05 (v2.0.0)

---

## 3. Scroll-Time Optimization via Class Toggle (Not Permanent Disable)

**Decision**: Use `mt98-scrolling` class on `<html>` added/removed during scroll, with CSS rules scoped to `.mt98-scrolling *`.

**Rationale**:
- Permanent disable (v2.1.x `disableAllScrollEffects`) broke site animations users expect
- Class toggle is surgical: only affects scroll-time, not interactions
- 120ms delay handles momentum scrolling on mobile
- Passive listener + rAF ensures no scroll jank

**Alternatives**: Permanent CSS disable (`html.mt98-disable-scroll-effects *`), per-element style manipulation
**Rejected Because**: Permanent breaks UX; per-element too slow

**Date**: 2026-11-13 (v2.0.1 rollback from v2.1.x)

---

## 4. 3-Tier Image Loading Strategy (Above-Fold Protection)

**Decision**: Three tiers based on viewport distance:
- Tier 1 (0-2 VPs): `eager` + `high`
- Tier 2 (2-1.5 VPs): `eager` + `auto`
- Tier 3 (>1.5 VPs): `lazy` + `low`

**Rationale**:
- v2.0.0 binary (eager/lazy) caused above-fold images to lazy-load
- Firefox Android shows blank spaces for lazy images near viewport
- 2-viewport buffer accounts for fast fling scrolling
- `fetchPriority` hints browser scheduling

**Alternatives**: Binary eager/lazy, IntersectionObserver-based, native `loading="lazy"` only
**Rejected Because**: Binary too coarse; IO adds overhead; native lazy no priority control

**Date**: 2026-11-13 (v2.0.1)

---

## 5. `prefers-reduced-motion` Media Query (Not Global Kill)

**Decision**: Use `@media (prefers-reduced-motion: reduce)` to disable animations only for users who request it.

**Rationale**:
- v2.0.0 and v2.1.0 killed ALL animations globally — broke dropdowns, modals, carousels
- OS-level setting is explicit user intent
- Preserves site UX for majority of users
- CSS-only, no JS overhead

**Alternatives**: Global `* { animation: none !important }`, JS-based detection + toggle
**Rejected Because**: Global breaks UX; JS adds complexity

**Date**: 2026-11-13 (v2.0.1, also v2.1.1 fix)

---

## 6. `content-visibility: auto` with `contain-intrinsic-size` for Large Images

**Decision**: Apply `content-visibility: auto` to images ≥600px rendered height, with intrinsic size set after load.

**Rationale**:
- `auto` lets browser skip off-screen content (paint/layout savings)
- `contain-intrinsic-size` prevents layout shift when content reappears
- Set after `load` event when actual rendered height known
- Fallback 800px before load

**Alternatives**: `content-visibility: visible` (v2.1.x), no content-visibility, IntersectionObserver
**Rejected Because**: `visible` caused layout breaks; no optimization misses savings; IO overhead

**Date**: 2026-11-05 (v2.0.0), refined 2026-11-13 (v2.0.1)

---

## 7. Reader Pages: Conservative (No Optimization)

**Decision**: Detect `/readerpage.php` and `/reader/` paths, disable image optimization entirely.

**Rationale**:
- Reader pages have different layout (single column, chapter images)
- Aggressive optimization (v2.1.x) caused images to disappear
- Chapter images are primary content — must load reliably
- Conservative approach = zero risk on reader

**Alternatives**: Selective optimization (v2.1.1), full optimization with larger intrinsic size
**Rejected Because**: Any optimization risk on primary content unacceptable

**Date**: 2026-11-05 (v2.0.0), confirmed 2026-11-13 (rollback)

---

## 8. `@grant none` — No GM APIs

**Decision**: Use `@grant none`, no `GM_*` APIs, no `@require`, no external resources.

**Rationale**:
- Maximum compatibility (CSP, all userscript managers)
- No permission prompts in Tampermonkey
- No external dependencies to fail or be blocked
- All functionality achievable with standard Web APIs

**Alternatives**: `GM_addStyle`, `GM_xmlhttpRequest`, `@require` for libraries
**Rejected Because**: Unnecessary; native APIs sufficient

**Date**: 2026-11-05 (v2.0.0)

---

## 9. `WeakSet` for Deduplication (Not Map/Set)

**Decision**: Track processed elements with `WeakSet` instead of `Set` or `Map`.

**Rationale**:
- `WeakSet` doesn't prevent garbage collection
- Elements removed from DOM automatically cleaned up
- No memory leak on long pages with dynamic content
- O(1) lookup, minimal overhead

**Alternatives**: `Set` with manual cleanup, `Map` with timestamps, `data-` attributes on elements
**Rejected Because**: `Set` leaks; `Map` overkill; DOM attributes pollute page

**Date**: 2026-11-05 (v2.0.0)

---

## 10. `requestIdleCallback` for Batch Processing (with setTimeout Fallback)

**Decision**: Process queued images/iframes in idle callbacks, batch size 100, fallback to `setTimeout(300ms)`.

**Rationale**:
- Non-blocking: yields to main thread for scrolling/input
- Batch size limits frame time impact
- Fallback ensures work happens even without idle time
- Recursive scheduling processes full queue over multiple frames

**Alternatives**: `setInterval`, `requestAnimationFrame`, process all at once, Web Worker
**Rejected Because**: Interval/RAF not for idle work; all-at-once blocks; Worker can't access DOM

**Date**: 2026-11-05 (v2.0.0)

---

## 11. MutationObserver on `document.body` (Subtree)

**Decision**: Observe `document.body` with `childList: true, subtree: true` for new images/iframes.

**Rationale**:
- Catches all dynamic content (AJAX, infinite scroll, SPA navigation)
- Filters to only `img`/`iframe` — minimal callback work
- Queues for batch processor, doesn't process inline
- `WeakSet` prevents re-processing

**Alternatives**: Observe specific containers, `IntersectionObserver`, periodic `querySelectorAll`
**Rejected Because**: Specific containers miss new areas; IO wrong tool; polling wasteful

**Date**: 2026-11-05 (v2.0.0)

---

## 12. Emergency Disable via URL Parameter

**Decision**: Check `?mt98perf=off` at script start, exit immediately if present.

**Rationale**:
- User-controllable without Tampermonkey UI
- Works for debugging, comparison, emergency
- No storage, no UI, zero overhead when not used
- Simple, reliable, shareable via URL

**Alternatives**: Tampermonkey menu command, localStorage flag, cookie
**Rejected Because**: Requires UI interaction; storage adds complexity

**Date**: 2026-11-05 (v2.0.0)

---

## 13. Cleanup on `pagehide` (Not `unload`/`beforeunload`)

**Decision**: Use `pagehide` (once, passive) for cleanup: clear timers, cancel rAF, disconnect observer.

**Rationale**:
- `pagehide` fires on navigation, bfcache entry, close
- `unload` prevents bfcache (bad for performance)
- `beforeunload` for confirmation dialogs only
- Passive + once = minimal overhead

**Alternatives**: `unload`, `beforeunload`, `visibilitychange`
**Rejected Because**: `unload` kills bfcache; `visibilitychange` fires on tab switch

**Date**: 2026-11-05 (v2.0.0)

---

## 14. Rollback v2.1.x → v2.0.0 Baseline

**Decision**: Completely revert v2.1.0/2.1.1 changes, keep only v2.0.1 incremental improvements.

**Rationale**:
- v2.1.x caused: images disappearing, layout breaks, excessive dozigame.ir connections
- Root cause: too many aggressive features added simultaneously without isolation testing
- Infinite scroll intercepted pagination → broke navigation
- `content-visibility: visible` + 5000px intrinsic size → layout shifts
- Preconnect to dozigame.ir → excessive connections (privacy/performance)
- AVIF fallback → broke on images without AVIF source

**Lesson**: Add ONE feature per version, test thoroughly on real site, rollback fast

**Date**: 2026-11-13 (v2.0.1 release)

---

## 15. Versioned Releases in `versions/` + `dist/` Latest

**Decision**: Build script creates `versions/mt98-performance-optimizer-v{version}.user.js` and `dist/mt98-performance-optimizer.user.js` with versioned URLs.

**Rationale**:
- Tampermonkey `@updateURL`/`@downloadURL` need stable versioned URLs
- `dist/` always points to latest for manual installs
- `versions/` provides immutable history
- Build reads `@version` from source — single source of truth

**Alternatives**: GitHub Releases only, no versioned files, CDN
**Rejected Because**: GitHub Releases not raw URLs; no versioned = cache issues

**Date**: 2026-11-13 (v2.1.0, retained in v2.0.x)

---

## 16. Private GitHub Repo per Script

**Decision**: Each userscript gets its own private GitHub repo under `parhamghahremani/<script-name>`.

**Rationale**:
- Isolation: one script's history/issues don't pollute another
- Granular access control (future collaborators)
- Clear release/tags per script
- Matches canonical naming convention

**Alternatives**: Monorepo `parhamghahremani/userscripts` with subfolders
**Rejected Because**: Monorepo mixes concerns; CI/CD complex; tag naming conflicts

**Date**: 2026-11-17 (Project setup)

---

## 17. Local Backups Inside Project (Not Git)

**Decision**: Backup directories (`backups/`) inside each project, excluded from Git.

**Rationale**:
- Backups include build outputs, node_modules, untracked work
- Git is for source history; backups are for disaster recovery
- Per-project isolation matches repo structure
- Never auto-deleted — user controls retention

**Alternatives**: Git tags only, external backup tool, cloud sync
**Rejected Because**: Git doesn't track untracked/ignored; external tools add dependency

**Date**: 2026-11-17 (Project setup)