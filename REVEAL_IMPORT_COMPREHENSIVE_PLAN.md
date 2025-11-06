# Comprehensive Plan: Reveal.js Import Fixes

## Problem Analysis

### Current Import Flow
1. Parse HTML with DOMParser
2. Create temp container (`<div>`) off-screen
3. Inject `<style>` tags into temp container
4. Copy slide HTML into temp container
5. Call `window.getComputedStyle()` on elements
6. **PROBLEM**: CSS selectors don't match!

### Why CSS Doesn't Apply
```css
/* Original CSS in Make Reveal.html */
.reveal { font-size: 32px; }
.reveal h2 { font-size: 1.8em; }  /* Should be 57.6px */
.reveal h3 { font-size: 1.4em; }  /* Should be 44.8px */
.video-overlay { color: #fff; background: rgba(0,0,0,0.6); }
```

```html
<!-- Temp container structure -->
<div style="position: absolute...">  <!-- NO .reveal class! -->
  <style>/* CSS here */</style>
  <section>
    <h2>Text</h2>  <!-- Selector .reveal h2 doesn't match! -->
  </section>
</div>
```

**Result**: `window.getComputedStyle(h2)` returns browser default (~24px), not reveal.js style (57.6px)

## Core Issues

### Issue 1: Font Sizes Too Small
- **Expected**: H2 = 57.6px, base text = 32px
- **Current**: H2 computed as 24px → scaled to 12px
- **Root Cause**: CSS selectors don't apply to temp container

### Issue 2: Wrong Colors
- **Expected**: `.video-overlay { color: #fff; }`
- **Current**: color computed as black (browser default)
- **Root Cause**: Same CSS selector issue

### Issue 3: Missing Semantic Structure
- **Expected**: Preserve h1, h2, h3, ul, li tags
- **Current**: Converting everything to generic text divs
- **Impact**: Loss of heading hierarchy, list styling

### Issue 4: Position Calculations
- Reveal.js centers content by default
- We're calculating absolute positions that may not match

## Comprehensive Solution

### Fix 1: Wrap Temp Container Content in .reveal Structure
```javascript
// Create proper reveal.js DOM structure
const tempContainer = document.createElement('div');
tempContainer.className = 'reveal';  // ADD THIS!
tempContainer.style.position = 'absolute';
tempContainer.style.left = '-9999px';
tempContainer.style.top = '-9999px';
tempContainer.style.width = '1920px';
tempContainer.style.height = '1080px';
tempContainer.style.visibility = 'hidden';

// Create inner slides container
const slidesWrapper = document.createElement('div');
slidesWrapper.className = 'slides';  // ADD THIS!

// Inject CSS
const styleElements = doc.querySelectorAll('style');
styleElements.forEach(styleEl => {
    const newStyle = document.createElement('style');
    newStyle.textContent = styleEl.textContent;
    tempContainer.appendChild(newStyle);
});

// Copy slides
const slidesContainer = doc.querySelector('.reveal .slides');
if (slidesContainer) {
    slidesWrapper.innerHTML = slidesContainer.innerHTML;
}

tempContainer.appendChild(slidesWrapper);
document.body.appendChild(tempContainer);

// NOW query slides from the correct location
const slideElements = slidesWrapper.querySelectorAll(':scope > section');
```

### Fix 2: Don't Scale Font Sizes (Keep Original)
```javascript
// BEFORE:
const fontSize = Math.round(rawFontSize * FONT_SCALE_FACTOR);  // 0.5x = TOO SMALL

// AFTER:
const fontSize = Math.round(rawFontSize);  // Keep original size
```

**Rationale**: Reveal.js and SlideWinder both use similar base font sizes (~32px). Only scale positions/dimensions, not fonts.

### Fix 3: Preserve Semantic HTML When Possible
Instead of converting h1/h2/h3 to plain text divs, store semantic information:

```javascript
// Store element metadata
return {
    id: crypto.randomUUID(),
    type: 'text',
    content: el.innerHTML,
    semanticTag: tagName,  // NEW: 'h1', 'h2', 'p', etc.
    fontSize: parseInt(computedStyle.fontSize),  // NO SCALING
    color: rgbToHex(computedStyle.color) || '#000000',
    // ...
};
```

### Fix 4: Export with Semantic Tags
```javascript
// In htmlGenerator.js
case 'text': {
    const tag = el.semanticTag || 'div';  // Use original tag if available
    const color = el.color || '#000000';
    let textStyles = `color: ${color}; font-size: ${el.fontSize}px;`;

    // Don't wrap in div, use semantic tag directly
    baseElementHtml = `<${tag} style="${textStyles}">${el.content}</${tag}>`;
    break;
}
```

### Fix 5: Better Position Calculation for Centered Content
```javascript
// For centered reveal.js slides, position elements relatively
function calculateSmartPosition(el, layout, index, siblings, canvasSize) {
    const computed = window.getComputedStyle(el);

    // Check if element is centered via reveal.js defaults
    const parentStyle = window.getComputedStyle(el.parentElement);
    if (layout.type === 'centered' ||
        parentStyle.textAlign === 'center' ||
        parentStyle.display === 'flex') {

        // For centered content, use flow positioning
        const verticalSpacing = 60;
        const startY = 100 + (index * verticalSpacing);

        return {
            x: 30,  // Small left margin
            y: startY,
            width: canvasSize.width - 60,  // Full width minus margins
            mode: 'flow-centered'
        };
    }

    // Otherwise use existing logic...
}
```

## Implementation Order

1. **Fix temp container structure** (revealImporter.js ~line 1017-1040)
   - Add .reveal and .slides classes
   - Restructure DOM hierarchy

2. **Remove font size scaling** (revealImporter.js ~line 1172)
   - Remove `FONT_SCALE_FACTOR` multiplication
   - Keep original computed font sizes

3. **Store semantic tags** (revealImporter.js ~line 1169-1187)
   - Add `semanticTag` field to elements
   - Preserve h1, h2, h3, p, ul, li information

4. **Export semantic HTML** (htmlGenerator.js ~line 125-158)
   - Use stored semantic tags instead of always using div
   - Remove the 2x font size hack (no longer needed)

5. **Test with Make Reveal.html**
   - Import should now show proper font sizes
   - Export should reconstruct semantic HTML
   - Round-trip should preserve formatting

## Expected Results

### Slide 1 (Title Slide)
- H1 "Stop Making Slides." → 80px (2.5em × 32px)
- H2 "Start Telling..." → 57.6px (1.8em × 32px)
- Small text → 16px

### Slide 2 (Template Trap)
- H2 "The 'Template Trap'" → 57.6px
- UL with 4 LI items → 32px each
- Proper bullet points and spacing

### Slide 3 (Video Overlay)
- Dark semi-transparent background
- White text
- H2 at 41.6px (1.3em × 32px)
- H1 at 64px (2em × 32px)

## Files to Modify

1. `presenta-react/src/utils/revealImporter.js`
   - Lines 1017-1040: Temp container structure
   - Lines 1169-1187: Element parsing (remove font scaling, add semanticTag)
   - Lines 100-250: Position calculation refinements

2. `presenta-react/src/utils/htmlGenerator.js`
   - Lines 125-158: Use semantic tags, remove 2x font hack
