# Project Status — MT98 Performance Optimizer

**Last Updated**: 2026-11-17  
**Current Stable Version**: 2.0.2  
**Git Branch**: master  
**GitHub Remote**: `parhamghahremani/mt98-performance-optimizer` (Private)  
**Sync Status**: Not yet pushed (awaiting manual review + approval)

---

## Current Work State

**Phase**: Project Setup & Documentation Completion  
**Active Task**: Initial Git commit, documentation creation, backup structure setup

### Completed Features (v2.0.2)

- ✅ Scroll-time optimization (`mt98-scrolling` class toggle)
- ✅ Image optimization: `decoding=async`, 3-tier lazy loading
- ✅ Large image optimization: `content-visibility: auto` + `contain-intrinsic-size`
- ✅ Iframe lazy loading for off-screen frames
- ✅ Batch DOM processing via `requestIdleCallback`
- ✅ MutationObserver for dynamic content
- ✅ Reader page conservative handling
- ✅ Emergency disable (`?mt98perf=off`)
- ✅ Respects `prefers-reduced-motion` (v2.0.1)
- ✅ Above-fold protection (first 2 viewports, v2.0.1)
- ✅ Custom SVG icon + author metadata (v2.0.2)
- ✅ GitHub URLs pointing to `parhamghahremani/userscripts` (v2.0.2)

### Build & Tooling

- ✅ ESLint + Prettier configured
- ✅ Playwright tests (7 tests passing locally)
- ✅ Build script (`npm run build`) → `dist/`, `versions/`
- ✅ Version bump scripts (patch/minor/major)

### Documentation Status

| Document | Status |
|----------|--------|
| `README.md` | Exists (needs update for v2.0.2) |
| `CHANGELOG.md` | Complete through v2.0.2 |
| `CLAUDE.md` | **Just created** |
| `PROJECT_STATUS.md` | **Just created** |
| `docs/SPECIFICATION.md` | ❌ Missing |
| `docs/ARCHITECTURE.md` | ❌ Missing |
| `docs/DEVELOPMENT_GUIDE.md` | ❌ Missing |
| `docs/CONFIGURATION_AND_PERMISSIONS.md` | ❌ Missing |
| `docs/COMPATIBILITY.md` | ❌ Missing |
| `docs/MANUAL_TEST_PLAN.md` | ❌ Missing |
| `docs/DEVELOPMENT_LOG.md` | ❌ Missing |
| `docs/DECISIONS.md` | ❌ Missing |
| `docs/KNOWN_ISSUES.md` | ❌ Missing |
| `docs/REFERENCES.md` | ❌ Missing |

---

## Git Status

```
On branch master
No commits yet
Untracked files: .gitignore, .prettierrc, CHANGELOG.md, build.js, eslint.config.mjs, package-lock.json, package.json, playwright.config.js, src/, tests/
```

**Next**: Initial commit with all current files

---

## GitHub Remote Status

- **Repository**: `https://github.com/parhamghahremani/mt98-performance-optimizer`
- **Visibility**: Private ✅
- **Pushed**: No (waiting for stable version approval)
- **Tags**: None yet

---

## Backup Status

**Backup Root**: `D:\Desktop\project\scripts\mt98-performance-optimizer\backups\`

| Backup Type | Status | Latest |
|-------------|--------|--------|
| `imported-original/` | ❌ Not created | — |
| `pre-change/` | ❌ Not created | — |
| `full-snapshots/` | ❌ Not created | — |
| `releases/` | ❌ Not created | — |
| `git-bundles/` | ❌ Not created | — |
| `checksums/` | ❌ Not created | — |
| `BACKUP_MANIFEST.md` | ❌ Not created | — |

**Next**: Create backup directory structure + initial full snapshot after first commit

---

## Compatibility (Verified / Unverified)

| Environment | Status | Notes |
|-------------|--------|-------|
| Firefox Desktop (Windows 11) | ❌ Unverified | Playwright tests only |
| Firefox Android | ❌ Unverified | Primary target, needs manual test |
| Tampermonkey (latest) | ❌ Unverified | Assumed compatible |
| `@grant none` / CSP | ✅ Designed for | No GM APIs used |
| `@run-at document-start` | ✅ Implemented | CSS injected before paint |

---

## Known Issues / Limitations

| Issue | Severity | Status |
|-------|----------|--------|
| v2.1.x rolled back due to regressions | High | Documented in CHANGELOG |
| Reader page detection may miss some paths | Low | Known, conservative approach |
| `content-visibility: auto` Firefox support varies | Medium | Fallback intrinsic size used |
| No automated visual regression testing | Info | Manual testing only |

---

## Next Steps

1. **Create initial Git commit** with all current files
2. **Create backup directory structure** and first full snapshot
3. **Complete missing documentation** in `docs/`
4. **Update README.md** for v2.0.2
5. **Run Playwright tests** to verify current state
6. **Present v2.0.2 to user** for manual Firefox/Tampermonkey testing
7. **Wait for user approval** to push to GitHub
8. **Push commit + tag v2.0.2** to origin after approval

---

## Version Alignment Check

| Location | Version | Aligned? |
|----------|---------|----------|
| `src/mt98-performance-optimizer.user.js` (`@version`) | 2.0.2 | ✅ |
| `package.json` (`version`) | 2.0.2 | ✅ |
| `CHANGELOG.md` (latest entry) | 2.0.2 | ✅ |
| Git tag | (none yet) | ⏳ Pending |
| GitHub Release | (none yet) | ⏳ Pending |