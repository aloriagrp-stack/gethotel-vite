import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
          <span className="text-4xl mb-3">😅</span>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Oops! Kuch gadbad ho gayi</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 max-w-xs">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-brand-500 text-white text-sm rounded-xl hover:bg-brand-600 transition"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
