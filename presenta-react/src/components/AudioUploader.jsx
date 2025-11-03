import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { UploadIcon, XIcon } from './Icons';

const AudioUploader = ({ onAudioUpload, currentAudio }) => {
    const [preview, setPreview] = useState(currentAudio || null);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setError(null);

        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // Check file size (max 50MB for audio)
            if (file.size > 50 * 1024 * 1024) {
                setError('File size must be less than 50MB');
                return;
            }

            // Read file as base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result;
                setPreview(base64);
                onAudioUpload(base64);
            };
            reader.onerror = () => {
                setError('Failed to read file');
            };
            reader.readAsDataURL(file);
        }
    }, [onAudioUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']
        },
        maxFiles: 1,
        multiple: false
    });

    const handleRemove = () => {
        setPreview(null);
        onAudioUpload('');
    };

    return (
        <div className="space-y-2">
            <div
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer
                    ${isDragActive
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500'
                    }
                `}
            >
                <input {...getInputProps()} />
                {preview ? (
                    <div className="relative">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                            <audio
                                src={preview}
                                className="w-full"
                                controls
                            />
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove audio"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <UploadIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isDragActive ? (
                                <span className="text-orange-600 dark:text-orange-400 font-semibold">Drop audio here</span>
                            ) : (
                                <>
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">Click to upload</span>
                                    {' or drag and drop'}
                                </>
                            )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            MP3, WAV, OGG, M4A, AAC, FLAC (max 50MB)
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

AudioUploader.propTypes = {
    onAudioUpload: PropTypes.func.isRequired,
    currentAudio: PropTypes.string
};

export default AudioUploader;
