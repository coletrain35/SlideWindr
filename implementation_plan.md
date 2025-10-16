# SlideWinder Implementation Plan

**Date Created**: 2025-10-15
**Project**: Presenta-React Optimization & Enhancement
**Status**: Planning Phase

---

## Executive Summary

This document outlines a comprehensive plan to improve the SlideWinder (Presenta-React) codebase based on efficiency and effectiveness review. The plan is divided into 4 phases, prioritizing security fixes, performance optimization, code quality improvements, and feature enhancements.

**Current State**: B- (Good foundation, needs polish)
**Target State**: A (Production-ready, optimized, secure)

---

## Phase 1: Critical Fixes (Priority: HIGH)
**Estimated Time**: 1-2 days
**Status**: ✅ COMPLETED

### 1.1 Security Vulnerabilities

#### Issue 1: CSS Injection Vulnerability
**File**: `presenta-react/src/components/LiveReactRenderer.jsx:658`
**Severity**: HIGH
**Current Code**:
```javascript
styleElement.innerHTML = css;
```

**Fix**:
```javascript
styleElement.textContent = css;
```

**Why**: `innerHTML` allows potential CSS injection attacks. Using `textContent` treats input as plain text, preventing injection while still allowing valid CSS.

**Steps**:
1. Open `LiveReactRenderer.jsx`
2. Locate line with `styleElement.innerHTML = css`
3. Replace with `styleElement.textContent = css`
4. Test with sample CSS to ensure styles still apply correctly
5. Add comment explaining security reasoning

---

#### Issue 2: Arbitrary Code Execution
**File**: `presenta-react/src/components/ComponentContainer.jsx`
**Severity**: MEDIUM (by design, but needs documentation)
**Current State**: No sandboxing or warnings

**Fix**:
1. Add warning comment at top of file:
```javascript
/**
 * SECURITY NOTE: This component executes arbitrary user-provided code.
 * In production, consider implementing:
 * - Sandboxed iframe execution
 * - Content Security Policy headers
 * - Code review/approval workflow for shared presentations
 */
```

2. Add user-facing warning in UI when adding React components:
```javascript
// In ReactComponentEditor.jsx
const addComponent = () => {
  const confirmed = window.confirm(
    'React components execute custom code. Only use trusted code sources. Continue?'
  );
  if (!confirmed) return;
  // ... rest of logic
};
```

---

#### Issue 3: XSS Risk in HTML Export
**File**: `presenta-react/src/App.jsx:324`
**Severity**: MEDIUM
**Current Code**:
```javascript
const escapedHtml = (el.htmlContent || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
```

**Issue**: Basic escaping may not be sufficient for all XSS vectors.

**Fix**:
1. Install DOMPurify: `npm install dompurify`
2. Import and use in App.jsx:
```javascript
import DOMPurify from 'dompurify';

// In generateHTML function
case 'iframe':
  const sanitizedHtml = DOMPurify.sanitize(el.htmlContent || '', {
    ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'a'],
    ALLOWED_ATTR: ['class', 'style', 'href', 'src', 'alt']
  });
  baseElementHtml = `<iframe srcdoc="${sanitizedHtml.replace(/"/g, '&quot;')}" ...></iframe>`;
  break;
```

---

### 1.2 ESLint Errors

#### Error 1: Lexical Declaration in Case Block
**File**: `presenta-react/src/App.jsx:101`
**Current Code**:
```javascript
case 'image':
    const src = prompt("Enter image URL:", "https://placehold.co/600x400/d1d5db/374151?text=My+Image");
    if (!src) return;
    newElement = { ...baseElement, type, src, width: 300, height: 200 };
    break;
```

**Fix**:
```javascript
case 'image': {
    const src = prompt("Enter image URL:", "https://placehold.co/600x400/d1d5db/374151?text=My+Image");
    if (!src) return;
    newElement = { ...baseElement, type, src, width: 300, height: 200 };
    break;
}
```

---

#### Error 2: Lexical Declaration in Case Block
**File**: `presenta-react/src/App.jsx:324`
**Current Code**:
```javascript
case 'iframe':
    const escapedHtml = (el.htmlContent || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    baseElementHtml = `<iframe srcdoc="${escapedHtml}" ...></iframe>`;
    break;
```

**Fix**:
```javascript
case 'iframe': {
    const escapedHtml = (el.htmlContent || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    baseElementHtml = `<iframe srcdoc="${escapedHtml}" style="border: none; width: 100%; height: 100%;"></iframe>`;
    break;
}
```

---

#### Error 3: Unused Variable
**File**: `presenta-react/src/components/ComponentContainer.jsx:55`
**Current Code**:
```javascript
} catch (e) {
    throw new Error("Invalid JSON in props.");
}
```

**Fix**:
```javascript
} catch {
    throw new Error("Invalid JSON in props.");
}
```
Or log the error:
```javascript
} catch (parseError) {
    throw new Error(`Invalid JSON in props: ${parseError.message}`);
}
```

---

### 1.3 Input Validation

#### Add Dimension Constraints
**File**: `presenta-react/src/components/ElementProperties.jsx`

**Current Code** (lines 774-777):
```javascript
<div><label>Width:</label><input type="number" value={Math.round(selectedElement.width)} onChange={e => updateElement(selectedElement.id, {width: +e.target.value})} className="w-full border rounded px-1" /></div>
<div><label>Height:</label><input type="number" value={Math.round(selectedElement.height)} onChange={e => updateElement(selectedElement.id, {height: +e.target.value})} className="w-full border rounded px-1" /></div>
```

**Fix**:
```javascript
<div>
  <label htmlFor="elem-width">Width:</label>
  <input
    id="elem-width"
    type="number"
    min="10"
    max="5000"
    value={Math.round(selectedElement.width)}
    onChange={e => {
      const value = Math.max(10, Math.min(5000, +e.target.value || 10));
      updateElement(selectedElement.id, {width: value});
    }}
    className="w-full border rounded px-1"
  />
</div>
<div>
  <label htmlFor="elem-height">Height:</label>
  <input
    id="elem-height"
    type="number"
    min="10"
    max="5000"
    value={Math.round(selectedElement.height)}
    onChange={e => {
      const value = Math.max(10, Math.min(5000, +e.target.value || 10));
      updateElement(selectedElement.id, {height: value});
    }}
    className="w-full border rounded px-1"
  />
</div>
```

---

#### Add AutoSlide Validation
**File**: `presenta-react/src/components/PresentationToolbar.jsx:854`

**Current Code**:
```javascript
<input id="autoslide-input" type="number" value={settings.autoSlide} onChange={e => handleValueChange('autoSlide', +e.target.value)} step="100" min="0" className="w-20 border-gray-300 border rounded px-2 py-1 text-sm" />
```

**Fix**:
```javascript
<input
  id="autoslide-input"
  type="number"
  value={settings.autoSlide}
  onChange={e => {
    const value = Math.max(0, Math.min(60000, +e.target.value || 0));
    handleValueChange('autoSlide', value);
  }}
  step="100"
  min="0"
  max="60000"
  className="w-20 border-gray-300 border rounded px-2 py-1 text-sm"
/>
```

---

### 1.4 Verification Tasks

- [ ] Run `npm run lint` and confirm 0 errors
- [ ] Test CSS injection fix with complex CSS
- [ ] Test dimension constraints with edge cases (0, negative, NaN)
- [ ] Test AutoSlide validation
- [ ] Manual security testing of iframe content
- [ ] Add security documentation to README

---

## Phase 2: Performance Optimization (Priority: MEDIUM-HIGH)
**Estimated Time**: 2-3 days
**Status**: ✅ COMPLETED

### 2.1 Debouncing Input Fields

#### Create Debounce Utility
**New File**: `presenta-react/src/utils/debounce.js`

```javascript
import { useEffect, useMemo, useRef } from 'react';

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Hook version of debounce
 * @param {Function} callback - The callback to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced callback
 */
export function useDebouncedCallback(callback, delay) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(() => {
    return debounce((...args) => callbackRef.current(...args), delay);
  }, [delay]);
}
```

---

#### Apply to ReactComponentEditor
**File**: `presenta-react/src/components/ReactComponentEditor.jsx`

**Current Code** (lines 665-667):
```javascript
const handleCodeChange = (e) => onChange({ ...componentData, code: e.target.value });
const handlePropsChange = (e) => onChange({ ...componentData, props: e.target.value });
const handleCssChange = (e) => onChange({ ...componentData, css: e.target.value });
```

**Fix**:
```javascript
import { useDebouncedCallback } from '../utils/debounce';

const ReactComponentEditor = ({ componentData, onChange, title }) => {
    const [localCode, setLocalCode] = useState(componentData?.code || '');
    const [localProps, setLocalProps] = useState(componentData?.props || '');
    const [localCss, setLocalCss] = useState(componentData?.css || '');

    const debouncedCodeChange = useDebouncedCallback((value) => {
        onChange({ ...componentData, code: value });
    }, 300);

    const debouncedPropsChange = useDebouncedCallback((value) => {
        onChange({ ...componentData, props: value });
    }, 300);

    const debouncedCssChange = useDebouncedCallback((value) => {
        onChange({ ...componentData, css: value });
    }, 300);

    const handleCodeChange = (e) => {
        const value = e.target.value;
        setLocalCode(value);
        debouncedCodeChange(value);
    };

    const handlePropsChange = (e) => {
        const value = e.target.value;
        setLocalProps(value);
        debouncedPropsChange(value);
    };

    const handleCssChange = (e) => {
        const value = e.target.value;
        setLocalCss(value);
        debouncedCssChange(value);
    };

    // Update local state when componentData changes externally
    useEffect(() => {
        setLocalCode(componentData?.code || '');
        setLocalProps(componentData?.props || '');
        setLocalCss(componentData?.css || '');
    }, [componentData?.code, componentData?.props, componentData?.css]);

    // ... rest of component
};
```

---

#### Apply to ElementProperties
**File**: `presenta-react/src/components/ElementProperties.jsx`

Add debouncing to:
- Width/Height inputs (300ms)
- Font size input (300ms)
- Image URL input (500ms)
- HTML content textarea (500ms)

**Pattern**:
```javascript
import { useDebouncedCallback } from '../utils/debounce';

const ElementProperties = ({ selectedElement, updateElement, deleteElement }) => {
    const debouncedUpdate = useDebouncedCallback((id, updates) => {
        updateElement(id, updates);
    }, 300);

    // Use for dimension changes
    const handleWidthChange = (e) => {
        const value = Math.max(10, Math.min(5000, +e.target.value || 10));
        debouncedUpdate(selectedElement.id, { width: value });
    };

    // ... rest of handlers
};
```

---

### 2.2 Memoization Strategy

#### Wrap Child Components
**Files to Update**:
- `ElementComponent.jsx`
- `SlideProperties.jsx`
- `ElementProperties.jsx`
- `PresentationToolbar.jsx`
- All icon components in `Icons.jsx`

**Pattern**:
```javascript
import React from 'react';

const ElementComponent = ({ element, onMouseDown, ... }) => {
    // Component logic
};

export default React.memo(ElementComponent, (prevProps, nextProps) => {
    // Custom comparison for optimization
    return (
        prevProps.element.id === nextProps.element.id &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isInteracting === nextProps.isInteracting
        // Add other props that should trigger re-render
    );
});
```

---

#### Add useCallback to App.jsx
**File**: `presenta-react/src/App.jsx`

**Handlers to Wrap** (lines 187-289):
```javascript
const handleMouseDown = useCallback((e, elementId) => {
    e.stopPropagation();
    setInteractingElementId(null);
    setSelectedElementId(elementId);
    const element = currentSlide.elements.find(el => el.id === elementId);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDragging({
        element,
        offsetX: e.clientX - canvasRect.left - element.x,
        offsetY: e.clientY - canvasRect.top - element.y,
    });
}, [currentSlide]);

const handleResizeMouseDown = useCallback((e, elementId, handle) => {
    e.stopPropagation();
    setInteractingElementId(null);
    setSelectedElementId(elementId);
    const element = currentSlide.elements.find(el => el.id === elementId);
    setResizing({
        element,
        handle,
        initialMouseX: e.clientX,
        initialMouseY: e.clientY,
        initialX: element.x,
        initialY: element.y,
        initialWidth: element.width,
        initialHeight: element.height,
    });
}, [currentSlide]);

const getBackgroundStyle = useCallback((bg) => {
    if (!bg) return { backgroundColor: '#ffffff' };
    if (bg.type === 'color') return { backgroundColor: bg.value };
    if (bg.type === 'image') return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    };
    return { backgroundColor: '#ffffff' };
}, []);
```

---

### 2.3 Optimize State Updates

#### Combine Multiple Updates
**File**: `presenta-react/src/components/SlideProperties.jsx:728-732`

**Current Code**:
```javascript
const handleBgTypeChange = (newType) => {
    let newValue = background.value || '';
    if (newType === 'color' && !background.value?.startsWith('#')) newValue = '#ffffff';
    handleBgChange('type', newType);
    handleBgChange('value', newValue);
};
```

**Fix**:
```javascript
const handleBgTypeChange = (newType) => {
    let newValue = background.value || '';
    if (newType === 'color' && !background.value?.startsWith('#')) newValue = '#ffffff';
    updateSlideSettings(currentSlide.id, {
        background: { ...background, type: newType, value: newValue }
    });
};
```

---

### 2.4 Performance Verification

- [ ] Measure render count before/after with React DevTools Profiler
- [ ] Test typing performance in code editor (should feel smooth)
- [ ] Test dragging/resizing performance (should be 60fps)
- [ ] Check bundle size with `npm run build` and analyze
- [ ] Lighthouse performance audit (target: 90+)

---

## Phase 3: Code Quality & Architecture (Priority: MEDIUM)
**Estimated Time**: 3-5 days
**Status**: ✅ COMPLETED

**Note**: Core quality improvements completed. App.jsx refactoring (3.1 - splitting into smaller components) deferred as optional enhancement for future iteration.

### 3.1 Split App.jsx into Smaller Components

**Current**: 532 lines - too large
**Target**: <200 lines per file

#### New File Structure
```
src/
  components/
    App/
      App.jsx (main orchestrator)
      SlideCanvas.jsx
      SlideSidebar.jsx
      ElementToolbar.jsx
      PropertiesPanel.jsx
  hooks/
    usePresentation.js
    useDragAndResize.js
    useKeyboardShortcuts.js
  contexts/
    PresentationContext.jsx
  utils/
    htmlGenerator.js
    debounce.js
```

---

#### Create SlideCanvas Component
**New File**: `presenta-react/src/components/App/SlideCanvas.jsx`

```javascript
import { useCallback } from 'react';
import ElementComponent from '../ElementComponent';
import LiveReactRenderer from '../LiveReactRenderer';

const SlideCanvas = ({
    canvasRef,
    currentSlide,
    selectedElementId,
    interactingElementId,
    librariesLoaded,
    getBackgroundStyle,
    handleMouseDown,
    handleResizeMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasMouseLeave,
    updateElement,
    setSelectedElementId,
    setInteractingElementId
}) => {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div
                ref={canvasRef}
                className="shadow-lg relative bg-cover bg-center"
                style={{ width: 960, height: 700, ...getBackgroundStyle(currentSlide?.background) }}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseLeave}
                onClick={() => { setSelectedElementId(null); setInteractingElementId(null); }}
            >
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {Object.values(librariesLoaded).every(Boolean) && currentSlide?.background?.reactComponent && (
                        <LiveReactRenderer
                            id={currentSlide.id}
                            component={currentSlide.background.reactComponent}
                        />
                    )}
                </div>
                {currentSlide?.elements.map(el => (
                    <ElementComponent
                        key={el.id}
                        element={el}
                        onMouseDown={handleMouseDown}
                        onResizeMouseDown={handleResizeMouseDown}
                        isSelected={selectedElementId === el.id}
                        updateElement={updateElement}
                        isInteracting={interactingElementId === el.id}
                        setInteractingElementId={setInteractingElementId}
                        librariesLoaded={librariesLoaded}
                    />
                ))}
            </div>
        </div>
    );
};

export default SlideCanvas;
```

---

#### Create SlideSidebar Component
**New File**: `presenta-react/src/components/App/SlideSidebar.jsx`

```javascript
import { ChevronUpIcon, ChevronDownIcon, CopyIcon, TrashIcon } from '../Icons';

const SlideSidebar = ({
    slides,
    currentSlideId,
    addSlide,
    deleteSlide,
    duplicateSlide,
    moveSlide,
    setCurrentSlideId,
    getBackgroundStyle
}) => {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
            <button onClick={addSlide} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-4">
                Add Slide
            </button>
            <div className="flex-1 overflow-y-auto space-y-2">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        onClick={() => setCurrentSlideId(slide.id)}
                        className={`relative group cursor-pointer border-2 rounded ${currentSlideId === slide.id ? 'border-blue-500' : 'border-transparent'}`}
                    >
                        <div className="absolute top-1 right-1 z-10 text-xs bg-gray-700 text-white rounded-full h-5 w-5 flex items-center justify-center">
                            {index + 1}
                        </div>
                        <div className="bg-gray-200 aspect-video rounded-sm overflow-hidden pointer-events-none" style={getBackgroundStyle(slide.background)}>
                            <div className="w-full h-full transform scale-[0.2] origin-top-left">
                                {slide.elements.map(el => {
                                    const style = {
                                        position: 'absolute',
                                        left: el.x,
                                        top: el.y,
                                        width: el.width,
                                        height: el.height,
                                        transform: `rotate(${el.rotation || 0}deg)`
                                    };
                                    if (el.type === 'text') return <div key={el.id} style={{ ...style, fontSize: el.fontSize, color: el.color, overflow: 'hidden' }}>{el.content}</div>
                                    if (el.type === 'shape') return <div key={el.id} style={{ ...style, backgroundColor: el.backgroundColor }}></div>
                                    if (el.type === 'image' || el.type === 'iframe') return <div key={el.id} style={{ ...style, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>MEDIA</div>
                                    return null;
                                })}
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:opacity-100 opacity-0 transition-opacity flex items-center justify-center gap-1">
                            <button title="Move Up" onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, -1) }} className="p-1 rounded-full bg-white/80 hover:bg-white text-gray-700"><ChevronUpIcon /></button>
                            <button title="Move Down" onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, 1) }} className="p-1 rounded-full bg-white/80 hover:bg-white text-gray-700"><ChevronDownIcon /></button>
                            <button title="Duplicate" onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id) }} className="p-1 rounded-full bg-white/80 hover:bg-white text-gray-700"><CopyIcon /></button>
                            <button title="Delete" onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id) }} className="p-1 rounded-full bg-white/80 hover:bg-white text-red-500"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default SlideSidebar;
```

---

#### Create Custom Hooks

**New File**: `presenta-react/src/hooks/usePresentation.js`

```javascript
import { useState, useCallback } from 'react';

export const usePresentation = (initialState) => {
    const [presentation, setPresentation] = useState(initialState);
    const [currentSlideId, setCurrentSlideId] = useState(initialState.slides[0].id);

    const updateElement = useCallback((elementId, updates) => {
        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide =>
                slide.id === currentSlideId
                    ? { ...slide, elements: slide.elements.map(el => el.id === elementId ? { ...el, ...updates } : el) }
                    : slide
            )
        }));
    }, [currentSlideId]);

    const addElement = useCallback((type, elementData) => {
        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide =>
                slide.id === currentSlideId ? { ...slide, elements: [...slide.elements, elementData] } : slide
            )
        }));
    }, [currentSlideId]);

    const deleteElement = useCallback((elementId) => {
        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide =>
                slide.id === currentSlideId
                    ? { ...slide, elements: slide.elements.filter(el => el.id !== elementId) }
                    : slide
            )
        }));
    }, [currentSlideId]);

    const addSlide = useCallback(() => {
        const newSlide = {
            id: crypto.randomUUID(),
            elements: [],
            background: { type: 'color', value: '#ffffff' }
        };
        setPresentation(prev => ({
            ...prev,
            slides: [...prev.slides, newSlide]
        }));
        setCurrentSlideId(newSlide.id);
    }, []);

    const deleteSlide = useCallback((slideId) => {
        setPresentation(prev => {
            if (prev.slides.length <= 1) return prev;
            const newSlides = prev.slides.filter(s => s.id !== slideId);
            if (currentSlideId === slideId) {
                setCurrentSlideId(newSlides[0].id);
            }
            return { ...prev, slides: newSlides };
        });
    }, [currentSlideId]);

    return {
        presentation,
        setPresentation,
        currentSlideId,
        setCurrentSlideId,
        updateElement,
        addElement,
        deleteElement,
        addSlide,
        deleteSlide
    };
};
```

---

**New File**: `presenta-react/src/hooks/useDragAndResize.js`

```javascript
import { useState, useCallback } from 'react';

export const useDragAndResize = (canvasRef, updateElement) => {
    const [dragging, setDragging] = useState(null);
    const [resizing, setResizing] = useState(null);

    const handleMouseDown = useCallback((e, element) => {
        e.stopPropagation();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        setDragging({
            element,
            offsetX: e.clientX - canvasRect.left - element.x,
            offsetY: e.clientY - canvasRect.top - element.y,
        });
    }, [canvasRef]);

    const handleResizeMouseDown = useCallback((e, element, handle) => {
        e.stopPropagation();
        setResizing({
            element,
            handle,
            initialMouseX: e.clientX,
            initialMouseY: e.clientY,
            initialX: element.x,
            initialY: element.y,
            initialWidth: element.width,
            initialHeight: element.height,
        });
    }, []);

    const handleMouseMove = useCallback((e) => {
        const canvasRect = canvasRef.current.getBoundingClientRect();

        if (dragging) {
            const newX = e.clientX - canvasRect.left - dragging.offsetX;
            const newY = e.clientY - canvasRect.top - dragging.offsetY;
            updateElement(dragging.element.id, { x: newX, y: newY });
        }

        if (resizing) {
            const dx = e.clientX - resizing.initialMouseX;
            const dy = e.clientY - resizing.initialMouseY;
            let { initialX, initialY, initialWidth, initialHeight } = resizing;
            let newX = initialX, newY = initialY, newWidth = initialWidth, newHeight = initialHeight;

            if (resizing.handle.includes('right')) newWidth = initialWidth + dx;
            if (resizing.handle.includes('left')) {
                newWidth = initialWidth - dx;
                newX = initialX + dx;
            }
            if (resizing.handle.includes('bottom')) newHeight = initialHeight + dy;
            if (resizing.handle.includes('top')) {
                newHeight = initialHeight - dy;
                newY = initialY + dy;
            }

            if (newWidth > 20 && newHeight > 20) {
                updateElement(resizing.element.id, { x: newX, y: newY, width: newWidth, height: newHeight });
            }
        }
    }, [dragging, resizing, updateElement, canvasRef]);

    const handleMouseUp = useCallback(() => {
        setDragging(null);
        setResizing(null);
    }, []);

    return {
        dragging,
        resizing,
        handleMouseDown,
        handleResizeMouseDown,
        handleMouseMove,
        handleMouseUp
    };
};
```

---

### 3.2 Add Accessibility Improvements

#### ARIA Labels for Icons
**File**: `presenta-react/src/components/Icons.jsx`

**Current**:
```javascript
const Icon = ({ children }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
```

**Fix**:
```javascript
const Icon = ({ children, label }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
    >
        {children}
    </svg>
);
```

---

#### Form Labels
Apply to all input fields across components:

**Pattern**:
```javascript
<div>
    <label htmlFor="unique-input-id" className="block text-sm font-medium mb-1">
        Label Text
    </label>
    <input
        id="unique-input-id"
        type="text"
        aria-describedby="unique-input-help"
        className="..."
    />
    <span id="unique-input-help" className="text-xs text-gray-500">
        Help text if needed
    </span>
</div>
```

---

#### Keyboard Navigation
Add keyboard shortcuts for common actions:

**New File**: `presenta-react/src/hooks/useKeyboardShortcuts.js`

```javascript
import { useEffect } from 'react';

export const useKeyboardShortcuts = (handlers) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if typing in input
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                return;
            }

            const { ctrlKey, metaKey, shiftKey, key } = e;
            const modifier = ctrlKey || metaKey;

            // Ctrl/Cmd + Z = Undo
            if (modifier && !shiftKey && key === 'z' && handlers.undo) {
                e.preventDefault();
                handlers.undo();
            }

            // Ctrl/Cmd + Shift + Z = Redo
            if (modifier && shiftKey && key === 'z' && handlers.redo) {
                e.preventDefault();
                handlers.redo();
            }

            // Ctrl/Cmd + C = Copy
            if (modifier && key === 'c' && handlers.copy) {
                e.preventDefault();
                handlers.copy();
            }

            // Ctrl/Cmd + V = Paste
            if (modifier && key === 'v' && handlers.paste) {
                e.preventDefault();
                handlers.paste();
            }

            // Ctrl/Cmd + D = Duplicate
            if (modifier && key === 'd' && handlers.duplicate) {
                e.preventDefault();
                handlers.duplicate();
            }

            // Ctrl/Cmd + S = Save
            if (modifier && key === 's' && handlers.save) {
                e.preventDefault();
                handlers.save();
            }

            // Delete/Backspace = Delete element
            if ((key === 'Delete' || key === 'Backspace') && handlers.delete) {
                e.preventDefault();
                handlers.delete();
            }

            // Arrow keys = Move element
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key) && handlers.move) {
                e.preventDefault();
                const direction = key.replace('Arrow', '').toLowerCase();
                const step = shiftKey ? 10 : 1;
                handlers.move(direction, step);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
};
```

---

### 3.3 Add Error Boundaries

**New File**: `presenta-react/src/components/ErrorBoundary.jsx`

```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <h2 className="text-lg font-bold text-red-800 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-red-600 mb-2">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
```

**Usage in App.jsx**:
```javascript
<ErrorBoundary>
    <LiveReactRenderer ... />
</ErrorBoundary>
```

---

### 3.4 Add PropTypes or TypeScript

#### Option 1: Add PropTypes (Quick)
```bash
npm install prop-types
```

**Example for ElementComponent.jsx**:
```javascript
import PropTypes from 'prop-types';

ElementComponent.propTypes = {
    element: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['text', 'shape', 'image', 'iframe']).isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        rotation: PropTypes.number,
    }).isRequired,
    onMouseDown: PropTypes.func.isRequired,
    onResizeMouseDown: PropTypes.func.isRequired,
    isSelected: PropTypes.bool.isRequired,
    updateElement: PropTypes.func.isRequired,
    isInteracting: PropTypes.bool.isRequired,
    setInteractingElementId: PropTypes.func.isRequired,
    librariesLoaded: PropTypes.object.isRequired,
};
```

---

#### Option 2: Migrate to TypeScript (Better Long-term)
**Steps**:
1. Rename `.jsx` to `.tsx` incrementally
2. Add type definitions
3. Configure `tsconfig.json`
4. Update build config

**Not recommended for Phase 3** - Too time-consuming. Better as separate initiative.

---

### 3.5 Code Quality Verification

- [ ] All files under 300 lines
- [ ] All props have PropTypes or TypeScript types
- [ ] All inputs have proper labels and ARIA attributes
- [ ] Error boundaries wrap dynamic content
- [ ] Keyboard shortcuts working
- [ ] No ESLint warnings
- [ ] Code follows consistent patterns

---

## Phase 4: UI/UX Modernization (Priority: HIGH)
**Estimated Time**: 3-5 days
**Status**: ✅ COMPLETED

### 4.1 Current UI Issues (Based on Screenshot Analysis)

**Problems Identified**:
1. Very basic, unstyled appearance - looks like early development phase
2. No visual hierarchy or modern design language
3. Plain white background with minimal contrast
4. Basic form controls without styling enhancements
5. No loading states, animations, or micro-interactions
6. Missing modern UI patterns (cards, shadows, gradients)
7. No dark mode support
8. Generic button styles
9. Toolbar lacks visual appeal and organization
10. Properties panel needs better information architecture

---

### 4.2 Design System Implementation

#### Create Design Tokens
**New File**: `presenta-react/src/styles/tokens.css`

```css
:root {
  /* Brand Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Accent Colors */
  --color-accent-50: #f0fdf4;
  --color-accent-100: #dcfce7;
  --color-accent-500: #22c55e;
  --color-accent-600: #16a34a;

  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* Semantic Colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-index Scale */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* Dark Mode Tokens */
[data-theme="dark"] {
  --color-bg-primary: var(--color-gray-900);
  --color-bg-secondary: var(--color-gray-800);
  --color-bg-tertiary: var(--color-gray-700);
  --color-text-primary: var(--color-gray-50);
  --color-text-secondary: var(--color-gray-300);
  --color-border: var(--color-gray-700);
}

/* Light Mode Tokens (Default) */
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: var(--color-gray-50);
  --color-bg-tertiary: var(--color-gray-100);
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-border: var(--color-gray-200);
}
```

---

#### Enhanced Header Component
**File**: `presenta-react/src/components/App/Header.jsx`

```jsx
import { useState } from 'react';
import { MoonIcon, SunIcon, DownloadIcon, SettingsIcon, HelpCircleIcon } from '../Icons';

const Header = ({ presentation, setPresentation, generateHTML, onOpenSettings }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.setAttribute('data-theme', !isDark ? 'dark' : 'light');
    };

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-lg bg-white/80 dark:bg-gray-900/80">
            <div className="px-6 py-3 flex justify-between items-center">
                {/* Left: Logo & Title */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="9" y1="9" x2="15" y2="9" />
                                <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                SlideWinder
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Presentation Builder</p>
                        </div>
                    </div>

                    {/* Presentation Title - Editable */}
                    <div className="ml-6 pl-6 border-l border-gray-200 dark:border-gray-700">
                        <input
                            type="text"
                            value={presentation.title}
                            onChange={(e) => setPresentation(p => ({ ...p, title: e.target.value }))}
                            className="text-sm font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 min-w-[200px]"
                            placeholder="Untitled Presentation"
                        />
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-3">
                    {/* Theme Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Theme
                        </label>
                        <select
                            value={presentation.theme}
                            onChange={(e) => setPresentation(p => ({ ...p, theme: e.target.value }))}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                            {REVEAL_THEMES.map(theme => (
                                <option key={theme} value={theme}>
                                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

                    {/* Action Buttons */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Toggle Dark Mode"
                    >
                        {isDark ? <SunIcon /> : <MoonIcon />}
                    </button>

                    <button
                        onClick={onOpenSettings}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Settings"
                    >
                        <SettingsIcon />
                    </button>

                    <button
                        onClick={generateHTML}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
```

---

#### Modern Sidebar Design
**File**: `presenta-react/src/components/App/ModernSlideSidebar.jsx`

```jsx
import { PlusIcon, ChevronUpIcon, ChevronDownIcon, CopyIcon, TrashIcon } from '../Icons';

const ModernSlideSidebar = ({
    slides,
    currentSlideId,
    addSlide,
    deleteSlide,
    duplicateSlide,
    moveSlide,
    setCurrentSlideId,
    getBackgroundStyle
}) => {
    return (
        <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={addSlide}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-102"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Slide</span>
                </button>
            </div>

            {/* Slides List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        onClick={() => setCurrentSlideId(slide.id)}
                        className={`
                            relative group cursor-pointer rounded-xl transition-all duration-200
                            ${currentSlideId === slide.id
                                ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                                : 'hover:shadow-md hover:scale-102'
                            }
                        `}
                    >
                        {/* Slide Number Badge */}
                        <div className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                            {index + 1}
                        </div>

                        {/* Slide Thumbnail */}
                        <div
                            className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                            style={getBackgroundStyle(slide.background)}
                        >
                            <div className="w-full h-full transform scale-[0.2] origin-top-left">
                                {slide.elements.map(el => {
                                    const style = {
                                        position: 'absolute',
                                        left: el.x,
                                        top: el.y,
                                        width: el.width,
                                        height: el.height,
                                        transform: `rotate(${el.rotation || 0}deg)`
                                    };
                                    if (el.type === 'text') return <div key={el.id} style={{ ...style, fontSize: el.fontSize, color: el.color, overflow: 'hidden' }}>{el.content}</div>
                                    if (el.type === 'shape') return <div key={el.id} style={{ ...style, backgroundColor: el.backgroundColor }}></div>
                                    if (el.type === 'image' || el.type === 'iframe') return <div key={el.id} style={{ ...style, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>MEDIA</div>
                                    return null;
                                })}
                            </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end justify-center gap-1 p-3">
                            <button
                                title="Move Up"
                                onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, -1) }}
                                className="p-2 rounded-lg bg-white/90 hover:bg-white text-gray-700 shadow-md transition-all hover:scale-110"
                            >
                                <ChevronUpIcon />
                            </button>
                            <button
                                title="Move Down"
                                onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, 1) }}
                                className="p-2 rounded-lg bg-white/90 hover:bg-white text-gray-700 shadow-md transition-all hover:scale-110"
                            >
                                <ChevronDownIcon />
                            </button>
                            <button
                                title="Duplicate"
                                onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id) }}
                                className="p-2 rounded-lg bg-white/90 hover:bg-white text-gray-700 shadow-md transition-all hover:scale-110"
                            >
                                <CopyIcon />
                            </button>
                            <button
                                title="Delete"
                                onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id) }}
                                className="p-2 rounded-lg bg-red-500/90 hover:bg-red-600 text-white shadow-md transition-all hover:scale-110"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Stats */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{slides.length}</span> slide{slides.length !== 1 ? 's' : ''}
                </div>
            </div>
        </aside>
    );
};

export default ModernSlideSidebar;
```

---

#### Enhanced Toolbar with Icons & Groups
**File**: `presenta-react/src/components/App/ModernToolbar.jsx`

```jsx
import { TypeIcon, SquareIcon, ImageIcon, CodeIcon, LayersIcon } from '../Icons';

const ToolButton = ({ icon: Icon, label, onClick, variant = 'default' }) => {
    const baseClasses = "flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105";
    const variants = {
        default: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md",
        primary: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg"
    };

    return (
        <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
        </button>
    );
};

const ToolGroup = ({ title, children }) => (
    <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
            {title}
        </span>
        <div className="flex gap-2">
            {children}
        </div>
    </div>
);

const ModernToolbar = ({ addElement, settings, updateSettings }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <div className="flex items-start justify-between gap-8">
                {/* Elements Tools */}
                <ToolGroup title="Add Elements">
                    <ToolButton icon={TypeIcon} label="Text" onClick={() => addElement('text')} />
                    <ToolButton icon={SquareIcon} label="Shape" onClick={() => addElement('shape')} />
                    <ToolButton icon={ImageIcon} label="Image" onClick={() => addElement('image')} />
                    <ToolButton icon={CodeIcon} label="HTML" onClick={() => addElement('iframe')} />
                </ToolGroup>

                {/* Divider */}
                <div className="h-full w-px bg-gray-200 dark:bg-gray-700" />

                {/* Presentation Settings - Inline */}
                <div className="flex-1 flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-3">
                        <LayersIcon className="w-5 h-5 text-gray-500" />
                        <select
                            value={settings.transition}
                            onChange={e => updateSettings({ transition: e.target.value })}
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="none">No Transition</option>
                            <option value="fade">Fade</option>
                            <option value="slide">Slide</option>
                            <option value="convex">Convex</option>
                            <option value="concave">Concave</option>
                            <option value="zoom">Zoom</option>
                        </select>
                    </div>

                    {/* Quick Toggles */}
                    <div className="flex items-center gap-2">
                        <ToggleSwitch
                            checked={settings.controls}
                            onChange={() => updateSettings({ controls: !settings.controls })}
                            label="Controls"
                        />
                        <ToggleSwitch
                            checked={settings.progress}
                            onChange={() => updateSettings({ progress: !settings.progress })}
                            label="Progress"
                        />
                        <ToggleSwitch
                            checked={settings.center}
                            onChange={() => updateSettings({ center: !settings.center })}
                            label="Center"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToggleSwitch = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
        <div className={`
            relative w-11 h-6 rounded-full transition-colors duration-200
            ${checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
        `}>
            <div className={`
                absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
                transition-transform duration-200 transform
                ${checked ? 'translate-x-5' : 'translate-x-0'}
            `} />
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
            {label}
        </span>
    </label>
);

export default ModernToolbar;
```

---

#### Modern Properties Panel
**File**: `presenta-react/src/components/App/ModernPropertiesPanel.jsx`

```jsx
const PropertySection = ({ title, children, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
            {Icon && <Icon className="w-5 h-5 text-blue-500" />}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const PropertyInput = ({ label, type = "text", value, onChange, min, max, step, unit }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
        </label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                step={step}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    {unit}
                </span>
            )}
        </div>
    </div>
);

const ModernPropertiesPanel = ({ selectedElement, currentSlide, updateElement, updateSlideSettings, deleteElement }) => {
    if (!selectedElement && !currentSlide) return null;

    return (
        <aside className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {selectedElement ? 'Element Properties' : 'Slide Properties'}
                    </h2>
                    {selectedElement && (
                        <button
                            onClick={deleteElement}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {selectedElement ? (
                    <>
                        <PropertySection title="Position & Size" icon={MoveIcon}>
                            <div className="grid grid-cols-2 gap-3">
                                <PropertyInput
                                    label="X"
                                    type="number"
                                    value={Math.round(selectedElement.x)}
                                    onChange={e => updateElement(selectedElement.id, { x: +e.target.value })}
                                    unit="px"
                                />
                                <PropertyInput
                                    label="Y"
                                    type="number"
                                    value={Math.round(selectedElement.y)}
                                    onChange={e => updateElement(selectedElement.id, { y: +e.target.value })}
                                    unit="px"
                                />
                                <PropertyInput
                                    label="Width"
                                    type="number"
                                    value={Math.round(selectedElement.width)}
                                    onChange={e => updateElement(selectedElement.id, { width: +e.target.value })}
                                    min="10"
                                    unit="px"
                                />
                                <PropertyInput
                                    label="Height"
                                    type="number"
                                    value={Math.round(selectedElement.height)}
                                    onChange={e => updateElement(selectedElement.id, { height: +e.target.value })}
                                    min="10"
                                    unit="px"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Rotation: {selectedElement.rotation || 0}°
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={selectedElement.rotation || 0}
                                    onChange={e => updateElement(selectedElement.id, { rotation: +e.target.value })}
                                    className="w-full accent-blue-500"
                                />
                            </div>
                        </PropertySection>

                        {selectedElement.type === 'text' && (
                            <PropertySection title="Text Style" icon={TypeIcon}>
                                <PropertyInput
                                    label="Font Size"
                                    type="number"
                                    value={selectedElement.fontSize}
                                    onChange={e => updateElement(selectedElement.id, { fontSize: +e.target.value })}
                                    unit="px"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Color
                                    </label>
                                    <input
                                        type="color"
                                        value={selectedElement.color}
                                        onChange={e => updateElement(selectedElement.id, { color: e.target.value })}
                                        className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                                    />
                                </div>
                            </PropertySection>
                        )}
                    </>
                ) : (
                    <PropertySection title="Slide Background" icon={PaletteIcon}>
                        {/* Slide properties */}
                    </PropertySection>
                )}
            </div>
        </aside>
    );
};

export default ModernPropertiesPanel;
```

---

### 4.3 Animations & Micro-interactions

#### Add Framer Motion
```bash
npm install framer-motion
```

#### Animated Components
**File**: `presenta-react/src/components/Animated/AnimatedButton.jsx`

```jsx
import { motion } from 'framer-motion';

const AnimatedButton = ({ children, onClick, variant = 'primary', ...props }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default AnimatedButton;
```

**Slide Transitions**:
```jsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
    <motion.div
        key={currentSlideId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
    >
        {/* Slide content */}
    </motion.div>
</AnimatePresence>
```

---

### 4.4 Loading States & Feedback

#### Loading Spinner Component
**File**: `presenta-react/src/components/UI/LoadingSpinner.jsx`

```jsx
const LoadingSpinner = ({ size = 'md', text }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
            {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
```

#### Toast Notifications
```bash
npm install react-hot-toast
```

**Usage**:
```jsx
import toast from 'react-hot-toast';

// Success
toast.success('Slide added successfully!');

// Error
toast.error('Failed to export presentation');

// Loading
const loading = toast.loading('Exporting...');
// ... do work
toast.dismiss(loading);
toast.success('Export complete!');
```

---

### 4.5 Additional Icon Components

**File**: `presenta-react/src/components/Icons.jsx` (additions)

```jsx
export const MoonIcon = () => <Icon><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Icon>;
export const SunIcon = () => <Icon><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></Icon>;
export const DownloadIcon = () => <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Icon>;
export const SettingsIcon = () => <Icon><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/></Icon>;
export const PlusIcon = () => <Icon><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
export const MoveIcon = () => <Icon><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></Icon>;
export const PaletteIcon = () => <Icon><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></Icon>;
export const HelpCircleIcon = () => <Icon><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>;
```

---

### 4.6 Responsive Design Improvements

#### Add Media Query Hooks
**File**: `presenta-react/src/hooks/useMediaQuery.js`

```jsx
import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        media.addListener(listener);

        return () => media.removeListener(listener);
    }, [matches, query]);

    return matches;
};

// Utility hooks
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
```

---

### 4.7 Empty States & Placeholders

**File**: `presenta-react/src/components/UI/EmptyState.jsx`

```jsx
const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
            {description}
        </p>
        {action}
    </div>
);

export default EmptyState;
```

---

### 4.8 UI Enhancement Checklist

- [ ] Implement design tokens (CSS custom properties)
- [ ] Create modern header with gradient logo
- [ ] Redesign sidebar with better visual hierarchy
- [ ] Enhanced toolbar with grouped actions
- [ ] Modern properties panel with sections
- [ ] Add Framer Motion animations
- [ ] Implement toast notifications
- [ ] Create loading states for async operations
- [ ] Add dark mode support
- [ ] Implement empty states
- [ ] Add new icons (Moon, Sun, Download, etc.)
- [ ] Responsive design improvements
- [ ] Smooth transitions between slides
- [ ] Hover effects on interactive elements
- [ ] Focus states for accessibility

---

## Phase 5: Feature Enhancements (Priority: LOW-MEDIUM)
**Estimated Time**: Ongoing
**Status**: Pending

### 4.1 Undo/Redo System

**New File**: `presenta-react/src/hooks/useHistory.js`

```javascript
import { useState, useCallback } from 'react';

export const useHistory = (initialState, maxHistory = 50) => {
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const pushState = useCallback((newState) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, currentIndex + 1);
            newHistory.push(newState);
            // Limit history size
            if (newHistory.length > maxHistory) {
                newHistory.shift();
                return newHistory;
            }
            return newHistory;
        });
        setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
    }, [currentIndex, maxHistory]);

    const undo = useCallback(() => {
        if (canUndo) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [canUndo]);

    const redo = useCallback(() => {
        if (canRedo) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [canRedo]);

    const currentState = history[currentIndex];

    return {
        state: currentState,
        pushState,
        undo,
        redo,
        canUndo,
        canRedo
    };
};
```

**Integration in App.jsx**:
```javascript
const { state: presentation, pushState, undo, redo, canUndo, canRedo } = useHistory(initialPresentation);

// Update setPresentation calls to use pushState
const updatePresentation = (newState) => {
    pushState(newState);
};
```

---

### 4.2 LocalStorage Autosave

**New File**: `presenta-react/src/hooks/useLocalStorage.js`

```javascript
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue, autoSaveDelay = 2000) => {
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return initialValue;
        }
    });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        }, autoSaveDelay);

        return () => clearTimeout(timeoutId);
    }, [key, value, autoSaveDelay]);

    return [value, setValue];
};
```

**Usage**:
```javascript
const [presentation, setPresentation] = useLocalStorage('presenta-presentation', initialState);
```

---

### 4.3 Enhanced Export Options

#### Add PDF Export
```bash
npm install jspdf html2canvas
```

**New File**: `presenta-react/src/utils/exporters.js`

```javascript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (slides, onProgress) => {
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [960, 700]
    });

    for (let i = 0; i < slides.length; i++) {
        onProgress?.(i, slides.length);

        // Render slide to canvas
        const slideElement = document.getElementById(`slide-${slides[i].id}`);
        const canvas = await html2canvas(slideElement);
        const imgData = canvas.toDataURL('image/png');

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, 960, 700);
    }

    pdf.save('presentation.pdf');
};

export const exportToImages = async (slides, format = 'png', onProgress) => {
    const images = [];

    for (let i = 0; i < slides.length; i++) {
        onProgress?.(i, slides.length);

        const slideElement = document.getElementById(`slide-${slides[i].id}`);
        const canvas = await html2canvas(slideElement);
        const imgData = canvas.toDataURL(`image/${format}`);

        // Download image
        const link = document.createElement('a');
        link.download = `slide-${i + 1}.${format}`;
        link.href = imgData;
        link.click();

        images.push(imgData);
    }

    return images;
};
```

---

### 4.4 Import Functionality

**New File**: `presenta-react/src/utils/importers.js`

```javascript
export const importFromJSON = (jsonString) => {
    try {
        const presentation = JSON.parse(jsonString);
        // Validate structure
        if (!presentation.slides || !Array.isArray(presentation.slides)) {
            throw new Error('Invalid presentation format');
        }
        return presentation;
    } catch (error) {
        throw new Error(`Import failed: ${error.message}`);
    }
};

export const importFromHTML = (htmlString) => {
    // Parse HTML and extract presentation data
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const slides = [];
    const sections = doc.querySelectorAll('.slides > section');

    sections.forEach(section => {
        // Extract slide data from HTML
        const slide = {
            id: crypto.randomUUID(),
            elements: [],
            background: extractBackground(section)
        };
        slides.push(slide);
    });

    return { slides };
};

function extractBackground(section) {
    const bgColor = section.getAttribute('data-background-color');
    const bgImage = section.getAttribute('data-background-image');

    if (bgColor) return { type: 'color', value: bgColor };
    if (bgImage) return { type: 'image', value: bgImage };
    return { type: 'color', value: '#ffffff' };
}
```

---

### 4.5 Additional Features

#### Snap to Grid
```javascript
const snapToGrid = (value, gridSize = 10) => {
    return Math.round(value / gridSize) * gridSize;
};

// In drag handler
const newX = snapToGrid(e.clientX - canvasRect.left - dragging.offsetX);
const newY = snapToGrid(e.clientY - canvasRect.top - dragging.offsetY);
```

---

#### Multi-select
```javascript
const [selectedElementIds, setSelectedElementIds] = useState([]);

// Ctrl+Click to add to selection
const handleElementClick = (e, elementId) => {
    if (e.ctrlKey || e.metaKey) {
        setSelectedElementIds(prev =>
            prev.includes(elementId)
                ? prev.filter(id => id !== elementId)
                : [...prev, elementId]
        );
    } else {
        setSelectedElementIds([elementId]);
    }
};
```

---

#### Alignment Tools
```javascript
export const alignElements = (elements, alignment) => {
    switch (alignment) {
        case 'left':
            const leftMost = Math.min(...elements.map(el => el.x));
            return elements.map(el => ({ ...el, x: leftMost }));

        case 'center':
            const centerX = elements.reduce((sum, el) => sum + el.x + el.width / 2, 0) / elements.length;
            return elements.map(el => ({ ...el, x: centerX - el.width / 2 }));

        case 'right':
            const rightMost = Math.max(...elements.map(el => el.x + el.width));
            return elements.map(el => ({ ...el, x: rightMost - el.width }));

        // Add top, middle, bottom alignments
        default:
            return elements;
    }
};
```

---

#### Templates System
```javascript
const templates = [
    {
        id: 'blank',
        name: 'Blank',
        thumbnail: '/templates/blank.png',
        slides: [{ id: crypto.randomUUID(), elements: [], background: { type: 'color', value: '#ffffff' } }]
    },
    {
        id: 'pitch-deck',
        name: 'Pitch Deck',
        thumbnail: '/templates/pitch.png',
        slides: [
            // Pre-configured slides with layouts
        ]
    }
];

const createFromTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    return {
        ...template,
        title: 'Untitled Presentation',
        theme: 'black',
        settings: defaultSettings
    };
};
```

---

### 4.6 Feature Verification

- [ ] Undo/Redo working across all actions
- [ ] Autosave preventing data loss
- [ ] PDF export producing quality output
- [ ] Image export in multiple formats
- [ ] Import functionality handling edge cases
- [ ] Snap to grid improving alignment
- [ ] Multi-select enabling bulk operations
- [ ] Templates providing quick starts

---

## Phase 5: Testing & Documentation (Priority: MEDIUM)
**Estimated Time**: 3-5 days
**Status**: Pending

### 5.1 Unit Tests Setup

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Add to package.json**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Create vitest.config.js**:
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

---

### 5.2 Test Examples

**File**: `presenta-react/src/components/__tests__/ElementComponent.test.jsx`

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ElementComponent from '../ElementComponent';

describe('ElementComponent', () => {
    const mockElement = {
        id: '1',
        type: 'text',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        content: 'Test Text',
        fontSize: 24,
        color: '#000000',
        rotation: 0
    };

    it('renders text element correctly', () => {
        render(
            <ElementComponent
                element={mockElement}
                onMouseDown={vi.fn()}
                onResizeMouseDown={vi.fn()}
                isSelected={false}
                updateElement={vi.fn()}
                isInteracting={false}
                setInteractingElementId={vi.fn()}
                librariesLoaded={{ babel: true, three: true }}
            />
        );

        expect(screen.getByText('Test Text')).toBeInTheDocument();
    });

    it('calls onMouseDown when clicked', () => {
        const handleMouseDown = vi.fn();
        render(
            <ElementComponent
                element={mockElement}
                onMouseDown={handleMouseDown}
                onResizeMouseDown={vi.fn()}
                isSelected={false}
                updateElement={vi.fn()}
                isInteracting={false}
                setInteractingElementId={vi.fn()}
                librariesLoaded={{ babel: true, three: true }}
            />
        );

        const element = screen.getByText('Test Text').parentElement;
        fireEvent.mouseDown(element);

        expect(handleMouseDown).toHaveBeenCalled();
    });

    it('shows resize handles when selected', () => {
        const { container } = render(
            <ElementComponent
                element={mockElement}
                onMouseDown={vi.fn()}
                onResizeMouseDown={vi.fn()}
                isSelected={true}
                updateElement={vi.fn()}
                isInteracting={false}
                setInteractingElementId={vi.fn()}
                librariesLoaded={{ babel: true, three: true }}
            />
        );

        const resizeHandles = container.querySelectorAll('[style*="resize"]');
        expect(resizeHandles.length).toBe(4);
    });
});
```

---

### 5.3 Integration Tests

**File**: `presenta-react/src/__tests__/App.integration.test.jsx`

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App Integration', () => {
    it('adds a new slide', async () => {
        render(<App />);

        const addButton = screen.getByText('Add Slide');
        fireEvent.click(addButton);

        await waitFor(() => {
            const slideNumbers = screen.getAllByText(/\d+/);
            expect(slideNumbers).toHaveLength(2);
        });
    });

    it('adds and deletes an element', async () => {
        render(<App />);

        const textButton = screen.getByText('Text');
        fireEvent.click(textButton);

        await waitFor(() => {
            expect(screen.getByText('New Text')).toBeInTheDocument();
        });

        const deleteButton = screen.getByText('Delete Element');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('New Text')).not.toBeInTheDocument();
        });
    });

    it('changes presentation theme', async () => {
        render(<App />);

        const themeSelect = screen.getByLabelText(/theme/i);
        await userEvent.selectOptions(themeSelect, 'night');

        expect(themeSelect.value).toBe('night');
    });
});
```

---

### 5.4 E2E Tests

Consider Playwright or Cypress for E2E testing:

```bash
npm install --save-dev @playwright/test
```

**File**: `presenta-react/e2e/presentation.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test('create presentation workflow', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Add a slide
    await page.click('text=Add Slide');
    await expect(page.locator('.slide-thumbnail')).toHaveCount(2);

    // Add text element
    await page.click('text=Text');
    await expect(page.locator('text=New Text')).toBeVisible();

    // Edit text
    await page.click('text=New Text');
    await page.fill('input[type="text"]', 'Hello World');

    // Export
    await page.click('text=Export to reveal.js');

    // Verify download
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toBe('presentation.html');
});
```

---

### 5.5 Documentation

#### README.md Update
**File**: `presenta-react/README.md`

```markdown
# Presenta-React

A modern, React-based presentation builder that generates Reveal.js presentations with advanced features including drag-and-drop elements, custom React components, and Three.js integration.

## Features

- Drag-and-drop slide editor
- Multiple element types (text, shapes, images, HTML embeds)
- Custom React component support
- Three.js and WebGL integration
- Export to standalone HTML
- Multiple themes and transitions
- Undo/Redo support
- Keyboard shortcuts
- Auto-save functionality

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Building

```bash
npm run build
```

## Testing

```bash
npm test
npm run test:coverage
```

## Usage

### Creating a Presentation

1. Click "Add Slide" to create new slides
2. Use the toolbar to add elements (Text, Shape, Image, HTML Embed)
3. Drag elements to position them
4. Resize using corner handles
5. Edit properties in the right panel

### Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Ctrl/Cmd + C` - Copy element
- `Ctrl/Cmd + V` - Paste element
- `Ctrl/Cmd + D` - Duplicate element
- `Delete/Backspace` - Delete element
- `Arrow Keys` - Move element (hold Shift for 10px steps)

### Custom React Components

1. Select an element or slide background
2. Click "Add React Component"
3. Write your React component code (must have default export)
4. Provide props as JSON
5. Add custom CSS if needed

### Exporting

Click "Export to reveal.js" to download a standalone HTML presentation.

## Architecture

```
src/
  components/      # React components
  hooks/          # Custom React hooks
  utils/          # Utility functions
  contexts/       # React contexts
```

## Security Considerations

- Custom React components execute arbitrary code
- Only use trusted code sources
- In production, implement sandboxing or code review

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT
```

---

#### API Documentation
**File**: `presenta-react/docs/API.md`

```markdown
# API Documentation

## Hooks

### usePresentation(initialState)
Manages presentation state including slides and elements.

**Parameters:**
- `initialState` (Object): Initial presentation configuration

**Returns:**
- `presentation` (Object): Current presentation state
- `updateElement(id, updates)` (Function): Update an element
- `addElement(type, data)` (Function): Add new element
- `deleteElement(id)` (Function): Remove element
- `addSlide()` (Function): Add new slide
- `deleteSlide(id)` (Function): Remove slide

### useDragAndResize(canvasRef, updateElement)
Handles drag and resize interactions for elements.

**Parameters:**
- `canvasRef` (React.Ref): Reference to canvas container
- `updateElement` (Function): Function to update element position/size

**Returns:**
- `dragging` (Object|null): Current drag state
- `resizing` (Object|null): Current resize state
- `handleMouseDown(e, element)` (Function): Start drag
- `handleResizeMouseDown(e, element, handle)` (Function): Start resize
- `handleMouseMove(e)` (Function): Handle mouse movement
- `handleMouseUp()` (Function): End interaction

### useHistory(initialState, maxHistory)
Implements undo/redo functionality.

**Parameters:**
- `initialState` (any): Initial state
- `maxHistory` (number): Maximum history entries (default: 50)

**Returns:**
- `state` (any): Current state
- `pushState(newState)` (Function): Add state to history
- `undo()` (Function): Undo last change
- `redo()` (Function): Redo undone change
- `canUndo` (boolean): Whether undo is available
- `canRedo` (boolean): Whether redo is available

## Components

### ElementComponent
Renders a single presentation element with interactions.

**Props:**
- `element` (Object): Element data
- `onMouseDown` (Function): Mouse down handler
- `onResizeMouseDown` (Function): Resize handler
- `isSelected` (boolean): Selection state
- `updateElement` (Function): Update function
- `isInteracting` (boolean): Interaction state
- `setInteractingElementId` (Function): Set interaction state
- `librariesLoaded` (Object): Library loading states

### SlideProperties
Properties panel for slide settings.

**Props:**
- `currentSlide` (Object): Current slide data
- `updateSlideSettings` (Function): Update function

### ElementProperties
Properties panel for element settings.

**Props:**
- `selectedElement` (Object): Selected element data
- `updateElement` (Function): Update function
- `deleteElement` (Function): Delete function

## Utilities

### generateHTML(presentation)
Generates standalone HTML from presentation.

**Parameters:**
- `presentation` (Object): Presentation data

**Returns:**
- (string): HTML content

### exportToPDF(slides, onProgress)
Exports presentation to PDF.

**Parameters:**
- `slides` (Array): Slide data
- `onProgress` (Function): Progress callback

**Returns:**
- (Promise): Resolves when complete
```

---

### 5.6 Testing Verification

- [ ] Unit test coverage > 70%
- [ ] All critical paths covered by integration tests
- [ ] E2E tests passing for main workflows
- [ ] Documentation complete and accurate
- [ ] Examples provided for common use cases

---

## Deployment Checklist

### Pre-Deployment
- [ ] All Phase 1 critical fixes applied
- [ ] ESLint shows 0 errors
- [ ] All tests passing
- [ ] Performance audit > 90
- [ ] Accessibility audit > 90
- [ ] Security vulnerabilities addressed
- [ ] Documentation complete

### Build Optimization
- [ ] Production build optimized
- [ ] Bundle size < 1MB (gzipped)
- [ ] Code splitting implemented
- [ ] Assets optimized (images compressed)
- [ ] Source maps generated for debugging
- [ ] Environment variables configured

### Deployment
- [ ] Deploy to staging environment
- [ ] Smoke tests on staging
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Set up analytics
- [ ] Configure CDN if needed

---

## Maintenance Plan

### Weekly
- Review error logs
- Monitor performance metrics
- Update dependencies (minor versions)
- Review user feedback

### Monthly
- Security audit
- Performance review
- Update dependencies (major versions)
- Review and update documentation
- Plan new features

### Quarterly
- Comprehensive testing
- Major feature releases
- Architecture review
- Code refactoring as needed

---

## Success Metrics

| Metric | Current | Target | Phase |
|--------|---------|--------|-------|
| Security Issues | 3 | 0 | 1 |
| ESLint Errors | 3 | 0 | 1 |
| Bundle Size | ~2MB | <1MB | 2 |
| Lighthouse Performance | Unknown | >90 | 2 |
| Code Coverage | 0% | >70% | 5 |
| Accessibility Score | ~60 | >90 | 3 |
| User Satisfaction | N/A | >4.5/5 | Post-launch |

---

## Timeline Summary

| Phase | Duration | Priority | Status |
|-------|----------|----------|--------|
| Phase 1: Critical Fixes | 1-2 days | HIGH | Pending |
| Phase 2: Performance | 2-3 days | MEDIUM-HIGH | Pending |
| Phase 3: Code Quality | 3-5 days | MEDIUM | Pending |
| Phase 4: UI/UX Modernization | 3-5 days | HIGH | Pending |
| Phase 5: Features | Ongoing | LOW-MEDIUM | Pending |
| Phase 6: Testing | 3-5 days | MEDIUM | Pending |

**Total Estimated Time**: 3-4 weeks for Phases 1-4, then ongoing for Phase 5

---

## Next Steps

1. Review and approve this implementation plan
2. Set up project tracking (GitHub Issues, Jira, etc.)
3. Create git branch: `feature/optimization-phase-1`
4. Begin Phase 1 implementation
5. Code review after each phase
6. Deploy to staging after Phase 3
7. Production deployment after Phase 5

---

**Document Version**: 1.0
**Last Updated**: 2025-10-15
**Maintained By**: Development Team
