# React Component Performance System

## Overview
SlideWinder now includes a comprehensive performance monitoring and optimization system for React components to prevent performance degradation when multiple components are added to presentations.

## Features Implemented

### 1. Performance Monitoring Hook (`useComponentPerformance`)
**Location**: `presenta-react/src/hooks/useComponentPerformance.js`

**What it does:**
- Tracks total React components across all slides
- Tracks React components on the current slide
- Calculates estimated performance impact (low/medium/high/critical)
- Measures render time
- Determines when to show warnings

**Thresholds:**
- **Low**: 0-2 components per slide (no warning)
- **Medium**: 3-5 components per slide (no warning, but tracked)
- **High**: 6-9 components per slide (⚠️ warning shown)
- **Critical**: 10+ components per slide (🚨 critical warning shown)
- **Total deck warning**: 20+ components across entire deck

### 2. Lazy Loading Component (`LazyComponent`)
**Location**: `presenta-react/src/components/LazyComponent.jsx`

**What it does:**
- Uses Intersection Observer API to detect when components enter viewport
- Only renders React components when visible on screen
- Shows loading placeholder until component is visible
- Maintains component state after initial render

**Benefits:**
- Reduces initial page load time
- Prevents rendering off-screen components
- Improves browser responsiveness
- Falls back gracefully on older browsers

**Usage:**
```jsx
import LazyComponent from './components/LazyComponent';

<LazyComponent threshold={0.1} rootMargin="50px">
  <LiveReactRenderer id={element.id} component={element.reactComponent} />
</LazyComponent>
```

### 3. Performance Warning Banner (`PerformanceWarning`)
**Location**: `presenta-react/src/components/PerformanceWarning.jsx`

**What it does:**
- Displays a dismissible warning banner when performance thresholds are exceeded
- Color-coded by severity (orange for high, red for critical)
- Shows helpful tips to reduce component count
- Auto-positions at top center of screen

**Warning Levels:**
- **High** (Orange): 6-9 components - "Performance may degrade"
- **Critical** (Red): 10+ components - "Significant lag expected"

### 4. Performance Metrics Tracking
**Location**: Integrated into `App.jsx`

**Metrics tracked:**
- Total components in presentation
- Components on current slide
- Estimated performance impact
- Render time
- Whether to show warning

## Current Optimizations

### ✅ Already Implemented
1. **ComponentContainer uses React.memo()** - Prevents unnecessary re-renders
2. **Thumbnails don't render components** - Sidebar thumbnails skip component rendering for better performance
3. **ErrorBoundary wrapping** - Prevents component crashes from breaking the entire app
4. **Performance warning system** - Alerts users before performance degrades

### ⚠️ Optional (Not Yet Implemented)
1. **Lazy loading in ElementComponent** - Could wrap LiveReactRenderer with LazyComponent
2. **Component render time tracking** - useComponentRenderTime hook is available but not integrated
3. **Progressive loading** - Load components in batches when many exist on one slide

## How to Enable Lazy Loading

To enable lazy loading for React components in the canvas, modify `ElementComponent.jsx`:

```jsx
import LazyComponent from './LazyComponent';

// In the render method, wrap LiveReactRenderer:
{element.type === 'component' && Object.values(librariesLoaded).every(Boolean) && element.reactComponent && (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <ErrorBoundary fallbackMessage="Failed to render component">
            <LazyComponent>
                <LiveReactRenderer
                    id={element.id}
                    component={element.reactComponent}
                />
            </LazyComponent>
        </ErrorBoundary>
    </div>
)}
```

## Performance Best Practices

### For Users:
1. **Limit components per slide** - Keep to 5 or fewer per slide
2. **Split complex presentations** - Use multiple slides instead of one crowded slide
3. **Optimize component code** - Avoid expensive operations in render functions
4. **Use static content** - Use text/shapes/images when possible instead of React components

### For Developers:
1. **Monitor the console** - Slow renders (>100ms) are logged automatically
2. **Profile with React DevTools** - Use profiler to identify slow components
3. **Implement lazy loading** - Wrap heavy components in LazyComponent
4. **Use React.memo strategically** - Memoize expensive child components

## Testing

To test the performance system:

1. **Low load (normal operation)**:
   - Add 1-3 React components to a slide
   - No warning should appear
   - Performance should be smooth

2. **Medium load (tracked but no warning)**:
   - Add 4-5 React components to a slide
   - No warning appears, but metrics are tracked
   - Slight performance impact may be noticed

3. **High load (warning appears)**:
   - Add 6-9 React components to a slide
   - Orange warning banner appears
   - Suggests reducing component count

4. **Critical load (severe warning)**:
   - Add 10+ React components to a slide
   - Red warning banner appears with critical message
   - Significant performance degradation expected

## Future Enhancements

1. **Performance Dashboard**: Add a settings panel showing detailed metrics
2. **Auto-optimization**: Automatically enable lazy loading when threshold is hit
3. **Component Budget**: Set maximum component count in presentation settings
4. **Real-time FPS tracking**: Show frames-per-second in developer mode
5. **Memory usage monitoring**: Track memory consumption of components

## Technical Details

### Intersection Observer Configuration
```javascript
{
  threshold: 0.1,        // Trigger when 10% visible
  rootMargin: '50px'     // Pre-load 50px before entering viewport
}
```

### Performance Thresholds (can be adjusted)
```javascript
// In useComponentPerformance.js
if (currentSlideComponents >= 10) {
    estimatedImpact = 'critical';
} else if (currentSlideComponents >= 6) {
    estimatedImpact = 'high';
} else if (currentSlideComponents >= 3) {
    estimatedImpact = 'medium';
}
```

## Browser Compatibility

- **IntersectionObserver**: Chrome 51+, Firefox 55+, Safari 12.1+, Edge 15+
- **Fallback**: Components render immediately on unsupported browsers
- **Performance API**: Supported in all modern browsers

## Conclusion

The performance monitoring system provides both **proactive warnings** and **reactive optimizations** to ensure SlideWinder remains responsive even with complex React components. Users are guided to maintain good performance practices, while developers have tools to diagnose and fix performance issues.
