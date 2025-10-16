# SlideWindr

A modern, interactive presentation builder built with React, Three.js, and Tailwind CSS.

## Features

- **Visual Slide Editor** - Drag and drop elements, resize, and position with ease
- **Rich Media Support** - Add text, images, shapes, and custom React components
- **Interactive Backgrounds** - Create stunning backgrounds with WebGL-powered effects
- **Visual Props Editor** - Adjust component properties without writing code
- **Dark Mode** - Beautiful dark/light theme support
- **Auto-save** - Never lose your work with automatic saving to localStorage
- **Undo/Redo** - Full history management for all edits
- **Export** - Generate PDFs or export your presentation data

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Create Slides** - Use the sidebar to add new slides
2. **Add Elements** - Click toolbar buttons to add text, images, shapes, or React components
3. **Customize** - Use the properties panel to adjust colors, sizes, and more
4. **Add Backgrounds** - Choose from color, image, or interactive React components
5. **Present** - Enter presentation mode to view your slides

## Technology Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Three.js** - 3D graphics and WebGL
- **@react-three/fiber** - React renderer for Three.js
- **postprocessing** - Post-processing effects
- **@babel/standalone** - Runtime JSX compilation for custom components
- **html2canvas & jspdf** - PDF export

## Development

This project uses:
- ESLint for code linting
- Vite for fast HMR (Hot Module Replacement)
- React 19 with the latest features

To expand the ESLint configuration for production, see the [Vite React TypeScript template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts).

## License

MIT
