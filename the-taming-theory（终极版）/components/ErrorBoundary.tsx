import React, { ErrorInfo } from "react";
import { Button } from "./ui/Button";

interface Props {
  children?: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-surface border border-red-900/50 rounded-lg text-center space-y-4 my-4 animate-in fade-in">
          <div className="h-10 w-10 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-red-500">
            {this.props.fallbackTitle || "Something went wrong"}
          </h2>
          <p className="text-textSecondary text-xs font-mono max-w-md mx-auto break-words">
            {this.state.error?.message || "An unexpected error occurred during rendering."}
          </p>
          <div className="flex justify-center gap-4 pt-2">
             <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                size="sm"
             >
                Reload Page
             </Button>
             <Button 
                onClick={() => this.setState({ hasError: false, error: null })} 
                variant="ghost"
                size="sm"
             >
                Dismiss & Try Again
             </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
