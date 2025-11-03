import { useState, useEffect, useCallback, useRef } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import LiveReactRenderer from './components/LiveReactRenderer';
import ElementComponent from './components/ElementComponent';
import SlideProperties from './components/SlideProperties';
import ElementProperties from './components/ElementProperties';
import AlignmentGuides from './components/AlignmentGuides';
import UnifiedRibbon from './components/UnifiedRibbon';
import ReactComponentEditor from './components/ReactComponentEditor';
import PerformanceWarning from './components/PerformanceWarning';
import SpeakerNotes from './components/SpeakerNotes';
import PresenterView from './components/PresenterView';
import AudienceView from './components/AudienceView';
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
    RedoIcon,
    FileTextIcon
} from './components/Icons';
import { generateRevealHTML } from './utils/htmlGenerator';
import { useHistory } from './hooks/useHistory';
import { useAutoSave } from './hooks/useAutoSave';
import { useComponentPerformance, getPerformanceWarning } from './hooks/useComponentPerformance';
import { exportSlidesAsPDF, exportAllSlidesAsImages, exportAsJSON, importFromJSON } from './utils/exportUtils';
import { importRevealHTML } from './utils/revealImporter';
import { exportToPowerPoint } from './utils/pptxUtils';
import { alignHorizontal, alignVertical, distributeElements, snapToGrid as snapPositionToGrid, findAlignmentGuides, reorderElement } from './utils/alignmentUtils';
import ExportDialog from './components/ExportDialog';
import ImportDialog from './components/ImportDialog';
import LayoutSelector from './components/LayoutSelector';
import { applyLayout } from './data/slideLayouts';

// --- Helper Functions & Constants ---
const REVEAL_THEMES = ["black", "white", "league", "beige", "sky", "night", "serif", "simple", "solarized", "blood", "moon"];

// Presenter View Wrapper - manages state for presenter mode
function PresenterViewWrapper({ presentation, initialSlideIndex }) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);

    const handleSlideChange = (newIndex) => {
        setCurrentSlideIndex(newIndex);
    };

    const handleClose = () => {
        window.close();
    };

    return (
        <PresenterView
            presentation={presentation}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={handleSlideChange}
            onClose={handleClose}
        />
    );
}

// --- Main App Component ---
export default function App() {
    // Check if we're in presenter or audience mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode'); // 'presenter' or 'audience'

    // If in presenter or audience mode, load presentation from localStorage
    if (mode === 'presenter' || mode === 'audience') {
        const storedPresentation = localStorage.getItem('slidewindr-presentation-data');
        const storedSlideIndex = parseInt(localStorage.getItem('slidewindr-presenter-slide') || '0', 10);

        if (storedPresentation) {
            const presentation = JSON.parse(storedPresentation);
            const slides = presentation.slides.filter(s => !s.parentId);
            const initialSlideIndex = Math.min(storedSlideIndex, slides.length - 1);

            if (mode === 'presenter') {
                return <PresenterViewWrapper presentation={presentation} initialSlideIndex={initialSlideIndex} />;
            } else {
                return <AudienceView presentation={presentation} initialSlideIndex={initialSlideIndex} />;
            }
        }
    }
    const initialPresentation = {
        title: "My Presentation",
        theme: "black",
        slides: [{
            id: crypto.randomUUID(),
            elements: [],
            background: { type: 'color', value: '#ffffff' },
            transition: null, // null = use global transition
            parentId: null, // null = top-level slide, otherwise ID of parent slide
            notes: '' // Speaker notes for this slide
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
    const { state: presentation, setState: setPresentation, undo, redo, canUndo, canRedo, startBatch, endBatch } = useHistory(initialPresentation);
    const { saveStatus, loadSave, clearSave } = useAutoSave(presentation);
    const [currentSlideId, setCurrentSlideId] = useState(presentation?.slides?.[0]?.id || initialPresentation.slides[0].id);
    const performanceMetrics = useComponentPerformance(presentation?.slides || [], currentSlideId);
    const performanceWarning = getPerformanceWarning(performanceMetrics);
    const [selectedElementIds, setSelectedElementIds] = useState([]);
    const selectedElementId = selectedElementIds[0] || null; // For backward compatibility
    const [dragging, setDragging] = useState(null);
    const [resizing, setResizing] = useState(null);
    const [rotating, setRotating] = useState(null);
    const [interactingElementId, setInteractingElementId] = useState(null);
    const [librariesLoaded] = useState({ babel: true, three: true, postprocessing: true });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
    const [selectedShapeType, setSelectedShapeType] = useState('rectangle');
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [previewAnimations, setPreviewAnimations] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [alignmentGuides, setAlignmentGuides] = useState(null);
    const [textEditor, setTextEditor] = useState(null); // Store TipTap editor instance
    const [marquee, setMarquee] = useState(null); // { startX, startY, endX, endY }
    const [showNotes, setShowNotes] = useState(false); // Toggle speaker notes panel
    const [notesHeight, setNotesHeight] = useState(200); // Height of notes panel in pixels
    const [showLayoutSelector, setShowLayoutSelector] = useState(false); // Layout selector modal
    const [layoutTargetSlideId, setLayoutTargetSlideId] = useState(null); // Slide to apply layout to
    const gridSize = 20;
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

    // Inject custom CSS from imported reveal.js presentations
    useEffect(() => {
        const styleId = 'revealjs-custom-css';
        let styleElement = document.getElementById(styleId);

        if (presentation?.customCSS) {
            // Create or update style element
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }
            styleElement.textContent = presentation.customCSS;
        } else {
            // Remove style element if no custom CSS
            if (styleElement) {
                styleElement.remove();
            }
        }

        // Cleanup on unmount
        return () => {
            const el = document.getElementById(styleId);
            if (el) el.remove();
        };
    }, [presentation?.customCSS]);

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

    const updateSlideNotes = useCallback((slideId, notes) => {
        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide =>
                slide.id === slideId
                    ? { ...slide, notes }
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
            fragmentOrder: 0, // 0 = always visible, 1+ = fragment reveal order
            animation: {
                type: 'none', // Animation type: fadeIn, slideInLeft, etc.
                duration: 0.5, // Duration in seconds
                delay: 0, // Delay in seconds
                easing: 'easeOut' // Easing function
            }
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
            case 'component':
                newElement = {
                    ...baseElement,
                    type,
                    width: 400,
                    height: 300,
                    reactComponent: {
                        code: '// Paste your React component code here\n// Example:\nexport default function Component() {\n  return (\n    <div style={{ padding: "20px", textAlign: "center" }}>\n      <h1>Your Component</h1>\n      <p>Edit this code in the properties panel →</p>\n    </div>\n  );\n}',
                        props: '{}',
                        css: ''
                    }
                };
                break;
            case 'table':
                // Initialize a 3x3 table with default styling
                const defaultRows = 3;
                const defaultCols = 3;
                const cellData = Array(defaultRows).fill(null).map((_, rowIdx) =>
                    Array(defaultCols).fill(null).map((_, colIdx) => {
                        // Header row
                        if (rowIdx === 0) return `Header ${colIdx + 1}`;
                        // Data rows
                        return `Cell ${rowIdx},${colIdx + 1}`;
                    })
                );
                const cellStyles = Array(defaultRows).fill(null).map((_, rowIdx) =>
                    Array(defaultCols).fill(null).map(() => ({
                        backgroundColor: rowIdx === 0 ? '#3b82f6' : '#ffffff',
                        color: rowIdx === 0 ? '#ffffff' : '#000000',
                        textAlign: 'left',
                        verticalAlign: 'middle',
                        fontWeight: rowIdx === 0 ? 'bold' : 'normal',
                        fontSize: 14,
                        padding: 8,
                        borderColor: '#d1d5db',
                        borderWidth: 1
                    }))
                );
                newElement = {
                    ...baseElement,
                    type,
                    rows: defaultRows,
                    columns: defaultCols,
                    cellData,
                    cellStyles,
                    width: 400,
                    height: 200
                };
                break;
            case 'code':
                newElement = {
                    ...baseElement,
                    type,
                    code: '// Your code here\nfunction hello() {\n  console.log("Hello, World!");\n}',
                    language: 'javascript',
                    fontSize: 14,
                    showLineNumbers: true,
                    width: 500,
                    height: 300
                };
                break;
            case 'chart':
                newElement = {
                    ...baseElement,
                    type,
                    chartType: 'bar', // bar, line, pie, doughnut, radar, polarArea
                    chartData: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                        datasets: [{
                            label: 'Sales',
                            data: [12, 19, 3, 5, 20],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.6)',
                                'rgba(54, 162, 235, 0.6)',
                                'rgba(255, 206, 86, 0.6)',
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(153, 102, 255, 0.6)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                            ],
                            borderWidth: 2,
                        }]
                    },
                    chartOptions: {
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        }
                    },
                    width: 500,
                    height: 350
                };
                break;
            case 'video':
                newElement = {
                    ...baseElement,
                    type,
                    videoUrl: '',
                    videoData: null,
                    autoplay: false,
                    loop: false,
                    muted: false,
                    controls: true,
                    objectFit: 'contain',
                    borderRadius: 0,
                    width: 640,
                    height: 360
                };
                break;
            case 'audio':
                newElement = {
                    ...baseElement,
                    type,
                    audioUrl: '',
                    audioData: null,
                    autoplay: false,
                    loop: false,
                    muted: false,
                    backgroundColor: '#f3f4f6',
                    borderRadius: 8,
                    width: 400,
                    height: 100
                };
                break;
            case 'smartart':
                newElement = {
                    ...baseElement,
                    type,
                    diagramType: 'process', // process, vertical-process, hierarchy, cycle, relationship, matrix, pyramid, funnel
                    nodes: [
                        { id: '1', text: 'Step 1', color: '#3b82f6' },
                        { id: '2', text: 'Step 2', color: '#8b5cf6' },
                        { id: '3', text: 'Step 3', color: '#ec4899' }
                    ],
                    smartArtStyle: {
                        nodeColor: '#3b82f6',
                        textColor: '#ffffff',
                        borderColor: '#1e40af',
                        borderWidth: 2,
                        fontSize: 14,
                        fontWeight: 'normal',
                        shape: 'rounded',
                        showConnectors: true,
                        connectorColor: '#64748b',
                        connectorWidth: 2,
                        connectorStyle: 'solid',
                        arrowType: 'arrow'
                    },
                    width: 600,
                    height: 300
                };
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
    const [copiedElements, setCopiedElements] = useState([]);

    const copyElement = useCallback(() => {
        if (selectedElementIds.length === 0) return;
        const elements = currentSlide?.elements?.filter(e => selectedElementIds.includes(e.id));
        if (elements && elements.length > 0) {
            setCopiedElements(elements);
        }
    }, [selectedElementIds, currentSlide]);

    const pasteElement = useCallback(() => {
        if (copiedElements.length === 0) return;

        // Create new elements with offset and new IDs
        const newElements = copiedElements.map(el => ({
            ...el,
            id: crypto.randomUUID(),
            x: el.x + 20,
            y: el.y + 20
        }));

        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide =>
                slide.id === currentSlideId ? { ...slide, elements: [...slide.elements, ...newElements] } : slide
            )
        }));

        // Select the newly pasted elements
        setSelectedElementIds(newElements.map(el => el.id));
    }, [copiedElements, currentSlideId]);

    const addSlide = useCallback(() => {
        // Show layout selector for new slide
        setLayoutTargetSlideId('new');
        setShowLayoutSelector(true);
    }, []);

    const handleLayoutSelect = useCallback((layoutId) => {
        const layoutElements = applyLayout(layoutId);

        if (layoutTargetSlideId === 'new') {
            // Create new slide with layout
            const newSlide = {
                id: crypto.randomUUID(),
                elements: layoutElements,
                background: { type: 'color', value: '#ffffff' },
                transition: null,
                parentId: null
            };
            setPresentation(prev => ({
                ...prev,
                slides: [...prev.slides, newSlide]
            }));
            setCurrentSlideId(newSlide.id);
        } else {
            // Apply layout to existing slide
            setPresentation(prev => ({
                ...prev,
                slides: prev.slides.map(slide =>
                    slide.id === layoutTargetSlideId
                        ? { ...slide, elements: layoutElements }
                        : slide
                )
            }));
        }

        setLayoutTargetSlideId(null);
    }, [layoutTargetSlideId]);

    const addNestedSlide = useCallback((parentId) => {
        const newSlide = {
            id: crypto.randomUUID(),
            elements: [],
            background: { type: 'color', value: '#ffffff' },
            transition: null,
            parentId: parentId // nested under parent
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

    // Alignment and arrangement functions
    const handleAlign = useCallback((alignment) => {
        if (selectedElementIds.length === 0) return;

        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide => {
                if (slide.id !== currentSlideId) return slide;

                const selectedElements = slide.elements.filter(el => selectedElementIds.includes(el.id));
                let alignedElements;

                if (['left', 'center', 'right'].includes(alignment)) {
                    alignedElements = alignHorizontal(selectedElements, alignment, 960);
                } else if (['top', 'middle', 'bottom'].includes(alignment)) {
                    alignedElements = alignVertical(selectedElements, alignment, 540);
                } else {
                    return slide;
                }

                // Create a map of aligned elements for quick lookup
                const alignedMap = new Map(alignedElements.map(el => [el.id, el]));

                return {
                    ...slide,
                    elements: slide.elements.map(el =>
                        alignedMap.has(el.id) ? alignedMap.get(el.id) : el
                    )
                };
            })
        }));
    }, [selectedElementIds, currentSlideId]);

    const handleDistribute = useCallback((direction) => {
        if (selectedElementIds.length < 3) return;

        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide => {
                if (slide.id !== currentSlideId) return slide;

                const selectedElements = slide.elements.filter(el => selectedElementIds.includes(el.id));
                const distributedElements = distributeElements(selectedElements, direction);

                // Create a map of distributed elements for quick lookup
                const distributedMap = new Map(distributedElements.map(el => [el.id, el]));

                return {
                    ...slide,
                    elements: slide.elements.map(el =>
                        distributedMap.has(el.id) ? distributedMap.get(el.id) : el
                    )
                };
            })
        }));
    }, [selectedElementIds, currentSlideId]);

    const handleReorder = useCallback((action) => {
        if (selectedElementIds.length === 0) return;

        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide => {
                if (slide.id !== currentSlideId) return slide;

                let newElements = [...slide.elements];

                // Apply reorder action to each selected element
                // Do it in reverse order for 'forward'/'front' to maintain relative order
                const idsToReorder = action === 'forward' || action === 'front'
                    ? [...selectedElementIds].reverse()
                    : selectedElementIds;

                idsToReorder.forEach(elementId => {
                    newElements = reorderElement(newElements, elementId, action);
                });

                return { ...slide, elements: newElements };
            })
        }));
    }, [selectedElementIds, currentSlideId]);

    // Group/Ungroup functions
    const groupElements = useCallback(() => {
        if (selectedElementIds.length < 2) return;

        const groupId = crypto.randomUUID();
        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide => {
                if (slide.id !== currentSlideId) return slide;

                return {
                    ...slide,
                    elements: slide.elements.map(el =>
                        selectedElementIds.includes(el.id)
                            ? { ...el, groupId }
                            : el
                    )
                };
            })
        }));
    }, [selectedElementIds, currentSlideId]);

    const ungroupElements = useCallback(() => {
        if (selectedElementIds.length === 0) return;

        // Get the groupIds of selected elements
        const slide = presentationRef.current.slides.find(s => s.id === currentSlideId);
        if (!slide) return;

        const groupIds = new Set(
            slide.elements
                .filter(el => selectedElementIds.includes(el.id) && el.groupId)
                .map(el => el.groupId)
        );

        if (groupIds.size === 0) return;

        setPresentation(prev => ({
            ...prev,
            slides: prev.slides.map(slide => {
                if (slide.id !== currentSlideId) return slide;

                return {
                    ...slide,
                    elements: slide.elements.map(el =>
                        groupIds.has(el.groupId)
                            ? { ...el, groupId: undefined }
                            : el
                    )
                };
            })
        }));
    }, [selectedElementIds, currentSlideId]);

    const handleMouseDown = useCallback((e, elementId) => {
        e.stopPropagation();
        setInteractingElementId(null);

        // Get fresh element data from current presentation state
        const slide = presentationRef.current.slides.find(s => s.id === currentSlideId);
        if (!slide) return;

        // Check if this element is part of a group and auto-select the group
        const clickedElement = slide.elements.find(el => el.id === elementId);
        if (clickedElement && clickedElement.groupId && !e.ctrlKey && !e.metaKey) {
            // Select all elements in the same group
            const groupElementIds = slide.elements
                .filter(el => el.groupId === clickedElement.groupId)
                .map(el => el.id);
            setSelectedElementIds(groupElementIds);
            return;
        }

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

        // Start batching history updates
        startBatch();
    }, [currentSlideId, selectedElementIds, startBatch]);

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

        // Start batching history updates
        startBatch();
    }, [currentSlideId, startBatch]);

    const handleRotateMouseDown = useCallback((e, elementId) => {
        e.stopPropagation();
        setInteractingElementId(null);
        setSelectedElementIds([elementId]);

        // Get fresh element data from current presentation state
        const slide = presentationRef.current.slides.find(s => s.id === currentSlideId);
        if (!slide) return;

        const element = slide.elements.find(el => el.id === elementId);
        if (!element) return;

        isDraggingOrResizingRef.current = true;

        // Calculate center of element for rotation
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const centerX = canvasRect.left + element.x + element.width / 2;
        const centerY = canvasRect.top + element.y + element.height / 2;

        setRotating({
            elementId: element.id,
            centerX,
            centerY,
            initialRotation: element.rotation || 0,
        });

        // Start batching history updates
        startBatch();
    }, [currentSlideId, startBatch]);

    const handleCanvasMouseMove = useCallback((e) => {
        if (interactingElementId) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();

        // Update marquee if active
        if (marquee) {
            const x = e.clientX - canvasRect.left;
            const y = e.clientY - canvasRect.top;
            setMarquee(prev => ({ ...prev, endX: x, endY: y }));
            return;
        }

        if (dragging) {
            // Get current slide for smart guides
            const slide = presentationRef.current.slides.find(s => s.id === currentSlideId);
            if (!slide) return;

            // Move all selected elements using their respective offsets
            dragging.offsets.forEach((offset, index) => {
                let newX = e.clientX - canvasRect.left - offset.offsetX;
                let newY = e.clientY - canvasRect.top - offset.offsetY;

                // Apply snap-to-grid if enabled (only for first element to avoid desync)
                if (snapToGrid && index === 0) {
                    newX = snapPositionToGrid(newX, gridSize);
                    newY = snapPositionToGrid(newY, gridSize);
                }

                // Find smart guides (only for first/primary dragging element)
                if (index === 0) {
                    const draggedElement = slide.elements.find(el => el.id === offset.id);
                    if (draggedElement) {
                        const otherElements = slide.elements.filter(el => !selectedElementIds.includes(el.id));
                        const tempElement = { ...draggedElement, x: newX, y: newY };
                        const guides = findAlignmentGuides(tempElement, otherElements);

                        // Apply snap if guides are found
                        if (guides.snapX !== null) newX = guides.snapX;
                        if (guides.snapY !== null) newY = guides.snapY;

                        // Update alignment guides for visual display
                        setAlignmentGuides(guides.vertical.length > 0 || guides.horizontal.length > 0 ? guides : null);
                    }
                }

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

            // Apply snap-to-grid if enabled
            if (snapToGrid) {
                newX = snapPositionToGrid(newX, gridSize);
                newY = snapPositionToGrid(newY, gridSize);
                newWidth = snapPositionToGrid(newWidth, gridSize);
                newHeight = snapPositionToGrid(newHeight, gridSize);
            }

            if (newWidth > 20 && newHeight > 20) {
                updateElement(resizing.elementId, { x: newX, y: newY, width: newWidth, height: newHeight });
            }
        }
        if (rotating) {
            // Calculate angle between mouse position and element center
            const dx = e.clientX - rotating.centerX;
            const dy = e.clientY - rotating.centerY;

            // Calculate angle in degrees (0 = right, 90 = down, 180 = left, 270 = up)
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);

            // Adjust to match CSS rotation (0 = up, 90 = right, 180 = down, 270 = left)
            angle = angle + 90;

            // Normalize to 0-360
            if (angle < 0) angle += 360;

            // Snap to 15-degree increments if shift key is held
            if (e.shiftKey) {
                angle = Math.round(angle / 15) * 15;
            }

            updateElement(rotating.elementId, { rotation: Math.round(angle) });
        }
    }, [dragging, resizing, rotating, updateElement, interactingElementId, snapToGrid, gridSize, currentSlideId, selectedElementIds, marquee]);

    const handleCanvasMouseDown = useCallback((e) => {
        // Only start marquee if clicking on canvas (not on an element)
        if (e.target !== e.currentTarget) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;

        // If not holding Ctrl/Cmd, clear selection
        if (!e.ctrlKey && !e.metaKey) {
            setSelectedElementIds([]);
        }

        // Start marquee selection
        setMarquee({ startX: x, startY: y, endX: x, endY: y });
        setInteractingElementId(null);
    }, []);

    const handleCanvasMouseUp = useCallback(() => {
        isDraggingOrResizingRef.current = false;

        // End batching if any operation was in progress
        if (dragging || resizing || rotating) {
            endBatch();
        }

        setDragging(null);
        setResizing(null);
        setRotating(null);
        setAlignmentGuides(null); // Clear guides when done dragging

        // Handle marquee selection
        if (marquee) {
            const { startX, startY, endX, endY } = marquee;
            const marqueeRect = {
                left: Math.min(startX, endX),
                top: Math.min(startY, endY),
                right: Math.max(startX, endX),
                bottom: Math.max(startY, endY),
            };

            // Find all elements that intersect with marquee
            const slide = presentationRef.current.slides.find(s => s.id === currentSlideId);
            if (slide) {
                const selectedIds = slide.elements
                    .filter(el => {
                        const elRect = {
                            left: el.x,
                            top: el.y,
                            right: el.x + el.width,
                            bottom: el.y + el.height,
                        };
                        // Check if rectangles intersect
                        return !(elRect.right < marqueeRect.left ||
                                elRect.left > marqueeRect.right ||
                                elRect.bottom < marqueeRect.top ||
                                elRect.top > marqueeRect.bottom);
                    })
                    .map(el => el.id);

                setSelectedElementIds(selectedIds);
            }

            setMarquee(null);
        }
    }, [marquee, currentSlideId, dragging, resizing, rotating, endBatch]);

    const handleCanvasMouseLeave = useCallback(() => {
        // End batching if any operation was in progress
        if (dragging || resizing || rotating) {
            endBatch();
        }

        setDragging(null);
        setResizing(null);
        setRotating(null);
        setAlignmentGuides(null); // Clear guides when leaving canvas
        setMarquee(null); // Clear marquee when leaving canvas
    }, [dragging, resizing, rotating, endBatch]);

    const getBackgroundStyle = useCallback((bg) => {
        if (!bg) return { backgroundColor: '#ffffff' };
        if (bg.type === 'color') {
            // Handle transparent backgrounds for imported reveal.js slides
            if (bg.value === 'transparent') return { backgroundColor: 'transparent' };
            return { backgroundColor: bg.value };
        }
        if (bg.type === 'image') return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
        if (bg.type === 'gradient') return { background: bg.value };
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
            // Group: Ctrl+G or Cmd+G
            else if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey && !isInputFocused) {
                e.preventDefault();
                groupElements();
            }
            // Ungroup: Ctrl+Shift+G or Cmd+Shift+G
            else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'g' && !isInputFocused) {
                e.preventDefault();
                ungroupElements();
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
    }, [selectedElementIds, deleteElement, undo, redo, copyElement, pasteElement, currentSlideId, groupElements, ungroupElements]);

    const generateHTML = () => {
        generateRevealHTML(presentation);
    };

    const startPresenterMode = () => {
        // Save current presentation to localStorage
        localStorage.setItem('slidewindr-presentation-data', JSON.stringify(presentation));
        localStorage.setItem('slidewindr-presenter-slide', '0');

        // Open presenter window
        const presenterWindow = window.open(
            `${window.location.origin}${window.location.pathname}?mode=presenter`,
            'slidewindr-presenter',
            'width=1200,height=800'
        );

        // Open audience window (fullscreen)
        const audienceWindow = window.open(
            `${window.location.origin}${window.location.pathname}?mode=audience`,
            'slidewindr-audience',
            'width=1920,height=1080'
        );

        if (!presenterWindow || !audienceWindow) {
            alert('Please allow pop-ups to use Presenter Mode');
        }
    };

    const handleExport = async (options) => {
        const { type, format, quality, scale } = options;

        try {
            if (type === 'html') {
                generateRevealHTML(presentation);
            } else if (type === 'pptx') {
                await exportToPowerPoint(presentation);
            } else if (type === 'json') {
                exportAsJSON(presentation, presentation.title || 'presentation');
            } else if (type === 'pdf') {
                // Get all slide elements from the canvas
                const slideElements = presentation.slides.map((_, index) => {
                    // Create temporary slide elements for export
                    const tempDiv = document.createElement('div');
                    tempDiv.style.width = '960px';
                    tempDiv.style.height = '540px';
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
                    tempDiv.style.height = '540px';
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

    const handleImport = async (file, mode, fileType) => {
        try {
            let importedData;

            if (fileType === 'html') {
                importedData = await importRevealHTML(file);

                // Show warnings if any unsupported features were detected
                if (importedData.warnings?.hasWarnings) {
                    const warningMessage = buildWarningMessage(importedData.warnings);
                    const proceed = window.confirm(warningMessage);
                    if (!proceed) {
                        throw new Error('Import cancelled by user');
                    }
                }
            } else {
                importedData = await importFromJSON(file);
            }

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

    const buildWarningMessage = (warnings) => {
        let message = '⚠️ IMPORT WARNINGS\n\n';
        message += 'The following Reveal.js features are not supported and will be lost:\n\n';

        const highSeverity = warnings.features.filter(f => f.severity === 'high');
        const mediumSeverity = warnings.features.filter(f => f.severity === 'medium');
        const lowSeverity = warnings.features.filter(f => f.severity === 'low');

        if (highSeverity.length > 0) {
            message += '🔴 HIGH IMPACT:\n';
            highSeverity.forEach(f => {
                message += `  • ${f.name} (${f.count}x): ${f.description}\n`;
            });
            message += '\n';
        }

        if (mediumSeverity.length > 0) {
            message += '🟡 MEDIUM IMPACT:\n';
            mediumSeverity.forEach(f => {
                message += `  • ${f.name} (${f.count}x): ${f.description}\n`;
            });
            message += '\n';
        }

        if (lowSeverity.length > 0) {
            message += '🟢 LOW IMPACT:\n';
            lowSeverity.forEach(f => {
                message += `  • ${f.name} (${f.count}x): ${f.description}\n`;
            });
            message += '\n';
        }

        message += 'Do you want to continue with the import?';
        return message;
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
                            onClick={() => setShowNotes(!showNotes)}
                            className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
                                showNotes
                                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                            title="Toggle Speaker Notes"
                        >
                            <FileTextIcon className="w-4 h-4" />
                            <span>Notes</span>
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

            {/* Performance Warning Banner */}
            <PerformanceWarning warning={performanceWarning} />

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
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {presentation?.slides?.filter(s => !s.parentId).map((slide, index) => {
                            // Find nested slides under this parent
                            const nestedSlides = presentation.slides.filter(s => s.parentId === slide.id);
                            const allSlidesInGroup = [slide, ...nestedSlides];

                            return (
                                <div key={slide.id} className="space-y-2">
                                    {/* Parent slide */}
                                    <div className="space-y-1">
                                        <div
                                            onClick={() => setCurrentSlideId(slide.id)}
                                            className={`
                                                relative group cursor-pointer rounded-xl transition-all duration-200
                                                ${currentSlideId === slide.id
                                                    ? 'ring-2 ring-blue-500 shadow-lg scale-105'
                                                    : 'hover:shadow-md hover:scale-102'
                                                }
                                            `}
                                            style={{ width: '192px', height: '108px' }}
                                        >
                                            {/* Slide Number Badge */}
                                            <div className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                                                {presentation.slides.filter(s => !s.parentId).indexOf(slide) + 1}
                                            </div>

                                            {/* Add Nested Slide Badge */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addNestedSlide(slide.id) }}
                                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1 transition-all hover:scale-105"
                                                title="Add nested slide under this slide (vertical navigation)"
                                            >
                                                <PlusIcon className="w-3 h-3" />
                                                <span>Nested</span>
                                            </button>

                                            {/* Slide Thumbnail */}
                                            <div
                                                className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                                style={{ ...getBackgroundStyle(slide.background), width: '192px', height: '108px' }}
                                            >
                                                <div style={{ width: '960px', height: '540px', transform: 'scale(0.2)', transformOrigin: 'top left' }}>
                                                    {slide.elements.map(el => {
                                                        const style = { position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, transform: `rotate(${el.rotation || 0}deg)` };
                                                        if (el.type === 'text') return <div key={el.id} style={{ ...style, fontSize: el.fontSize, color: el.color, overflow: 'hidden' }}>{el.content}</div>
                                                        if (el.type === 'shape') return <div key={el.id} style={{ ...style, backgroundColor: el.backgroundColor }}></div>
                                                        if (el.type === 'image' || el.type === 'iframe') return <div key={el.id} style={{ ...style, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666' }}>IMG</div>
                                                        if (el.type === 'chart') return <div key={el.id} style={{ ...style, border: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#6366f1', backgroundColor: '#eef2ff' }}>CHART</div>
                                                        if (el.type === 'table') return <div key={el.id} style={{ ...style, border: '2px solid #eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#eab308', backgroundColor: '#fefce8' }}>TABLE</div>
                                                        if (el.type === 'code') return <div key={el.id} style={{ ...style, border: '2px solid #ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#ec4899', backgroundColor: '#fdf2f8' }}>CODE</div>
                                                        if (el.type === 'component') return <div key={el.id} style={{ ...style, border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#a855f7', backgroundColor: '#faf5ff' }}>COMP</div>
                                                        return null;
                                                    })}
                                                </div>
                                            </div>

                                            {/* Slide Controls Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:opacity-100 opacity-0 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                                <button
                                                    title="Move Up"
                                                    onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, -1) }}
                                                    className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transform hover:scale-110 transition-all text-xs"
                                                >
                                                    <ChevronUpIcon />
                                                </button>
                                                <button
                                                    title="Move Down"
                                                    onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, 1) }}
                                                    className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transform hover:scale-110 transition-all text-xs"
                                                >
                                                    <ChevronDownIcon />
                                                </button>
                                                <button
                                                    title="Add Nested Slide"
                                                    onClick={(e) => { e.stopPropagation(); addNestedSlide(slide.id) }}
                                                    className="p-1.5 rounded-full bg-purple-500/90 hover:bg-purple-600 text-white shadow-md transform hover:scale-110 transition-all text-xs"
                                                >
                                                    <PlusIcon />
                                                </button>
                                                <button
                                                    title="Duplicate"
                                                    onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id) }}
                                                    className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transform hover:scale-110 transition-all text-xs"
                                                >
                                                    <CopyIcon />
                                                </button>
                                                <button
                                                    title="Delete"
                                                    onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id) }}
                                                    className="p-1.5 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-md transform hover:scale-110 transition-all text-xs"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Nested slides */}
                                        {nestedSlides.map((nestedSlide, nestedIndex) => (
                                            <div
                                                key={nestedSlide.id}
                                                onClick={() => setCurrentSlideId(nestedSlide.id)}
                                                className={`
                                                    ml-6 relative group cursor-pointer rounded-xl transition-all duration-200
                                                    ${currentSlideId === nestedSlide.id
                                                        ? 'ring-2 ring-purple-500 shadow-lg scale-105'
                                                        : 'hover:shadow-md hover:scale-102'
                                                    }
                                                `}
                                                style={{ width: '192px', height: '108px' }}
                                            >
                                                {/* Nested indicator */}
                                                <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 h-px bg-gray-400 dark:bg-gray-600"></div>

                                                {/* Slide Number Badge */}
                                                <div className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                                                    {nestedIndex + 1}
                                                </div>

                                                {/* Slide Thumbnail */}
                                                <div
                                                    className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                                                    style={{ ...getBackgroundStyle(nestedSlide.background), width: '192px', height: '108px' }}
                                                >
                                                    <div style={{ width: '960px', height: '540px', transform: 'scale(0.2)', transformOrigin: 'top left' }}>
                                                        {nestedSlide.elements.map(el => {
                                                            const style = { position: 'absolute', left: el.x, top: el.y, width: el.width, height: el.height, transform: `rotate(${el.rotation || 0}deg)` };
                                                            if (el.type === 'text') return <div key={el.id} style={{ ...style, fontSize: el.fontSize, color: el.color, overflow: 'hidden' }}>{el.content}</div>
                                                            if (el.type === 'shape') return <div key={el.id} style={{ ...style, backgroundColor: el.backgroundColor }}></div>
                                                            if (el.type === 'image' || el.type === 'iframe') return <div key={el.id} style={{ ...style, border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666' }}>IMG</div>
                                                            if (el.type === 'chart') return <div key={el.id} style={{ ...style, border: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#6366f1', backgroundColor: '#eef2ff' }}>CHART</div>
                                                            if (el.type === 'table') return <div key={el.id} style={{ ...style, border: '2px solid #eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#eab308', backgroundColor: '#fefce8' }}>TABLE</div>
                                                            if (el.type === 'code') return <div key={el.id} style={{ ...style, border: '2px solid #ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#ec4899', backgroundColor: '#fdf2f8' }}>CODE</div>
                                                            if (el.type === 'component') return <div key={el.id} style={{ ...style, border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#a855f7', backgroundColor: '#faf5ff' }}>COMP</div>
                                                            return null;
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Slide Controls Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:opacity-100 opacity-0 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                                    <button
                                                        title="Move Up"
                                                        onClick={(e) => { e.stopPropagation(); moveSlide(nestedSlide.id, -1) }}
                                                        className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transform hover:scale-110 transition-all text-xs"
                                                    >
                                                        <ChevronUpIcon />
                                                    </button>
                                                    <button
                                                        title="Move Down"
                                                        onClick={(e) => { e.stopPropagation(); moveSlide(nestedSlide.id, 1) }}
                                                        className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transform hover:scale-110 transition-all text-xs"
                                                    >
                                                        <ChevronDownIcon />
                                                    </button>
                                                    <button
                                                        title="Duplicate"
                                                        onClick={(e) => { e.stopPropagation(); duplicateSlide(nestedSlide.id) }}
                                                        className="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-md transform hover:scale-110 transition-all text-xs"
                                                    >
                                                        <CopyIcon />
                                                    </button>
                                                    <button
                                                        title="Delete"
                                                        onClick={(e) => { e.stopPropagation(); deleteSlide(nestedSlide.id) }}
                                                        className="p-1.5 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-md transform hover:scale-110 transition-all text-xs"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col p-4 bg-gray-200 dark:bg-gray-900">
                    {/* Unified Ribbon - Single adaptive toolbar */}
                    <UnifiedRibbon
                        settings={presentation.settings}
                        updateSettings={updatePresentationSettings}
                        undo={undo}
                        redo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        addElement={addElement}
                        selectedShapeType={selectedShapeType}
                        setSelectedShapeType={setSelectedShapeType}
                        selectedElement={selectedElement}
                        selectedElementIds={selectedElementIds}
                        updateElement={updateElement}
                        deleteElement={deleteElement}
                        copyElement={copyElement}
                        pasteElement={pasteElement}
                        onAlign={handleAlign}
                        onDistribute={handleDistribute}
                        onReorder={handleReorder}
                        showGrid={showGrid}
                        onToggleGrid={() => setShowGrid(!showGrid)}
                        snapToGrid={snapToGrid}
                        onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
                        previewAnimations={previewAnimations}
                        onTogglePreviewAnimations={() => {
                            setPreviewAnimations(!previewAnimations);
                            setAnimationKey(prev => prev + 1);
                        }}
                        editor={textEditor}
                    />

                    <div className={`flex-1 flex flex-col ${showNotes ? '' : 'items-center justify-center'}`}>
                        <div className={`flex ${showNotes ? 'flex-1' : ''} items-center justify-center`}>
                            <div
                                ref={canvasRef}
                                className="shadow-lg relative bg-cover bg-center"
                                style={{ width: 960, height: 540, ...getBackgroundStyle(currentSlide?.background) }}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseLeave}
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
                            {/* Alignment Guides and Grid */}
                            <AlignmentGuides
                                guides={alignmentGuides}
                                showGrid={showGrid}
                                gridSize={gridSize}
                                canvasWidth={960}
                                canvasHeight={540}
                            />
                            {currentSlide?.elements.map(el => (
                                <ElementComponent
                                    key={el.id}
                                    element={el}
                                    onMouseDown={handleMouseDown}
                                    onResizeMouseDown={handleResizeMouseDown}
                                    onRotateMouseDown={handleRotateMouseDown}
                                    isSelected={selectedElementIds.includes(el.id)}
                                    isMultiSelected={selectedElementIds.length > 1 && selectedElementIds.includes(el.id)}
                                    updateElement={updateElement}
                                    isInteracting={interactingElementId === el.id}
                                    setInteractingElementId={setInteractingElementId}
                                    librariesLoaded={librariesLoaded}
                                    onEditorReady={setTextEditor}
                                    previewAnimations={previewAnimations}
                                    animationKey={animationKey}
                                />
                            ))}
                            {/* Marquee Selection Rectangle */}
                            {marquee && (
                                <div
                                    className="absolute pointer-events-none border-2 border-blue-500 bg-blue-500/10"
                                    style={{
                                        left: Math.min(marquee.startX, marquee.endX),
                                        top: Math.min(marquee.startY, marquee.endY),
                                        width: Math.abs(marquee.endX - marquee.startX),
                                        height: Math.abs(marquee.endY - marquee.startY),
                                    }}
                                />
                            )}
                            </div>
                        </div>

                        {/* Speaker Notes Panel */}
                        {showNotes && (
                            <div style={{ height: `${notesHeight}px` }} className="w-full">
                                <SpeakerNotes
                                    notes={currentSlide?.notes || ''}
                                    onNotesChange={(notes) => updateSlideNotes(currentSlideId, notes)}
                                    slideNumber={presentation.slides.filter(s => !s.parentId).indexOf(currentSlide) + 1}
                                />
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Panel - Element Properties & React Component Editor */}
                <aside className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                    {selectedElement ? (
                        <div className="space-y-6">
                            {/* Element Properties */}
                            <ElementProperties
                                selectedElement={selectedElement}
                                updateElement={updateElement}
                            />

                            {/* Advanced Features - React Component */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Advanced Features
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Add custom React components with Three.js, animations, and more.
                                </p>

                                <ReactComponentEditor
                                    componentData={selectedElement.reactComponent}
                                    onChange={(newComponentData) => {
                                        updateElement(selectedElement.id, { reactComponent: newComponentData });
                                    }}
                                    title="React Component"
                                />
                            </div>
                        </div>
                    ) : currentSlide ? (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Slide Background
                            </h3>
                            <SlideProperties
                                currentSlide={currentSlide}
                                updateSlideSettings={updateSlideSettings}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                            <p className="text-sm">Select a slide or element</p>
                        </div>
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

            {/* Layout Selector */}
            <LayoutSelector
                isOpen={showLayoutSelector}
                onClose={() => {
                    setShowLayoutSelector(false);
                    setLayoutTargetSlideId(null);
                }}
                onSelectLayout={handleLayoutSelect}
            />
        </div>
    );
}
