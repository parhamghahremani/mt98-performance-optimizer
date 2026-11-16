# Development Guide — MT98 Performance Optimizer

**Project**: `mt98-performance-optimizer`  
**Version**: 2.0.2

---

## Project Structure

```
mt98-performance-optimizer/
├── src/
│   └── mt98-performance-optimizer.user.js    # Source userscript (EDIT THIS)
├── dist/
│   └── mt98-performance-optimizer.user.js    # Build output (latest, auto-generated)
├── versions/
│   └── mt98-performance-optimizer-v*.user.js # Versioned releases (auto-generated)
├── tests/
│   └── run-tests.spec.js                     # Playwright tests
├── docs/                                     # Documentation
├── backups/                                  # Local backups (never committed)
├── .gitignore
├── .prettierrc
├── build.js
├── CHANGELOG.md
├── CLAUDE.md
├── eslint.config.mjs
├── package.json
├── package-lock.json
├── playwright.config.js
├── PROJECT_STATUS.md
└── README.md
```

---

## Editing the Source

**Only edit**: `src/mt98-performance-optimizer.user.js`

**Never edit directly**:
- `dist/mt98-performance-optimizer.user.js` — build output
- `versions/mt98-performance-optimizer-v*.user.js` — versioned archives

---

## Development Workflow

### 1. Make Changes
Edit `src/mt98-performance-optimizer.user.js`

### 2. Lint & Format
```bash
npm run lint      # Check for issues
npm run format    # Auto-fix formatting
```

### 3. Test
```bash
npm test          # Run Playwright tests
```

### 4. Build (creates versioned release)
```bash
npm run build
```
This reads `@version` from source and creates:
- `versions/mt98-performance-optimizer-v{version}.user.js`
- `dist/mt98-performance-optimizer.user.js` (with updated `@downloadURL`/`@updateURL`)

### 5. Version Bump
```bash
npm run version:patch  # 2.0.2 → 2.0.3 (bug fixes)
npm run version:minor  # 2.0.2 → 2.1.0 (new features)
npm run version:major  # 2.0.2 → 3.0.0 (breaking changes)
```
This updates `package.json` version AND `@version` in source file.

### 6. Commit
```bash
git add .
git commit -m "type: description"
git tag vX.Y.Z
```

### 7. Backup
Create pre-change snapshot before major edits, full snapshot after stable milestone.

### 8. Manual Test
Test in real Firefox + Tampermonkey (Desktop and Android)

### 9. Push to GitHub (ONLY AFTER APPROVAL)
```bash
git push origin master --tags
```

---

## Code Style Rules

Enforced by ESLint + Prettier:

| Rule | Setting |
|------|---------|
| Indent | 4 spaces |
| Line endings | Unix (LF) |
| Quotes | Double |
| Semicolons | Required |
| Variables | `const` preferred, `no-var` |
| Unused vars | Warning (prefix `_` to ignore) |
| Console | Allowed |

**Key conventions from existing code**:
- 4-space indentation throughout
- JSDoc-style block comments for sections
- Inline comments for non-obvious logic
- `try/catch` for all DOM operations
- `passive: true` for all event listeners
- `once: true` for one-time listeners
- `WeakSet` for deduplication
- Config-driven thresholds (no magic numbers)

---

## Testing Strategy

### Playwright Tests (Research Only)
```bash
npm test
```
Tests in `tests/run-tests.spec.js` verify:
- Script injection without errors
- Style element presence
- `mt98-scrolling` class behavior
- `decoding=async` on images
- Lazy loading on off-screen images
- Large image class application
- Reader page handling
- Emergency disable parameter
- Iframe lazy loading

**Note**: These are NOT userscript runtime tests. They inject the script via `page.addInitScript()` in a controlled Playwright Firefox instance. Final verification is always manual.

### Manual Test Checklist (MANUAL_TEST_PLAN.md)
See `docs/MANUAL_TEST_PLAN.md` for complete checklist.

---

## Backup Procedures

### Pre-Change Snapshot (Before Each Logical Batch)
```bash
# From project root
# Create timestamped ZIP excluding .git/, backups/, node_modules/, dist/, versions/, test-results/, playwright-report/
# Verify with Get-FileHash -Algorithm SHA256
# Record in backups/BACKUP_MANIFEST.md
```

### Post-Stable Snapshot (After Milestone)
```bash
# Full project snapshot (same exclusions)
# Create standalone release ZIP (source + config + docs, no .git/backups/node_modules)
# Create Git bundle: git bundle create backups/git-bundles/mt98-vX.Y.Z.bundle --all
# Verify bundle: git bundle verify backups/git-bundles/mt98-vX.Y.Z.bundle
# Compute checksums, record in manifest
```

---

## Release Process

1. Ensure all tests pass (`npm test`)
2. Lint clean (`npm run lint`)
3. Version bump appropriate level (`npm run version:patch|minor|major`)
4. Build (`npm run build`) — creates versioned files
5. Update CHANGELOG.md with new version entry
6. Commit + tag: `git commit -am "chore: release vX.Y.Z" && git tag vX.Y.Z`
7. Create backups (full snapshot + release ZIP + git bundle)
8. Present to user for manual Firefox/Tampermonkey testing
9. **Wait for explicit user approval**
10. Push: `git push origin master --tags`

---

## Debugging Tips

### Console Logging
Add temporary logs with `[MT98]` prefix:
```javascript
console.log("[MT98] Debug message", data);
```

### Inspect Injected Style
```javascript
document.getElementById("mt98-performance-optimizer")?.sheet?.cssRules
```

### Check Scroll Class
```javascript
document.documentElement.classList.contains("mt98-scrolling")
```

### Verify Image Attributes
```javascript
Array.from(document.querySelectorAll("img")).map(img => ({
    src: img.src,
    decoding: img.decoding,
    loading: img.loading,
    fetchPriority: img.fetchPriority,
    class: img.className
}))
```

### Emergency Disable
Add `?mt98perf=off` to URL to completely disable script.

---

## Common Tasks

### Add New CONFIG Option
1. Add to `CONFIG` object with default
2. Add JSDoc comment explaining purpose
3. Update `docs/CONFIGURATION_AND_PERMISSIONS.md`
4. Update `docs/SPECIFICATION.md` if behavior changes

### Modify CSS Rules
Edit the `css` template literal in the style injection section. Remember:
- CSS is injected at `document-start`
- Use `!important` for overrides
- Test on actual MT98 pages

### Adjust Viewport Thresholds
Modify `CONFIG.lazyDistance`, `CONFIG.largeImageHeight`, or `CONFIG.protectAboveFold` logic in `optimizeImage()`.

### Add New Match Pattern
Update `@match` in metadata block AND verify in `package.json` homepage/URLs if needed.

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| Images disappear | Over-aggressive `content-visibility` or lazy loading | Check `protectAboveFold`, `largeImageHeight`, `lazyDistance` |
| Layout shifts | `contain-intrinsic-size` not set or wrong | Verify `optimizeLoadedImage()` sets correct height |
| Scroll flash | `mt98-scrolling` class timing | Adjust `scrollEndDelay`, ensure rAF used |
| Script not running | `@match` mismatch or `@run-at` issue | Verify URL pattern, check Tampermonkey console |
| CSP errors | `@grant` not `none` or external resources | Keep `@grant none`, inline all CSS |
| Playwright tests fail | Site structure changed | Update selectors in tests, not script logic |

---

## References

- Tampermonkey docs: https://www.tampermonkey.net/documentation.php
- MDN `content-visibility`: https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility
- MDN `requestIdleCallback`: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
- Firefox Android performance: https://developer.mozilla.org/en-US/docs/Web/Performance/Firefox_Android