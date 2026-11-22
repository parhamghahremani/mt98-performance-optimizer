# MT98 Performance Optimizer — Project Instructions

**Project**: `mt98-performance-optimizer`  
**Canonical Name**: `mt98-performance-optimizer`  
**Userscript File**: `src/mt98-performance-optimizer.user.js` (built to `dist/` and `versions/`)  
**GitHub Repo**: `parhamghahremani/mt98-performance-optimizer` (Public)  
**Current Version**: 2.0.2  
**Target**: Firefox Desktop + Firefox Android  
**Site**: `https://mt98.ir/*`, `https://www.mt98.ir/*`

---

## Quick Reference

| Aspect | Value |
|--------|-------|
| `@run-at` | `document-start` |
| `@grant` | `none` |
| `@match` | `https://mt98.ir/*`, `https://www.mt98.ir/*` |
| Build | `npm run build` → `dist/`, `versions/` |
| Lint | `npm run lint` |
| Test | `npm test` (Playwright) |
| Version bump | `npm run version:patch\|minor\|major` |

---

## Architecture Summary

Single-file userscript (IIFE) with these modules:

1. **Configuration** (`CONFIG` object) — 10 options controlling behavior
2. **Early CSS injection** — Style element with performance CSS (run-at document-start)
3. **Scroll-time optimization** — `mt98-scrolling` class toggled during scroll (passive listener)
4. **Image optimization** — `decoding=async`, 3-tier lazy loading, `content-visibility` for large images
5. **Iframe optimization** — Lazy loading for off-screen iframes
6. **Batch processing** — `requestIdleCallback` with configurable batch size
7. **MutationObserver** — Queues new images/iframes for optimization
8. **Cleanup** — Proper disconnect on `pagehide`

---

## Key Design Decisions (from DECISIONS.md)

- **v2.0.0 baseline**: Conservative, stable, no fetch/history/DOMParser
- **v2.0.1**: Added `respectReducedMotion` (media query) + `protectAboveFold` (2 viewports)
- **v2.1.x rolled back**: Caused image disappearance, layout breaks, excessive dozigame.ir connections
- **Reader pages**: Conservative — no image optimization on `/readerpage.php` or `/reader/`
- **Emergency disable**: `?mt98perf=off` URL parameter
- **No GM APIs**: `@grant none` for CSP compatibility

---

## Configuration (CONFIG object)

| Option | Default | Description |
|--------|---------|-------------|
| `optimizeImages` | `true` | Async decode + conditional lazy loading |
| `optimizeLargeImages` | `true` | `content-visibility: auto` for large images |
| `largeImageHeight` | `600` | Min rendered height (px) for content-visibility |
| `lazyDistance` | `1.5` | Viewport multiplier for lazy trigger |
| `scrollEndDelay` | `120` | ms to keep `mt98-scrolling` after scroll |
| `idleDelay` | `300` | ms timeout for `requestIdleCallback` |
| `batchSize` | `100` | Max nodes per idle callback |
| `respectReducedMotion` | `true` | Use prefers-reduced-motion media query |
| `protectAboveFold` | `true` | Protect first 2 viewports from lazy |

---

## Development Commands

```bash
# From project root: D:\Desktop\project\scripts\mt98-performance-optimizer

# Install deps
npm install

# Lint source
npm run lint

# Format source
npm run format

# Run Playwright tests
npm test

# Build versioned release
npm run build

# Version bumps (updates package.json + src/@version)
npm run version:patch  # 2.0.2 → 2.0.3
npm run version:minor  # 2.0.2 → 2.1.0
npm run version:major  # 2.0.2 → 3.0.0
```

---

## Build Process

`build.js` reads `@version` from source, creates:
- `versions/mt98-performance-optimizer-v{version}.user.js` — versioned archive
- `dist/mt98-performance-optimizer.user.js` — latest with updated `@downloadURL`/`@updateURL` pointing to versioned file

**Never edit `dist/` or `versions/` directly** — they are build outputs.

---

## Testing

- **Playwright tests** in `tests/run-tests.spec.js` — run with `npm test`
- Tests inject script via `page.addInitScript()` and verify:
  - Style element injection
  - `mt98-scrolling` class behavior (legacy mode)
  - `decoding=async` on images
  - Lazy loading on off-screen images
  - `content-visibility` class on large images
  - Reader page conservative handling
  - Emergency disable (`?mt98perf=off`)
  - Iframe lazy loading

**Final verification always manual** in real Firefox + Tampermonkey.

---

## Git Workflow

```bash
# Always use explicit path
cd "D:\Desktop\project\scripts\mt98-performance-optimizer"

# Check status
git status

# Stage changes
git add .

# Commit with conventional message
git commit -m "type: description"

# Tag stable versions
git tag v2.0.2

# Push (ONLY after manual review + explicit approval)
git push origin master --tags
```

---

## Backup Protocol

Pre-change snapshot before each logical batch:
```bash
# Create timestamped snapshot (exclude .git/, backups/, node_modules/, dist/, versions/)
# Verify with Get-FileHash -Algorithm SHA256
# Record in backups/BACKUP_MANIFEST.md
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | User-facing: install, usage, config, version |
| `CHANGELOG.md` | Versioned history |
| `PROJECT_STATUS.md` | Current state, version, backups, next steps |
| `docs/SPECIFICATION.md` | Requirements, acceptance criteria |
| `docs/ARCHITECTURE.md` | Module breakdown, data flow |
| `docs/DEVELOPMENT_GUIDE.md` | Editing, build, maintenance, release |
| `docs/CONFIGURATION_AND_PERMISSIONS.md` | Metadata, grants, CONFIG details |
| `docs/COMPATIBILITY.md` | Verified browsers, unverified areas |
| `docs/MANUAL_TEST_PLAN.md` | User test checklist |
| `docs/DEVELOPMENT_LOG.md` | Milestones, diagnosed issues |
| `docs/DECISIONS.md` | Key technical decisions + rationale |
| `docs/KNOWN_ISSUES.md` | Confirmed defects, workarounds |
| `docs/REFERENCES.md` | Official docs, research sources |

---

## Constraints & Rules

1. **Never modify sibling projects** — Only touch `mt98-performance-optimizer/`
2. **Source of truth** = `src/mt98-performance-optimizer.user.js`
3. **Version consistency**: `@version` in source = `package.json` = Git tag = CHANGELOG
4. **Public GitHub repo** — Public for Tampermonkey auto-update compatibility
5. **Sync only after approval** — Push after manual test + user go-ahead
6. **Persian communication** — All user messages in Persian; code/docs in English
7. **No automated test suites** — Playwright for research only; user tests manually

---

## Current Status (2026-11-17)

- **Version**: 2.0.2 (stable baseline)
- **Git**: Initialized, remote `origin` configured
- **GitHub**: Public repo at `parhamghahremani/mt98-performance-optimizer`
- **Documentation**: Being created in this session
- **Backups**: Directory structure being set up
- **Next**: Initial commit, documentation completion, backup verification