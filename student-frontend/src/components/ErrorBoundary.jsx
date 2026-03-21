import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Oops! Something went wrong</h1>
                        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                            {this.state.error?.message || "We encountered an unexpected error while preparing this page for you."}
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={this.handleReset}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all transform active:scale-[0.98] shadow-xl shadow-indigo-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Try Refreshing
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
                            >
                                Back to Home
                            </button>
                        </div>
                        <div className="mt-12 flex items-center justify-center gap-2 text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                            <p className="text-xs font-semibold uppercase tracking-widest">Student Portal Support</p>
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
