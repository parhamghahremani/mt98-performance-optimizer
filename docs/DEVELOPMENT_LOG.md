# Development Log — MT98 Performance Optimizer

**Project**: `mt98-performance-optimizer`  
**Format**: Date | Version | Milestone / Issue / Decision

---

## 2026-11-17 | 2.0.2 | Project Setup & Documentation
- Created workspace root `WORKSPACE_STATUS.md` and `CLAUDE.md`
- Analyzed mt98-performance-optimizer project structure
- Created `.gitignore` with proper exclusions
- Initialized Git repository
- Created GitHub private repo: `parhamghahremani/mt98-performance-optimizer`
- Created project documentation:
  - `CLAUDE.md` — Project instructions
  - `PROJECT_STATUS.md` — Current state tracking
  - `docs/SPECIFICATION.md` — Requirements & acceptance criteria
  - `docs/ARCHITECTURE.md` — Module breakdown & data flow
  - `docs/DEVELOPMENT_GUIDE.md` — Editing, build, testing workflow
  - `docs/CONFIGURATION_AND_PERMISSIONS.md` — Metadata, grants, CONFIG
  - `docs/COMPATIBILITY.md` — Browser/API compatibility matrix
  - `docs/MANUAL_TEST_PLAN.md` — User test checklist
- Created backup directory structure + `BACKUP_MANIFEST.md`
- **Next**: Initial commit, backup snapshot, user manual test

---

## 2026-11-14 | 2.0.2 | Release v2.0.2
- Added custom SVG icon (`@icon` metadata)
- Added `@author parham` metadata
- Updated `@namespace` to GitHub profile
- Updated GitHub URLs (`@downloadURL`, `@updateURL`, `@supportURL`, `@homepageURL`) to `parhamghahremani/userscripts` repo
- Version bump: 2.0.1 → 2.0.2 (patch, metadata only)
- CHANGELOG updated

---

## 2026-11-13 | 2.0.1 | Incremental Improvements on v2.0.0 Baseline
- **Rollback decision**: v2.1.x caused regressions → reverted to v2.0.0
- Added `respectReducedMotion: true` — uses `@media (prefers-reduced-motion: reduce)` instead of global animation kill
- Added `protectAboveFold: true` — protects first 2 viewports from lazy loading
- Implemented 3-tier loading system:
  - 0-2 viewports: eager + high priority
  - 2-1.5 viewports: eager + auto
  - >1.5 viewports: lazy + low priority
- Updated CONFIG with new options
- Removed all v2.1.x features (infinite scroll, AVIF, preconnect, trust seal, chapter nav, content-visibility:visible, below-fold acceleration, touch targets)
- Version bump: 2.0.0 → 2.0.1
- CHANGELOG updated with detailed rollback rationale

---

## 2026-11-13 | 2.1.1 | Attempted Fixes for v2.1.0 Regressions
- Fixed global animation kill → replaced with prefers-reduced-motion
- Fixed greedy scroll-effect selectors → surgical targeting
- Fixed reader page optimization → selective chapter content only
- Changed `forceContentVisibilityVisible` default: true → false
- Strengthened above-fold protection (3-tier system)
- Limited touch target optimization to chapter nav only
- **Result**: Still had issues, full rollback to v2.0.0 decided

---

## 2026-11-13 | 2.1.0 | Major Feature Release (Later Rolled Back)
- Scroll flash elimination: permanent `mt98-disable-scroll-effects` class (Sarrast v1.2.2 pattern)
- Preconnect CDN: dozigame.ir preconnect + DNS prefetch
- Trust seal deferral: Enamad iframe moved to footer + lazy
- Infinite scroll / pagination intercept: fetch + append + history.pushState
- Next-page thumbnail prefetching
- Aggressive reader page optimization: content-visibility: visible + 5000px intrinsic size
- Chapter navigation prefetch
- AVIF fallback for WebP
- Content-visibility: visible force mode
- Below-fold acceleration
- Touch target optimization (48×48px)
- Build script for versioned releases
- **Regressions found**: Images disappearing, layout breaks, excessive dozigame.ir connections
- **Decision**: Rollback to v2.0.0 baseline

---

## 2026-11-05 | 2.0.0 | Baseline Release
- Complete rewrite as structured userscript project
- Scroll-time optimization: `mt98-scrolling` class toggle
- Image optimization: decoding=async, conditional lazy loading, fetchPriority
- Large image optimization: content-visibility: auto + contain-intrinsic-size
- Iframe optimization: lazy loading + content-visibility
- Batch DOM processing: requestIdleCallback + configurable batch size
- MutationObserver for dynamic content
- Reader page detection: conservative handling
- Emergency disable: ?mt98perf=off
- Cleanup on pagehide: disconnect observers, clear timers
- Resize/orientation handling: re-queue content
- ESLint + Prettier + Playwright tooling setup
- Versioned releases in versions/ folder
- Initial CONFIG with 7 options

---

## Key Decisions Logged in DECISIONS.md
- See `docs/DECISIONS.md` for detailed rationale on each architectural choice