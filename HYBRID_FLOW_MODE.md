# Hybrid Flow Mode Implementation

## Problem Solved
Previous flow mode implementation created a single container per slide, making text elements non-editable. User requested ability to edit individual text elements while maintaining stability.

## Updates (Latest)
- **Enhanced iframe sanitization**: Now handles both quoted and unquoted src attributes
- **Improved height calculations**: Tag-specific minimum heights prevent overlapping
- **Better spacing**: Different spacing for simple vs complex elements
- **Debugging logs**: Console logs for iframe detection and sanitization

## Solution: Hybrid Approach

Flow mode now intelligently classifies elements:

### Simple Elements (Editable)
**Criteria:**
- Heading tags: h1, h2, h3, h4, h5, h6
- Text: p (paragraphs)
- Lists: ul, ol
- Quotes: blockquote
- No complex styling (backgrounds, borders)

**Behavior:**
- Parsed individually
- Fully editable in editor
- Proper text formatting preserved
- Can be moved and resized

### Complex Elements (Containers)
**Criteria:**
- iframes (always)
- divs with styled backgrounds
- Flex/grid layouts
- Elements with 4+ children
- Any element with complex styling

**Behavior:**
- Kept as single container
- iframes sanitized (src replaced with about:blank)
- Non-editable (stable)
- Shows as single block in editor
- Exports with original HTML

## Implementation

### New Functions (`revealImporter.js:118-236`)

1. **`isSimpleTextElement(el)`** - Detects editable text elements
2. **`isComplexElement(el)`** - Detects elements that need containerization
3. **`parseSimpleFlowElement(el, currentY)`** - Parse editable elements with proper positioning
4. **`createComplexFlowContainer(el, currentY)`** - Create container with iframe sanitization

### Modified Flow Mode Logic (`revealImporter.js:1513-1565`)

```javascript
if (layoutMode === 'flow') {
  let currentY = 80;
  const spacing = 20;

  children.forEach((child) => {
    if (isSimpleTextElement(child)) {
      // Editable element
      const element = parseSimpleFlowElement(child, currentY);
      slide.elements.push(element);
      currentY += element.height + spacing;
    } else if (isComplexElement(child)) {
      // Container (with iframe sanitization)
      const container = createComplexFlowContainer(child, currentY);
      slide.elements.push(container);
      currentY += container.height + spacing;
    } else {
      // Default: treat as simple
      const element = parseSimpleFlowElement(child, currentY);
      slide.elements.push(element);
      currentY += element.height + spacing;
    }
  });
}
```

## How It Works

### Simple Element Flow
1. Import detects h1, p, ul, etc.
2. Parse as individual element with layout mode 'flow'
3. No `isFlowContainer` flag set
4. ElementComponent allows editing (line 67 checks `!element.isFlowContainer`)
5. User can click and edit text with rich text editor
6. Export outputs as semantic HTML

### Complex Element Flow
1. Import detects iframe, styled div, or complex layout
2. Create container with `isFlowContainer: true`
3. Sanitize iframes: replace src with about:blank, preserve in data-original-src
4. Store both `content` (original) and `editorContent` (sanitized)
5. ElementComponent shows sanitized version, blocks editing
6. Export uses original content with real iframe src

## Testing Instructions

1. **Delete current presentation** (to clear cache)
2. **Re-import** "Make Reveal.html"
3. **Test simple elements:**
   - Click on any heading (h1, h2) - should enter edit mode
   - Click on paragraphs - should be editable
   - Click on lists - should be editable
   - Verify text formatting is preserved
4. **Test complex elements:**
   - Navigate to "Embed Anything" slide (slide 12)
   - Verify iframe shows as gray placeholder
   - Verify no crash
   - Verify can't edit iframe container (expected)
5. **Test export:**
   - Export presentation
   - Open in browser
   - Verify all content matches original
   - Verify iframe loads correctly

## Expected Results

### Editor
- ✅ Simple text elements are clickable and editable
- ✅ Complex elements show as containers (non-editable)
- ✅ iframes show as gray placeholders
- ✅ No crashes
- ✅ Clean thumbnails with proper spacing

### Export
- ✅ Perfect semantic HTML
- ✅ iframes have original src restored
- ✅ All styling preserved
- ✅ Reveal.js handles layout correctly

## Benefits

1. **Editability** - Can now edit headings, paragraphs, lists individually
2. **Stability** - Complex elements and iframes can't crash the editor
3. **Perfect Export** - Maintains semantic HTML with proper structure
4. **Smart Detection** - Automatically classifies elements appropriately
5. **Best of Both Worlds** - Edit what makes sense, protect what's complex

## Trade-offs

- Complex elements (styled divs, iframes) remain non-editable
- This is intentional to maintain stability
- These are typically imported as-is and don't need editing
- If editing is needed, can edit the original Reveal.js file and re-import

## Key Fixes for Stability

### Iframe Sanitization (Lines 106-132)
```javascript
function sanitizeIframesForEditor(html) {
  // Handle quoted src attributes
  let sanitized = html.replace(
    /<iframe([^>]*?)src\s*=\s*["']([^"']*)["']([^>]*?)>/gi,
    (match, before, src, after) => {
      return `<iframe${before}data-original-src="${src}" src="about:blank"${after} style="background: #f0f0f0; border: 2px dashed #999;">`;
    }
  );

  // Handle unquoted src attributes
  sanitized = sanitized.replace(
    /<iframe([^>]*?)src\s*=\s*([^\s>]+)([^>]*?)>/gi,
    (match, before, src, after) => {
      if (before.includes('data-original-src') || after.includes('data-original-src')) {
        return match; // Skip if already sanitized
      }
      return `<iframe${before}data-original-src="${src}" src="about:blank"${after} style="background: #f0f0f0; border: 2px dashed #999;">`;
    }
  );

  return sanitized;
}
```

### Tag-Specific Heights (Lines 190-227)
```javascript
function parseSimpleFlowElement(el, currentY) {
  // Tag-specific minimum heights to prevent overlapping
  let minHeight = 40;
  if (tagName === 'h1') minHeight = 80;
  else if (tagName === 'h2') minHeight = 70;
  else if (tagName === 'h3') minHeight = 60;
  else if (tagName === 'p') minHeight = 50;
  else if (tagName === 'ul' || tagName === 'ol') minHeight = 100;
  else if (tagName === 'blockquote') minHeight = 80;

  // Use actual height if valid, otherwise minimum
  const height = rect.height > 10 ? Math.max(rect.height, minHeight) : minHeight;
}
```

### Complex Element Heights (Lines 236-280)
```javascript
function createComplexFlowContainer(el, currentY) {
  // Minimum heights for complex elements
  let minHeight = 150;
  if (tagName === 'iframe') minHeight = 400;
  else if (tagName === 'div') minHeight = 200;

  const height = rect.height > 10 ? Math.max(rect.height, minHeight) : minHeight;

  // Sanitize to prevent iframe loading
  const sanitizedHTML = sanitizeIframesForEditor(originalHTML);

  // Debug logging for iframes
  if (tagName === 'iframe') {
    console.log('Flow iframe detected - sanitizing:', {
      original: originalHTML.substring(0, 100),
      sanitized: sanitizedHTML.substring(0, 100)
    });
  }
}
```

### Improved Spacing (Lines 1561-1563)
```javascript
let currentY = 60; // Starting Y position
const simpleSpacing = 15; // Space between simple elements
const complexSpacing = 30; // Extra space for complex elements
```

## Files Modified

**`revealImporter.js`**
- Lines 106-132: Enhanced `sanitizeIframesForEditor()` function
- Lines 134-149: `isSimpleTextElement()` function
- Lines 151-182: `isComplexElement()` function
- Lines 184-228: `parseSimpleFlowElement()` with tag-specific heights
- Lines 230-280: `createComplexFlowContainer()` with iframe sanitization
- Lines 1557-1603: Hybrid flow mode logic with improved spacing

**No changes needed to:**
- `ElementComponent.jsx` - Already supports this pattern with `!element.isFlowContainer` check
- `htmlGenerator.js` - Already exports flow mode correctly
