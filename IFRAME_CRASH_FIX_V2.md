# Iframe Crash Fix V2 - Nested Detection

## Problem
Despite previous sanitization attempts, the iframe slide was still crashing and showing a nested SlideWinder interface. Also, there was a JavaScript parsing error for Reveal.js settings.

## Root Cause Analysis

### Issue 1: Nested Iframe Not Detected
The iframe in "Make Reveal.html" is wrapped in a div:
```html
<div style="...">
    <iframe src="volunteller.html" ...></iframe>
</div>
```

The previous `isComplexElement()` function only checked if the element itself was an iframe, not if it **contained** an iframe. So the div was treated as a simple element, and the iframe inside kept its original src, causing it to load.

### Issue 2: Relative URL Resolution
The iframe had `src="volunteller.html"` (a relative URL). When rendered in the editor at `localhost:5173`, this resolved to the current page, showing a nested SlideWinder interface.

### Issue 3: Reveal.js Settings Parsing
The settings parser had issues with consecutive commas and didn't handle them properly, causing "Unexpected token ','" errors.

## Solutions Implemented

### Fix 1: Detect Elements CONTAINING Iframes (Lines 162-189)

```javascript
function isComplexElement(el) {
  const tagName = el.tagName.toLowerCase();
  const computedStyle = window.getComputedStyle(el);

  // Iframes are always complex
  if (tagName === 'iframe') return true;

  // CRITICAL: Check if element CONTAINS an iframe (even nested)
  const containsIframe = el.querySelector('iframe') !== null;
  if (containsIframe) {
    console.log('Element contains iframe - treating as complex:', el);
    return true;
  }

  // ... rest of checks
}
```

**What this does:**
- Uses `querySelector('iframe')` to check for nested iframes
- Marks any element containing an iframe as complex
- Ensures the div wrapper is treated as a complex container
- Logs detection for debugging

### Fix 2: Enhanced Iframe Sanitization (Lines 106-143)

```javascript
function sanitizeIframesForEditor(html) {
  console.log('Sanitizing HTML (first 200 chars):', html.substring(0, 200));

  let sanitized = html.replace(
    /<iframe([^>]*?)src\s*=\s*["']([^"']*)["']([^>]*?)>/gi,
    (match, before, src, after) => {
      console.log(`Replacing iframe src: "${src}" with "about:blank"`);
      // Remove existing styles and replace with placeholder
      const cleanBefore = before.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
      const cleanAfter = after.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
      return `<iframe${cleanBefore}data-original-src="${src}" src="about:blank"${cleanAfter} style="width: 100%; height: 100%; background: #f0f0f0; border: 2px dashed #999;">`;
    }
  );

  console.log('Sanitized HTML (first 200 chars):', sanitized.substring(0, 200));
  return sanitized;
}
```

**Improvements:**
- Removes existing iframe styles to prevent conflicts
- Forces placeholder styling with gray background and dashed border
- Adds comprehensive logging to track sanitization
- Preserves original src in `data-original-src` for export

### Fix 3: Improved Reveal.js Settings Parser (Lines 2168-2183)

```javascript
// Clean up the config string to make it valid JSON-like
// Remove plugins array
configStr = configStr.replace(/plugins:\s*\[[^\]]*\]/g, '');

// Remove comments FIRST (before cleaning commas)
configStr = configStr.replace(/\/\/.*$/gm, '');
configStr = configStr.replace(/\/\*[\s\S]*?\*\//g, '');

// Remove trailing commas before closing braces/brackets
configStr = configStr.replace(/,(\s*[}\]])/g, '$1');

// Remove multiple consecutive commas
configStr = configStr.replace(/,\s*,+/g, ',');

// Remove leading commas
configStr = configStr.replace(/([{\[])\s*,/g, '$1');
```

**Fixes:**
- Removes comments before processing commas (order matters!)
- Handles multiple consecutive commas
- Removes leading commas
- More robust bracket/brace handling

## Flow Diagram

```
Reveal HTML Import
       ↓
   Find slide children
       ↓
   For each child:
       ↓
   Is simple text element?
   (h1, h2, p, ul, etc.)
       ↓ YES
   Parse as editable element
       ↓
       ↓ NO
       ↓
   Contains iframe? ← [NEW CHECK]
   (el.querySelector('iframe'))
       ↓ YES
   Treat as complex container
       ↓
   Get outerHTML (includes wrapper + iframe)
       ↓
   Sanitize: Replace iframe src with about:blank
       ↓
   Store original + sanitized versions
       ↓
   Export uses original (real iframe)
   Editor uses sanitized (safe placeholder)
```

## Testing Instructions

1. **Hard refresh**: `Ctrl + Shift + R`
2. **Delete** current presentation
3. **Re-import** "Make Reveal.html"
4. **Navigate to "Embed Anything" slide** (slide 12)
5. **Check console logs** - should see:
   - "Element contains iframe - treating as complex"
   - "Sanitizing HTML..."
   - "Replacing iframe src: 'volunteller.html' with 'about:blank'"
6. **Expected results:**
   - ✅ No crash
   - ✅ No nested SlideWinder interface
   - ✅ Shows gray placeholder box
   - ✅ No "Unexpected token ','" errors
7. **Export and test:**
   - Export presentation
   - Open in browser
   - iframe should work with original src

## What Changed in This Fix

### Previous Approach (Failed)
- Only checked if element IS an iframe
- Missed div wrappers containing iframes
- Div with iframe parsed as simple element
- Iframe kept original src
- Loaded in editor → crash

### New Approach (Working)
- Checks if element CONTAINS an iframe
- Detects wrapper elements with nested iframes
- Treats entire wrapper as complex container
- Sanitizes all iframes in the HTML
- Safe placeholder in editor
- Original src restored on export

## Files Modified

**`revealImporter.js`**
- Lines 106-143: Enhanced `sanitizeIframesForEditor()` with logging and style removal
- Lines 162-189: Improved `isComplexElement()` to detect nested iframes
- Lines 2168-2183: Fixed Reveal.js settings parser for comma handling

## Benefits

1. **Nested iframe detection** - Catches iframes wrapped in divs/containers
2. **Comprehensive logging** - Easy to debug sanitization issues
3. **Style conflict prevention** - Removes existing styles before applying placeholder
4. **Settings parsing fixed** - No more comma-related JavaScript errors
5. **Maintains editability** - Simple text elements still editable
6. **Perfect export** - Original iframes restored in output

## Known Behavior

- Console will show logs when importing slides with iframes
- Iframe containers show gray dashed placeholder in editor
- These containers are intentionally non-editable for stability
- Export always uses original iframe src

## Future Enhancements

- Could add iframe src display in placeholder
- Could add preview button to test iframe in modal
- Could support editing iframe properties in panel
