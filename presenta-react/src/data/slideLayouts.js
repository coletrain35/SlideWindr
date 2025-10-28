/**
 * Built-in slide layouts for SlideWindr
 * Each layout defines a template of elements with positioning and styling
 */

export const slideLayouts = {
  blank: {
    id: 'blank',
    name: 'Blank',
    description: 'Empty slide with no content',
    thumbnail: '□',
    elements: []
  },

  titleSlide: {
    id: 'titleSlide',
    name: 'Title Slide',
    description: 'Large title with subtitle',
    thumbnail: '▬\n▬',
    elements: [
      {
        type: 'text',
        content: '<h1 style="font-size: 64px; font-weight: bold; margin: 0;">Presentation Title</h1>',
        x: 80,
        y: 180,
        width: 800,
        height: 80,
        fontSize: 64,
        color: '#000000',
        className: 'title-text',
        computedStyles: {
          textAlign: 'center',
          fontWeight: 'bold'
        }
      },
      {
        type: 'text',
        content: '<p style="font-size: 28px; margin: 0;">Your subtitle here</p>',
        x: 80,
        y: 300,
        width: 800,
        height: 40,
        fontSize: 28,
        color: '#666666',
        className: 'subtitle-text',
        computedStyles: {
          textAlign: 'center'
        }
      }
    ]
  },

  titleAndContent: {
    id: 'titleAndContent',
    name: 'Title and Content',
    description: 'Title at top with content area below',
    thumbnail: '▬\n□',
    elements: [
      {
        type: 'text',
        content: '<h2 style="font-size: 48px; font-weight: bold; margin: 0;">Slide Title</h2>',
        x: 50,
        y: 40,
        width: 860,
        height: 60,
        fontSize: 48,
        color: '#000000',
        className: 'slide-title',
        computedStyles: {
          fontWeight: 'bold'
        }
      },
      {
        type: 'text',
        content: '<ul><li>Add your content here</li><li>Use bullet points</li><li>Or any text format</li></ul>',
        x: 80,
        y: 140,
        width: 800,
        height: 320,
        fontSize: 24,
        color: '#333333',
        className: 'content-text'
      }
    ]
  },

  twoColumn: {
    id: 'twoColumn',
    name: 'Two Column',
    description: 'Title with two equal columns',
    thumbnail: '▬\n□□',
    elements: [
      {
        type: 'text',
        content: '<h2 style="font-size: 48px; font-weight: bold; margin: 0;">Slide Title</h2>',
        x: 50,
        y: 40,
        width: 860,
        height: 60,
        fontSize: 48,
        color: '#000000',
        className: 'slide-title',
        computedStyles: {
          fontWeight: 'bold'
        }
      },
      {
        type: 'text',
        content: '<h3 style="font-size: 28px; margin: 0 0 10px 0;">Left Column</h3><p>Add your content here</p>',
        x: 50,
        y: 140,
        width: 420,
        height: 340,
        fontSize: 24,
        color: '#333333',
        className: 'column-left'
      },
      {
        type: 'text',
        content: '<h3 style="font-size: 28px; margin: 0 0 10px 0;">Right Column</h3><p>Add your content here</p>',
        x: 490,
        y: 140,
        width: 420,
        height: 340,
        fontSize: 24,
        color: '#333333',
        className: 'column-right'
      }
    ]
  },

  comparison: {
    id: 'comparison',
    name: 'Comparison',
    description: 'Side-by-side comparison layout',
    thumbnail: '▬\n□ ↔ □',
    elements: [
      {
        type: 'text',
        content: '<h2 style="font-size: 48px; font-weight: bold; margin: 0;">Comparison</h2>',
        x: 50,
        y: 40,
        width: 860,
        height: 60,
        fontSize: 48,
        color: '#000000',
        className: 'slide-title',
        computedStyles: {
          fontWeight: 'bold',
          textAlign: 'center'
        }
      },
      {
        type: 'shape',
        shapeType: 'rectangle',
        x: 50,
        y: 140,
        width: 400,
        height: 340,
        backgroundColor: '#e3f2fd',
        borderColor: '#2196f3',
        borderWidth: 2,
        borderStyle: 'solid',
        rounded: 10
      },
      {
        type: 'text',
        content: '<h3 style="font-size: 28px; margin: 0 0 10px 0;">Option A</h3><ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul>',
        x: 70,
        y: 160,
        width: 360,
        height: 300,
        fontSize: 22,
        color: '#1976d2',
        className: 'comparison-left'
      },
      {
        type: 'shape',
        shapeType: 'rectangle',
        x: 510,
        y: 140,
        width: 400,
        height: 340,
        backgroundColor: '#f3e5f5',
        borderColor: '#9c27b0',
        borderWidth: 2,
        borderStyle: 'solid',
        rounded: 10
      },
      {
        type: 'text',
        content: '<h3 style="font-size: 28px; margin: 0 0 10px 0;">Option B</h3><ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul>',
        x: 530,
        y: 160,
        width: 360,
        height: 300,
        fontSize: 22,
        color: '#7b1fa2',
        className: 'comparison-right'
      }
    ]
  },

  contentWithImage: {
    id: 'contentWithImage',
    name: 'Content with Image',
    description: 'Text content on left, image on right',
    thumbnail: '▬\n□ ▢',
    elements: [
      {
        type: 'text',
        content: '<h2 style="font-size: 48px; font-weight: bold; margin: 0;">Slide Title</h2>',
        x: 50,
        y: 40,
        width: 860,
        height: 60,
        fontSize: 48,
        color: '#000000',
        className: 'slide-title',
        computedStyles: {
          fontWeight: 'bold'
        }
      },
      {
        type: 'text',
        content: '<p style="font-size: 24px; line-height: 1.6;">Add your text content here. This layout is perfect for combining text with visual elements.</p>',
        x: 50,
        y: 140,
        width: 450,
        height: 340,
        fontSize: 24,
        color: '#333333',
        className: 'content-text'
      },
      {
        type: 'shape',
        shapeType: 'rectangle',
        x: 530,
        y: 140,
        width: 380,
        height: 340,
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
        borderWidth: 2,
        borderStyle: 'dashed',
        rounded: 8
      },
      {
        type: 'text',
        content: '<p style="font-size: 20px; color: #999; text-align: center;">Click to add image</p>',
        x: 530,
        y: 290,
        width: 380,
        height: 40,
        fontSize: 20,
        color: '#999999',
        computedStyles: {
          textAlign: 'center'
        }
      }
    ]
  },

  bigNumber: {
    id: 'bigNumber',
    name: 'Big Number',
    description: 'Focus on a key statistic',
    thumbnail: '▬\n88',
    elements: [
      {
        type: 'text',
        content: '<h2 style="font-size: 36px; font-weight: bold; margin: 0;">Key Metric</h2>',
        x: 80,
        y: 80,
        width: 800,
        height: 50,
        fontSize: 36,
        color: '#000000',
        className: 'metric-label',
        computedStyles: {
          textAlign: 'center',
          fontWeight: 'bold'
        }
      },
      {
        type: 'text',
        content: '<h1 style="font-size: 120px; font-weight: bold; margin: 0; color: #2196f3;">95%</h1>',
        x: 80,
        y: 180,
        width: 800,
        height: 150,
        fontSize: 120,
        color: '#2196f3',
        className: 'big-number',
        computedStyles: {
          textAlign: 'center',
          fontWeight: 'bold'
        }
      },
      {
        type: 'text',
        content: '<p style="font-size: 28px; margin: 0;">Success Rate</p>',
        x: 80,
        y: 360,
        width: 800,
        height: 40,
        fontSize: 28,
        color: '#666666',
        className: 'metric-description',
        computedStyles: {
          textAlign: 'center'
        }
      }
    ]
  },

  quote: {
    id: 'quote',
    name: 'Quote',
    description: 'Highlight an important quote',
    thumbnail: '"\n"',
    elements: [
      {
        type: 'text',
        content: '<blockquote style="font-size: 36px; font-style: italic; margin: 0; line-height: 1.5;">"Add your inspiring quote here. Make it memorable and impactful."</blockquote>',
        x: 100,
        y: 150,
        width: 760,
        height: 200,
        fontSize: 36,
        color: '#333333',
        className: 'quote-text',
        computedStyles: {
          textAlign: 'center',
          fontStyle: 'italic',
          lineHeight: '1.5'
        }
      },
      {
        type: 'text',
        content: '<p style="font-size: 24px; margin: 0;">— Author Name</p>',
        x: 100,
        y: 380,
        width: 760,
        height: 40,
        fontSize: 24,
        color: '#666666',
        className: 'quote-author',
        computedStyles: {
          textAlign: 'right'
        }
      }
    ]
  },

  sectionHeader: {
    id: 'sectionHeader',
    name: 'Section Header',
    description: 'Introduce a new section',
    thumbnail: '━\n▬',
    elements: [
      {
        type: 'shape',
        shapeType: 'rectangle',
        x: 0,
        y: 0,
        width: 960,
        height: 540,
        backgroundColor: '#1976d2',
        borderWidth: 0
      },
      {
        type: 'text',
        content: '<h1 style="font-size: 72px; font-weight: bold; margin: 0; color: white;">Section Title</h1>',
        x: 80,
        y: 220,
        width: 800,
        height: 100,
        fontSize: 72,
        color: '#ffffff',
        className: 'section-title',
        computedStyles: {
          textAlign: 'center',
          fontWeight: 'bold'
        }
      }
    ]
  }
};

/**
 * Get all available layouts as an array
 */
export function getAvailableLayouts() {
  return Object.values(slideLayouts);
}

/**
 * Get a specific layout by ID
 */
export function getLayoutById(layoutId) {
  return slideLayouts[layoutId] || slideLayouts.blank;
}

/**
 * Apply a layout to create slide elements
 * Generates new IDs and returns element array
 */
export function applyLayout(layoutId) {
  const layout = getLayoutById(layoutId);

  // Deep clone the elements and generate new IDs
  return layout.elements.map(element => ({
    ...element,
    id: crypto.randomUUID(),
    rotation: element.rotation || 0
  }));
}
