import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Presenter View - Control panel for presentations
 * Shows current slide, next slide preview, notes, timer, and controls
 */
const PresenterView = ({ presentation, currentSlideIndex, onSlideChange, onClose }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const timerRef = useRef(null);

    const slides = presentation.slides.filter(s => !s.parentId); // Only top-level slides
    const currentSlide = slides[currentSlideIndex];
    const nextSlide = slides[currentSlideIndex + 1];

    // Timer logic
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isTimerRunning]);

    // Sync slide changes to audience window via localStorage
    useEffect(() => {
        localStorage.setItem('slidewindr-presenter-slide', currentSlideIndex.toString());
        localStorage.setItem('slidewindr-presenter-timestamp', Date.now().toString());
    }, [currentSlideIndex]);

    // Listen for navigation from audience window
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'slidewindr-audience-slide') {
                const newIndex = parseInt(e.newValue, 10);
                if (!isNaN(newIndex) && newIndex !== currentSlideIndex) {
                    onSlideChange(newIndex);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [currentSlideIndex, onSlideChange]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePrevSlide = () => {
        if (currentSlideIndex > 0) {
            onSlideChange(currentSlideIndex - 1);
        }
    };

    const handleNextSlide = () => {
        if (currentSlideIndex < slides.length - 1) {
            onSlideChange(currentSlideIndex + 1);
        }
    };

    const resetTimer = () => {
        setElapsedTime(0);
    };

    // Render slide preview
    const renderSlidePreview = (slide) => {
        if (!slide) return null;

        const getBackgroundStyle = (bg) => {
            if (!bg) return { backgroundColor: '#ffffff' };
            if (bg.type === 'color') return { backgroundColor: bg.value };
            if (bg.type === 'image') return { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover' };
            return { backgroundColor: '#ffffff' };
        };

        return (
            <div
                className="relative bg-cover bg-center"
                style={{ ...getBackgroundStyle(slide.background), width: '100%', height: '100%' }}
            >
                {slide.elements.map(el => (
                    <div
                        key={el.id}
                        className="absolute"
                        style={{
                            left: `${(el.x / 960) * 100}%`,
                            top: `${(el.y / 540) * 100}%`,
                            width: `${(el.width / 960) * 100}%`,
                            height: `${(el.height / 540) * 100}%`,
                            transform: `rotate(${el.rotation || 0}deg)`,
                        }}
                    >
                        {el.type === 'text' && (
                            <div
                                dangerouslySetInnerHTML={{ __html: el.content }}
                                style={{
                                    fontSize: `${(el.fontSize / 960) * 100}%`,
                                    color: el.color,
                                    width: '100%',
                                    height: '100%',
                                }}
                            />
                        )}
                        {el.type === 'shape' && (
                            <div style={{ backgroundColor: el.backgroundColor, width: '100%', height: '100%' }} />
                        )}
                        {el.type === 'image' && (
                            <img src={el.imageData || el.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                <h1 className="text-lg font-bold">Presenter View - {presentation.title}</h1>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
                >
                    End Presentation
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Current Slide (Large) */}
                <div className="flex-[2] p-4 flex flex-col">
                    <div className="flex-1 bg-black rounded-lg overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
                        {renderSlidePreview(currentSlide)}
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-400">
                        Slide {currentSlideIndex + 1} of {slides.length}
                    </div>
                </div>

                {/* Right: Controls, Next Slide, Notes */}
                <div className="flex-1 p-4 flex flex-col gap-4 bg-gray-800">
                    {/* Timer and Controls */}
                    <div className="bg-gray-900 rounded-lg p-4">
                        <div className="text-center mb-4">
                            <div className="text-4xl font-mono font-bold text-green-400">{formatTime(elapsedTime)}</div>
                            <div className="text-xs text-gray-500 mt-1">Elapsed Time</div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsTimerRunning(!isTimerRunning)}
                                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
                            >
                                {isTimerRunning ? 'Pause' : 'Resume'}
                            </button>
                            <button
                                onClick={resetTimer}
                                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="bg-gray-900 rounded-lg p-4">
                        <div className="text-sm font-semibold mb-2 text-gray-400">Navigation</div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevSlide}
                                disabled={currentSlideIndex === 0}
                                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={handleNextSlide}
                                disabled={currentSlideIndex === slides.length - 1}
                                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                                Next →
                            </button>
                        </div>
                    </div>

                    {/* Next Slide Preview */}
                    <div className="bg-gray-900 rounded-lg p-4 flex-1 flex flex-col min-h-0">
                        <div className="text-sm font-semibold mb-2 text-gray-400">Next Slide</div>
                        {nextSlide ? (
                            <div className="flex-1 bg-black rounded overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                {renderSlidePreview(nextSlide)}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-black rounded text-gray-600 text-sm">
                                End of presentation
                            </div>
                        )}
                    </div>

                    {/* Speaker Notes */}
                    <div className="bg-gray-900 rounded-lg p-4 flex-1 flex flex-col min-h-0">
                        <div className="text-sm font-semibold mb-2 text-gray-400">Speaker Notes</div>
                        <div className="flex-1 overflow-y-auto text-sm text-gray-300 whitespace-pre-wrap">
                            {currentSlide?.notes || <span className="text-gray-600 italic">No notes for this slide</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

PresenterView.propTypes = {
    presentation: PropTypes.object.isRequired,
    currentSlideIndex: PropTypes.number.isRequired,
    onSlideChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default PresenterView;
