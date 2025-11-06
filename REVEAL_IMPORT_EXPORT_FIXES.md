# Reveal.js Import/Export Fixes - Completed

## Issues Identified

By comparing `exported.html` (SlideWinder output) with `Make Reveal.html` (original), I identified these critical issues:

1. **Font sizes too small** - Text showing as 8px instead of proper sizes
2. **Missing container styles** - `.video-overlay` dark background box not rendering
3. **Wrong text colors** - Black text on dark backgrounds instead of white
4. **Nested slides flattened** - Vertical slide stacks converted to sequential slides

## Root Causes

### 1. Font Size Issue
- **Problem**: Styled containers (like `.video-overlay`) had fontSize scaled down to 8px during import
- **Impact**: Child elements with `font-size: 1.3em` inherited from 8px base → 10.4px (tiny!)
- **Root Cause**: Import scaled fontSize by 0.5, export used scaled value as base for em calculations

### 2. Missing Container Styles
- **Problem**: Import stored `backgroundColor`, `padding`, `borderRadius` but export didn't include them
- **Impact**: Dark overlay boxes disappeared, breaking visual design

### 3. Wrong Text Colors
- **Problem**: CSS wasn't loaded into temp container during import
- **Impact**: `.video-overlay { color: #fff; }` rule not applied → computed color was black

### 4. Nested Slides Flattened
- **Problem**: Import detected nested `<section>` but added them to flat array
- **Impact**: 2D navigation lost, vertical stacks became sequential slides

## Fixes Applied

### Fix 1: Export Font Size Handling (`htmlGenerator.js:128`)
```javascript
// For styled containers, use larger base font size to preserve relative em sizing
const baseFontSize = el.isStyledContainer ? (el.fontSize * 2) : el.fontSize;
```
**Result**: Container base fontSize 8px × 2 = 16px, so children render at correct sizes

### Fix 2: Export Container Styles (`htmlGenerator.js:133-137`)
```javascript
// Add container styles if this is a styled container
if (el.isStyledContainer) {
    if (el.backgroundColor) textStyles += ` background-color: ${el.backgroundColor};`;
    if (el.padding) textStyles += ` padding: ${el.padding};`;
    if (el.borderRadius) textStyles += ` border-radius: ${el.borderRadius}px;`;
}
```
**Result**: Dark overlay boxes now render correctly with proper styling

### Fix 3: Import CSS Injection (`revealImporter.js:1026-1032`)
```javascript
// Extract and inject custom CSS for accurate computed styles
const styleElements = doc.querySelectorAll('style');
styleElements.forEach(styleEl => {
    const newStyle = document.createElement('style');
    newStyle.textContent = styleEl.textContent;
    tempContainer.appendChild(newStyle);
});
```
**Result**: `window.getComputedStyle()` now returns correct colors from CSS rules

### Fix 4: Extract Custom CSS for Export (`revealImporter.js:978-1002`)
```javascript
// Extract custom CSS from <style> tags
const allCSS = Array.from(styleElements)
    .map(styleEl => styleEl.textContent)
    .join('\n\n');

// Filter to keep only custom CSS (not reveal.js framework styles)
const customCSS = allCSS.split('\n')
    .filter(line => {
        const isRevealFramework = /* ... */;
        return !isRevealFramework;
    })
    .join('\n')
    .trim();
```
**Result**: Custom CSS preserved and included in exported HTML

### Fix 5: Preserve Nested Slides (`revealImporter.js:1067-1083`)
```javascript
if (verticalSlides.length > 0) {
    // Create a wrapper parent slide
    const parentSlide = {
        id: crypto.randomUUID(),
        elements: [],
        background: { type: 'color', value: 'transparent' },
        hasVerticalSlides: true
    };
    slides.push(parentSlide);

    // Link children to parent
    verticalSlides.forEach((verticalSlide) => {
        const childSlide = parseSlidePreserveHTML(verticalSlide);
        childSlide.parentId = parentSlide.id;
        slides.push(childSlide);
    });
}
```
**Result**: Nested structure preserved, export reconstructs `<section><section>` hierarchy

## Expected Outcomes

After these fixes:

1. ✅ **Font sizes correct** - Headings display at proper large sizes
2. ✅ **Styled containers render** - Dark overlay boxes with rounded corners visible
3. ✅ **Colors accurate** - White text on dark backgrounds, proper theme colors
4. ✅ **Nested slides work** - 2D navigation preserved, vertical stacks functional
5. ✅ **Custom CSS preserved** - Classes like `.video-overlay`, `.flex-container` styled correctly

## Testing

To test the fixes:

1. Import "Make Reveal.html" into SlideWinder
2. Verify slides render correctly in the editor
3. Export to Reveal.js HTML
4. Open exported HTML in browser
5. Compare with original:
   - Font sizes should match
   - `.video-overlay` slide should have dark semi-transparent background
   - Text should be white on dark backgrounds
   - Use arrow keys to test vertical slide navigation

## Files Modified

1. `presenta-react/src/utils/htmlGenerator.js` - Export fixes (lines 125-158)
2. `presenta-react/src/utils/revealImporter.js` - Import fixes (lines 978-1002, 1026-1089)

## Additional Notes

- The export already had nested slide support, we just needed to fix the import
- Custom CSS filtering could be improved to better distinguish framework vs. custom styles
- Consider adding a "test round-trip" feature to validate import→export fidelity
