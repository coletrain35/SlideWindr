/**
 * Presentation themes with predefined color schemes and fonts
 */

export const presentationThemes = {
  default: {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#2196f3',
      secondary: '#757575',
      accent: '#ff9800',
      background: '#ffffff',
      text: '#000000',
      textLight: '#666666'
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif'
    }
  },

  professional: {
    id: 'professional',
    name: 'Professional',
    colors: {
      primary: '#1976d2',
      secondary: '#424242',
      accent: '#0288d1',
      background: '#ffffff',
      text: '#212121',
      textLight: '#757575'
    },
    fonts: {
      heading: 'Helvetica, Arial, sans-serif',
      body: 'Helvetica, Arial, sans-serif'
    }
  },

  modern: {
    id: 'modern',
    name: 'Modern',
    colors: {
      primary: '#6200ea',
      secondary: '#03dac6',
      accent: '#ff0266',
      background: '#ffffff',
      text: '#000000',
      textLight: '#666666'
    },
    fonts: {
      heading: 'Verdana, sans-serif',
      body: 'Verdana, sans-serif'
    }
  },

  elegant: {
    id: 'elegant',
    name: 'Elegant',
    colors: {
      primary: '#4a148c',
      secondary: '#7b1fa2',
      accent: '#ba68c8',
      background: '#f5f5f5',
      text: '#212121',
      textLight: '#616161'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  },

  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    colors: {
      primary: '#e91e63',
      secondary: '#ff5722',
      accent: '#ffc107',
      background: '#ffffff',
      text: '#000000',
      textLight: '#666666'
    },
    fonts: {
      heading: 'Comic Sans MS, sans-serif',
      body: 'Comic Sans MS, sans-serif'
    }
  },

  nature: {
    id: 'nature',
    name: 'Nature',
    colors: {
      primary: '#43a047',
      secondary: '#66bb6a',
      accent: '#8bc34a',
      background: '#f1f8e9',
      text: '#1b5e20',
      textLight: '#558b2f'
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif'
    }
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0277bd',
      secondary: '#0288d1',
      accent: '#03a9f4',
      background: '#e1f5fe',
      text: '#01579b',
      textLight: '#0277bd'
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif'
    }
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#ff6f00',
      secondary: '#ff9800',
      accent: '#ffc107',
      background: '#fff3e0',
      text: '#e65100',
      textLight: '#ef6c00'
    },
    fonts: {
      heading: 'Verdana, sans-serif',
      body: 'Verdana, sans-serif'
    }
  },

  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#bb86fc',
      secondary: '#03dac6',
      accent: '#cf6679',
      background: '#121212',
      text: '#ffffff',
      textLight: '#b0b0b0'
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Arial, sans-serif'
    }
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      primary: '#000000',
      secondary: '#424242',
      accent: '#757575',
      background: '#ffffff',
      text: '#000000',
      textLight: '#9e9e9e'
    },
    fonts: {
      heading: 'Helvetica, Arial, sans-serif',
      body: 'Helvetica, Arial, sans-serif'
    }
  }
};

/**
 * Get all available themes
 */
export function getAvailableThemes() {
  return Object.values(presentationThemes);
}

/**
 * Get a theme by ID
 */
export function getThemeById(themeId) {
  return presentationThemes[themeId] || presentationThemes.default;
}

/**
 * Apply a theme to a presentation
 * Updates slide backgrounds and text colors
 */
export function applyThemeToPresentation(presentation, themeId) {
  const theme = getThemeById(themeId);

  return {
    ...presentation,
    theme: themeId,
    slides: presentation.slides.map(slide => ({
      ...slide,
      background: {
        ...slide.background,
        value: slide.background.type === 'color' ? theme.colors.background : slide.background.value
      },
      elements: slide.elements.map(element => {
        if (element.type === 'text') {
          return {
            ...element,
            color: theme.colors.text,
            computedStyles: {
              ...element.computedStyles,
              fontFamily: theme.fonts.body
            }
          };
        }
        if (element.type === 'shape' && element.backgroundColor) {
          return {
            ...element,
            backgroundColor: theme.colors.primary
          };
        }
        return element;
      })
    }))
  };
}
