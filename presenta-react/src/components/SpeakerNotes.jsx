import React from 'react';
import PropTypes from 'prop-types';

/**
 * Speaker Notes Editor Component
 * Allows adding and editing presenter notes for each slide
 */
const SpeakerNotes = ({ notes, onNotesChange, slideNumber, slideTitle }) => {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg
                        className="w-5 h-5 text-gray-600 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Speaker Notes
                        {slideNumber && <span className="text-gray-500 dark:text-gray-500 ml-2">Slide {slideNumber}</span>}
                    </h3>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                    {notes?.length || 0} characters
                </div>
            </div>

            {/* Notes Editor */}
            <div className="flex-1 p-4 overflow-y-auto">
                <textarea
                    value={notes || ''}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Add speaker notes for this slide... These will be visible in presentation mode but not to the audience."
                    className="w-full h-full resize-none border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 text-sm leading-relaxed"
                    style={{ minHeight: '100px' }}
                />
            </div>

            {/* Footer with tips */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                    💡 Tip: Speaker notes are visible during presentation mode and exported with your presentation
                </p>
            </div>
        </div>
    );
};

SpeakerNotes.propTypes = {
    notes: PropTypes.string,
    onNotesChange: PropTypes.func.isRequired,
    slideNumber: PropTypes.number,
    slideTitle: PropTypes.string
};

export default SpeakerNotes;
