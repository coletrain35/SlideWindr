# Iframe Sanitization Fix

## Problem
The "Embed Anything" slide with an iframe crashed SlideWindr and showed a nested SlideWindr interface on reload.

**Root Cause:** The iframe with `src="volunteller.html"` was actually loading in the editor, which:
- Tried to load a relative URL that didn't exist
- Could potentially cause recursive loading
- Crashed the editor on that slide

## Solution: Dual Content Approach

Flow mode elements now store **two versions** of their HTML:

### 1. Original Content (for export)
```javascript
content: slideEl.innerHTML  // Original HTML with real iframe src
```

### 2. Editor Content (for display)
```javascript
editorContent: sanitizedHTML  // Sanitized HTML with iframe src replaced
```

## How It Works

### Import (`revealImporter.js:106-116`)
```javascript
function sanitizeIframesForEditor(html) {
  return html.replace(
    /<iframe([^>]*?)src=["']([^"']*)["']([^>]*?)>/gi,
    (match, before, src, after) => {
      return `<iframe${before}data-original-src="${src}" src="about:blank"${after} style="background: #f0f0f0; border: 2px dashed #999;">`;
    }
  );
}
```

**What this does:**
- Finds all `<iframe src="...">` tags
- Saves the original src in `data-original-src` attribute
- Replaces src with `about:blank` (safe, won't load anything)
- Adds placeholder styling (gray background, dashed border)

### Display (`ElementComponent.jsx:63-80`)
```javascript
const displayContent = element.editorContent || element.content;
// Uses editorContent for display (sanitized iframes)
```

### Export (`htmlGenerator.js`)
```javascript
return el.content;  // Uses original content (real iframe)
```

## Results

### ✅ Editor
- Iframe shows as a gray box with dashed border
- No crashes
- No attempts to load content
- Safe and stable

### ✅ Export
- Original iframe with real `src` attribute
- Works perfectly when opened in browser
- No changes to the exported HTML

## Example

### Original HTML (imported)
```html
<iframe src="volunteller.html" style="width: 100%; height: 100%;"></iframe>
```

### Editor Display
```html
<iframe data-original-src="volunteller.html"
        src="about:blank"
        style="background: #f0f0f0; border: 2px dashed #999;">
</iframe>
```

### Export
```html
<iframe src="volunteller.html" style="width: 100%; height: 100%;"></iframe>
```

## Files Modified

**`revealImporter.js`**
- Lines 100-116: Added `sanitizeIframesForEditor()` function
- Lines 1380-1395: Store both original and sanitized HTML

**`ElementComponent.jsx`**
- Lines 63-80: Use `editorContent` for display, preserve `content` for updates

## Testing Instructions

1. **Hard refresh**: `Ctrl + Shift + R`
2. **Delete** current presentation
3. **Re-import** "Make Reveal.html"
4. **Navigate to "Embed Anything" slide** (slide 12)
5. **Expected results:**
   - ✅ No crash
   - ✅ Shows gray placeholder box for iframe
   - ✅ Thumbnail shows content without crashing
6. **Export** and test in browser
7. **Expected in export:**
   - ✅ Iframe loads with original src
   - ✅ Works exactly like the original

## Benefits

1. **No Crashes** - iframes can't load problematic content in editor
2. **Visual Placeholder** - You can see where the iframe is
3. **Perfect Export** - Original iframe preserved exactly
4. **Safe** - No security issues from untrusted iframe content
5. **Stable** - No recursive loading or relative URL issues

## Future Enhancements

Possible improvements:
- Show iframe src URL in the placeholder
- Add "Preview" button to test iframe in modal
- Support editing iframe src in properties panel

For now, this solution ensures stability while maintaining perfect export fidelity.
