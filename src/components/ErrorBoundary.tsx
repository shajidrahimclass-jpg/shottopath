import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-sans">
          <div className="bg-card text-card-foreground p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-border">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-3">Something went wrong</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              An unexpected interface error occurred, but we've saved the application from crashing.
            </p>
            <Button onClick={this.handleReset} className="w-full sm:w-auto font-medium" size="lg">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh Application
            </Button>
            
            {import.meta.env?.DEV && this.state.error && (
              <div className="mt-8 text-left">
                <details className="text-xs text-muted-foreground p-4 bg-muted rounded-lg overflow-x-auto max-h-64 scrollbar-thin">
                  <summary className="cursor-pointer font-semibold mb-2 flex items-center">
                    Developer Details
                  </summary>
                  <div className="mt-2 font-mono whitespace-pre-wrap">
                    <span className="text-red-500">{this.state.error.toString()}</span>
                    <br />
                    {this.state.errorInfo?.componentStack}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
