import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dashboard caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            A critical error occurred while rendering this view. Our team has been notified. 
            You can try reloading the page to resolve this issue.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2.5 bg-muted text-foreground hover:bg-muted/80 font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-12 text-left bg-muted/30 p-6 rounded-xl border border-border/50 max-w-2xl overflow-auto">
              <p className="text-sm font-mono text-red-500 mb-2">{this.state.error.toString()}</p>
              <pre className="text-xs text-muted-foreground">
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
