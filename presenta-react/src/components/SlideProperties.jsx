import React from 'react';
import PropTypes from 'prop-types';
import ReactComponentEditor from './ReactComponentEditor';

const SlideProperties = ({ currentSlide, updateSlideSettings }) => {
    if (!currentSlide) return <p>No slide selected.</p>;

    const { background } = currentSlide;

    const handleBgChange = (prop, value) => {
        const newBg = { ...background, [prop]: value };
        updateSlideSettings(currentSlide.id, { background: newBg });
    };

    const handleBgTypeChange = (newType) => {
        let newValue = background.value || '';
        if (newType === 'color' && !background.value?.startsWith('#')) newValue = '#ffffff';
        // Combine multiple updates into single state change for better performance
        updateSlideSettings(currentSlide.id, {
            background: { ...background, type: newType, value: newValue }
        });
    };

    return (
        <div>
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Slide Properties</h2>
            <div className="space-y-4 text-sm">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                    <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wide text-xs">Background</h3>
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => handleBgTypeChange('color')}
                            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                                background.type === 'color'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                            }`}
                        >
                            Color
                        </button>
                        <button
                            onClick={() => handleBgTypeChange('image')}
                            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                                background.type === 'image'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                            }`}
                        >
                            Image
                        </button>
                    </div>
                    {background.type === 'color' && (
                        <div>
                            <label htmlFor="bg-color" className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Color:</label>
                            <input
                                id="bg-color"
                                type="color"
                                value={background.value}
                                onChange={e => handleBgChange('value', e.target.value)}
                                className="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                        </div>
                    )}
                    {background.type === 'image' && (
                        <div>
                            <label htmlFor="bg-image-url" className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Image URL:</label>
                            <input
                                id="bg-image-url"
                                type="text"
                                value={background.value}
                                onChange={e => handleBgChange('value', e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    )}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <ReactComponentEditor
                        title="Background Component"
                        componentData={background.reactComponent}
                        onChange={(data) => handleBgChange('reactComponent', data)}
                    />
                </div>
            </div>
        </div>
    );
};

SlideProperties.propTypes = {
    currentSlide: PropTypes.shape({
        id: PropTypes.string.isRequired,
        background: PropTypes.shape({
            type: PropTypes.oneOf(['color', 'image']).isRequired,
            value: PropTypes.string.isRequired,
            reactComponent: PropTypes.shape({
                code: PropTypes.string,
                props: PropTypes.string,
                css: PropTypes.string
            })
        }).isRequired,
        elements: PropTypes.array
    }),
    updateSlideSettings: PropTypes.func.isRequired
};

// Memoize to prevent re-renders when slide data hasn't changed
export default React.memo(SlideProperties);
