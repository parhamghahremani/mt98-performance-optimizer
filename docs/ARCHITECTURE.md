# Architecture — MT98 Performance Optimizer

**Project**: `mt98-performance-optimizer`  
**Version**: 2.0.2

---

## High-Level Structure

```
mt98-performance-optimizer.user.js (IIFE)
│
├── CONFIG object                          → Centralized configuration
├── Early CSS Injection                    → Style element at document-start
├── Scroll State Manager                   → mt98-scrolling class toggle
├── Image Optimizer                        → decoding, loading, fetchPriority, content-visibility
├── Iframe Optimizer                       → lazy loading, content-visibility
├── Batch Processor (requestIdleCallback)  → Incremental DOM processing
├── MutationObserver                       → Dynamic content detection
└── Cleanup Handlers                       → pagehide, unload
```

---

## Module Breakdown

### 1. Configuration (`CONFIG`)

```javascript
const CONFIG = {
    optimizeImages: true,
    optimizeLargeImages: true,
    largeImageHeight: 600,
    lazyDistance: 1.5,
    scrollEndDelay: 120,
    idleDelay: 300,
    batchSize: 100,
    respectReducedMotion: true,
    protectAboveFold: true,
};
```

Single source of truth for all thresholds and feature flags. All modules read from this object.

---

### 2. Early CSS Injection

**Timing**: `@run-at document-start` → executes before `document.body` exists

**Process**:
1. Create `<style id="mt98-performance-optimizer">`
2. Build CSS string from template literal (includes `@media prefers-reduced-motion`)
3. Inject into `document.documentElement` (or wait for `DOMContentLoaded`)

**CSS Categories**:
- Base: `scroll-behavior: auto`, `scroll-snap-type: none`, `will-change: auto`
- Reduced Motion: `@media (prefers-reduced-motion: reduce)` → kills animations/transitions
- Scroll-Time: `.mt98-scrolling *` → disables shadows, filters, backdrop-filter
- Images: `image-rendering: auto`
- Large Images: `.mt98-large-image` → `content-visibility: auto`
- Iframes: `.mt98-lazy-frame` → `content-visibility: auto`

---

### 3. Scroll State Manager

**Components**:
- `scrollTimer` — timeout ID for class removal
- `scrollFrame` — `requestAnimationFrame` ID for class addition
- `markScrolling()` — called on passive `scroll` event

**Flow**:
```
User scrolls
    → passive scroll event fires
    → markScrolling()
        → if not already scrolling:
            → requestAnimationFrame → add 'mt98-scrolling' class
            → clear existing timeout
            → setTimeout(scrollEndDelay) → remove 'mt98-scrolling' class
```

**Why requestAnimationFrame?** Ensures class is added at next paint frame, not mid-scroll handler.

**Why passive listener?** Browser doesn't wait for JS before scrolling — critical for smooth scrolling on mobile.

---

### 4. Image Optimizer

**Entry Point**: `optimizeImage(img)` — called for each `<img>` element

**Steps**:
1. **Deduplication**: `WeakSet` check → skip if already processed
2. **Async Decoding**: `img.decoding = "async"` (try/catch)
3. **Viewport Analysis** (if `shouldOptimizeImages`):
   - Get `getBoundingClientRect()`
   - Calculate viewport height
   - Apply 3-tier loading strategy:
     - Tier 1 (0-2 viewports): `eager` + `high`
     - Tier 2 (2-lazyDistance): `eager` + `auto`
     - Tier 3 (>lazyDistance): `lazy` + `low`
4. **Large Image Handling** (if `shouldOptimizeLargeImages`):
   - If complete → `optimizeLoadedImage()`
   - Else → add `load` listener (once, passive)

**optimizeLoadedImage(img)**:
1. Verify `naturalWidth` && `naturalHeight`
2. Get rendered height via `getBoundingClientRect()`
3. If ≥ `largeImageHeight`:
   - Add `mt98-large-image` class
   - Set `contain-intrinsic-size: auto <height>px` (important)

---

### 5. Iframe Optimizer

**Entry Point**: `optimizeIframe(frame)`

**Steps**:
1. **Deduplication**: `WeakSet` check
2. **Viewport Check**: If `rect.top > viewportHeight * lazyDistance`
3. **Apply**: `loading="lazy"` + `mt98-lazy-frame` class

**CSS for `.mt98-lazy-frame`**:
```css
content-visibility: auto;
contain-intrinsic-size: auto 300px;
```

---

### 6. Batch Processor

**Queues**:
- `imageQueue: HTMLImageElement[]`
- `frameQueue: HTMLIFrameElement[]`
- `processing: boolean` — mutex

**Flow**:
```
queueCurrentContent()
    → querySelectorAll('img', 'iframe')
    → push unprocessed to queues
    → processQueues()

processQueues()
    → if processing: return
    → processing = true
    → runWhenIdle()
        → while imageQueue.length && processed < batchSize:
            → optimizeImage(imageQueue.shift())
        → while frameQueue.length && processed < batchSize:
            → optimizeIframe(frameQueue.shift())
        → processing = false
        → if queues not empty: processQueues() (recursive via idle callback)
```

**runWhenIdle(callback, timeout)**:
- Uses `requestIdleCallback` if available
- Falls back to `setTimeout(timeout)`

---

### 7. MutationObserver

**Configuration**:
```javascript
observer.observe(document.body, {
    childList: true,
    subtree: true
});
```

**Callback Logic**:
1. Iterate mutations
2. For each added node (ELEMENT_NODE only):
   - Direct match: `element.matches("img")` or `("iframe")`
   - Subtree: `element.querySelectorAll("img", "iframe")`
3. Push unprocessed to queues
4. Schedule `processQueues()` via `runWhenIdle()` (debounced via `mutationScheduled` flag)

**Why not walk entire subtree immediately?** Performance — only collect references, process later in idle callback.

---

### 8. Initialization & Lifecycle

**Start Observer**:
```javascript
function startObserver() {
    if (!document.body) return;
    observer.observe(document.body, { childList: true, subtree: true });
    queueCurrentContent();
}
```

**Trigger**: `DOMContentLoaded` (if `document.readyState === "loading"`) or immediate

**Re-processing**:
- `load` event (once, passive) → `queueCurrentContent()` after 500ms
- `resize` event (debounced 250ms) → `queueCurrentContent()`

**Cleanup** (`pagehide`, once, passive):
- `clearTimeout(scrollTimer)`
- `cancelAnimationFrame(scrollFrame)`
- `observer.disconnect()`

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PAGE LOAD (document-start)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              INJECT STYLE ELEMENT (#mt98-performance-optimizer)    │
│  • Base CSS                                                  │
│  • @media prefers-reduced-motion                             │
│  • .mt98-scrolling rules                                     │
│  • .mt98-large-image / .mt98-lazy-frame rules                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  DOMContentLoaded / Ready                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Scroll      │ │ Mutation    │ │ Batch       │
    │ Listener    │ │ Observer    │ │ Processor   │
    │ (passive)   │ │ (body,      │ │ (idle       │
    │             │ │  subtree)   │ │  callback)  │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Toggle      │ │ Queue new   │ │ Process     │
    │ mt98-       │ │ img/iframe  │ │ queues in   │
    │ scrolling   │ │ to queues   │ │ batches     │
    └─────────────┘ └─────────────┘ └─────────────┘
                           │               │
                           └───────┬───────┘
                                   ▼
                        ┌─────────────────────┐
                        │ optimizeImage() /   │
                        │ optimizeIframe()    │
                        │  • decoding=async   │
                        │  • 3-tier loading   │
                        │  • content-visibility│
                        └─────────────────────┘
```

---

## Key Design Patterns

| Pattern | Usage |
|---------|-------|
| **IIFE** | Encapsulation, no global pollution |
| **WeakSet** | Deduplication without preventing GC |
| **Passive Listeners** | Non-blocking scroll/resize/load |
| **requestIdleCallback** | Non-blocking batch processing |
| **requestAnimationFrame** | Paint-aligned class toggling |
| **Debouncing** | MutationObserver scheduling, resize handler |
| **Configuration Object** | Single source of truth, easy tuning |
| **Try/Catch Boundaries** | Graceful degradation on unsupported APIs |

---

## Firefox Android Considerations

| Constraint | Mitigation |
|------------|------------|
| Limited GPU memory | Disable shadows/filters during scroll |
| Slower JS execution | Batch processing via idle callbacks |
| Touch scrolling | Passive listeners + rAF for smoothness |
| `content-visibility` support | Fallback `contain-intrinsic-size` |
| No `requestIdleCallback` | `setTimeout` fallback |

---

## Security / CSP Notes

- `@grant none` — No `GM_*` APIs, no elevated privileges
- No `fetch`, `XMLHttpRequest`, `WebSocket` in v2.0.x
- No `eval`, `Function` constructor, dynamic code
- All DOM access via standard APIs
- Compatible with strict CSP: `script-src 'self'` (inline script allowed by Tampermonkey)