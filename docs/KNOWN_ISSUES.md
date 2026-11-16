# Known Issues — MT98 Performance Optimizer

**Project**: `mt98-performance-optimizer`  
**Version**: 2.0.2  
**Status**: Open / Workaround / Fixed / Won't Fix

---

## Open Issues

### ISSUE-001: Large Image Threshold May Miss Some Tall Images
**Severity**: Low  
**Description**: `largeImageHeight: 600` uses rendered height after CSS. Images with CSS `max-height` or constrained containers may render smaller than natural size, missing optimization.  
**Reproduction**: Find tall image in constrained container, check if `mt98-large-image` class applied.  
**Workaround**: Increase `largeImageHeight` in CONFIG, or add specific selector exceptions.  
**Status**: Open — monitoring

### ISSUE-002: Lazy Loading May Cause Brief Flash on Slow Connections
**Severity**: Low  
**Description**: Images switching from placeholder to loaded may flash on slow 3G. `loading="lazy"` defers load until near viewport.  
**Reproduction**: Throttle network to Slow 3G, scroll to lazy images.  
**Workaround**: Reduce `lazyDistance` to trigger earlier, or disable `optimizeImages` for problematic pages.  
**Status**: Open — acceptable trade-off

### ISSUE-003: Reader Page Detection May Miss Variations
**Severity**: Low  
**Description**: Regex `/readerpage\.php/` and `/\/reader(?:\/|$)/` may not catch all reader page URLs if site changes routing.  
**Reproduction**: Navigate to reader page, check if optimization incorrectly applied.  
**Workaround**: Add `?mt98perf=off` to URL, or update regex in script.  
**Status**: Open — monitor site changes

### ISSUE-004: `fetchPriority` Not Supported in Older Firefox
**Severity**: Info  
**Description**: `fetchPriority` added in Firefox 118. Older versions ignore it gracefully.  
**Impact**: No functional break, just no priority hint.  
**Status**: Known limitation — graceful degradation

### ISSUE-005: `content-visibility: auto` Firefox Android Bugs
**Severity**: Medium  
**Description**: Firefox Android has known bugs with `content-visibility: auto` causing layout shifts or content not reappearing on scroll back.  
**Mitigation**: `contain-intrinsic-size` set after load reduces but doesn't eliminate.  
**Reference**: https://bugzilla.mozilla.org/show_bug.cgi?id=1789344  
**Status**: Monitoring upstream — fallback intrinsic size helps

---

## Historical Issues (Fixed in v2.0.1+)

### FIXED: v2.1.x Images Disappearing on Reader Pages
**Severity**: Critical (was)  
**Root Cause**: Aggressive `content-visibility: visible` + 5000px intrinsic size on chapter images caused layout collapse.  
**Fix**: Rollback to v2.0.0 conservative approach — reader pages get NO image optimization.  
**Version Fixed**: 2.0.1 (via rollback)  
**Verification**: Reader pages work correctly in v2.0.1+

### FIXED: v2.1.x Layout Breaks on Normal Pages
**Severity**: Critical (was)  
**Root Cause**: `forceContentVisibilityVisible: true` applied `content-visibility: visible` globally, breaking complex layouts.  
**Fix**: Removed `forceContentVisibilityVisible` option; use `auto` only for large images.  
**Version Fixed**: 2.0.1 (via rollback)

### FIXED: v2.1.x Excessive Connections to dozigame.ir
**Severity**: High (was)  
**Root Cause**: `preconnectCDN: true` added preconnect + prefetch for every thumbnail, causing hundreds of connections.  
**Fix**: Removed preconnect/prefetch features entirely.  
**Version Fixed**: 2.0.1 (via rollback)

### FIXED: v2.1.x Global Animation Kill Broke Site UI
**Severity**: High (was)  
**Root Cause**: `*, *::before, *::after { animation: none !important }` broke dropdowns, modals, carousels.  
**Fix**: Replaced with `@media (prefers-reduced-motion: reduce)` — only affects users who opt in.  
**Version Fixed**: 2.0.1

### FIXED: v2.0.0 Above-Fold Images Lazy-Loaded
**Severity**: Medium (was)  
**Root Cause**: Binary eager/lazy with 1.5 viewport threshold caused hero images to lazy-load.  
**Fix**: 3-tier system + `protectAboveFold: true` protects first 2 viewports.  
**Version Fixed**: 2.0.1

---

## Won't Fix / Accepted Limitations

### WONTFIX: No Support for Non-Firefox Browsers
**Reason**: Primary target is Firefox Desktop + Firefox Android. Chrome/Edge/Safari not tested.  
**Impact**: Script may work but not guaranteed.  
**Decision**: Explicit scope limitation.

### WONTFIX: No Automated Visual Regression Testing
**Reason**: Manual testing in real Firefox + Tampermonkey is the only reliable validation. Playwright tests are for research only.  
**Decision**: Accept manual test requirement.

### WONTFIX: No `@require` / External Libraries
**Reason**: `@grant none` + zero dependencies is a core design principle.  
**Decision**: Maintain vanilla JS only.

---

## Issue Reporting Template

When reporting new issues, include:

```
**Version**: [e.g., 2.0.2]
**Browser**: [Firefox Desktop 131 / Firefox Android 131]
**Tampermonkey**: [version]
**URL**: [specific MT98 page]
**Steps to Reproduce**:
1. ...
2. ...
**Expected**: ...
**Actual**: ...
**Console Errors**: [paste relevant lines]
**Screenshots**: [if visual]
```

---

## Monitoring

Check these periodically:
- Firefox release notes for `content-visibility` fixes
- MT98 site structure changes (reader paths, image hosting)
- Tampermonkey updates affecting `@run-at document-start`
- User reports via GitHub Issues