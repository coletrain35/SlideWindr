import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { UploadIcon, XIcon } from './Icons';

const VideoUploader = ({ onVideoUpload, currentVideo }) => {
    const [preview, setPreview] = useState(currentVideo || null);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setError(null);

        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // Check file size (max 100MB for video)
            if (file.size > 100 * 1024 * 1024) {
                setError('File size must be less than 100MB');
                return;
            }

            // Read file as base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result;
                setPreview(base64);
                onVideoUpload(base64);
            };
            reader.onerror = () => {
                setError('Failed to read file');
            };
            reader.readAsDataURL(file);
        }
    }, [onVideoUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi']
        },
        maxFiles: 1,
        multiple: false
    });

    const handleRemove = () => {
        setPreview(null);
        onVideoUpload('');
    };

    return (
        <div className="space-y-2">
            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer
                    ${isDragActive
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500'
                    }
                `}
            >
                <input {...getInputProps()} />
                {preview ? (
                    <div className="relative">
                        <video
                            src={preview}
                            className="w-full h-32 object-contain rounded bg-black"
                            controls
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove video"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <UploadIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isDragActive ? (
                                <span className="text-red-600 dark:text-red-400 font-semibold">Drop video here</span>
                            ) : (
                                <>
                                    <span className="font-semibold text-red-600 dark:text-red-400">Click to upload</span>
                                    {' or drag and drop'}
                                </>
                            )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            MP4, WebM, OGG, MOV, AVI (max 100MB)
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

VideoUploader.propTypes = {
    onVideoUpload: PropTypes.func.isRequired,
    currentVideo: PropTypes.string
};

export default VideoUploader;
