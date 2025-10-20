import { useState, useEffect, useCallback, useRef } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import LiveReactRenderer from './components/LiveReactRenderer';
import ElementComponent from './components/ElementComponent';
import SlideProperties from './components/SlideProperties';
import ElementProperties from './components/ElementProperties';
import PresentationToolbar from './components/PresentationToolbar';
import {
    TypeIcon,
    SquareIcon,
    ImageIcon,
    CodeIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    CopyIcon,
    TrashIcon,
    MoonIcon,
    SunIcon,
    DownloadIcon,
    SettingsIcon,
    PlusIcon,
    UndoIcon,
    RedoIcon
} from './components/Icons';
import { generateRevealHTML } from './utils/htmlGenerator';
import { useHistory } from './hooks/useHistory';
import { useAutoSave } from './hooks/useAutoSave';
import { exportSlidesAsPDF, exportAllSlidesAsImages, exportAsJSON, importFromJSON } from './utils/exportUtils';
import ExportDialog from './components/ExportDialog';
import ImportDialog from './components/ImportDialog';

// --- Helper Functions & Constants ---
const REVEAL_THEMES = ["black", "white", "league", "beige", "sky", "night", "serif", "simple", "solarized", "blood", "moon"];

// --- Main App Component ---
export default function App() {
    const initialPresentation = {
        title: "My Presentation",
        theme: "black",
        slides: [{
            id: crypto.randomUUID(),
            elements: [],
            background: { type: 'color', value: '#ffffff' }
        }],
        settings: {
            transition: 'slide',
            backgroundTransition: 'fade',
            controls: true,
            progress: true,
            slideNumber: false,
            center: true,
            loop: false,
            autoSlide: 0,
            mouseWheel: false,
        }
    };

    // Use history hook for undo/redo functionality
    const { state: presentation, setState: setPresentation, undo, redo, canUndo, canRedo } = useHistory(initialPresentation);
    const { saveStatus, loadSave, clearSave } = useAutoSave(presentation);
    const [currentSlideId, setCurrentSlideId] = useState(presentation?.slides?.[0]?.id || initialPresentation.slides[0].id);
    const [selectedElementIds, setSelectedElementIds] = useState([]);
    const selectedElementId = selectedElementIds[0] || null; // For backward compatibility
    const [dragging, setDragging] = useState(null);
    const [resizing, setResizing] = useState(null);
    const [interactingElementId, setInteractingElementId] = useState(null);
    const [librariesLoaded] = useState({ babel: true, three: true, postprocessing: true });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
    const [selectedShapeType, setSelectedShapeType] = useState('rectangle');
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const canvasRef = useRef(null);
    const slideRefs = useRef([]);
    const hasCheckedRecovery = useRef(false);
    const isDraggingOrResizingRef = useRef(false);
    const presentationRef = useRef(presentation);

    // Keep presentation ref in sync
    useEffect(() => {
        presentationRef.current = presentation;
    }, [presentation]);

    // Check for auto-saved data on mount
    useEffect(() => {
        if (hasCheckedRecovery.current) return;
        hasCheckedRecovery.current = true;

        const saved = loadSave();
        if (saved && saved.data) {
            const timeDiff = Date.now() - (saved.timestamp ? saved.timestamp.getTime() : 0);
            const minutesAgo = Math.floor(timeDiff / 60000);

            // Show recovery dialog if there's saved data
            if (window.confirm(
                `Auto-saved presentation found (${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago).\n\nWould you like to recover it?`
            )) {
                setPresentation(saved.data);
                setCurrentSlideId(saved.data.slides[0]?.id);
            } else {
                // User declined recovery, clear the save
                clearSave();
            }
        }
    }, [loadSave, clearSave, setPresentation]);

    const currentSlide = presentation?.slides?.find(s => s.id === currentSlideId);
    const selectedElement = currentSlide?.elements?.find(e => e.id === selectedElementId);

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

    const updateSlideSettings = useCallback((slideId, newSettings) => {
        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide =>
                slide.id === slideId
                    ? { ...slide, ...newSettings }
                    : slide
            )
        }));
    }, []);

    const updatePresentationSettings = useCallback((newSettings) => {
        setPresentation(prev => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings }
        }));
    }, []);

    const addElement = useCallback((type) => {
        const baseElement = {
            id: crypto.randomUUID(),
            x: 50,
            y: 50,
            width: 200,
            height: 100,
            rotation: 0,
        };
        let newElement;
        switch (type) {
            case 'text':
                newElement = { ...baseElement, type, content: 'New Text', fontSize: 24, color: '#000000', height: 50, width: 150 };
                break;
            case 'shape': {
                // Adjust dimensions based on shape type for proper aspect ratios
                let shapeWidth = 200;
                let shapeHeight = 100;

                // For circular/square shapes, make them square
                if (['circle', 'star', 'pentagon', 'hexagon'].includes(selectedShapeType)) {
                    shapeWidth = 150;
                    shapeHeight = 150;
                }
                // For diamond, use square aspect
                else if (selectedShapeType === 'diamond') {
                    shapeWidth = 150;
                    shapeHeight = 150;
                }
                // For triangle, use reasonable proportions
                else if (selectedShapeType === 'triangle') {
                    shapeWidth = 150;
                    shapeHeight = 130;
                }

                newElement = {
                    ...baseElement,
                    type,
                    shapeType: selectedShapeType,
                    backgroundColor: '#3b82f6',
                    width: shapeWidth,
                    height: shapeHeight
                };
                break;
            }
            case 'image':
                // Create placeholder image that can be updated via properties panel
                newElement = {
                    ...baseElement,
                    type,
                    src: 'https://placehold.co/600x400/d1d5db/374151?text=Upload+Image',
                    imageData: null,
                    width: 300,
                    height: 200
                };
                break;
            case 'iframe':
                newElement = { ...baseElement, type, htmlContent: '<div style="font-family: sans-serif; text-align: center; padding: 20px;">\n  <h1 style="color: #3b82f6;">Hello, World!</h1>\n  <p>Edit this code in the properties panel.</p>\n</div>', width: 400, height: 300 };
                break;
            default:
                return;
        }

        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide =>
                slide.id === currentSlideId ? { ...slide, elements: [...slide.elements, newElement] } : slide
            )
        }));
        setSelectedElementIds([newElement.id]);
    }, [currentSlideId, selectedShapeType]);

    const deleteElement = useCallback(() => {
        if (selectedElementIds.length === 0) return;
        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide =>
                slide.id === currentSlideId
                    ? { ...slide, elements: slide.elements.filter(el => !selectedElementIds.includes(el.id)) }
                    : slide
            )
        }));
        setSelectedElementIds([]);
    }, [currentSlideId, selectedElementIds]);

    // Clipboard state for copy/paste
    const [copiedElement, setCopiedElement] = useState(null);

    const copyElement = useCallback(() => {
        if (!selectedElementId) return;
        const element = currentSlide?.elements?.find(e => e.id === selectedElementId);
        if (element) {
            setCopiedElement(element);
        }
    }, [selectedElementId, currentSlide]);

    const pasteElement = useCallback(() => {
        if (!copiedElement) return;
        const newElement = {
            ...copiedElement,
            id: crypto.randomUUID(),
            x: copiedElement.x + 20,
            y: copiedElement.y + 20
        };
        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide =>
                slide.id === currentSlideId ? { ...slide, elements: [...slide.elements, newElement] } : slide
            )
        }));
        setSelectedElementIds([newElement.id]);
    }, [copiedElement, currentSlideId]);

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

    const duplicateSlide = useCallback((slideId) => {
        setPresentation(prev => {
            const slideToDuplicate = prev.slides.find(s => s.id === slideId);
            if (!slideToDuplicate) return prev;
            const newSlide = {
                ...slideToDuplicate,
                id: crypto.randomUUID(),
                elements: slideToDuplicate.elements.map(el => ({ ...el, id: crypto.randomUUID() }))
            };
            const slideIndex = prev.slides.findIndex(s => s.id === slideId);
            const newSlides = [...prev.slides];
            newSlides.splice(slideIndex + 1, 0, newSlide);
            setCurrentSlideId(newSlide.id);
            return { ...prev, slides: newSlides };
        });
    }, []);

    const moveSlide = useCallback((slideId, direction) => {
        setPresentation(prev => {
            const index = prev.slides.findIndex(s => s.id === slideId);
            if ((index === 0 && direction === -1) || (index === prev.slides.length - 1 && direction === 1)) return prev;

            const newSlides = [...prev.slides];
            const [movedSlide] = newSlides.splice(index, 1);
            newSlides.splice(index + direction, 0, movedSlide);
            return { ...prev, slides: newSlides };
        });
    }, []);

    const handleMouseDown = useCallback((e, elementId) => {
        e.stopPropagation();
        setInteractingElementId(null);

        // Handle multi-selection with Ctrl/Cmd key
        if (e.ctrlKey || e.metaKey) {
            setSelectedElementIds(prev => {
                if (prev.includes(elementId)) {
                    // Remove from selection if already selected
                    return prev.filter(id => id !== elementId);
                } else {
                    // Add to selection
                    return [...prev, elementId];
                }
            });
            return; // Don't start dragging when multi-selecting
        } else {
            // Single selection (replace existing selection)
            setSelectedElementIds([elementId]);
        }

        // Get fresh element data from current presentation state
        const slide = presentationRef.current.slides.find(s => s.id === currentSlideId);
        if (!slide) return;

        const element = slide.elements.find(el => el.id === elementId);
        if (!element) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        isDraggingOrResizingRef.current = true;

        // For multi-selection, store offsets for all selected elements
        const elementsToMove = selectedElementIds.length > 1 ?
            slide.elements.filter(el => selectedElementIds.includes(el.id)) :
            [element];

        const offsets = elementsToMove.map(el => ({
            id: el.id,
            offsetX: e.clientX - canvasRect.left - el.x,
            offsetY: e.clientY - canvasRect.top - el.y,
        }));

        setDragging({
            elementId: element.id,
            offsets: offsets, // Store all element offsets for multi-move
        });
    }, [currentSlideId, selectedElementIds]);

    const handleResizeMouseDown = useCallback((e, elementId, handle) => {
        e.stopPropagation();
        setInteractingElementId(null);
        setSelectedElementIds([elementId]);

        // Get fresh element data from current presentation state
        const slide = presentationRef.current.slides.find(s => s.id === currentSlideId);
        if (!slide) return;

        const element = slide.elements.find(el => el.id === elementId);
        if (!element) return;

        isDraggingOrResizingRef.current = true;
        setResizing({
            elementId: element.id, // Store ID instead of whole element
            handle,
            initialMouseX: e.clientX,
            initialMouseY: e.clientY,
            initialX: element.x,
            initialY: element.y,
            initialWidth: element.width,
            initialHeight: element.height,
        });
    }, [currentSlideId]);

    const handleCanvasMouseMove = useCallback((e) => {
        if (interactingElementId) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        if (dragging) {
            // Move all selected elements using their respective offsets
            dragging.offsets.forEach(offset => {
                let newX = e.clientX - canvasRect.left - offset.offsetX;
                let newY = e.clientY - canvasRect.top - offset.offsetY;
                updateElement(offset.id, { x: newX, y: newY });
            });
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
                updateElement(resizing.elementId, { x: newX, y: newY, width: newWidth, height: newHeight });
            }
        }
    }, [dragging, resizing, updateElement, interactingElementId]);

    const handleCanvasMouseUp = useCallback(() => {
        isDraggingOrResizingRef.current = false;
        setDragging(null);
        setResizing(null);
    }, []);

    const handleCanvasMouseLeave = useCallback(() => {
        setDragging(null);
        setResizing(null);
    }, []);

    const getBackgroundStyle = useCallback((bg) => {
        if (!bg) return { backgroundColor: '#ffffff' };
        if (bg.type === 'color') return { backgroundColor: bg.value };
        if (bg.type === 'image') return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        return { backgroundColor: '#ffffff' };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check if focus is in an input field
            const isInputFocused = document.activeElement.tagName === "INPUT" ||
                                   document.activeElement.tagName === "TEXTAREA" ||
                                   document.activeElement.isContentEditable;

            // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isInputFocused) {
                e.preventDefault();
                undo();
            }
            // Redo: Ctrl+Shift+Z (Windows/Linux) or Cmd+Shift+Z (Mac) or Ctrl+Y (Windows)
            else if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
                if (!isInputFocused) {
                    e.preventDefault();
                    redo();
                }
            }
            // Copy: Ctrl+C or Cmd+C
            else if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !isInputFocused && selectedElementId) {
                e.preventDefault();
                copyElement();
            }
            // Paste: Ctrl+V or Cmd+V
            else if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !isInputFocused) {
                e.preventDefault();
                pasteElement();
            }
            // Select All: Ctrl+A or Cmd+A
            else if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !isInputFocused) {
                e.preventDefault();
                const slide = presentationRef.current.slides.find(s => s.id === currentSlideId);
                if (slide && slide.elements.length > 0) {
                    setSelectedElementIds(slide.elements.map(el => el.id));
                }
            }
        };

        const handleKeyUp = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedElementIds.length > 0 && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && !document.activeElement.isContentEditable) {
                    deleteElement();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [selectedElementIds, deleteElement, undo, redo, copyElement, pasteElement, currentSlideId]);

    const generateHTML = () => {
        generateRevealHTML(presentation);
    };

    const handleExport = async (options) => {
        const { type, format, quality, scale } = options;

        try {
            if (type === 'html') {
                generateRevealHTML(presentation);
            } else if (type === 'json') {
                exportAsJSON(presentation, presentation.title || 'presentation');
            } else if (type === 'pdf') {
                // Get all slide elements from the canvas
                const slideElements = presentation.slides.map((_, index) => {
                    // Create temporary slide elements for export
                    const tempDiv = document.createElement('div');
                    tempDiv.style.width = '960px';
                    tempDiv.style.height = '700px';
                    tempDiv.style.position = 'absolute';
                    tempDiv.style.left = '-10000px';

                    const slide = presentation.slides[index];
                    const bgStyle = getBackgroundStyle(slide.background);
                    Object.assign(tempDiv.style, bgStyle);

                    document.body.appendChild(tempDiv);
                    return tempDiv;
                });

                await exportSlidesAsPDF(slideElements, presentation.title || 'presentation', { quality, scale });

                // Clean up temp elements
                slideElements.forEach(el => document.body.removeChild(el));
            } else if (type === 'images') {
                const slideElements = presentation.slides.map((_, index) => {
                    const tempDiv = document.createElement('div');
                    tempDiv.style.width = '960px';
                    tempDiv.style.height = '700px';
                    tempDiv.style.position = 'absolute';
                    tempDiv.style.left = '-10000px';

                    const slide = presentation.slides[index];
                    const bgStyle = getBackgroundStyle(slide.background);
                    Object.assign(tempDiv.style, bgStyle);

                    document.body.appendChild(tempDiv);
                    return tempDiv;
                });

                await exportAllSlidesAsImages(slideElements, presentation.title || 'slide', { format, quality, scale });

                slideElements.forEach(el => document.body.removeChild(el));
            }
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    };

    const handleImport = async (file, mode) => {
        try {
            const importedData = await importFromJSON(file);

            if (mode === 'replace') {
                setPresentation(importedData);
                setCurrentSlideId(importedData.slides[0]?.id);
                setSelectedElementIds([]);
            } else if (mode === 'merge') {
                setPresentation(prev => ({
                    ...prev,
                    slides: [...prev.slides, ...importedData.slides]
                }));
            }
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    };

    const toggleTheme = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 font-sans flex flex-col h-screen w-screen overflow-hidden">
            {/* Modern Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md backdrop-blur-lg bg-white/80 dark:bg-gray-800/80">
                <div className="px-6 py-3 flex justify-between items-center">
                    {/* Left: Logo & Title */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/slidewindr-icon.png"
                                alt="SlideWindr"
                                className="w-10 h-10 object-contain"
                            />
                            <img
                                src="/slidewindr-wordmark.png"
                                alt="SlideWindr"
                                className="h-8 object-contain hidden sm:block"
                            />
                        </div>

                        {/* Presentation Title - Editable */}
                        <div className="ml-6 pl-6 border-l border-gray-200 dark:border-gray-700">
                            <input
                                type="text"
                                value={presentation.title}
                                onChange={(e) => setPresentation(p => ({ ...p, title: e.target.value }))}
                                className="text-sm font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 min-w-[200px] text-gray-900 dark:text-gray-100"
                                placeholder="Untitled Presentation"
                            />
                        </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center gap-3">
                        {/* Save Status Indicator */}
                        {saveStatus !== 'idle' && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                                {saveStatus === 'saving' && (
                                    <>
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">Saving...</span>
                                    </>
                                )}
                                {saveStatus === 'saved' && (
                                    <>
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
                                    </>
                                )}
                                {saveStatus === 'error' && (
                                    <>
                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span className="text-xs text-red-600 dark:text-red-400">Save Failed</span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Theme Selector */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Theme
                            </label>
                            <select
                                value={presentation.theme}
                                onChange={(e) => setPresentation(p => ({ ...p, theme: e.target.value }))}
                                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={() => setShowImportDialog(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
                            title="Import Presentation"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Import</span>
                        </button>

                        <button
                            onClick={() => setShowExportDialog(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Modern Sidebar */}
                <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
                        {presentation?.slides?.map((slide, index) => (
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
                                    className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                    style={getBackgroundStyle(slide.background)}
                                >
                                    <div className="w-full h-full transform scale-[0.2] origin-top-left">
                                        {slide.elements.map(el => {
                                            const style = { position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, transform: `rotate(${el.rotation || 0}deg)` };
                                            if (el.type === 'text') return <div key={el.id} style={{ ...style, fontSize: el.fontSize, color: el.color, overflow: 'hidden' }}>{el.content}</div>
                                            if (el.type === 'shape') return <div key={el.id} style={{ ...style, backgroundColor: el.backgroundColor }}></div>
                                            if (el.type === 'image' || el.type === 'iframe') return <div key={el.id} style={{ ...style, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>MEDIA</div>
                                            return null;
                                        })}
                                    </div>
                                </div>

                                {/* Slide Controls Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:opacity-100 opacity-0 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                    <button
                                        title="Move Up"
                                        onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, -1) }}
                                        className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transform hover:scale-110 transition-all"
                                    >
                                        <ChevronUpIcon />
                                    </button>
                                    <button
                                        title="Move Down"
                                        onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, 1) }}
                                        className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transform hover:scale-110 transition-all"
                                    >
                                        <ChevronDownIcon />
                                    </button>
                                    <button
                                        title="Duplicate"
                                        onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id) }}
                                        className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transform hover:scale-110 transition-all"
                                    >
                                        <CopyIcon />
                                    </button>
                                    <button
                                        title="Delete"
                                        onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id) }}
                                        className="p-2 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-md transform hover:scale-110 transition-all"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col p-4 bg-gray-200 dark:bg-gray-900">
                    <PresentationToolbar
                        settings={presentation.settings}
                        updateSettings={updatePresentationSettings}
                        undo={undo}
                        redo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                    />
                    {/* Modern Element Toolbar */}
                    <div className="mb-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
                        <button
                            onClick={() => addElement('text')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm font-medium"
                        >
                            <TypeIcon /> Text
                        </button>
                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                            <button
                                onClick={() => addElement('shape')}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all text-sm font-medium whitespace-nowrap"
                            >
                                <SquareIcon /> {selectedShapeType.charAt(0).toUpperCase() + selectedShapeType.slice(1)}
                            </button>
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />
                            <select
                                value={selectedShapeType}
                                onChange={(e) => setSelectedShapeType(e.target.value)}
                                className="px-3 py-2 bg-transparent text-gray-700 dark:text-gray-300 text-sm font-medium cursor-pointer border-none outline-none hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
                            >
                                <option value="rectangle">Rectangle</option>
                                <option value="circle">Circle</option>
                                <option value="ellipse">Ellipse</option>
                                <option value="triangle">Triangle</option>
                                <option value="diamond">Diamond</option>
                                <option value="arrow">Arrow</option>
                                <option value="line">Line</option>
                                <option value="star">Star</option>
                                <option value="pentagon">Pentagon</option>
                                <option value="hexagon">Hexagon</option>
                            </select>
                        </div>
                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                        <button
                            onClick={() => addElement('image')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all text-sm font-medium"
                        >
                            <ImageIcon /> Image
                        </button>
                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
                        <button
                            onClick={() => addElement('iframe')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all text-sm font-medium"
                        >
                            <CodeIcon /> HTML Embed
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <div
                            ref={canvasRef}
                            className="shadow-lg relative bg-cover bg-center"
                            style={{ width: 960, height: 700, ...getBackgroundStyle(currentSlide?.background) }}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseLeave}
                            onClick={() => { setSelectedElementIds([]); setInteractingElementId(null); }}
                        >
                            <div className="absolute inset-0 w-full h-full pointer-events-none">
                                {Object.values(librariesLoaded).every(Boolean) && currentSlide?.background?.reactComponent && (
                                    <ErrorBoundary fallbackMessage="Failed to render background component">
                                        <LiveReactRenderer
                                            id={currentSlide.id}
                                            component={currentSlide.background.reactComponent}
                                        />
                                    </ErrorBoundary>
                                )}
                            </div>
                            {currentSlide?.elements.map(el => (
                                <ElementComponent
                                    key={el.id}
                                    element={el}
                                    onMouseDown={handleMouseDown}
                                    onResizeMouseDown={handleResizeMouseDown}
                                    isSelected={selectedElementIds.includes(el.id)}
                                    isMultiSelected={selectedElementIds.length > 1 && selectedElementIds.includes(el.id)}
                                    updateElement={updateElement}
                                    isInteracting={interactingElementId === el.id}
                                    setInteractingElementId={setInteractingElementId}
                                    librariesLoaded={librariesLoaded}
                                />
                            ))}
                        </div>
                    </div>
                </main>

                {/* Modern Properties Panel */}
                <aside className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                    {selectedElement ? (
                        <ElementProperties selectedElement={selectedElement} updateElement={updateElement} deleteElement={deleteElement} copyElement={copyElement} pasteElement={pasteElement} />
                    ) : (
                        <SlideProperties currentSlide={currentSlide} updateSlideSettings={updateSlideSettings} />
                    )}
                </aside>
            </div>

            {/* Export Dialog */}
            <ExportDialog
                isOpen={showExportDialog}
                onClose={() => setShowExportDialog(false)}
                onExport={handleExport}
                presentationTitle={presentation.title}
            />

            {/* Import Dialog */}
            <ImportDialog
                isOpen={showImportDialog}
                onClose={() => setShowImportDialog(false)}
                onImport={handleImport}
            />
        </div>
    );
}
