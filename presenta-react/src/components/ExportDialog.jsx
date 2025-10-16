import { useState } from 'react';
import PropTypes from 'prop-types';

const ExportDialog = ({ isOpen, onClose, onExport, presentationTitle }) => {
    const [exportType, setExportType] = useState('html'); // 'html', 'pdf', 'images', 'json'
    const [quality, setQuality] = useState('high'); // 'low', 'medium', 'high'
    const [imageFormat, setImageFormat] = useState('png'); // 'png', 'jpeg'
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    const qualityMapping = {
        low: { quality: 0.5, scale: 1 },
        medium: { quality: 0.8, scale: 1.5 },
        high: { quality: 1.0, scale: 2 }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const options = {
                type: exportType,
                format: imageFormat,
                ...qualityMapping[quality]
            };
            await onExport(options);
            onClose();
        } catch (error) {
            alert(`Export failed: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Export Presentation
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {presentationTitle}
                    </p>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4">
                    {/* Export Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Export Format
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setExportType('html')}
                                className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                    exportType === 'html'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                HTML (Reveal.js)
                            </button>
                            <button
                                onClick={() => setExportType('pdf')}
                                className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                    exportType === 'pdf'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                PDF
                            </button>
                            <button
                                onClick={() => setExportType('images')}
                                className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                    exportType === 'images'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                Images (PNG/JPEG)
                            </button>
                            <button
                                onClick={() => setExportType('json')}
                                className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                    exportType === 'json'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                JSON
                            </button>
                        </div>
                    </div>

                    {/* Image Format (only for images and PDF) */}
                    {(exportType === 'images' || exportType === 'pdf') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {exportType === 'images' ? 'Image Format' : 'PDF Quality'}
                            </label>
                            {exportType === 'images' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setImageFormat('png')}
                                        className={`flex-1 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                                            imageFormat === 'png'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        PNG
                                    </button>
                                    <button
                                        onClick={() => setImageFormat('jpeg')}
                                        className={`flex-1 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                                            imageFormat === 'jpeg'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        JPEG
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quality Settings (only for PDF and images) */}
                    {(exportType === 'pdf' || exportType === 'images') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Quality
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setQuality('low')}
                                    className={`flex-1 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                                        quality === 'low'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Low
                                </button>
                                <button
                                    onClick={() => setQuality('medium')}
                                    className={`flex-1 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                                        quality === 'medium'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    Medium
                                </button>
                                <button
                                    onClick={() => setQuality('high')}
                                    className={`flex-1 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                                        quality === 'high'
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    High
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            {exportType === 'html' && 'Export as a standalone HTML file with Reveal.js presentation.'}
                            {exportType === 'pdf' && 'Export all slides as a single PDF document.'}
                            {exportType === 'images' && 'Export each slide as a separate image file.'}
                            {exportType === 'json' && 'Export presentation data as JSON for backup or sharing.'}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isExporting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isExporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Exporting...</span>
                            </>
                        ) : (
                            <span>Export</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

ExportDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired,
    presentationTitle: PropTypes.string.isRequired
};

export default ExportDialog;
