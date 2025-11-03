import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * AudioElement - Component for displaying audio players
 * Supports both file uploads (base64) and URLs
 */
const AudioElement = ({ element, isInteracting, updateElement }) => {
    const audioRef = useRef(null);

    // Apply audio settings when element updates
    useEffect(() => {
        if (audioRef.current) {
            const audio = audioRef.current;
            audio.autoplay = element.autoplay || false;
            audio.loop = element.loop || false;
            audio.muted = element.muted || false;
        }
    }, [element.autoplay, element.loop, element.muted]);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: element.backgroundColor || '#f3f4f6',
                borderRadius: element.borderRadius ? `${element.borderRadius}px` : '8px',
                padding: '16px',
            }}
        >
            <audio
                ref={audioRef}
                src={element.audioData || element.audioUrl}
                autoPlay={element.autoplay || false}
                loop={element.loop || false}
                muted={element.muted || false}
                controls
                style={{
                    width: '100%',
                    maxWidth: '400px',
                }}
                onError={(e) => {
                    console.error('Audio failed to load:', e);
                }}
            >
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};

AudioElement.propTypes = {
    element: PropTypes.shape({
        audioData: PropTypes.string,
        audioUrl: PropTypes.string,
        autoplay: PropTypes.bool,
        loop: PropTypes.bool,
        muted: PropTypes.bool,
        backgroundColor: PropTypes.string,
        borderRadius: PropTypes.number,
    }).isRequired,
    isInteracting: PropTypes.bool,
    updateElement: PropTypes.func,
};

export default AudioElement;
