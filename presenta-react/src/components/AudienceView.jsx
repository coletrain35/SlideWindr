import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from './ErrorBoundary';
import LiveReactRenderer from './LiveReactRenderer';
import ElementComponent from './ElementComponent';

/**
 * Audience View - Fullscreen presentation view for the audience
 * Syncs with presenter view via localStorage
 */
const AudienceView = ({ presentation, initialSlideIndex }) => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
    const [librariesLoaded] = useState({ babel: true, three: true, postprocessing: true });

    const slides = presentation.slides.filter(s => !s.parentId); // Only top-level slides
    const currentSlide = slides[currentSlideIndex];

    // Listen for slide changes from presenter window
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'slidewindr-presenter-slide') {
                const newIndex = parseInt(e.newValue, 10);
                if (!isNaN(newIndex)) {
                    setCurrentSlideIndex(newIndex);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Handle keyboard navigation in audience window
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
                e.preventDefault();
                if (currentSlideIndex < slides.length - 1) {
                    const newIndex = currentSlideIndex + 1;
                    setCurrentSlideIndex(newIndex);
                    // Notify presenter window
                    localStorage.setItem('slidewindr-audience-slide', newIndex.toString());
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
                if (currentSlideIndex > 0) {
                    const newIndex = currentSlideIndex - 1;
                    setCurrentSlideIndex(newIndex);
                    // Notify presenter window
                    localStorage.setItem('slidewindr-audience-slide', newIndex.toString());
                }
            } else if (e.key === 'Home') {
                e.preventDefault();
                setCurrentSlideIndex(0);
                localStorage.setItem('slidewindr-audience-slide', '0');
            } else if (e.key === 'End') {
                e.preventDefault();
                const lastIndex = slides.length - 1;
                setCurrentSlideIndex(lastIndex);
                localStorage.setItem('slidewindr-audience-slide', lastIndex.toString());
            } else if (e.key === 'Escape') {
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlideIndex, slides.length]);

    // Request fullscreen on mount
    useEffect(() => {
        const enterFullscreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (err) {
                console.error('Failed to enter fullscreen:', err);
            }
        };
        enterFullscreen();
    }, []);

    const getBackgroundStyle = (bg) => {
        if (!bg) return { backgroundColor: '#ffffff' };
        if (bg.type === 'color') return { backgroundColor: bg.value };
        if (bg.type === 'image') return {
            backgroundImage: `url(${bg.value})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
        return { backgroundColor: '#ffffff' };
    };

    if (!currentSlide) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center text-white text-2xl">
                End of Presentation
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            <div
                className="relative bg-cover bg-center"
                style={{ ...getBackgroundStyle(currentSlide.background), width: '960px', height: '540px' }}
            >
                {/* Background React Component */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {Object.values(librariesLoaded).every(Boolean) && currentSlide.background?.reactComponent && (
                        <ErrorBoundary fallbackMessage="Failed to render background component">
                            <LiveReactRenderer
                                id={currentSlide.id}
                                component={currentSlide.background.reactComponent}
                            />
                        </ErrorBoundary>
                    )}
                </div>

                {/* Elements */}
                {currentSlide.elements.map(el => (
                    <ElementComponent
                        key={el.id}
                        element={el}
                        onMouseDown={() => {}}
                        onResizeMouseDown={() => {}}
                        onRotateMouseDown={() => {}}
                        isSelected={false}
                        isMultiSelected={false}
                        updateElement={() => {}}
                        isInteracting={false}
                        setInteractingElementId={() => {}}
                        librariesLoaded={librariesLoaded}
                        onEditorReady={() => {}}
                        previewAnimations={false}
                        animationKey={0}
                    />
                ))}
            </div>

            {/* Slide Number (subtle, bottom right) */}
            <div className="fixed bottom-4 right-4 text-white text-sm opacity-50">
                {currentSlideIndex + 1} / {slides.length}
            </div>
        </div>
    );
};

AudienceView.propTypes = {
    presentation: PropTypes.object.isRequired,
    initialSlideIndex: PropTypes.number.isRequired,
};

export default AudienceView;
