/**
 * Alignment utility functions for positioning elements
 */

/**
 * Align elements horizontally
 * @param {Array} elements - Array of elements to align
 * @param {string} alignment - 'left' | 'center' | 'right'
 * @param {number} canvasWidth - Canvas width for single-element alignment (default: 960)
 * @returns {Array} Updated elements with new x positions
 */
export function alignHorizontal(elements, alignment, canvasWidth = 960) {
    if (elements.length === 0) return elements;

    // Single element: align to canvas
    if (elements.length === 1) {
        const el = elements[0];
        switch (alignment) {
            case 'left':
                return [{ ...el, x: 0 }];
            case 'center':
                return [{ ...el, x: (canvasWidth - el.width) / 2 }];
            case 'right':
                return [{ ...el, x: canvasWidth - el.width }];
            default:
                return elements;
        }
    }

    // Multiple elements: align relative to each other
    let targetX;

    switch (alignment) {
        case 'left':
            // Align to leftmost element
            targetX = Math.min(...elements.map(el => el.x));
            return elements.map(el => ({ ...el, x: targetX }));

        case 'center':
            // Align centers of all elements
            const avgCenterX = elements.reduce((sum, el) => sum + el.x + el.width / 2, 0) / elements.length;
            return elements.map(el => ({ ...el, x: avgCenterX - el.width / 2 }));

        case 'right':
            // Align right edges to rightmost element
            const maxRight = Math.max(...elements.map(el => el.x + el.width));
            return elements.map(el => ({ ...el, x: maxRight - el.width }));

        default:
            return elements;
    }
}

/**
 * Align elements vertically
 * @param {Array} elements - Array of elements to align
 * @param {string} alignment - 'top' | 'middle' | 'bottom'
 * @param {number} canvasHeight - Canvas height for single-element alignment (default: 540)
 * @returns {Array} Updated elements with new y positions
 */
export function alignVertical(elements, alignment, canvasHeight = 540) {
    if (elements.length === 0) return elements;

    // Single element: align to canvas
    if (elements.length === 1) {
        const el = elements[0];
        switch (alignment) {
            case 'top':
                return [{ ...el, y: 0 }];
            case 'middle':
                return [{ ...el, y: (canvasHeight - el.height) / 2 }];
            case 'bottom':
                return [{ ...el, y: canvasHeight - el.height }];
            default:
                return elements;
        }
    }

    // Multiple elements: align relative to each other
    let targetY;

    switch (alignment) {
        case 'top':
            // Align to topmost element
            targetY = Math.min(...elements.map(el => el.y));
            return elements.map(el => ({ ...el, y: targetY }));

        case 'middle':
            // Align centers of all elements
            const avgCenterY = elements.reduce((sum, el) => sum + el.y + el.height / 2, 0) / elements.length;
            return elements.map(el => ({ ...el, y: avgCenterY - el.height / 2 }));

        case 'bottom':
            // Align bottom edges to bottommost element
            const maxBottom = Math.max(...elements.map(el => el.y + el.height));
            return elements.map(el => ({ ...el, y: maxBottom - el.height }));

        default:
            return elements;
    }
}

/**
 * Distribute elements evenly with equal spacing
 * @param {Array} elements - Array of elements to distribute
 * @param {string} direction - 'horizontal' | 'vertical'
 * @returns {Array} Updated elements with new positions
 */
export function distributeElements(elements, direction) {
    if (elements.length < 3) return elements; // Need at least 3 elements to distribute

    const sorted = [...elements].sort((a, b) =>
        direction === 'horizontal' ? a.x - b.x : a.y - b.y
    );

    if (direction === 'horizontal') {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalSpace = (last.x + last.width) - first.x;
        const totalElementWidth = sorted.reduce((sum, el) => sum + el.width, 0);
        const spacing = (totalSpace - totalElementWidth) / (sorted.length - 1);

        let currentX = first.x;
        return sorted.map(el => {
            const newEl = { ...el, x: currentX };
            currentX += el.width + spacing;
            return newEl;
        });
    } else {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalSpace = (last.y + last.height) - first.y;
        const totalElementHeight = sorted.reduce((sum, el) => sum + el.height, 0);
        const spacing = (totalSpace - totalElementHeight) / (sorted.length - 1);

        let currentY = first.y;
        return sorted.map(el => {
            const newEl = { ...el, y: currentY };
            currentY += el.height + spacing;
            return newEl;
        });
    }
}

/**
 * Snap position to grid
 * @param {number} value - Position value to snap
 * @param {number} gridSize - Size of grid cells
 * @returns {number} Snapped position
 */
export function snapToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}

/**
 * Find nearby alignment guides for smart snapping
 * @param {Object} draggingElement - Element being dragged
 * @param {Array} otherElements - Other elements on the slide
 * @param {number} threshold - Distance threshold for snapping (default: 5px)
 * @returns {Object} Guide lines and snapped position
 */
export function findAlignmentGuides(draggingElement, otherElements, threshold = 5) {
    const guides = {
        vertical: [],
        horizontal: [],
        snapX: null,
        snapY: null
    };

    const dragLeft = draggingElement.x;
    const dragRight = draggingElement.x + draggingElement.width;
    const dragCenterX = draggingElement.x + draggingElement.width / 2;
    const dragTop = draggingElement.y;
    const dragBottom = draggingElement.y + draggingElement.height;
    const dragCenterY = draggingElement.y + draggingElement.height / 2;

    otherElements.forEach(el => {
        const elLeft = el.x;
        const elRight = el.x + el.width;
        const elCenterX = el.x + el.width / 2;
        const elTop = el.y;
        const elBottom = el.y + el.height;
        const elCenterY = el.y + el.height / 2;

        // Check vertical alignment (X-axis)
        if (Math.abs(dragLeft - elLeft) < threshold) {
            guides.vertical.push({ x: elLeft, type: 'left' });
            guides.snapX = elLeft;
        }
        if (Math.abs(dragRight - elRight) < threshold) {
            guides.vertical.push({ x: elRight, type: 'right' });
            guides.snapX = elRight - draggingElement.width;
        }
        if (Math.abs(dragCenterX - elCenterX) < threshold) {
            guides.vertical.push({ x: elCenterX, type: 'center' });
            guides.snapX = elCenterX - draggingElement.width / 2;
        }

        // Check horizontal alignment (Y-axis)
        if (Math.abs(dragTop - elTop) < threshold) {
            guides.horizontal.push({ y: elTop, type: 'top' });
            guides.snapY = elTop;
        }
        if (Math.abs(dragBottom - elBottom) < threshold) {
            guides.horizontal.push({ y: elBottom, type: 'bottom' });
            guides.snapY = elBottom - draggingElement.height;
        }
        if (Math.abs(dragCenterY - elCenterY) < threshold) {
            guides.horizontal.push({ y: elCenterY, type: 'middle' });
            guides.snapY = elCenterY - draggingElement.height / 2;
        }
    });

    return guides;
}

/**
 * Change element layer order
 * @param {Array} elements - All elements on the slide
 * @param {string} elementId - ID of element to reorder
 * @param {string} action - 'front' | 'back' | 'forward' | 'backward'
 * @returns {Array} Reordered elements array
 */
export function reorderElement(elements, elementId, action) {
    const index = elements.findIndex(el => el.id === elementId);
    if (index === -1) return elements;

    const newElements = [...elements];
    const [element] = newElements.splice(index, 1);

    switch (action) {
        case 'front':
            // Move to end (top layer)
            newElements.push(element);
            break;
        case 'back':
            // Move to beginning (bottom layer)
            newElements.unshift(element);
            break;
        case 'forward':
            // Move up one layer
            if (index < elements.length - 1) {
                newElements.splice(index + 1, 0, element);
            } else {
                newElements.push(element);
            }
            break;
        case 'backward':
            // Move down one layer
            if (index > 0) {
                newElements.splice(index - 1, 0, element);
            } else {
                newElements.unshift(element);
            }
            break;
        default:
            newElements.splice(index, 0, element);
    }

    return newElements;
}
