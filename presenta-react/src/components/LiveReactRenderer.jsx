import { useEffect } from 'react';
import PropTypes from 'prop-types';
import ComponentContainer from './ComponentContainer';

const LiveReactRenderer = ({ id, component }) => {
    const { code, props: propsString, css } = component;

    useEffect(() => {
        const styleId = `dynamic-style-${id}`;
        let styleElement = document.getElementById(styleId);
        if (css) {
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }
            // SECURITY: Use textContent instead of innerHTML to prevent CSS injection attacks
            // textContent treats input as plain text, preventing potential malicious code execution
            styleElement.textContent = css;
        }

        return () => {
            if (styleElement) {
                styleElement.remove();
            }
        };
    }, [id, css]);

    return <ComponentContainer code={code} propsString={propsString} />;
};

LiveReactRenderer.propTypes = {
    id: PropTypes.string.isRequired,
    component: PropTypes.shape({
        code: PropTypes.string,
        props: PropTypes.string,
        css: PropTypes.string
    }).isRequired
};

export default LiveReactRenderer;
