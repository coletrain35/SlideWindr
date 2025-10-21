# SlideWindr

A modern, interactive presentation builder built with React, Three.js, and Tailwind CSS. Create stunning presentations with a visual editor, custom React components, and powerful export capabilities.

## Features

### Core Presentation Features
- **Visual Slide Editor** - Drag, drop, resize, and rotate elements with precise positioning controls
- **Rich Media Support** - Add text, images, shapes, and HTML embeds to your slides
- **Custom React Components** - Embed interactive React components as slide elements or backgrounds
- **Live Code Editor** - Write and preview React components with JSX, props, and CSS support
- **Visual Props Editor** - Smart UI controls automatically generated from component props (colors, sliders, toggles)
- **11 Built-in Themes** - Choose from Reveal.js themes (black, white, league, beige, sky, night, serif, simple, solarized, blood, moon)

### Slide Management
- **Unlimited Slides** - Create, duplicate, reorder, and delete slides
- **Slide Thumbnails** - Visual preview sidebar with live slide thumbnails
- **Background Options** - Solid colors, images, or interactive React components
- **Inline Text Editing** - Click to edit text directly on the canvas
- **Element Properties** - Fine-tune position, size, rotation, colors, and more

### Workflow Features
- **Auto-save** - Automatic saving to localStorage with recovery on reload
- **Save Status Indicator** - Real-time save status display (saving, saved, error)
- **Import/Export** - Multiple export formats and import capabilities
- **Dark Mode** - Beautiful dark/light theme toggle
- **Keyboard Shortcuts** - Delete (Del/Backspace), Undo (Ctrl+Z), Redo (Ctrl+Y)

### Export Options
- **HTML Export** - Generate standalone Reveal.js presentations with full functionality
- **PDF Export** - Convert presentations to PDF with quality control
- **Image Export** - Export slides as PNG or JPEG images
- **JSON Export** - Save presentation data for backup or sharing

### Advanced Features
- **Three.js Integration** - Build 3D graphics and WebGL effects in components
- **React Three Fiber** - Use R3F and Drei for declarative 3D scenes
- **Post-Processing Effects** - Add visual effects to your presentations
- **Babel Transpilation** - Write JSX that's transpiled in the browser
- **Interactive Elements** - Toggle interaction mode for embedded content
- **Presentation Settings** - Configure transitions, controls, auto-advance, looping, and more

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

**IMPORTANT:** The application code is in the `presenta-react` subdirectory. All npm commands must be run from there.

```bash
# Clone the repository
git clone <your-repo-url>
cd SlideWinder

# Navigate to the app directory
cd presenta-react

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

**Quick Start Scripts** (from project root):
```bash
# Windows users can use these convenient scripts:
dev.bat      # Starts development server
build.bat    # Builds for production
```

## Usage

### Quick Start Guide

1. **Create Slides** - Click "Add Slide" button in the sidebar to create new slides
2. **Add Elements** - Use the element toolbar to add:
   - **Text** - Editable text with font size and color controls
   - **Shapes** - Rectangles with customizable colors
   - **Images** - Add images via URL
   - **HTML Embeds** - Custom HTML/iframe content
3. **Customize Elements** - Select any element to:
   - Drag to reposition
   - Use corner handles to resize
   - Adjust properties in the right panel (position, size, rotation, colors)
   - Click text to edit inline
4. **Configure Backgrounds** - Select a slide and choose:
   - Solid color
   - Image (via URL)
   - Custom React component (advanced)
5. **Add React Components** - Click "Edit React Component" to:
   - Write JSX code with full React hooks support
   - Configure component props with visual controls
   - Add custom CSS styling
   - Use Three.js, React Three Fiber, or post-processing effects
6. **Manage Slides** - Hover over slide thumbnails to:
   - Reorder with up/down arrows
   - Duplicate slides
   - Delete slides
7. **Export** - Click "Export" to generate:
   - HTML presentation (Reveal.js format)
   - PDF document
   - PNG/JPEG images
   - JSON data file
8. **Import** - Click "Import" to load saved presentations (replace or merge modes)

## Technology Stack

### Core Framework
- **React 19.1.1** - Latest React with concurrent features
- **Vite 7.1.7** - Lightning-fast build tool and dev server with HMR
- **Tailwind CSS 4.1.14** - Utility-first CSS framework

### 3D Graphics & Rendering
- **Three.js 0.180.0** - WebGL 3D graphics library
- **@react-three/fiber 9.4.0** - React renderer for Three.js
- **@react-three/drei 10.7.6** - Useful helpers for R3F
- **@react-three/postprocessing 3.0.4** - Post-processing effects
- **postprocessing 6.37.8** - Post-processing library
- **OGL 1.0.11** - Minimal WebGL library

### Development Tools
- **@babel/standalone 7.28.4** - In-browser JSX transpilation
- **ESLint 9.36.0** - Code linting with React hooks plugin
- **TypeScript types** - Type definitions for React 19

### Export & Utilities
- **html2canvas 1.4.1** - HTML to canvas rendering
- **jsPDF 3.0.3** - PDF generation
- **DOMPurify 3.3.0** - XSS sanitization for HTML content
- **prop-types 15.8.1** - Runtime type checking

## Development

### Available Scripts

```bash
npm run dev      # Start development server (default: http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Project Structure

```
presenta-react/
├── src/
│   ├── components/          # React components
│   │   ├── App.jsx         # Main application component
│   │   ├── ElementComponent.jsx
│   │   ├── ElementProperties.jsx
│   │   ├── SlideProperties.jsx
│   │   ├── ReactComponentEditor.jsx
│   │   ├── LiveReactRenderer.jsx
│   │   ├── ComponentContainer.jsx
│   │   ├── PresentationToolbar.jsx
│   │   ├── ExportDialog.jsx
│   │   ├── ImportDialog.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── Icons.jsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAutoSave.js  # Auto-save to localStorage
│   │   └── useHistory.js   # Undo/redo functionality
│   ├── utils/              # Utility functions
│   │   ├── debounce.js     # Debouncing helper
│   │   ├── exportUtils.js  # Export functionality
│   │   └── htmlGenerator.js # Reveal.js HTML generation
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

### Key Features for Developers

- **Hot Module Replacement** - Instant updates during development
- **React 19 Features** - Latest React including concurrent rendering
- **ESLint Configuration** - Code quality enforcement with React hooks rules
- **Tailwind CSS 4** - Latest Tailwind with modern CSS features
- **Component Memoization** - Performance optimizations with React.memo
- **Debounced Updates** - Reduced re-renders for numeric inputs (150-300ms)
- **Error Boundaries** - Graceful error handling for custom components
- **localStorage Persistence** - Automatic save/restore with 2-second debounce

### Extending SlideWinder

To add new element types:
1. Add type handling in `App.jsx` `addElement()` function (src/App.jsx:142-179)
2. Add rendering logic in `ElementComponent.jsx` (src/components/ElementComponent.jsx)
3. Add property controls in `ElementProperties.jsx` (src/components/ElementProperties.jsx)

To add new export formats:
1. Add export function in `exportUtils.js` (src/utils/exportUtils.js)
2. Add UI option in `ExportDialog.jsx` (src/components/ExportDialog.jsx)
3. Wire up in `App.jsx` `handleExport()` (src/App.jsx:383-437)

## Keyboard Shortcuts

- **Delete** or **Backspace** - Delete selected element
- **Ctrl+Z** (Windows/Linux) or **Cmd+Z** (Mac) - Undo last action
- **Ctrl+Y** (Windows) or **Ctrl+Shift+Z** / **Cmd+Shift+Z** - Redo last undone action

## Browser Compatibility

SlideWinder works best in modern browsers with WebGL support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Limitations

- **Undo/Redo** - Currently disabled for debugging purposes (see src/App.jsx:60-64)
- **Export** - React components in exported HTML require internet connection for CDN libraries
- **localStorage** - Auto-save limited by browser storage quotas (~5-10MB typically)
- **PDF Export** - Complex 3D/WebGL backgrounds may not render correctly in PDF
- **Security** - Custom React components execute arbitrary code (use trusted sources only)

## Performance Tips

1. **Limit Component Complexity** - Complex Three.js scenes may impact editor performance
2. **Optimize Images** - Use compressed images and reasonable dimensions
3. **Debouncing** - Property changes are debounced to reduce re-renders
4. **Background Performance** - React component backgrounds render continuously; use simple components for backgrounds

## Troubleshooting

### Presentation won't load
- Check browser console for errors
- Clear localStorage: Open dev tools → Application → Local Storage → Clear

### Component not rendering
- Check for syntax errors in the React component code
- Ensure all imported libraries are available (Three, R3F, etc.)
- Check ErrorBoundary messages in the element

### Export failed
- **PDF/Images** - Ensure all images are loaded before export
- **HTML** - Check that component code is valid JSX
- **Large presentations** - May exceed browser memory limits

### Auto-save not working
- Check browser localStorage is enabled and not full
- Check console for save errors
- Try clearing old saves from localStorage

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT
