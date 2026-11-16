# References — MT98 Performance Optimizer

**Project**: `mt98-performance-optimizer`  
**Version**: 2.0.2

---

## Official Documentation

### Tampermonkey
- **Documentation**: https://www.tampermonkey.net/documentation.php
- **Metadata Block**: https://www.tampermonkey.net/documentation.php#_metadata_block
- **API Reference**: https://www.tampermonkey.net/documentation.php#_api
- **Compatibility**: https://www.tampermonkey.net/documentation.php#_browser_compatibility

### Mozilla Developer Network (MDN)
- **content-visibility**: https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility
- **contain-intrinsic-size**: https://developer.mozilla.org/en-US/docs/Web/CSS/contain-intrinsic-size
- **requestIdleCallback**: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback
- **requestAnimationFrame**: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
- **MutationObserver**: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
- **IntersectionObserver**: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
- **HTMLImageElement.decoding**: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding
- **HTMLImageElement.loading**: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading
- **HTMLImageElement.fetchPriority**: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/fetchPriority
- **prefers-reduced-motion**: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- **Passive Event Listeners**: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#passive
- **WeakSet**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
- **Page Lifecycle Events**: https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event

### Firefox Specific
- **Firefox Release Notes**: https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases
- **Firefox Android Performance**: https://developer.mozilla.org/en-US/docs/Web/Performance/Firefox_Android
- **Firefox Platform Status**: https://platform-status.mozilla.org/

### Web Standards
- **HTML Living Standard**: https://html.spec.whatwg.org/
- **CSS Containment**: https://drafts.csswg.org/css-contain/
- **Page Lifecycle**: https://wicg.github.io/page-lifecycle/
- **Content Visibility Explainer**: https://github.com/WICG/content-visibility

---

## Performance Research & Prior Art

### Scroll Performance
- **Scrolling Performance**: https://developer.chrome.com/docs/devtools/rendering-tools/scrolling-performance
- **CSS Triggers**: https://csstriggers.com/
- **will-change**: https://developer.mozilla.org/en-US/docs/Web/CSS/will-change

### Image Optimization
- **Native Lazy Loading**: https://web.dev/browser-level-image-lazy-loading/
- **Fetch Priority**: https://web.dev/fetch-priority/
- **Async Decoding**: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding

### Content Visibility
- **content-visibility: The New CSS Property That Boosts Rendering Performance**: https://web.dev/content-visibility/
- **Chrome 85: content-visibility**: https://developer.chrome.com/blog/new-in-chrome-85/#content-visibility

---

## Prior Art / Inspiration

### Sarrast Performance Optimizer (Sibling Project)
- **Path**: `D:\Desktop\project\scripts\sarrast-performance-optimizer\`
- **v1.2.2 Pattern**: Permanent scroll-effects disable via static CSS class
- **Lesson**: Permanent disable eliminates flash but breaks expected animations

### MT98 Site Analysis (Research)
- **Target Domain**: mt98.ir, www.mt98.ir
- **Key Paths**: `/readerpage.php`, `/reader/`, category pages, article pages
- **Image Hosting**: dozigame.ir CDN for thumbnails
- **Trust Seal**: Enamad iframe (often in footer)

---

## Tooling References

### Playwright
- **Documentation**: https://playwright.dev/docs/intro
- **MCP Server**: https://github.com/microsoft/playwright-mcp
- **Test API**: https://playwright.dev/docs/api/class-test

### ESLint
- **Config Guide**: https://eslint.org/docs/latest/use/configure/
- **Rules**: https://eslint.org/docs/latest/rules/

### Prettier
- **Options**: https://prettier.io/docs/en/options.html

### GitHub CLI
- **Manual**: https://cli.github.com/manual/
- **Repo Create**: https://cli.github.com/manual/gh_repo_create

---

## Version Control & Release

### Semantic Versioning
- **Spec**: https://semver.org/
- **Git Tag Format**: `v{major}.{minor}.{patch}`

### Conventional Commits
- **Spec**: https://www.conventionalcommits.org/
- **Types**: feat, fix, docs, style, refactor, perf, test, chore

---

## Related Projects (Workspace Siblings)

| Project | Path | Status |
|---------|------|--------|
| instagram-select-comments | `../instagram-select-comments/` | Needs setup |
| sarrast-performance-optimizer | `../sarrast-performance-optimizer/` | Needs setup |
| shahvani-ultra-lite | `../shahvani-ultra-lite/` | Needs setup |
| universal-age-gate-bypass | `../universal-age-gate-bypass/` | Needs setup |

---

## Notes for Future Research

- Monitor Firefox `content-visibility: visible` support (currently behind flag)
- Watch for `ResizeObserver` API improvements for layout shift detection
- Track Tampermonkey `@run-at` behavior changes
- Follow MT98 site structure changes (reader paths, image CDN)
- Consider `scheduler.yield()` for main thread yielding (future alternative to idle callback)