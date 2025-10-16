import React from 'react';
import PropTypes from 'prop-types';

/**
 * ErrorBoundary component catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire application.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError() {
        // Update state so the next render shows the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.state = { hasError: true, error, errorInfo };
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-full w-full bg-red-50 border-2 border-red-500 rounded p-4">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
                        <p className="text-sm text-red-600 mb-4">
                            {this.props.fallbackMessage || 'An error occurred while rendering this component.'}
                        </p>
                        {this.state.error && (
                            <details className="text-left text-xs bg-white p-2 rounded border border-red-300 mb-4">
                                <summary className="cursor-pointer font-semibold">Error details</summary>
                                <pre className="mt-2 overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallbackMessage: PropTypes.string
};

export default ErrorBoundary;
