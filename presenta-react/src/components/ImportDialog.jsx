import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const ImportDialog = ({ isOpen, onClose, onImport }) => {
    const [importMode, setImportMode] = useState('replace'); // 'replace' or 'merge'
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState(null); // 'json' or 'html'
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);

            // Determine file type
            const fileName = file.name.toLowerCase();
            if (fileName.endsWith('.json')) {
                setFileType('json');
            } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
                setFileType('html');
            } else {
                setFileType(null);
                setError('Please select a JSON or HTML file');
            }
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            setError('Please select a file to import');
            return;
        }

        if (!fileType) {
            setError('Invalid file type. Please select a JSON or HTML file');
            return;
        }

        setIsImporting(true);
        setError(null);

        try {
            await onImport(selectedFile, importMode, fileType);
            onClose();
            setSelectedFile(null);
            setFileType(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(err.message || 'Failed to import presentation');
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setFileType(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Import Presentation
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Load a presentation from JSON or Reveal.js HTML
                    </p>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4">
                    {/* File Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Select Presentation File
                        </label>
                        <div className="relative">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.html,.htm,application/json,text/html"
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
                            />
                        </div>
                        {selectedFile && fileType && (
                            <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB) - {fileType.toUpperCase()}
                            </p>
                        )}
                    </div>

                    {/* Import Mode */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Import Mode
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setImportMode('replace')}
                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                    importMode === 'replace'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className="font-semibold">Replace</div>
                                <div className="text-xs mt-1 opacity-75">Replace current presentation</div>
                            </button>
                            <button
                                onClick={() => setImportMode('merge')}
                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                    importMode === 'merge'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className="font-semibold">Merge</div>
                                <div className="text-xs mt-1 opacity-75">Add slides to current</div>
                            </button>
                        </div>
                    </div>

                    {/* Warning for Replace Mode */}
                    {importMode === 'replace' && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>This will replace your current presentation. Make sure you have exported your work if needed.</span>
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>{error}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isImporting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isImporting || !selectedFile}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isImporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Importing...</span>
                            </>
                        ) : (
                            <span>Import</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

ImportDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onImport: PropTypes.func.isRequired
};

export default ImportDialog;
