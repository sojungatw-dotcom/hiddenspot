import React, { useState } from 'react';
import { Smartphone, Monitor, Sparkles, Wifi, Battery, Compass } from 'lucide-react';

interface PhoneMockupFrameProps {
  children: React.ReactNode;
  onOpenAiGenerator: () => void;
  aiLoading?: boolean;
}

export const PhoneMockupFrame: React.FC<PhoneMockupFrameProps> = ({
  children,
  onOpenAiGenerator,
  aiLoading = false,
}) => {
  const [isMockupMode, setIsMockupMode] = useState<boolean>(true);
  const [currentTime] = useState<string>('19:42');

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-start antialiased selection:bg-rose-500 selection:text-white">
      {/* Top Global Control Toolbar */}
      <header className="w-full bg-stone-900/90 backdrop-blur border-b border-stone-800 px-4 py-2.5 z-40 sticky top-0 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-stone-200">Hidden Spot Busan</span>
            <span className="hidden sm:inline text-stone-400 ml-2">
              부산 N차 재방문자를 위한 AI 로컬 히든 스팟 추천
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Trigger button in top bar */}
          <button
            id="global-ai-generator-btn"
            onClick={onOpenAiGenerator}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-medium shadow-sm transition-all text-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'AI 분석 중...' : 'AI 히든 스팟 발굴'}</span>
          </button>

          {/* Mockup mode toggle */}
          <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-stone-700/60">
            <button
              id="mockup-mode-toggle"
              onClick={() => setIsMockupMode(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs font-medium cursor-pointer ${
                isMockupMode
                  ? 'bg-stone-700 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="스마트폰 화면 목업 뷰"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">모바일 목업</span>
            </button>
            <button
              id="fullscreen-mode-toggle"
              onClick={() => setIsMockupMode(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs font-medium cursor-pointer ${
                !isMockupMode
                  ? 'bg-stone-700 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="전체 화면 뷰"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">전체화면</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Presentation Container */}
      <main className="w-full flex-1 flex items-center justify-center p-0 sm:p-4 md:p-8">
        {isMockupMode ? (
          /* Smartphone Hardware Mockup Frame */
          <div className="relative w-full max-w-[430px] my-auto">
            {/* Outer ambient glow & shadow */}
            <div className="relative mx-auto rounded-[52px] p-[10px] bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] border border-stone-600/30">
              {/* Device Bezel */}
              <div className="relative rounded-[44px] bg-white text-stone-900 overflow-hidden shadow-inner flex flex-col h-[884px] max-h-[92vh]">
                {/* Dynamic Island / Speaker cutout */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-stone-950 rounded-full z-50 flex items-center justify-between px-2.5 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-blue-950/80" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-900 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/80 animate-pulse" />
                  </div>
                </div>

                {/* Mobile Status Bar */}
                <div className="w-full pt-3 px-7 pb-1.5 flex items-center justify-between text-[13px] font-semibold text-stone-800 tracking-tight z-40 select-none shrink-0">
                  <span>{currentTime}</span>
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <span className="text-[11px] font-bold tracking-tighter">5G</span>
                    <Wifi className="w-3.5 h-3.5" />
                    <div className="flex items-center gap-0.5">
                      <Battery className="w-4 h-4 fill-stone-800" />
                    </div>
                  </div>
                </div>

                {/* Inner Mobile Viewport */}
                <div className="flex-1 overflow-hidden relative flex flex-col bg-stone-50">
                  {children}
                </div>

                {/* iOS Home Indicator Bar */}
                <div className="w-full py-1.5 flex items-center justify-center bg-white z-40 shrink-0">
                  <div className="w-32 h-1 bg-stone-300 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Fullscreen Responsive Mode */
          <div className="w-full max-w-4xl bg-stone-50 text-stone-900 min-h-[90vh] rounded-2xl shadow-2xl border border-stone-700/40 overflow-hidden flex flex-col">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
