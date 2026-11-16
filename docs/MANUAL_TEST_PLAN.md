# Manual Test Plan — MT98 Performance Optimizer

**Project**: `mt98-performance-optimizer`  
**Version**: 2.0.2  
**Tester**: [User Name]  
**Date**: [Test Date]  
**Firefox Version**: [Version]  
**Tampermonkey Version**: [Version]  
**Platform**: [Windows 11 Desktop / Android]

---

## Pre-Test Setup

1. Install Tampermonkey in Firefox
2. Install userscript from `dist/mt98-performance-optimizer.user.js` or `src/mt98-performance-optimizer.user.js`
3. Verify script appears in Tampermonkey dashboard (enabled)
4. Open DevTools Console (F12) for monitoring

---

## Test Cases

### TC-01: Script Injection & Basic Load
**Target**: `https://mt98.ir/` (homepage)
**Steps**:
1. Navigate to `https://mt98.ir/`
2. Wait for page load
3. Check DevTools Console for errors
4. Verify style element exists: `document.getElementById('mt98-performance-optimizer')`

**Expected**:
- No script-related console errors
- Style element present in `<head>` or `<html>`
- Page renders normally

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-02: Scroll-Time Class Toggle
**Target**: `https://mt98.ir/` (any long page)
**Steps**:
1. Open DevTools Console
2. Run: `document.documentElement.classList.contains('mt98-scrolling')` → should be `false`
3. Scroll page (mouse wheel / touch drag)
4. During scroll, run same command → should be `true`
5. Stop scrolling, wait 200ms
6. Run command → should be `false`

**Expected**:
- Class added during scroll
- Class removed ~120ms after scroll stops
- No flickering

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-03: Image Async Decoding
**Target**: `https://mt98.ir/` (page with images)
**Steps**:
1. Open DevTools Console
2. Run:
```javascript
Array.from(document.querySelectorAll('img')).filter(img => img.decoding === 'async').length
```

**Expected**:
- Count > 0 (most/all images have `decoding="async"`)

**Actual**: [Pass/Fail] | Count: _____ | Notes: _______________

---

### TC-04: 3-Tier Lazy Loading
**Target**: `https://mt98.ir/` (long page with many images)
**Steps**:
1. Scroll to top of page
2. Run in console:
```javascript
const vh = window.innerHeight;
const imgs = Array.from(document.querySelectorAll('img'));
const tiers = { eagerHigh: 0, eagerAuto: 0, lazyLow: 0 };
imgs.forEach(img => {
  const rect = img.getBoundingClientRect();
  if (rect.top <= vh * 2 && img.loading === 'eager' && img.fetchPriority === 'high') tiers.eagerHigh++;
  else if (rect.top <= vh * 1.5 && img.loading === 'eager') tiers.eagerAuto++;
  else if (rect.top > vh * 1.5 && img.loading === 'lazy' && img.fetchPriority === 'low') tiers.lazyLow++;
});
console.table(tiers);
```

**Expected**:
- `eagerHigh` > 0 (above-fold images)
- `lazyLow` > 0 (below-fold images)
- No images in wrong tier

**Actual**: [Pass/Fail] | eagerHigh: __ | eagerAuto: __ | lazyLow: __ | Notes: _______________

---

### TC-05: Large Image Content-Visibility
**Target**: `https://mt98.ir/` (page with tall images)
**Steps**:
1. Run in console:
```javascript
document.querySelectorAll('img.mt98-large-image').length
```
2. Inspect one: check for `content-visibility: auto` and `contain-intrinsic-size`

**Expected**:
- Count > 0 for pages with images ≥600px rendered height
- CSS rules applied

**Actual**: [Pass/Fail] | Count: _____ | Notes: _______________

---

### TC-06: Reader Page Conservative Handling
**Target**: `https://mt98.ir/readerpage.php` (or any `/reader/` path)
**Steps**:
1. Navigate to reader page
2. Check console for errors
3. Verify images load normally (no aggressive lazy loading)
4. Run: `document.querySelectorAll('img[loading="lazy"]').length` — should be minimal/zero

**Expected**:
- No script errors
- Images load eagerly (reader content priority)
- `mt98-large-image` class not aggressively applied

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-07: Reduced Motion Respect
**Target**: Any MT98 page
**Prerequisite**: OS-level "Reduce motion" enabled
- Windows: Settings → Accessibility → Visual effects → Turn off animation effects
- Android: Settings → Accessibility → Remove animations

**Steps**:
1. Enable reduce motion at OS level
2. Reload MT98 page
3. Check if animations/transitions disabled (via DevTools Elements → Computed)
4. Disable reduce motion, reload, verify animations work

**Expected**:
- With reduce motion ON: animations/transitions killed via CSS
- With reduce motion OFF: normal site animations preserved

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-08: Emergency Disable Parameter
**Target**: `https://mt98.ir/?mt98perf=off`
**Steps**:
1. Navigate to `https://mt98.ir/?mt98perf=off`
2. Check console for script errors
3. Verify style element NOT present: `document.getElementById('mt98-performance-optimizer')`
4. Verify no `mt98-scrolling` class ever added

**Expected**:
- Script exits immediately
- No style injection
- No observers attached
- Page behaves as if script not installed

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-09: Iframe Lazy Loading
**Target**: `https://mt98.ir/` (page with iframes, e.g., Enamad trust seal)
**Steps**:
1. Find iframes on page
2. Check off-screen iframes for `loading="lazy"` and `mt98-lazy-frame` class

**Expected**:
- Off-screen iframes get lazy loading
- On-screen iframes unchanged

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-10: Dynamic Content (MutationObserver)
**Target**: `https://mt98.ir/` (page with infinite scroll or dynamic loads)
**Steps**:
1. Scroll to trigger dynamic content load (if applicable)
2. Wait for new images to appear
3. Verify new images get `decoding="async"` and appropriate loading tier

**Expected**:
- New images processed automatically
- Same optimization rules apply

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-11: Resize / Orientation Handling
**Target**: Any MT98 page
**Steps**:
1. Resize browser window significantly
2. Or rotate device (Android)
3. Verify images re-evaluated (loading attributes may change)

**Expected**:
- `queueCurrentContent()` triggered after 250ms debounce
- Images re-tiered based on new viewport

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-12: Cleanup on Navigation
**Target**: Navigate away from MT98
**Steps**:
1. Navigate to external site (e.g., google.com)
2. Check that no memory leaks (observer disconnected)
3. Return to MT98, verify script re-initializes

**Expected**:
- `pagehide` handler cleans up timers/observer
- Fresh initialization on return

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-13: Firefox Android Specific
**Target**: `https://mt98.ir/` on Firefox Android
**Steps**:
1. Install Tampermonkey on Firefox Android
2. Install script
3. Test TC-01 through TC-12 on mobile
4. Pay attention to:
   - Touch scrolling smoothness
   - No image disappearance
   - Reader page usability
   - Memory/performance on long pages

**Expected**:
- All desktop tests pass
- Smooth scrolling on long pages
- No visual regressions

**Actual**: [Pass/Fail] | Notes: _______________

---

### TC-14: Performance Subjective
**Target**: Long MT98 page (e.g., category with many items)
**Steps**:
1. Disable script (Tampermonkey toggle)
2. Scroll rapidly, note jank/stutter
3. Enable script
4. Scroll same page, compare

**Expected**:
- Noticeably smoother scrolling with script enabled
- No new visual artifacts

**Actual**: [Pass/Fail] | Notes: _______________

---

## Regression Checks (Run After Any Change)

- [ ] TC-01: Basic injection
- [ ] TC-02: Scroll class toggle
- [ ] TC-03: Async decoding
- [ ] TC-04: 3-tier loading
- [ ] TC-06: Reader pages
- [ ] TC-07: Reduced motion
- [ ] TC-08: Emergency disable
- [ ] No new console errors
- [ ] Images don't disappear
- [ ] Layout doesn't break

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tester | | | |
| Approver | | | |

---

## Test Results Summary

| Test Case | Desktop | Android | Notes |
|-----------|---------|---------|-------|
| TC-01 | | | |
| TC-02 | | | |
| TC-03 | | | |
| TC-04 | | | |
| TC-05 | | | |
| TC-06 | | | |
| TC-07 | | | |
| TC-08 | | | |
| TC-09 | | | |
| TC-10 | | | |
| TC-11 | | | |
| TC-12 | | | |
| TC-13 | N/A | | |
| TC-14 | | | |

**Overall**: [PASS / FAIL / CONDITIONAL]

**Blockers**: _______________________________________________

**Notes**: _________________________________________________