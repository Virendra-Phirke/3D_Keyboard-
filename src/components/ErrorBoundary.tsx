import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] text-white p-6">
          <div className="bg-[#0e0c1a] border border-red-500/30 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            
            <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2">WebGL Engine Error</h2>
            <p className="text-sm text-gray-400 mb-6">
              The 3D renderer encountered a critical error. This is usually caused by unsupported hardware, outdated drivers, or WebGL context loss.
            </p>

            <div className="bg-black/50 p-4 rounded-xl text-left overflow-auto text-xs font-mono text-red-400 mb-6 border border-white/5">
              {this.state.error?.message || "Unknown rendering error occurred."}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 hover:bg-red-400 text-black font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              <RefreshCw size={16} />
              Restart Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
