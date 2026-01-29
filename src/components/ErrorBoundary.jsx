import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        localStorage.clear();
        window.location.reload();
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <div className="max-w-xl w-full bg-white rounded-lg shadow-xl p-8 border-l-4 border-red-500">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong 😵</h1>
                        <p className="text-gray-600 mb-6">The application encountered a critical error and crashed.</p>

                        <div className="bg-gray-100 p-4 rounded text-sm font-mono overflow-auto max-h-48 mb-6 border border-gray-300">
                            <div className="font-bold text-red-800 mb-2">{this.state.error && this.state.error.toString()}</div>
                            <pre className="text-gray-500 whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-bold"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 font-bold"
                            >
                                HARD RESET (Clear Data)
                            </button>
                        </div>
                        <p className="mt-4 text-xs text-center text-gray-400">Warning: Hard Reset will delete all local products and sales.</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
