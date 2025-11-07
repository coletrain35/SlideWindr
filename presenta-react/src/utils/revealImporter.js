/**
 * Utility to import and parse reveal.js HTML presentations
 * Converts reveal.js HTML format to SlideWindr internal format
 *
 * PHASE 1 IMPROVEMENTS (Enhanced Positioning System):
 * - Smart layout detection for common Reveal.js patterns
 * - Multi-pass position calculation algorithm
 * - Canvas boundary detection with auto-fix
 */

// ===== PHASE 1: ENHANCED POSITIONING SYSTEM =====

/**
 * Detect common Reveal.js slide layout patterns
 * @param {HTMLElement} slideEl - The slide section element
 * @returns {Object} - Layout information with type and relevant elements
 */
function detectSlideLayout(slideEl) {
  const children = Array.from(slideEl.children).filter(child =>
    !child.classList.contains('notes') && child.tagName !== 'ASIDE'
  );

  if (children.length === 0) {
    return { type: 'empty', elements: [] };
  }

  // Pattern 1: Title Slide (h1/h2 with optional subtitle and description)
  // More flexible - detects title slides with 2-4 elements if first is heading
  if (children.length >= 2 && children.length <= 4 &&
      ['H1', 'H2'].includes(children[0].tagName)) {
    return {
      type: 'title-slide',
      title: children[0],
      subtitle: children[1],
      elements: children
    };
  }

  // Pattern 2: Full-slide Image/Video
  if (children.length === 1 &&
      ['IMG', 'VIDEO', 'IFRAME'].includes(children[0].tagName)) {
    return {
      type: 'full-media',
      media: children[0],
      elements: children
    };
  }

  // Pattern 3: Detect Flexbox Layout
  const computedStyle = window.getComputedStyle(slideEl);
  if (computedStyle.display === 'flex' || computedStyle.display === 'inline-flex') {
    return {
      type: 'flex',
      flexDirection: computedStyle.flexDirection,
      justifyContent: computedStyle.justifyContent,
      alignItems: computedStyle.alignItems,
      elements: children
    };
  }

  // Pattern 4: Detect Grid Layout
  if (computedStyle.display === 'grid' || computedStyle.display === 'inline-grid') {
    return {
      type: 'grid',
      gridTemplateColumns: computedStyle.gridTemplateColumns,
      gridTemplateRows: computedStyle.gridTemplateRows,
      gap: computedStyle.gap,
      elements: children
    };
  }

  // Pattern 5: Multi-column layout
  const columnCount = parseInt(computedStyle.columnCount);
  if (columnCount > 1) {
    return {
      type: 'multi-column',
      columnCount,
      elements: children
    };
  }

  // Pattern 6: Centered Content (default Reveal.js style)
  if ((computedStyle.display === 'flex' &&
       computedStyle.justifyContent.includes('center') &&
       computedStyle.alignItems.includes('center')) ||
      computedStyle.textAlign === 'center') {
    return {
      type: 'centered',
      elements: children
    };
  }

  // Default: Generic layout
  return {
    type: 'generic',
    elements: children
  };
}

/**
 * Sanitize iframes for editor display to prevent loading issues
 * Replaces iframe src with a placeholder while preserving structure
 * @param {string} html - HTML content with potential iframes
 * @returns {string} - Sanitized HTML safe for editor
 */
function sanitizeIframesForEditor(html) {
  if (!html) return html;

  console.log('Sanitizing HTML (first 200 chars):', html.substring(0, 200));

  // Replace iframe src to prevent loading in editor
  // Use a single comprehensive regex that handles both quoted and unquoted src
  let sanitized = html.replace(
    /<iframe([^>]*?)src\s*=\s*(["']?)([^"'\s>]+)\2([^>]*?)>/gi,
    (match, before, quote, src, after) => {
      // Skip if already sanitized
      if (before.includes('data-original-src') || after.includes('data-original-src') || src === 'about:blank') {
        return match;
      }

      console.log(`Replacing iframe src: "${src}" with "about:blank"`);

      // Remove any existing style attributes to prevent conflicts
      const cleanBefore = before.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
      const cleanAfter = after.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');

      return `<iframe${cleanBefore} data-original-src="${src}" src="about:blank"${cleanAfter} style="width: 100%; height: 100%; background: #f0f0f0; border: 2px dashed #999;">`;
    }
  );

  console.log('Sanitized HTML (first 200 chars):', sanitized.substring(0, 200));

  return sanitized;
}

/**
 * Determine if an element is a simple text element that can be edited individually
 * @param {HTMLElement} el - The element to check
 * @returns {boolean} - True if element is simple and editable
 */
function isSimpleTextElement(el) {
  const tagName = el.tagName.toLowerCase();
  const computedStyle = window.getComputedStyle(el);

  // Simple text elements (headings, paragraphs, lists, blockquotes)
  const simpleTextTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'blockquote'];
  if (simpleTextTags.includes(tagName)) {
    // Check if it has complex styling (backgrounds, borders, etc.)
    const hasBackground = hasStyledBackground(el, computedStyle);
    const hasBorder = computedStyle.borderWidth !== '0px' && computedStyle.borderStyle !== 'none';

    // Simple elements shouldn't have backgrounds or borders
    return !hasBackground && !hasBorder;
  }

  return false;
}

/**
 * Determine if an element is complex and should remain as a container
 * @param {HTMLElement} el - The element to check
 * @returns {boolean} - True if element should be a container
 */
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

  // Divs with styling are complex
  if (tagName === 'div' && hasStyledBackground(el, computedStyle)) return true;

  // Elements with flex/grid layout are complex
  const display = computedStyle.display;
  if (display === 'flex' || display === 'grid' || display === 'inline-flex' || display === 'inline-grid') {
    return true;
  }

  // Elements with multiple children might be complex layouts
  if (el.children.length > 3) return true;

  return false;
}

/**
 * Parse a simple text element for flow mode (editable)
 * @param {HTMLElement} el - The element to parse
 * @param {number} currentY - Current Y position for stacking
 * @returns {Object} - Element object
 */
function parseSimpleFlowElement(el, currentY) {
  const computedStyle = window.getComputedStyle(el);
  const tagName = el.tagName.toLowerCase();

  // Get text content size with tag-specific minimums
  const rect = el.getBoundingClientRect();
  let minHeight = 40;

  // Set minimum heights based on tag type
  if (tagName === 'h1') minHeight = 80;
  else if (tagName === 'h2') minHeight = 70;
  else if (tagName === 'h3') minHeight = 60;
  else if (tagName === 'p') minHeight = 50;
  else if (tagName === 'ul' || tagName === 'ol') minHeight = 100;
  else if (tagName === 'blockquote') minHeight = 80;

  // Use rect height if valid, otherwise use minimum
  const height = rect.height > 10 ? Math.max(rect.height, minHeight) : minHeight;

  // Extract complete styles for proper rendering
  const computedStyles = extractCompleteStyles(el);

  return {
    id: crypto.randomUUID(),
    type: 'text',
    layoutMode: 'flow',
    x: 40,
    y: currentY,
    width: 880,
    height: height,
    rotation: 0,
    content: el.innerHTML,
    fontSize: parseInt(computedStyle.fontSize) || 32,
    color: rgbToHex(computedStyle.color) || '#000000',
    tagName: tagName,
    className: el.className || '',
    computedStyles: computedStyles
  };
}

/**
 * Create a container element for complex flow content
 * @param {HTMLElement} el - The element to containerize
 * @param {number} currentY - Current Y position for stacking
 * @returns {Object} - Container element object
 */
function createComplexFlowContainer(el, currentY) {
  const tagName = el.tagName.toLowerCase();
  const rect = el.getBoundingClientRect();

  // Set minimum height based on element type
  let minHeight = 150;
  if (tagName === 'iframe') minHeight = 400;
  else if (tagName === 'div') minHeight = 200;

  // Use actual height if larger than minimum
  const height = rect.height > 10 ? Math.max(rect.height, minHeight) : minHeight;

  // Get HTML content - use outerHTML to capture the element itself
  const originalHTML = el.outerHTML;

  // CRITICAL: Sanitize iframes to prevent loading and crashes
  const sanitizedHTML = sanitizeIframesForEditor(originalHTML);

  // Log for debugging iframe elements
  if (tagName === 'iframe') {
    console.log('Flow iframe detected - sanitizing:', {
      original: originalHTML.substring(0, 100),
      sanitized: sanitizedHTML.substring(0, 100)
    });
  }

  return {
    id: crypto.randomUUID(),
    type: 'text',
    layoutMode: 'flow',
    x: 40,
    y: currentY,
    width: 880,
    height: height,
    rotation: 0,
    content: originalHTML,
    editorContent: sanitizedHTML,
    fontSize: 32,
    color: '#000000',
    tagName: tagName,
    className: el.className || '',
    isFlowContainer: true,
    isComplexElement: true
  };
}

/**
 * Parse basic markdown to HTML
 * Handles common markdown syntax for reveal.js slides
 * @param {string} markdown - Markdown content
 * @returns {string} - HTML content
 */
function parseBasicMarkdown(markdown) {
  let html = markdown;

  // Headers
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and Italic (do these before lists to preserve formatting in list items)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Process lists line by line to handle numbered and bulleted separately
  const lines = html.split('\n');
  const processed = [];
  let inNumberedList = false;
  let inBulletedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this is a numbered list item
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      if (!inNumberedList) {
        processed.push('<ol>');
        inNumberedList = true;
      }
      if (inBulletedList) {
        processed.push('</ul>');
        inBulletedList = false;
      }
      processed.push(`<li>${numberedMatch[1]}</li>`);
      continue;
    }

    // Check if this is a bulleted list item
    const bulletedMatch = trimmed.match(/^[\*\-]\s+(.+)$/);
    if (bulletedMatch) {
      if (!inBulletedList) {
        processed.push('<ul>');
        inBulletedList = true;
      }
      if (inNumberedList) {
        processed.push('</ol>');
        inNumberedList = false;
      }
      processed.push(`<li>${bulletedMatch[1]}</li>`);
      continue;
    }

    // Not a list item - close any open lists
    if (inNumberedList) {
      processed.push('</ol>');
      inNumberedList = false;
    }
    if (inBulletedList) {
      processed.push('</ul>');
      inBulletedList = false;
    }

    // Process as regular line
    if (trimmed && !trimmed.startsWith('<')) {
      processed.push(`<p>${trimmed}</p>`);
    } else if (trimmed) {
      processed.push(line);
    }
  }

  // Close any remaining open lists
  if (inNumberedList) processed.push('</ol>');
  if (inBulletedList) processed.push('</ul>');

  return processed.join('\n');
}

/**
 * Detect whether a slide should use flow layout or absolute positioning
 * Flow layout: Natural document flow with reveal.js centering (most reveal.js slides)
 * Absolute layout: Explicit positioning with x/y coordinates
 * @param {HTMLElement} slideEl - The slide section element
 * @param {Array<HTMLElement>} children - Child elements
 * @returns {string} - 'flow' or 'absolute'
 */
function detectSlideLayoutMode(slideEl, children) {
  // Check if ANY child has explicit absolute positioning
  const hasAbsolutePositioned = children.some(child => {
    const computed = window.getComputedStyle(child);
    const style = child.style;

    // Check for explicit positioning
    if (computed.position === 'absolute' || computed.position === 'fixed') {
      return true;
    }

    // Check for inline left/top/right/bottom
    if (style.left || style.top || style.right || style.bottom) {
      return true;
    }

    // Check for transform translate (manual positioning)
    const transform = computed.transform || style.transform;
    if (transform && transform.includes('translate') && !transform.includes('translateX(0') && !transform.includes('translateY(0')) {
      return true;
    }

    return false;
  });

  // Check for complex layouts that might need absolute positioning
  const slideComputed = window.getComputedStyle(slideEl);
  const hasComplexLayout =
    slideComputed.display === 'grid' ||
    children.some(child => {
      const computed = window.getComputedStyle(child);
      // Flex containers with specific positioning might need absolute
      return computed.display === 'grid';
    });

  if (hasAbsolutePositioned || hasComplexLayout) {
    return 'absolute';
  }

  // Default: Use flow layout (reveal.js natural centering)
  return 'flow';
}

/**
 * Calculate element position using multi-pass algorithm
 * Priority: absolute → transform → flex → grid → flow
 * @param {HTMLElement} el - The element to position
 * @param {Object} layout - Detected slide layout
 * @param {number} index - Element index
 * @param {Array} siblings - Sibling elements
 * @param {Object} canvasSize - Target canvas dimensions
 * @returns {Object} - Position {x, y} and positioning mode
 */
function calculateSmartPosition(el, layout, index, siblings, canvasSize = { width: 960, height: 540 }) {
  const computed = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const parentEl = el.parentElement;
  const parentRect = parentEl ? parentEl.getBoundingClientRect() : rect;

  // Reveal.js typical viewport size (can be configured, but 1920x1080 is common)
  const REVEAL_WIDTH = 1920;
  const REVEAL_HEIGHT = 1080;
  const scaleX = canvasSize.width / REVEAL_WIDTH;
  const scaleY = canvasSize.height / REVEAL_HEIGHT;

  let x, y, mode;

  // Priority 1: Explicit absolute/fixed positioning
  if (computed.position === 'absolute' || computed.position === 'fixed') {
    const left = parseInt(computed.left) || 0;
    const top = parseInt(computed.top) || 0;

    x = Math.round(left * scaleX);
    y = Math.round(top * scaleY);
    mode = 'absolute';

    return { x, y, mode };
  }

  // Priority 2: Transform translate positioning
  const transform = computed.transform;
  if (transform && transform !== 'none' && transform.includes('matrix')) {
    const values = transform.match(/matrix\(([^)]+)\)/);
    if (values) {
      const parts = values[1].split(',').map(v => parseFloat(v.trim()));
      if (parts.length >= 6) {
        const translateX = parts[4];
        const translateY = parts[5];

        x = Math.round((rect.left + translateX) * scaleX);
        y = Math.round((rect.top + translateY) * scaleY);
        mode = 'transform';

        return { x, y, mode };
      }
    }
  }

  // Priority 3: Flexbox positioning
  if (layout.type === 'flex') {
    const relX = rect.left - parentRect.left;
    const relY = rect.top - parentRect.top;

    x = Math.round(relX * scaleX);
    y = Math.round(relY * scaleY);
    mode = 'flex';

    return { x, y, mode };
  }

  // Priority 4: Grid positioning
  if (layout.type === 'grid') {
    const relX = rect.left - parentRect.left;
    const relY = rect.top - parentRect.top;

    x = Math.round(relX * scaleX);
    y = Math.round(relY * scaleY);
    mode = 'grid';

    return { x, y, mode };
  }

  // Priority 5: Layout-specific positioning
  switch (layout.type) {
    case 'title-slide':
      // Center all elements horizontally, stack vertically
      x = Math.round((canvasSize.width - (rect.width * scaleX)) / 2);

      if (el === layout.title) {
        // Title at top-center with more space
        y = 100;
      } else if (el === layout.subtitle) {
        // Subtitle below title
        const titleHeight = layout.title ? layout.title.getBoundingClientRect().height * scaleY : 0;
        y = 100 + titleHeight + 40; // Increased spacing
      } else {
        // Additional elements (description, notes) stacked below
        const titleHeight = layout.title ? layout.title.getBoundingClientRect().height * scaleY : 0;
        const subtitleHeight = layout.subtitle ? layout.subtitle.getBoundingClientRect().height * scaleY : 0;
        y = 100 + titleHeight + subtitleHeight + 80 + (index * 40);
      }
      mode = 'title-slide';
      break;

    case 'full-media':
      // Center the media element
      x = Math.round((canvasSize.width - (rect.width * scaleX)) / 2);
      y = Math.round((canvasSize.height - (rect.height * scaleY)) / 2);
      mode = 'full-media';
      break;

    case 'centered':
      // Center horizontally, stack vertically
      x = Math.round((canvasSize.width - (rect.width * scaleX)) / 2);
      y = 60 + (index * 100);
      mode = 'centered';
      break;

    default:
      // Generic flow layout - smart stacking
      x = 80; // Left margin
      y = 50 + (index * 80); // Vertical stacking with spacing
      mode = 'flow';
  }

  return { x, y, mode };
}

/**
 * Ensure element stays within canvas boundaries with auto-fix
 * @param {Object} element - Element with x, y, width, height
 * @param {Object} canvasSize - Canvas dimensions
 * @returns {Object} - Adjustment info {adjusted, method, scale}
 */
function ensureWithinBounds(element, canvasSize = { width: 960, height: 540 }) {
  const MARGIN = 20; // Safety margin

  const overflowRight = (element.x + element.width) > (canvasSize.width - MARGIN);
  const overflowBottom = (element.y + element.height) > (canvasSize.height - MARGIN);
  const overflowLeft = element.x < MARGIN;
  const overflowTop = element.y < MARGIN;

  if (!overflowRight && !overflowBottom && !overflowLeft && !overflowTop) {
    return { adjusted: false };
  }

  // Strategy 1: Reposition if element fits
  if (element.width <= canvasSize.width - 2 * MARGIN &&
      element.height <= canvasSize.height - 2 * MARGIN) {

    element.x = Math.max(MARGIN, Math.min(element.x, canvasSize.width - element.width - MARGIN));
    element.y = Math.max(MARGIN, Math.min(element.y, canvasSize.height - element.height - MARGIN));

    return { adjusted: true, method: 'reposition' };
  }

  // Strategy 2: Scale down if too large
  const scaleX = (canvasSize.width - 2 * MARGIN) / element.width;
  const scaleY = (canvasSize.height - 2 * MARGIN) / element.height;
  const scale = Math.min(scaleX, scaleY, 1.0); // Don't scale up

  if (scale < 1.0) {
    element.width = Math.floor(element.width * scale);
    element.height = Math.floor(element.height * scale);
    element.x = MARGIN;
    element.y = MARGIN;

    return { adjusted: true, method: 'scale', scale };
  }

  return { adjusted: false };
}

/**
 * Smart layout-based element stacking
 * Used when generic flow positioning is needed
 * @param {Array} elements - Array of elements with their types
 * @param {Object} canvasSize - Canvas dimensions
 * @returns {Array} - Elements with updated positions
 */
function smartLayoutStack(elements, canvasSize = { width: 960, height: 540 }) {
  // Group by type for intelligent positioning
  const headers = elements.filter(el => el.tagName && el.tagName.match(/^H[1-6]$/));
  const images = elements.filter(el => el.type === 'image');
  const text = elements.filter(el => el.type === 'text' && !el.tagName?.match(/^H[1-6]$/));
  const other = elements.filter(el =>
    !headers.includes(el) && !images.includes(el) && !text.includes(el)
  );

  let currentY = 40; // Top margin
  const centerX = canvasSize.width / 2;
  const HEADER_SPACING = 20;
  const IMAGE_SPACING = 30;
  const TEXT_SPACING = 15;
  const OTHER_SPACING = 20;

  // Position headers (centered, top)
  headers.forEach(header => {
    header.x = centerX - header.width / 2;
    header.y = currentY;
    currentY += header.height + HEADER_SPACING;
  });

  // Position images (centered)
  images.forEach(img => {
    img.x = centerX - img.width / 2;
    img.y = currentY;
    currentY += img.height + IMAGE_SPACING;
  });

  // Position text content
  text.forEach(txt => {
    txt.x = centerX - txt.width / 2;
    txt.y = currentY;
    currentY += txt.height + TEXT_SPACING;
  });

  // Position other elements
  other.forEach(el => {
    el.x = centerX - el.width / 2;
    el.y = currentY;
    currentY += el.height + OTHER_SPACING;
  });

  return elements;
}

// ===== END PHASE 1 ENHANCEMENTS =====

// ===== PHASE 2: ENHANCED STYLE PRESERVATION =====

/**
 * Check if an element has significant background styling worth preserving
 * @param {HTMLElement} el - The element to check
 * @param {CSSStyleDeclaration} computed - Computed styles
 * @returns {boolean} - True if has styled background
 */
function hasStyledBackground(el, computed) {
  const bg = computed.backgroundColor;
  const bgImage = computed.backgroundImage;

  // Check for non-transparent background color
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
    // Parse to check if it has opacity
    const rgba = parseRGBA(bg);
    if (rgba && rgba.a > 0) {
      return true;
    }
  }

  // Check for background image or gradient
  if (bgImage && bgImage !== 'none') {
    return true;
  }

  // Check for border that creates visual container
  const borderWidth = parseInt(computed.borderWidth);
  if (borderWidth > 0) {
    return true;
  }

  // Check for box shadow
  if (computed.boxShadow && computed.boxShadow !== 'none') {
    return true;
  }

  return false;
}

/**
 * Parse RGBA color string to extract components
 * @param {string} rgba - RGBA color string
 * @returns {Object|null} - Object with r, g, b, a or null
 */
function parseRGBA(rgba) {
  if (!rgba) return null;

  // Handle rgb() format
  const rgbMatch = rgba.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: 1
    };
  }

  // Handle rgba() format
  const rgbaMatch = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: parseFloat(rgbaMatch[4])
    };
  }

  return null;
}

/**
 * Extract complete computed styles from an element (40+ properties)
 * Captures all visual styling for accurate reproduction
 * @param {HTMLElement} el - The element to extract styles from
 * @returns {Object} - Complete style object
 */
function extractCompleteStyles(el) {
  const computed = window.getComputedStyle(el);

  return {
    // Text Styling
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    fontStyle: computed.fontStyle,
    fontVariant: computed.fontVariant,
    color: computed.color,
    textAlign: computed.textAlign,
    textDecoration: computed.textDecoration,
    textDecorationColor: computed.textDecorationColor,
    textDecorationStyle: computed.textDecorationStyle,
    textTransform: computed.textTransform,
    letterSpacing: computed.letterSpacing,
    lineHeight: computed.lineHeight,
    textShadow: computed.textShadow,
    textIndent: computed.textIndent,
    wordSpacing: computed.wordSpacing,
    whiteSpace: computed.whiteSpace,

    // Box Model
    width: computed.width,
    height: computed.height,
    minWidth: computed.minWidth,
    minHeight: computed.minHeight,
    maxWidth: computed.maxWidth,
    maxHeight: computed.maxHeight,
    padding: computed.padding,
    paddingTop: computed.paddingTop,
    paddingRight: computed.paddingRight,
    paddingBottom: computed.paddingBottom,
    paddingLeft: computed.paddingLeft,
    margin: computed.margin,
    marginTop: computed.marginTop,
    marginRight: computed.marginRight,
    marginBottom: computed.marginBottom,
    marginLeft: computed.marginLeft,
    border: computed.border,
    borderRadius: computed.borderRadius,
    borderWidth: computed.borderWidth,
    borderStyle: computed.borderStyle,
    borderColor: computed.borderColor,

    // Background
    backgroundColor: computed.backgroundColor,
    backgroundImage: computed.backgroundImage,
    backgroundSize: computed.backgroundSize,
    backgroundPosition: computed.backgroundPosition,
    backgroundRepeat: computed.backgroundRepeat,
    backgroundAttachment: computed.backgroundAttachment,
    backgroundClip: computed.backgroundClip,

    // Visual Effects
    boxShadow: computed.boxShadow,
    opacity: computed.opacity,
    filter: computed.filter,
    backdropFilter: computed.backdropFilter,
    mixBlendMode: computed.mixBlendMode,

    // Transform
    transform: computed.transform,
    transformOrigin: computed.transformOrigin,
    transformStyle: computed.transformStyle,
    perspective: computed.perspective,

    // Layout
    display: computed.display,
    position: computed.position,
    zIndex: computed.zIndex,
    float: computed.float,
    clear: computed.clear,
    verticalAlign: computed.verticalAlign,

    // Flexbox (if parent or element is flex)
    flexDirection: computed.flexDirection,
    flexWrap: computed.flexWrap,
    flexGrow: computed.flexGrow,
    flexShrink: computed.flexShrink,
    flexBasis: computed.flexBasis,
    justifyContent: computed.justifyContent,
    alignItems: computed.alignItems,
    alignSelf: computed.alignSelf,
    alignContent: computed.alignContent,
    gap: computed.gap,

    // Grid (if parent or element is grid)
    gridTemplateColumns: computed.gridTemplateColumns,
    gridTemplateRows: computed.gridTemplateRows,
    gridColumn: computed.gridColumn,
    gridRow: computed.gridRow,
    gridGap: computed.gap,

    // List styling
    listStyle: computed.listStyle,
    listStyleType: computed.listStyleType,
    listStylePosition: computed.listStylePosition,
    listStyleImage: computed.listStyleImage,

    // Additional
    overflow: computed.overflow,
    overflowX: computed.overflowX,
    overflowY: computed.overflowY,
    cursor: computed.cursor,
    visibility: computed.visibility,
    clipPath: computed.clipPath,
    objectFit: computed.objectFit,
    objectPosition: computed.objectPosition
  };
}

/**
 * Extract and parse background gradient from computed styles
 * Supports linear-gradient and radial-gradient
 * @param {CSSStyleDeclaration} computed - Computed styles
 * @returns {Object|null} - Gradient object or null if no gradient
 */
function extractBackgroundGradient(computed) {
  const bgImage = computed.backgroundImage;

  if (!bgImage || bgImage === 'none') {
    return null;
  }

  // Linear gradient
  if (bgImage.includes('linear-gradient')) {
    const match = bgImage.match(/linear-gradient\(([^)]+)\)/);
    if (match) {
      return {
        type: 'linear-gradient',
        value: match[1],
        css: bgImage
      };
    }
  }

  // Radial gradient
  if (bgImage.includes('radial-gradient')) {
    const match = bgImage.match(/radial-gradient\(([^)]+)\)/);
    if (match) {
      return {
        type: 'radial-gradient',
        value: match[1],
        css: bgImage
      };
    }
  }

  // Repeating gradients
  if (bgImage.includes('repeating-linear-gradient')) {
    const match = bgImage.match(/repeating-linear-gradient\(([^)]+)\)/);
    if (match) {
      return {
        type: 'repeating-linear-gradient',
        value: match[1],
        css: bgImage
      };
    }
  }

  if (bgImage.includes('repeating-radial-gradient')) {
    const match = bgImage.match(/repeating-radial-gradient\(([^)]+)\)/);
    if (match) {
      return {
        type: 'repeating-radial-gradient',
        value: match[1],
        css: bgImage
      };
    }
  }

  return null;
}

/**
 * Detect if element is a list (ul/ol) and parse with styling
 * @param {HTMLElement} el - The element to check
 * @param {Object} position - Element position
 * @param {Object} size - Element size
 * @returns {Object|null} - List element object or null
 */
function parseListElement(el, position, size) {
  const tagName = el.tagName.toLowerCase();

  if (tagName !== 'ul' && tagName !== 'ol') {
    return null;
  }

  const computed = window.getComputedStyle(el);
  const items = Array.from(el.querySelectorAll('li'));

  return {
    id: crypto.randomUUID(),
    type: 'text', // Use text type but preserve list HTML
    ...position,
    ...size,
    rotation: 0,
    content: el.outerHTML, // Preserve list HTML structure
    fontSize: parseInt(computed.fontSize) || 32,  // Extract font size for lists
    color: rgbToHex(computed.color) || '#000000',
    tagName: tagName, // Store UL or OL tag
    listType: tagName,
    listStyle: computed.listStyleType,
    itemCount: items.length,
    className: el.className,
    inlineStyle: el.getAttribute('style') || '',
    computedStyles: extractCompleteStyles(el)
  };
}

/**
 * Detect code blocks and extract with language detection
 * Supports <pre><code>, highlight.js, prism.js patterns
 * @param {HTMLElement} el - The element to check
 * @param {Object} position - Element position
 * @param {Object} size - Element size
 * @returns {Object|null} - Code element object or null
 */
function parseCodeBlock(el, position, size) {
  const tagName = el.tagName.toLowerCase();

  // Pattern 1: <pre><code> structure
  if (tagName === 'pre') {
    const codeEl = el.querySelector('code');
    if (codeEl) {
      const language = detectLanguage(codeEl);
      const computed = window.getComputedStyle(el);

      return {
        id: crypto.randomUUID(),
        type: 'code',
        ...position,
        ...size,
        rotation: 0,
        code: codeEl.textContent,
        language: language,
        showLineNumbers: el.classList.contains('line-numbers') ||
                        el.classList.contains('number-lines'),
        fontSize: 14,
        className: el.className,
        computedStyles: extractCompleteStyles(el)
      };
    }
  }

  // Pattern 2: Standalone <code> with highlight classes
  if (tagName === 'code' &&
      (el.classList.contains('hljs') ||
       el.classList.contains('highlight') ||
       Array.from(el.classList).some(c => c.startsWith('language-')))) {
    const language = detectLanguage(el);

    return {
      id: crypto.randomUUID(),
      type: 'code',
      ...position,
      ...size,
      rotation: 0,
      code: el.textContent,
      language: language,
      showLineNumbers: false,
      fontSize: 14,
      className: el.className,
      computedStyles: extractCompleteStyles(el)
    };
  }

  return null;
}

/**
 * Detect programming language from code element classes or content
 * @param {HTMLElement} codeEl - Code element
 * @returns {string} - Detected language
 */
function detectLanguage(codeEl) {
  const classes = Array.from(codeEl.classList);

  // Check for language- prefix (common pattern)
  for (const cls of classes) {
    if (cls.startsWith('language-')) {
      return cls.replace('language-', '');
    }
    if (cls.startsWith('lang-')) {
      return cls.replace('lang-', '');
    }
  }

  // Check for Highlight.js specific language classes
  for (const cls of classes) {
    if (['javascript', 'js', 'python', 'py', 'java', 'cpp', 'c', 'csharp', 'cs',
         'ruby', 'go', 'rust', 'php', 'swift', 'kotlin', 'typescript', 'ts',
         'html', 'css', 'scss', 'sql', 'bash', 'shell', 'json', 'yaml', 'xml'].includes(cls)) {
      return cls;
    }
  }

  // Heuristic detection based on content
  const code = codeEl.textContent.trim();

  if (code.includes('function') && code.includes('{') && code.includes('}')) {
    if (code.includes('=>') || code.includes('const ') || code.includes('let ')) {
      return 'javascript';
    }
  }

  if (code.includes('def ') && code.includes(':')) {
    return 'python';
  }

  if (code.includes('public class') || code.includes('private ')) {
    return 'java';
  }

  if (code.includes('<?php')) {
    return 'php';
  }

  if (code.includes('<html') || code.includes('<!DOCTYPE')) {
    return 'html';
  }

  return 'plaintext';
}

/**
 * Parse table element with cell data and styling
 * @param {HTMLElement} el - Table element
 * @param {Object} position - Element position
 * @param {Object} size - Element size
 * @returns {Object|null} - Table element object or null
 */
function parseTableElement(el, position, size) {
  if (el.tagName.toLowerCase() !== 'table') {
    return null;
  }

  const rows = Array.from(el.querySelectorAll('tr'));
  const rowCount = rows.length;
  const colCount = rows[0] ? rows[0].querySelectorAll('th, td').length : 0;

  if (rowCount === 0 || colCount === 0) {
    return null;
  }

  // Extract cell data and styles
  const cellData = [];
  const cellStyles = [];

  rows.forEach(row => {
    const rowData = [];
    const rowStyles = [];

    row.querySelectorAll('th, td').forEach(cell => {
      rowData.push(cell.textContent.trim());

      const computed = window.getComputedStyle(cell);
      rowStyles.push({
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        textAlign: computed.textAlign,
        fontWeight: computed.fontWeight,
        fontSize: computed.fontSize,
        padding: computed.padding,
        borderColor: computed.borderColor,
        borderWidth: computed.borderWidth,
        borderStyle: computed.borderStyle
      });
    });

    cellData.push(rowData);
    cellStyles.push(rowStyles);
  });

  return {
    id: crypto.randomUUID(),
    type: 'table',
    ...position,
    ...size,
    rotation: 0,
    rows: rowCount,
    columns: colCount,
    cellData,
    cellStyles,
    className: el.className,
    computedStyles: extractCompleteStyles(el)
  };
}

/**
 * Parse SVG element and preserve as inline SVG
 * @param {HTMLElement} el - SVG element
 * @param {Object} position - Element position
 * @param {Object} size - Element size
 * @returns {Object|null} - SVG element object or null
 */
function parseSVGElement(el, position, size) {
  if (el.tagName.toLowerCase() !== 'svg') {
    return null;
  }

  // Clone SVG to preserve it
  const svgClone = el.cloneNode(true);
  const svgString = new XMLSerializer().serializeToString(svgClone);

  return {
    id: crypto.randomUUID(),
    type: 'svg',
    ...position,
    ...size,
    rotation: 0,
    svgContent: svgString,
    viewBox: el.getAttribute('viewBox') || '',
    preserveAspectRatio: el.getAttribute('preserveAspectRatio') || 'xMidYMid meet',
    className: el.className,
    computedStyles: extractCompleteStyles(el)
  };
}

// ===== END PHASE 2 ENHANCEMENTS =====

/**
 * Detect unsupported Reveal.js features in the presentation
 * @param {Document} doc - The parsed HTML document
 * @returns {Object} - Object containing warnings about unsupported features
 */
function detectUnsupportedFeatures(doc) {
  const warnings = {
    hasWarnings: false,
    features: []
  };

  // Check for fragments
  const fragments = doc.querySelectorAll('.fragment');
  if (fragments.length > 0) {
    warnings.hasWarnings = true;
    warnings.features.push({
      name: 'Fragments (Progressive Reveal)',
      count: fragments.length,
      description: 'Elements that appear progressively will be imported as regular elements',
      severity: 'medium'
    });
  }

  // Check for auto-animate
  const autoAnimateSlides = doc.querySelectorAll('section[data-auto-animate]');
  if (autoAnimateSlides.length > 0) {
    warnings.hasWarnings = true;
    warnings.features.push({
      name: 'Auto-Animate',
      count: autoAnimateSlides.length,
      description: 'Slide-to-slide animations will not be preserved',
      severity: 'medium'
    });
  }

  // Check for speaker notes
  const notes = doc.querySelectorAll('aside.notes');
  if (notes.length > 0) {
    warnings.hasWarnings = true;
    warnings.features.push({
      name: 'Speaker Notes',
      count: notes.length,
      description: 'Speaker notes will be lost during import',
      severity: 'low'
    });
  }

  // Check for vertical slides (nested sections)
  const verticalSlides = doc.querySelectorAll('.reveal .slides > section > section');
  if (verticalSlides.length > 0) {
    warnings.hasWarnings = true;
    warnings.features.push({
      name: 'Vertical Slides',
      count: verticalSlides.length,
      description: 'Vertical slide hierarchy will be flattened to single-level slides',
      severity: 'high'
    });
  }

  // Check for markdown content
  const markdownSlides = doc.querySelectorAll('section[data-markdown]');
  if (markdownSlides.length > 0) {
    warnings.hasWarnings = true;
    warnings.features.push({
      name: 'Markdown Content',
      count: markdownSlides.length,
      description: 'Markdown will be converted to HTML (formatting may change)',
      severity: 'low'
    });
  }

  // Check for custom transitions
  const customTransitions = doc.querySelectorAll('section[data-transition]');
  if (customTransitions.length > 0) {
    warnings.hasWarnings = true;
    warnings.features.push({
      name: 'Per-Slide Transitions',
      count: customTransitions.length,
      description: 'Custom slide transitions will use global transition setting',
      severity: 'low'
    });
  }

  // Check for backgrounds with special features
  const parallaxBg = doc.querySelector('[data-background-parallax]');
  const videoBg = doc.querySelectorAll('section[data-background-video]');
  const iframeBg = doc.querySelectorAll('section[data-background-iframe]');

  if (parallaxBg) {
    warnings.hasWarnings = true;
    warnings.features.push({
      name: 'Parallax Backgrounds',
      count: 1,
      description: 'Parallax scrolling effect will be lost',
      severity: 'medium'
    });
  }

  if (videoBg.length > 0) {
    warnings.hasWarnings = true;
    warnings.features.push({
      name: 'Video Backgrounds',
      count: videoBg.length,
      description: 'Video backgrounds are not currently supported',
      severity: 'high'
    });
  }

  if (iframeBg.length > 0) {
    warnings.hasWarnings = true;
    warnings.features.push({
      name: 'iFrame Backgrounds',
      count: iframeBg.length,
      description: 'iFrame backgrounds are not currently supported',
      severity: 'high'
    });
  }

  // Check for plugins
  const scripts = doc.querySelectorAll('script');
  let hasPlugins = false;
  scripts.forEach(script => {
    const content = script.textContent;
    if (content.includes('RevealMath') || content.includes('RevealHighlight') ||
        content.includes('RevealNotes') || content.includes('RevealSearch') ||
        content.includes('RevealZoom') || content.includes('plugins:')) {
      hasPlugins = true;
    }
  });

  if (hasPlugins) {
    warnings.hasWarnings = true;
    warnings.features.push({
      name: 'Reveal.js Plugins',
      count: 1,
      description: 'Plugin functionality (Math, Syntax Highlighting, etc.) will be lost',
      severity: 'medium'
    });
  }

  return warnings;
}

/**
 * Extract all CSS from the reveal.js HTML document
 * @param {Document} doc - The parsed HTML document
 * @returns {Object} - CSS data including inline and linked stylesheets
 *
 * NOTE: We extract ONLY custom CSS (not Reveal.js framework CSS) because:
 * 1. Reveal.js CSS (reset, themes) would break SlideWinder's UI layout
 * 2. Custom CSS is needed for classes like .video-overlay, .flex-container, etc.
 * 3. This CSS will be included in the export for proper styling
 */
async function extractCSS(doc) {
  // Extract custom CSS from <style> tags
  const styleElements = doc.querySelectorAll('style');
  const allCSS = Array.from(styleElements)
    .map(styleEl => styleEl.textContent)
    .join('\n\n');

  // Filter to keep only custom CSS (not reveal.js framework styles)
  const customCSS = allCSS.split('\n')
    .filter(line => {
      // Keep lines that don't look like reveal.js framework CSS
      const isRevealFramework =
        line.includes('.reveal .slides section {') ||
        line.includes('/* Custom animations for elements') ||
        line.includes('/* Set explicit slide dimensions');
      return !isRevealFramework;
    })
    .join('\n')
    .trim();

  return {
    inlineCSS: customCSS,
    linkedStylesheets: []
  };
}

/**
 * Parse a reveal.js HTML file and convert it to SlideWindr format
 * @param {string} htmlContent - The HTML content of the reveal.js presentation
 * @returns {Promise<Object>} - Presentation object in SlideWindr format with warnings
 */
export async function parseRevealHTML(htmlContent) {
  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Detect unsupported features
  const warnings = detectUnsupportedFeatures(doc);

  // Extract presentation title
  const titleElement = doc.querySelector('title');
  const title = titleElement ? titleElement.textContent : 'Imported Presentation';

  // Extract reveal.js theme
  const themeLink = doc.querySelector('link[href*="reveal.js"][href*="theme"]');
  let theme = 'black'; // default theme
  if (themeLink) {
    const themeMatch = themeLink.href.match(/theme\/([^./]+)\.css/);
    if (themeMatch) {
      theme = themeMatch[1];
    }
  }

  // Extract all CSS from the document (async now)
  const cssData = await extractCSS(doc);

  // Create a temporary container with proper reveal.js DOM structure
  // This is CRITICAL so that CSS selectors like .reveal h2 actually match!
  const tempContainer = document.createElement('div');
  tempContainer.className = 'reveal';  // Add reveal class for CSS selectors
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  tempContainer.style.width = '1920px'; // Typical Reveal.js size
  tempContainer.style.height = '1080px';
  tempContainer.style.visibility = 'hidden';

  // Extract and inject custom CSS for accurate computed styles
  const styleElements = doc.querySelectorAll('style');
  styleElements.forEach(styleEl => {
    const newStyle = document.createElement('style');
    newStyle.textContent = styleEl.textContent;
    tempContainer.appendChild(newStyle);
  });

  // Create inner slides container with proper class
  const slidesWrapper = document.createElement('div');
  slidesWrapper.className = 'slides';  // Add slides class for CSS selectors

  // Copy the slides content into the slides wrapper
  const slidesContainer = doc.querySelector('.reveal .slides');
  if (slidesContainer) {
    slidesWrapper.innerHTML = slidesContainer.innerHTML;
  }

  tempContainer.appendChild(slidesWrapper);
  document.body.appendChild(tempContainer);

  // Extract slides from the properly structured container
  const slideElements = slidesWrapper.querySelectorAll(':scope > section');
  const slides = [];

  slideElements.forEach((slideEl) => {
    // Check for vertical slides (nested sections)
    const verticalSlides = slideEl.querySelectorAll(':scope > section');

    if (verticalSlides.length > 0) {
      // Has vertical slides - use the first child as parent, rest as children
      const verticalSlidesArray = Array.from(verticalSlides);

      // First vertical slide becomes the parent
      const parentSlide = parseSlidePreserveHTML(verticalSlidesArray[0]);
      parentSlide.hasVerticalSlides = true;
      slides.push(parentSlide);

      // Remaining vertical slides are children
      for (let i = 1; i < verticalSlidesArray.length; i++) {
        const childSlide = parseSlidePreserveHTML(verticalSlidesArray[i]);
        childSlide.parentId = parentSlide.id;
        slides.push(childSlide);
      }
    } else {
      // No vertical slides - process normally
      const slide = parseSlidePreserveHTML(slideEl);
      slides.push(slide);
    }
  });

  // Remove the temporary container
  document.body.removeChild(tempContainer);

  // Extract settings from Reveal.initialize call if present
  const settings = extractRevealSettings(doc);

  // Extract custom JavaScript (exclude library scripts and Reveal.initialize)
  let customJS = '';
  const scriptElements = doc.querySelectorAll('script');
  scriptElements.forEach(script => {
    // Skip external scripts (those with src attribute)
    if (script.src) return;

    const content = script.textContent.trim();
    // Skip empty scripts
    if (!content) return;

    // Simple approach: Keep everything before Reveal.initialize or window.addEventListener('load'
    // These are the patterns that typically wrap Reveal.initialize
    const lines = content.split('\n');
    let customCode = [];

    for (const line of lines) {
      // Stop when we hit Reveal.initialize or the load event listener that contains it
      if (line.includes('Reveal.initialize') ||
          line.includes("window.addEventListener('load'") ||
          line.includes('window.addEventListener("load"')) {
        break;
      }

      // Skip SlideWinder-specific code that shouldn't be re-exported
      if (line.includes('dependencyResolver') ||
          line.includes('renderedContainers') ||
          line.includes('Babel.transform') ||
          line.includes('ReactDOM.render') ||
          line.includes('webglcontext') ||
          line.includes('Reveal.on(')) {
        continue;
      }

      // Keep the line (including comments and empty lines for formatting)
      customCode.push(line);
    }

    // Only add if we found custom code (not just whitespace)
    const codeText = customCode.join('\n').trim();
    if (codeText) {
      customJS += codeText + '\n\n';
    }
  });

  return {
    title,
    theme,
    slides: slides.length > 0 ? slides : [createEmptySlide()],
    settings: settings || createDefaultSettings(),
    warnings,
    customCSS: cssData.inlineCSS,
    linkedStylesheets: cssData.linkedStylesheets,
    customJS: customJS.trim()
  };
}

/**
 * Parse a slide element while preserving individual elements with their styling
 * PHASE 1: Now uses smart layout detection and enhanced positioning
 * @param {HTMLElement} slideEl - The section element representing a slide
 * @returns {Object} - Slide object with individual editable elements
 */
function parseSlidePreserveHTML(slideEl) {
  const slide = {
    id: crypto.randomUUID(),
    elements: [],
    background: { type: 'color', value: 'transparent' }, // Use transparent to allow reveal.js theme bg
    transition: null, // null = use global transition
    parentId: null, // Top-level slide (SlideWinder doesn't support nested slides from Reveal.js vertical stacks)
    notes: '' // Speaker notes (extract if present)
  };

  // Extract background settings
  const bgColor = slideEl.getAttribute('data-background-color');
  const bgImage = slideEl.getAttribute('data-background-image');
  const bgVideo = slideEl.getAttribute('data-background-video');
  const bgGradient = slideEl.getAttribute('data-background-gradient');

  if (bgGradient) {
    slide.background = { type: 'gradient', value: bgGradient };
  } else if (bgImage) {
    slide.background = { type: 'image', value: bgImage };
  } else if (bgColor) {
    slide.background = { type: 'color', value: bgColor };
  } else if (bgVideo) {
    slide.background = { type: 'video', value: bgVideo };
  }

  // Extract per-slide transition
  const transition = slideEl.getAttribute('data-transition');
  if (transition) {
    slide.transition = transition;
  }

  // Special handling for data-markdown sections
  const textarea = slideEl.querySelector('textarea[data-template]');
  if (slideEl.hasAttribute('data-markdown') && textarea) {
    // For markdown sections, parse markdown to HTML (basic parsing)
    const markdownContent = textarea.textContent.trim();
    const htmlContent = parseBasicMarkdown(markdownContent);

    slide.elements.push({
      id: crypto.randomUUID(),
      type: 'text',
      layoutMode: 'flow',  // Use flow mode for markdown content
      x: 20,
      y: 20,
      width: 920,
      height: 500,
      rotation: 0,
      content: htmlContent,
      fontSize: 32,
      color: '#000000',
      tagName: 'div',
      isFlowContainer: true
    });

    // IMPORTANT: Set slide layoutMode to 'flow' so export outputs semantic HTML
    slide.layoutMode = 'flow';

    return slide;
  }

  // PHASE 1: Detect slide layout pattern
  const layout = detectSlideLayout(slideEl);

  // Parse child elements individually with preserved styling
  const children = Array.from(slideEl.children).filter(child =>
    !child.classList.contains('notes') && child.tagName !== 'ASIDE'
  );

  // ARCHITECTURAL CHANGE: Detect if slide should use flow or absolute positioning
  const layoutMode = detectSlideLayoutMode(slideEl, children);
  slide.layoutMode = layoutMode;

  // FLOW MODE: Hybrid approach - parse simple elements individually, keep complex as containers
  if (layoutMode === 'flow') {
    slide.flowContent = slideEl.innerHTML;

    let currentY = 60; // Starting Y position
    const simpleSpacing = 15; // Space between simple elements
    const complexSpacing = 30; // Extra space for complex elements

    // Classify elements into simple (editable) and complex (containers)
    children.forEach((child) => {
      if (isSimpleTextElement(child)) {
        // Parse as individual editable element
        const element = parseSimpleFlowElement(child, currentY);
        slide.elements.push(element);
        currentY += element.height + simpleSpacing;
      } else if (isComplexElement(child)) {
        // Keep as container (iframes, styled divs, etc.)
        const container = createComplexFlowContainer(child, currentY);
        slide.elements.push(container);
        currentY += container.height + complexSpacing;
      } else {
        // Default: treat as simple element
        // This handles small elements, spans, etc.
        const element = parseSimpleFlowElement(child, currentY);
        slide.elements.push(element);
        currentY += element.height + simpleSpacing;
      }
    });

    // If no elements were parsed (empty slide or all filtered out), add single container
    if (slide.elements.length === 0) {
      const originalHTML = slideEl.innerHTML;
      const sanitizedHTML = sanitizeIframesForEditor(originalHTML);
      slide.elements.push({
        id: crypto.randomUUID(),
        type: 'text',
        layoutMode: 'flow',
        x: 20,
        y: 20,
        width: 920,
        height: 500,
        rotation: 0,
        content: originalHTML,
        editorContent: sanitizedHTML,
        fontSize: 32,
        color: '#000000',
        tagName: 'div',
        className: '',
        isFlowContainer: true
      });
    }

    return slide;
  }

  // ABSOLUTE MODE: Parse individual elements
  let elementIndex = 0;

  children.forEach((child, index) => {
    const element = parseElementWithStyles(child, elementIndex, children, layout, layoutMode);
    if (element) {
      // PHASE 1: Apply boundary detection and auto-fix (only for absolute mode)
      const adjustment = ensureWithinBounds(element);
      if (adjustment.adjusted) {
        console.log(`Auto-fixed element overflow: ${adjustment.method}`, element);
      }

      slide.elements.push(element);
      elementIndex++;
    }
  });

  return slide;
}

/**
 * Parse an element while preserving all its styling information
 * PHASE 1: Now uses smart position calculation
 * PHASE 2: Enhanced element type detection and complete style extraction
 * ARCHITECTURAL: Now supports flow mode for natural reveal.js layout
 * @param {HTMLElement} el - The HTML element to parse
 * @param {number} index - Element index for default positioning
 * @param {Array} siblings - All sibling elements
 * @param {Object} layout - Detected slide layout
 * @param {string} slideLayoutMode - 'flow' or 'absolute'
 * @returns {Object|null} - Element object with preserved styles
 */
function parseElementWithStyles(el, index, siblings = [], layout = { type: 'generic' }, slideLayoutMode = 'absolute') {
  const computedStyle = window.getComputedStyle(el);
  const tagName = el.tagName.toLowerCase();

  // Note: Flow mode slides are handled at the slide level (single container)
  // This function only processes absolute mode elements

  // ABSOLUTE MODE:

  // PHASE 1: Use smart position calculation
  const positionResult = calculateSmartPosition(el, layout, index, siblings);
  const position = { x: positionResult.x, y: positionResult.y };

  // Get size - use computed size if no explicit size set
  const size = getElementSizeFromStyle(el, computedStyle);

  // Store the positioning mode for debugging
  const positioningMode = positionResult.mode;

  // PHASE 2.5: Check for styled container divs (preserve as single element)
  // This handles cases like .video-overlay, .card, etc. that have backgrounds/styling
  if (tagName === 'div' && hasStyledBackground(el, computedStyle)) {
    const backgroundColor = computedStyle.backgroundColor;
    const bgOpacity = parseRGBA(backgroundColor);

    return {
      id: crypto.randomUUID(),
      type: 'text',
      ...position,
      ...size,
      rotation: 0,
      content: el.innerHTML, // Keep all children as HTML
      fontSize: parseInt(computedStyle.fontSize) || 32,  // Keep original size, don't scale
      color: rgbToHex(computedStyle.color) || '#ffffff',
      backgroundColor: backgroundColor,
      borderRadius: parseInt(computedStyle.borderRadius) || 0,
      padding: computedStyle.padding,
      tagName: tagName,  // Store original semantic tag (div, section, etc.)
      className: el.className,
      inlineStyle: el.getAttribute('style') || '',
      positioningMode,
      isStyledContainer: true,
      computedStyles: extractCompleteStyles(el)
    };
  }

  // PHASE 2: Check for SVG elements (high priority)
  const svgElement = parseSVGElement(el, position, size);
  if (svgElement) {
    svgElement.positioningMode = positioningMode;
    return svgElement;
  }

  // PHASE 2: Check for table elements
  const tableElement = parseTableElement(el, position, size);
  if (tableElement) {
    tableElement.positioningMode = positioningMode;
    return tableElement;
  }

  // PHASE 2: Check for code blocks
  const codeElement = parseCodeBlock(el, position, size);
  if (codeElement) {
    codeElement.positioningMode = positioningMode;
    return codeElement;
  }

  // PHASE 2: Check for lists (ul/ol)
  const listElement = parseListElement(el, position, size);
  if (listElement) {
    listElement.positioningMode = positioningMode;
    return listElement;
  }

  // Check for images
  if (tagName === 'img') {
    const gradient = extractBackgroundGradient(computedStyle);
    return {
      id: crypto.randomUUID(),
      type: 'image',
      ...position,
      ...size,
      rotation: 0,
      src: el.src,
      alt: el.alt || '',
      className: el.className,
      style: el.getAttribute('style') || '',
      positioningMode,
      // PHASE 2: Complete styles
      computedStyles: extractCompleteStyles(el),
      gradient: gradient
    };
  }

  // Check for iframes
  if (tagName === 'iframe') {
    return {
      id: crypto.randomUUID(),
      type: 'iframe',
      ...position,
      ...size,
      rotation: 0,
      htmlContent: el.getAttribute('srcdoc') || el.src || '',
      className: el.className,
      style: el.getAttribute('style') || '',
      positioningMode,
      // PHASE 2: Complete styles
      computedStyles: extractCompleteStyles(el)
    };
  }

  // Check for text elements (headings, paragraphs, divs with text, blockquotes, etc.)
  if (isTextElement(el)) {
    // Extract key styling properties from computed styles
    const rawFontSize = parseInt(computedStyle.fontSize) || 24;

    // IMPORTANT: Keep original font sizes - don't scale them!
    // Reveal.js and SlideWinder both use similar base font sizes (~32px)
    // Only positions/dimensions are scaled, not font sizes
    const fontSize = Math.round(rawFontSize);

    const color = rgbToHex(computedStyle.color) || '#000000';

    // PHASE 2: Extract background gradient if present
    const gradient = extractBackgroundGradient(computedStyle);

    // PHASE 2: Use complete style extraction
    const completeStyles = extractCompleteStyles(el);

    return {
      id: crypto.randomUUID(),
      type: 'text',
      ...position,
      ...size,
      rotation: 0,
      content: el.innerHTML,
      fontSize: fontSize, // Now properly scaled
      color: color,
      tagName: tagName, // Store original tag for semantic preservation
      className: el.className,
      inlineStyle: el.getAttribute('style') || '',
      positioningMode,
      gradient: gradient,
      // PHASE 2: Store complete computed styles (100+ properties)
      computedStyles: completeStyles
    };
  }

  return null;
}

/**
 * Extract element position from inline styles or provide default
 * Reveal.js typically uses centered, stacked layout
 * Scales from Reveal.js size (1920x1080) to SlideWinder size (960x540)
 */
function getElementPositionFromStyle(el, computedStyle, index) {
  const SCALE_FACTOR = 0.5; // 1920x1080 -> 960x540
  const style = el.style;

  // Check for absolute positioning
  if (computedStyle.position === 'absolute' && (style.left || style.top)) {
    return {
      x: Math.round((parseInt(style.left) || 50) * SCALE_FACTOR),
      y: Math.round((parseInt(style.top) || 50) * SCALE_FACTOR)
    };
  }

  // Check for transform translate
  const transform = style.transform || computedStyle.transform;
  if (transform && transform.includes('translate')) {
    const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    if (match) {
      return {
        x: Math.round((parseInt(match[1]) || 50) * SCALE_FACTOR),
        y: Math.round((parseInt(match[2]) || 50) * SCALE_FACTOR)
      };
    }
  }

  // Default: center horizontally, stack vertically with spacing
  // This mimics reveal.js's default centered layout
  return {
    x: 80, // Center horizontally with some margin
    y: 50 + (index * 80) // Stack vertically with spacing
  };
}

/**
 * Extract element size from styles or use content-based defaults
 * Scales from typical Reveal.js size (1920x1080) to SlideWinder size (960x540)
 * ARCHITECTURAL CHANGE: Now handles vh/vw/% units properly
 */
function getElementSizeFromStyle(el, computedStyle) {
  // Reveal.js typical size: 1920x1080, SlideWinder: 960x540 = 0.5 scale factor
  const REVEAL_WIDTH = 1920;
  const REVEAL_HEIGHT = 1080;
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 540;
  const SCALE = 0.5;

  let width = 0;
  let height = 0;

  // Parse width
  const inlineWidth = el.style.width;
  if (inlineWidth) {
    if (inlineWidth.endsWith('vw')) {
      const vw = parseFloat(inlineWidth);
      width = Math.round((REVEAL_WIDTH * vw / 100) * SCALE);
    } else if (inlineWidth.endsWith('%')) {
      const percent = parseFloat(inlineWidth);
      width = Math.round((REVEAL_WIDTH * percent / 100) * SCALE);
    } else if (inlineWidth.endsWith('px')) {
      width = Math.round(parseFloat(inlineWidth) * SCALE);
    } else {
      width = Math.round(parseInt(inlineWidth) * SCALE);
    }
  } else {
    const computedWidth = parseInt(computedStyle.width) || 800;
    width = Math.round(computedWidth * SCALE);
  }

  // Parse height
  const inlineHeight = el.style.height;
  if (inlineHeight) {
    if (inlineHeight.endsWith('vh')) {
      const vh = parseFloat(inlineHeight);
      height = Math.round((REVEAL_HEIGHT * vh / 100) * SCALE);
    } else if (inlineHeight.endsWith('%')) {
      const percent = parseFloat(inlineHeight);
      height = Math.round((REVEAL_HEIGHT * percent / 100) * SCALE);
    } else if (inlineHeight.endsWith('px')) {
      height = Math.round(parseFloat(inlineHeight) * SCALE);
    } else {
      height = Math.round(parseInt(inlineHeight) * SCALE);
    }
  } else {
    const computedHeight = parseInt(computedStyle.height) || 80;
    height = Math.round(computedHeight * SCALE);
  }

  return {
    width: Math.min(width, 900), // Max width for slide (960 - margins)
    height: Math.min(height, 500) // Increased max height
  };
}

/**
 * Parse a single slide element (legacy method for backwards compatibility)
 * @param {HTMLElement} slideEl - The section element representing a slide
 * @returns {Object} - Slide object
 */
function parseSlide(slideEl) {
  const slide = {
    id: crypto.randomUUID(),
    elements: [],
    background: { type: 'color', value: '#ffffff' },
    transition: null, // null = use global transition
    parentId: null,
    notes: ''
  };

  // Extract background settings
  const bgColor = slideEl.getAttribute('data-background-color');
  const bgImage = slideEl.getAttribute('data-background-image');
  const bgVideo = slideEl.getAttribute('data-background-video');

  if (bgImage) {
    slide.background = { type: 'image', value: bgImage };
  } else if (bgColor) {
    slide.background = { type: 'color', value: bgColor };
  } else if (bgVideo) {
    slide.background = { type: 'video', value: bgVideo };
  }

  // Extract per-slide transition
  const transition = slideEl.getAttribute('data-transition');
  if (transition) {
    slide.transition = transition;
  }

  // Check for React component background
  const reactBg = slideEl.querySelector('[data-react-code]');
  if (reactBg && reactBg.hasAttribute('data-react-code')) {
    slide.background.reactComponent = {
      code: reactBg.getAttribute('data-react-code') || '',
      props: reactBg.getAttribute('data-react-props') || '{}',
      css: reactBg.getAttribute('data-react-css') || ''
    };
  }

  // Parse child elements
  const children = Array.from(slideEl.children);
  children.forEach((child, index) => {
    // Skip react background containers
    if (child.hasAttribute('data-react-code')) {
      return;
    }

    const element = parseElement(child, index);
    if (element) {
      slide.elements.push(element);
    }
  });

  return slide;
}

/**
 * Parse an individual element from HTML
 * @param {HTMLElement} el - The HTML element
 * @param {number} index - The element index for positioning
 * @returns {Object|null} - Element object or null if not parseable
 */
function parseElement(el, index) {
  const tagName = el.tagName.toLowerCase();
  const style = window.getComputedStyle(el);

  // Extract position and size from inline styles or use defaults
  const position = getElementPosition(el, index);
  const size = getElementSize(el);

  // Determine element type based on tag and attributes
  if (el.hasAttribute('data-react-code')) {
    // React Component
    return {
      id: crypto.randomUUID(),
      type: 'component',
      ...position,
      ...size,
      rotation: 0,
      reactComponent: {
        code: el.getAttribute('data-react-code') || '',
        props: el.getAttribute('data-react-props') || '{}',
        css: el.getAttribute('data-react-css') || ''
      }
    };
  } else if (tagName === 'img') {
    // Image
    return {
      id: crypto.randomUUID(),
      type: 'image',
      ...position,
      ...size,
      rotation: 0,
      src: el.src
    };
  } else if (tagName === 'iframe') {
    // HTML Embed
    return {
      id: crypto.randomUUID(),
      type: 'iframe',
      ...position,
      ...size,
      rotation: 0,
      htmlContent: el.getAttribute('srcdoc') || el.src || ''
    };
  } else if (tagName === 'svg') {
    // Shape (SVG)
    return parseShape(el, position, size);
  } else if (isTextElement(el)) {
    // Text content
    return {
      id: crypto.randomUUID(),
      type: 'text',
      ...position,
      ...size,
      rotation: 0,
      content: el.innerHTML,
      fontSize: parseInt(style.fontSize) || 16,
      color: rgbToHex(style.color) || '#000000'
    };
  }

  return null;
}

/**
 * Extract element position from style or use default based on index
 * Scales from Reveal.js size to SlideWinder size
 */
function getElementPosition(el, index) {
  const SCALE_FACTOR = 0.5;
  const style = el.style;

  // Try to get absolute positioning
  if (style.left || style.top) {
    return {
      x: Math.round((parseInt(style.left) || 50) * SCALE_FACTOR),
      y: Math.round((parseInt(style.top) || 50 + (index * 100)) * SCALE_FACTOR)
    };
  }

  // Check for transform translate
  const transform = style.transform;
  if (transform && transform.includes('translate')) {
    const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    if (match) {
      return {
        x: Math.round((parseInt(match[1]) || 50) * SCALE_FACTOR),
        y: Math.round((parseInt(match[2]) || 50) * SCALE_FACTOR)
      };
    }
  }

  // Default positioning - stack vertically
  return {
    x: 80,
    y: 50 + (index * 80)
  };
}

/**
 * Extract element size from style or use defaults
 * Scales from Reveal.js size to SlideWinder size
 */
function getElementSize(el) {
  const SCALE_FACTOR = 0.5;
  const style = el.style;
  const computed = window.getComputedStyle(el);

  const width = parseInt(style.width) || parseInt(computed.width) || 200;
  const height = parseInt(style.height) || parseInt(computed.height) || 80;

  // Scale from Reveal.js dimensions to SlideWinder dimensions
  const scaledWidth = Math.round(width * SCALE_FACTOR);
  const scaledHeight = Math.round(height * SCALE_FACTOR);

  return {
    width: Math.min(scaledWidth, 800),
    height: Math.min(scaledHeight, 200)
  };
}

/**
 * Check if element contains text content
 */
function isTextElement(el) {
  const textTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'blockquote', 'ul', 'ol', 'li'];
  return textTags.includes(el.tagName.toLowerCase()) && el.textContent.trim().length > 0;
}

/**
 * Parse SVG shape element
 */
function parseShape(svgEl, position, size) {
  // Try to determine shape type from SVG content
  const circle = svgEl.querySelector('circle, ellipse');
  const rect = svgEl.querySelector('rect');
  const polygon = svgEl.querySelector('polygon');
  const path = svgEl.querySelector('path');

  let shapeType = 'rectangle'; // default

  if (circle) {
    shapeType = 'circle';
  } else if (polygon) {
    const points = polygon.getAttribute('points');
    // Try to guess shape from number of points
    if (points) {
      const pointCount = points.split(' ').filter(p => p.trim()).length;
      if (pointCount === 5) shapeType = 'pentagon';
      else if (pointCount === 6) shapeType = 'hexagon';
      else if (pointCount === 3) shapeType = 'triangle';
      else if (pointCount === 4) shapeType = 'diamond';
    }
  } else if (path) {
    // Try to detect star from path
    const d = path.getAttribute('d');
    if (d && d.includes('L') && d.split('L').length > 8) {
      shapeType = 'star';
    }
  }

  // Get fill color
  const fill = svgEl.querySelector('[fill]');
  const backgroundColor = fill ? fill.getAttribute('fill') : '#3498db';

  return {
    id: crypto.randomUUID(),
    type: 'shape',
    ...position,
    ...size,
    rotation: 0,
    shapeType,
    backgroundColor
  };
}

/**
 * Extract Reveal.js settings from initialization script
 */
function extractRevealSettings(doc) {
  const scripts = doc.querySelectorAll('script');
  let settings = null;

  scripts.forEach(script => {
    const content = script.textContent;
    if (content.includes('Reveal.initialize')) {
      // Try to extract the configuration object
      const match = content.match(/Reveal\.initialize\s*\(\s*({[\s\S]*?})\s*\)/);
      if (match) {
        try {
          let configStr = match[1];

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

          // Try to parse as JSON first (safest)
          let config;
          try {
            // Convert to proper JSON by wrapping keys in quotes
            const jsonStr = configStr.replace(/(\w+):/g, '"$1":');
            config = JSON.parse(jsonStr);
          } catch (jsonError) {
            // If JSON parsing fails, try Function constructor
            config = new Function(`return ${configStr}`)();
          }

          settings = {
            transition: config.transition || 'slide',
            backgroundTransition: config.backgroundTransition || 'fade',
            controls: config.controls !== false,
            progress: config.progress !== false,
            slideNumber: config.slideNumber || false,
            center: config.center !== false,
            loop: config.loop || false,
            autoSlide: config.autoSlide || 0,
            mouseWheel: config.mouseWheel || false
          };
        } catch (e) {
          console.warn('Could not parse Reveal.js settings:', e);
          // Return null and use defaults
        }
      }
    }
  });

  return settings;
}

/**
 * Convert RGB color to hex
 */
function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent') return '#000000';

  // Check if already hex
  if (rgb.startsWith('#')) return rgb;

  // Parse rgb(r, g, b) or rgba(r, g, b, a)
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  return '#000000';
}

/**
 * Create an empty slide
 */
function createEmptySlide() {
  return {
    id: crypto.randomUUID(),
    elements: [],
    background: { type: 'color', value: '#ffffff' },
    transition: null,
    parentId: null,
    notes: ''
  };
}

/**
 * Create default settings
 */
function createDefaultSettings() {
  return {
    transition: 'slide',
    backgroundTransition: 'fade',
    controls: true,
    progress: true,
    slideNumber: false,
    center: true,
    loop: false,
    autoSlide: 0,
    mouseWheel: false
  };
}

/**
 * Import reveal.js HTML file
 * @param {File} file - The HTML file to import
 * @returns {Promise<Object>} - Promise resolving to presentation object
 */
export function importRevealHTML(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const htmlContent = e.target.result;
        const presentation = parseRevealHTML(htmlContent);
        resolve(presentation);
      } catch (error) {
        reject(new Error(`Failed to parse reveal.js HTML: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
