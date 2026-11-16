# Compatibility — MT98 Performance Optimizer

**Project**: `mt98-performance-optimizer`  
**Version**: 2.0.2

---

## Verified Environments

| Environment | Version | Status | Test Date | Notes |
|-------------|---------|--------|-----------|-------|
| Firefox Desktop | Latest (Win 11) | ❌ Unverified | — | Playwright tests only |
| Firefox Android | Latest | ❌ Unverified | — | Primary target, needs manual test |
| Tampermonkey | Latest | ❌ Unverified | — | Assumed compatible |

---

## Target Browsers (Design Targets)

| Browser | Platform | Priority | Notes |
|---------|----------|----------|-------|
| Firefox Desktop | Windows 11 | High | Development environment |
| Firefox for Android | Android 13+ | **Critical** | Primary target — GPU constraints |

---

## API Compatibility Matrix

| API / Feature | Firefox Desktop | Firefox Android | Notes |
|---------------|-----------------|-----------------|-------|
| `document-start` `@run-at` | ✅ | ✅ | Tampermonkey supported |
| `createElement('style')` | ✅ | ✅ | Standard DOM |
| `requestAnimationFrame` | ✅ | ✅ | Standard |
| `requestIdleCallback` | ✅ | ✅ | Standard (fallback to setTimeout) |
| `MutationObserver` | ✅ | ✅ | Standard |
| `WeakSet` | ✅ | ✅ | ES2015 |
| `Element.getBoundingClientRect()` | ✅ | ✅ | Standard |
| `HTMLImageElement.decoding` | ✅ | ✅ | Firefox 63+ |
| `HTMLImageElement.loading` | ✅ | ✅ | Firefox 75+ |
| `HTMLImageElement.fetchPriority` | ✅ | ✅ | Firefox 118+ |
| `content-visibility` CSS | ✅ | ⚠️ Partial | Firefox 85+; `auto` supported, `visible` behind flag |
| `contain-intrinsic-size` CSS | ✅ | ✅ | Firefox 85+ |
| `prefers-reduced-motion` media query | ✅ | ✅ | Firefox 63+ |
| Passive event listeners | ✅ | ✅ | Standard |
| `pagehide` event | ✅ | ✅ | Standard |
| `IntersectionObserver` | ✅ | ✅ | Not used in v2.0.x |

---

## CSS Feature Support

| CSS Property | Firefox Desktop | Firefox Android | Fallback |
|--------------|-----------------|-----------------|----------|
| `content-visibility: auto` | ✅ | ✅ | `contain-intrinsic-size` |
| `content-visibility: visible` | ⚠️ Behind flag | ❌ | Not used in v2.0.x |
| `contain-intrinsic-size` | ✅ | ✅ | Set via JS as backup |
| `filter: none` | ✅ | ✅ | Standard |
| `backdrop-filter` | ✅ | ✅ | Standard |
| `will-change: auto` | ✅ | ✅ | Standard |
| `scroll-behavior: auto` | ✅ | ✅ | Standard |
| `scroll-snap-type: none` | ✅ | ✅ | Standard |

---

## Tampermonkey Compatibility

| Tampermonkey Version | Status | Notes |
|---------------------|--------|-------|
| Latest (5.x) | ❌ Unverified | Should work |
| 4.x | ❌ Unverified | May work |
| Greasemonkey 4.x | ❌ Unverified | `@grant none` compatible |
| Violentmonkey | ❌ Unverified | Should work |

---

## Known Firefox Android Constraints

| Constraint | Impact | Mitigation in Script |
|------------|--------|---------------------|
| Limited GPU memory | Shadows/filters expensive during scroll | Disabled via `.mt98-scrolling` |
| Slower JS main thread | Batch processing must be non-blocking | `requestIdleCallback` + small batches |
| Touch scrolling | Passive listeners critical | All listeners `{passive: true}` |
| `content-visibility` bugs | Layout shifts on scroll back | `contain-intrinsic-size` set after load |
| No hover state | Touch targets need size | Not addressed in v2.0.x |

---

## Unverified / Assumed Compatibility

| Area | Assumption | Risk |
|------|------------|------|
| `fetchPriority` on Android | Supported in Firefox 118+ | Low — fallback to default |
| `decoding="async"` on Android | Supported | Low — graceful degradation |
| Large page performance | Tested on similar sites | Medium — needs real MT98 test |
| Reader page detection | Regex matches current paths | Low — conservative fallback |
| Emergency disable param | Works on all Firefox | Very low — simple URL check |

---

## Version-Specific Compatibility

### v2.0.0 — v2.0.2 (Current Baseline)
- **Minimum Firefox**: 75 (for `loading` attribute)
- **Recommended Firefox**: 118+ (for `fetchPriority`)
- **No external dependencies**
- **No `fetch`/`XHR`** — works offline

### v2.1.x (Rolled Back)
- Required `fetch`, `DOMParser`, `history.pushState`
- `content-visibility: visible` (behind flag)
- `IntersectionObserver` for infinite scroll
- **Higher minimum version requirements**

---

## Testing Requirements

### Mandatory Manual Tests (Before Each Release)

| Test | Environment | Method |
|------|-------------|--------|
| Script loads without errors | Firefox Desktop + Tampermonkey | Open mt98.ir, check console |
| Script loads without errors | Firefox Android + Tampermonkey | Open mt98.ir, check remote debug |
| Scroll performance improved | Firefox Android | Subjective: smooth scroll on long page |
| Images display correctly | Both | No missing/broken images |
| Reader pages work | Both | Navigate to reader page |
| Emergency disable works | Both | Add `?mt98perf=off` |

### Playwright Tests (Automated, Research Only)

Run via `npm test` — verifies injection, basic DOM mutations, no console errors.

---

## Regression Checklist

When upgrading Firefox/Tampermonkey or changing script:

- [ ] Style element injects at document-start
- [ ] `mt98-scrolling` class toggles correctly
- [ ] Images get `decoding="async"`
- [ ] 3-tier lazy loading works
- [ ] Large images get `content-visibility`
- [ ] Reader pages skip optimization
- [ ] `prefers-reduced-motion` respected
- [ ] `?mt98perf=off` disables script
- [ ] No console errors from script
- [ ] Memory stable on long pages (no leaks)

---

## Future Compatibility Considerations

| Feature | Minimum Version | Status |
|---------|-----------------|--------|
| `content-visibility: visible` | Firefox 117+ (flag) | Not in v2.0.x |
| `fetchPriority` | Firefox 118+ | Used, graceful fallback |
| `IntersectionObserver` | Firefox 55+ | Available if needed |
| `ResizeObserver` | Firefox 69+ | Available if needed |
| CSS Container Queries | Firefox 110+ | Not used |

---

## References

- Firefox Release Notes: https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases
- Tampermonkey Compatibility: https://www.tampermonkey.net/documentation.php
- MDN Browser Compat Data: https://github.com/mdn/browser-compat-data