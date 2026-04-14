"use client";

import { useEffect } from "react";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Caught by error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 md:p-6 w-full fade-in z-50 relative">
      <div className="glass-panel overflow-hidden relative w-full max-w-2xl rounded-[2.5rem] border border-red-500/10 shadow-[0_0_80px_-15px_rgba(239,68,68,0.15)] bg-[#0a0305]/60 backdrop-blur-xl text-center">
        {/* Subtle Glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[300px] bg-red-600/10 blur-[120px] pointer-events-none rounded-[100%] mix-blend-screen" />
        
        <div className="relative z-10 flex flex-col items-center p-10 md:p-16 space-y-10">
          
          {/* Icon Container */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full scale-150 animate-pulse-slow" />
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 shadow-inner">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20">
                <FiAlertTriangle className="w-10 h-10 text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)] transform -translate-y-0.5" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-5 max-w-lg mx-auto">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-sm leading-tight">
              متأسفانه خطایی رخ داد!
            </h1>
            
            <p className="text-white/60 text-lg leading-relaxed font-light mx-auto max-w-md">
              در پردازش درخواست شما مشکلی پیش آمده است. ما این مشکل را ثبت کردیم و در حال بررسی آن هستیم. لطفاً دوباره تلاش کنید.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-950 font-bold hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 focus:ring-4 focus:ring-white/20 active:scale-95 shadow-xl shadow-white/10"
            >
              <FiRefreshCw className="w-5 h-5" />
              <span className="text-lg">تلاش مجدد</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-white font-medium hover:bg-white/10 border border-white/10 transition-all duration-300 focus:ring-4 focus:ring-white/5 active:scale-95"
            >
              <FiHome className="w-5 h-5 opacity-70" />
              <span className="text-lg">صفحه اصلی</span>
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-pulse-slow {
          animation: pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}} />
    </div>
  );
}
