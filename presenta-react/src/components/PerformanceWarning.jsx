import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangleIcon, XIcon } from './Icons';

/**
 * Performance warning banner that appears when too many React components
 * are detected on the current slide
 */
const PerformanceWarning = ({ warning, onDismiss }) => {
    const [isDismissed, setIsDismissed] = useState(false);

    if (!warning || isDismissed) return null;

    const handleDismiss = () => {
        setIsDismissed(true);
        if (onDismiss) onDismiss();
    };

    const bgColors = {
        critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        high: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
        medium: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    };

    const textColors = {
        critical: 'text-red-800 dark:text-red-200',
        high: 'text-orange-800 dark:text-orange-200',
        medium: 'text-yellow-800 dark:text-yellow-200'
    };

    const iconColors = {
        critical: 'text-red-600 dark:text-red-400',
        high: 'text-orange-600 dark:text-orange-400',
        medium: 'text-yellow-600 dark:text-yellow-400'
    };

    return (
        <div
            className={`
                fixed top-16 left-1/2 -translate-x-1/2 z-50
                max-w-2xl w-auto mx-4
                px-4 py-3 rounded-lg border shadow-lg
                flex items-start gap-3
                animate-in slide-in-from-top duration-300
                ${bgColors[warning.level]}
            `}
        >
            <AlertTriangleIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[warning.level]}`} />
            <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm ${textColors[warning.level]}`}>
                    {warning.title}
                </h4>
                <p className={`text-xs mt-1 ${textColors[warning.level]}`}>
                    {warning.message}
                </p>
                <p className="text-xs mt-2 opacity-75">
                    💡 Tip: Use fewer components per slide, or split content across multiple slides.
                </p>
            </div>
            <button
                onClick={handleDismiss}
                className={`flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${textColors[warning.level]}`}
                aria-label="Dismiss warning"
            >
                <XIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

PerformanceWarning.propTypes = {
    warning: PropTypes.shape({
        level: PropTypes.oneOf(['critical', 'high', 'medium']).isRequired,
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired
    }),
    onDismiss: PropTypes.func
};

export default PerformanceWarning;
