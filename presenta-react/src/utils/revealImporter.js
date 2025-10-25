/**
 * Utility to import and parse reveal.js HTML presentations
 * Converts reveal.js HTML format to SlideWindr internal format
 */

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
 * Parse a reveal.js HTML file and convert it to SlideWindr format
 * @param {string} htmlContent - The HTML content of the reveal.js presentation
 * @returns {Object} - Presentation object in SlideWindr format with warnings
 */
export function parseRevealHTML(htmlContent) {
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

  // Extract slides (including vertical slides - flatten them)
  const slideElements = doc.querySelectorAll('.reveal .slides > section');
  const slides = [];

  slideElements.forEach((slideEl) => {
    // Check for vertical slides (nested sections)
    const verticalSlides = slideEl.querySelectorAll(':scope > section');

    if (verticalSlides.length > 0) {
      // Has vertical slides - process each one
      verticalSlides.forEach((verticalSlide) => {
        const slide = parseSlide(verticalSlide);
        slides.push(slide);
      });
    } else {
      // No vertical slides - process normally
      const slide = parseSlide(slideEl);
      slides.push(slide);
    }
  });

  // Extract settings from Reveal.initialize call if present
  const settings = extractRevealSettings(doc);

  return {
    title,
    theme,
    slides: slides.length > 0 ? slides : [createEmptySlide()],
    settings: settings || createDefaultSettings(),
    warnings
  };
}

/**
 * Parse a single slide element
 * @param {HTMLElement} slideEl - The section element representing a slide
 * @returns {Object} - Slide object
 */
function parseSlide(slideEl) {
  const slide = {
    id: crypto.randomUUID(),
    elements: [],
    background: { type: 'color', value: '#ffffff' },
    transition: null // null = use global transition
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
 */
function getElementPosition(el, index) {
  const style = el.style;

  // Try to get absolute positioning
  if (style.left || style.top) {
    return {
      x: parseInt(style.left) || 50,
      y: parseInt(style.top) || 50 + (index * 100)
    };
  }

  // Check for transform translate
  const transform = style.transform;
  if (transform && transform.includes('translate')) {
    const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
    if (match) {
      return {
        x: parseInt(match[1]) || 50,
        y: parseInt(match[2]) || 50
      };
    }
  }

  // Default positioning - stack vertically
  return {
    x: 50,
    y: 50 + (index * 100)
  };
}

/**
 * Extract element size from style or use defaults
 */
function getElementSize(el) {
  const style = el.style;
  const computed = window.getComputedStyle(el);

  return {
    width: parseInt(style.width) || parseInt(computed.width) || 200,
    height: parseInt(style.height) || parseInt(computed.height) || 100
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

          // Remove trailing commas before closing braces
          configStr = configStr.replace(/,(\s*})/g, '$1');
          configStr = configStr.replace(/,(\s*])/g, '$1');

          // Remove comments (both // and /* */ style)
          configStr = configStr.replace(/\/\/.*$/gm, '');
          configStr = configStr.replace(/\/\*[\s\S]*?\*\//g, '');

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
    transition: null
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
