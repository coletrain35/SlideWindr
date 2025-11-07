# Editor Display Fix for Flow Mode Slides

## Problem
Flow mode slides were showing overlapping text and poor layout in thumbnails and canvas editor view, even though they exported correctly.

## Root Cause
Flow mode elements were using `calculateSmartPosition()` which is designed for absolute positioning. This caused:
- Elements overlapping in the editor
- Poor thumbnail rendering
- Confusing canvas view

## Solution
Changed flow mode elements to use **simple vertical stacking** for editor display:

### New Positioning Logic (`revealImporter.js:1416-1459`)

**For regular flow elements:**
```javascript
x: 40,  // Consistent left margin
y: 80 + (index * 60),  // Stack vertically with 60px spacing
width: Math.min(size.width, 880),  // Cap width for editor
```

**For markdown slides:**
```javascript
x: 40,  // Consistent with other flow elements
y: 80,  // Same starting position
width: 880,  // Consistent width
height: 400,  // Reasonable height
```

## Key Points

1. **Editor positions are ONLY for display** - They're ignored during export
2. **Export still uses semantic HTML** - Flow mode slides export as clean HTML without positioning
3. **Vertical stacking** - Elements are stacked from top to bottom with consistent spacing
4. **No overlap** - Each element has its own vertical space

## Expected Results

### Thumbnails
- ✅ All elements visible (no overlap)
- ✅ Stacked vertically in order
- ✅ Consistent spacing between elements
- ✅ Clean, readable preview

### Canvas Editor
- ✅ Elements displayed in vertical stack
- ✅ Easy to select and edit individual elements
- ✅ No overlapping text
- ✅ Flow mode indicator (dashed blue outline when selected)

### Export (Unchanged)
- ✅ Still outputs semantic HTML
- ✅ Reveal.js handles natural layout and centering
- ✅ Perfect match to original

## Testing Instructions

1. **Hard refresh**: `Ctrl + Shift + R`
2. **Delete** current presentation or create new
3. **Re-import** "Make Reveal.html"
4. **Check thumbnails** - Should be clean, no overlapping
5. **Check canvas** - Elements should be vertically stacked
6. **Export and test** - Should still match original perfectly

## What Changed

**File: `revealImporter.js`**

Lines 1416-1459: Flow mode element positioning
- Changed from `calculateSmartPosition()` to simple vertical stacking
- x = 40 (consistent left margin)
- y = 80 + (index × 60) for stacking
- width = capped at 880px for editor

Lines 1344-1348: Markdown slide positioning
- Updated to match flow element positioning
- Consistent x/y/width with other flow elements

## Visual Comparison

### Before Fix
```
┌─────────────────┐
│ Title Text      │
│ More Text       │  ← Overlapping
│ Bullet List     │
│ Another Element │  ← Hard to read
└─────────────────┘
```

### After Fix
```
┌─────────────────┐
│ Title Text      │
│                 │
│ More Text       │
│                 │
│ Bullet List     │
│                 │
│ Another Element │
└─────────────────┘
```

## Notes

- **Editor view ≠ Export view** - This is intentional and correct
- **Dashed outline** - Flow mode elements show dashed blue outline when selected
- **Editing** - You can still drag and position elements in the editor, but export ignores these positions for flow mode
