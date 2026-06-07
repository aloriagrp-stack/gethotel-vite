import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(">>> MYTHOS ERROR BOUNDARY CAUGHT AN ERROR:", error, errorInfo);
    
    // Auto-reload on Chunk/Module loading error to grab the latest build assets
    const errorMsg = error?.message || "";
    const errorName = error?.name || "";
    const isChunkError = 
      errorMsg.includes("Failed to fetch dynamically imported module") ||
      errorMsg.includes("ChunkLoadError") ||
      errorMsg.includes("loading dynamically imported module") ||
      errorName === "ChunkLoadError";

    if (isChunkError) {
      try {
        const reloadKey = "chunk_reload_attempted";
        if (!sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, "true");
          window.location.reload();
        }
      } catch (e) {
        window.location.reload();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-black text-white mb-4 tracking-tighter italic">
              System <span className="text-red-500">Recovery</span>
            </h1>
            
            <p className="text-slate-400 text-sm font-bold leading-relaxed mb-10">
              A minor disturbance was detected in the matrix. Don't worry, your data is safe. Let's get you back on track.
            </p>

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl shadow-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
            >
              <RefreshCw className="w-4 h-4" /> Restart System
            </button>
            
            <p className="mt-8 text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">
              Mythos Integrity Shield Active
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
