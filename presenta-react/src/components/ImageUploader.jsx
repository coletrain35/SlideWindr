import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { UploadIcon, XIcon } from './Icons';

const ImageUploader = ({ onImageUpload, currentImage }) => {
    const [preview, setPreview] = useState(currentImage || null);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setError(null);

        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }

            // Read file as base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result;
                setPreview(base64);
                onImageUpload(base64);
            };
            reader.onerror = () => {
                setError('Failed to read file');
            };
            reader.readAsDataURL(file);
        }
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
        },
        maxFiles: 1,
        multiple: false
    });

    const handleRemove = () => {
        setPreview(null);
        onImageUpload('');
    };

    return (
        <div className="space-y-2">
            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer
                    ${isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }
                `}
            >
                <input {...getInputProps()} />
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-32 object-contain rounded"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove image"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <UploadIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isDragActive ? (
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">Drop image here</span>
                            ) : (
                                <>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span>
                                    {' or drag and drop'}
                                </>
                            )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PNG, JPG, GIF, SVG, WebP (max 10MB)
                        </p>
                    </div>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
};

ImageUploader.propTypes = {
    onImageUpload: PropTypes.func.isRequired,
    currentImage: PropTypes.string
};

export default ImageUploader;
