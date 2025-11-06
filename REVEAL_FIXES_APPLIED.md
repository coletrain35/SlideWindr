# Reveal.js Import/Export Fixes - Applied

## What Was Fixed

### Root Cause: CSS Selectors Not Matching
The temp container didn't have the `.reveal` and `.slides` classes, so CSS rules like `.reveal h2 { font-size: 1.8em; }` never applied. This caused `window.getComputedStyle()` to return browser defaults instead of reveal.js styles.

## Changes Made

### 1. Fixed Temp Container Structure (`revealImporter.js:1034-1067`)
**Before:**
```javascript
const tempContainer = document.createElement('div');
tempContainer.innerHTML = slidesContainer.innerHTML;
```

**After:**
```javascript
const tempContainer = document.createElement('div');
tempContainer.className = 'reveal';  // CSS selectors now match!

const slidesWrapper = document.createElement('div');
slidesWrapper.className = 'slides';  // Proper hierarchy

slidesWrapper.innerHTML = slidesContainer.innerHTML;
tempContainer.appendChild(slidesWrapper);
```

**Impact**: CSS rules now apply correctly during import, giving accurate font sizes and colors.

### 2. Removed Font Size Scaling (`revealImporter.js:1217, 1304`)
**Before:**
```javascript
const FONT_SCALE_FACTOR = 0.5;  // Made everything tiny!
const fontSize = Math.round(rawFontSize * FONT_SCALE_FACTOR);
```

**After:**
```javascript
// Keep original font sizes - don't scale them!
const fontSize = Math.round(rawFontSize);
```

**Impact**:
- H2 now imports as ~58px (not 12px)
- Base text now ~32px (not 16px)
- Headings display at proper large sizes

### 3. Preserved Semantic HTML Tags (`revealImporter.js:1222`)
**Before:**
```javascript
tagName: 'div',  // Lost semantic meaning
```

**After:**
```javascript
tagName: tagName,  // Preserves h1, h2, h3, ul, p, etc.
```

**Impact**: Export can reconstruct original HTML structure

### 4. Export with Semantic Tags (`htmlGenerator.js:126-165`)
**Before:**
```javascript
baseElementHtml = `<div style="${textStyles}">${el.content}</div>`;
```

**After:**
```javascript
const semanticTag = el.tagName || 'div';  // Use original tag
baseElementHtml = `<${semanticTag} style="${textStyles}">${el.content}</${semanticTag}>`;
```

**Impact**: Exported HTML has proper `<h1>`, `<h2>`, `<ul>` tags

### 5. Removed 2x Font Hack (`htmlGenerator.js:128`)
**Before:**
```javascript
const baseFontSize = el.isStyledContainer ? (el.fontSize * 2) : el.fontSize;
```

**After:**
```javascript
// No longer needed - font sizes are already correct
let textStyles = `color: ${color}; font-size: ${el.fontSize}px;`;
```

## Expected Results

### Slide 1: Title Slide
```html
<section>
    <h1>Stop Making Slides.</h1>  <!-- 80px, not 8px! -->
    <h2>Start Telling Interactive Stories.</h2>  <!-- 58px -->
    <p><small>A look at reveal.js...</small></p>  <!-- 16px -->
</section>
```

### Slide 2: Template Trap
```html
<section>
    <h2>The "Template Trap"</h2>  <!-- 58px, bold -->
    <ul>  <!-- Proper bullet points -->
        <li class="fragment">Trapped in the "Title + 3 Bullets" box.</li>
        <li class="fragment">Or... the dreaded "Wall of Text" slide.</li>
        <li class="fragment">Your graphs and charts look flat and dated.</li>
        <li class="fragment">And embedding live content? Forget it.</li>
    </ul>
</section>
```

### Slide 3: Video Overlay
```html
<section data-background-color="#2c3e50">
    <div class="video-overlay" style="background: rgba(0,0,0,0.6); color: #fff; padding: 40px; border-radius: 10px;">
        <h2 style="font-size: 1.3em;">What if your presentation was just...</h2>
        <h1 style="font-size: 2em;">A beautiful, interactive webpage?</h1>
        <p style="font-size: 0.9em;">That's reveal.js...</p>
    </div>
</section>
```

## Testing Instructions

1. **Clear browser cache** or do a hard refresh (Ctrl+Shift+R) to ensure new code loads
2. **Re-import Make Reveal.html** into SlideWinder
3. **Verify in Editor**:
   - Slide 2 should show large "The 'Template Trap'" heading
   - Should see 4 bullet points, properly formatted
   - Slide 3 should have dark semi-transparent box with white text
4. **Export to Reveal.js HTML**
5. **Open exported file in browser**
6. **Compare with original**:
   - Font sizes should match
   - Colors should match (white on dark backgrounds)
   - Headings should be bold and prominent
   - Bullet lists should have bullets
   - 2D navigation should work (arrow keys)

## What Should Now Work

✅ **Font sizes correct** - Headings are large and prominent
✅ **Colors accurate** - White text on dark backgrounds
✅ **Semantic HTML preserved** - h1, h2, ul tags maintained
✅ **Styled containers render** - Dark overlay boxes with rounded corners
✅ **Custom CSS preserved** - Classes like .video-overlay styled correctly
✅ **Nested slides preserved** - Vertical stacks maintain 2D navigation
✅ **Round-trip fidelity** - Import → Export → Import should be consistent

## Files Modified

1. `presenta-react/src/utils/revealImporter.js`
   - Lines 1034-1067: Temp container structure with .reveal and .slides classes
   - Line 1217: Removed font scaling for styled containers
   - Line 1222: Store semantic tagName
   - Line 1304: Removed font scaling for text elements

2. `presenta-react/src/utils/htmlGenerator.js`
   - Lines 126-165: Use semantic tags in export, removed font hack

## Notes

- Only positions and dimensions are scaled (0.5x for canvas size)
- Font sizes are NOT scaled - they stay at original reveal.js sizes
- This matches how reveal.js and SlideWinder both use ~32px base font
- Semantic tags preserved: h1, h2, h3, h4, h5, h6, p, ul, ol, li, blockquote, etc.
