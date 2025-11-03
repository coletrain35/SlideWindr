import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * VideoElement - Component for displaying videos
 * Supports both file uploads (base64) and URLs (including YouTube/Vimeo embeds)
 */
const VideoElement = ({ element, isInteracting, updateElement }) => {
    const videoRef = useRef(null);

    // Detect YouTube and Vimeo URLs
    const getEmbedUrl = (url) => {
        if (!url) return null;

        // YouTube patterns
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }

        // Vimeo patterns
        const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        return null;
    };

    const embedUrl = element.videoUrl ? getEmbedUrl(element.videoUrl) : null;

    // Apply video settings when element updates
    useEffect(() => {
        if (videoRef.current && !embedUrl) {
            const video = videoRef.current;
            video.autoplay = element.autoplay || false;
            video.loop = element.loop || false;
            video.muted = element.muted || false;
            video.controls = element.controls !== false; // Default to true
        }
    }, [element.autoplay, element.loop, element.muted, element.controls, embedUrl]);

    // If it's a YouTube/Vimeo URL, use iframe embed
    if (embedUrl) {
        const iframeSrc = `${embedUrl}?autoplay=${element.autoplay ? 1 : 0}&loop=${element.loop ? 1 : 0}&muted=${element.muted ? 1 : 0}`;

        return (
            <iframe
                src={iframeSrc}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video embed"
            />
        );
    }

    // Otherwise, use HTML5 video element
    return (
        <video
            ref={videoRef}
            src={element.videoData || element.videoUrl}
            autoPlay={element.autoplay || false}
            loop={element.loop || false}
            muted={element.muted || false}
            controls={element.controls !== false}
            style={{
                width: '100%',
                height: '100%',
                objectFit: element.objectFit || 'contain',
                borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0',
            }}
            onError={(e) => {
                console.error('Video failed to load:', e);
            }}
        >
            Your browser does not support the video element.
        </video>
    );
};

VideoElement.propTypes = {
    element: PropTypes.shape({
        videoData: PropTypes.string,
        videoUrl: PropTypes.string,
        autoplay: PropTypes.bool,
        loop: PropTypes.bool,
        muted: PropTypes.bool,
        controls: PropTypes.bool,
        objectFit: PropTypes.oneOf(['contain', 'cover', 'fill', 'none']),
        borderRadius: PropTypes.number,
    }).isRequired,
    isInteracting: PropTypes.bool,
    updateElement: PropTypes.func,
};

export default VideoElement;
