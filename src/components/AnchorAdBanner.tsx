import React, { useState, useEffect } from 'react';
import { RefreshCw, X, ChevronUp, Sparkles } from 'lucide-react';
import {
  ADSENSE_PUB_ID,
  GAM_SLOTS,
  AD_REFRESH_INTERVAL_SECONDS,
  registerGAMSlot,
  refreshAllAdSlots,
} from '../utils/adManager';

interface AnchorAdBannerProps {
  onAdClick?: () => void;
}

export const AnchorAdBanner: React.FC<AnchorAdBannerProps> = ({ onAdClick }) => {
  const [timeLeft, setTimeLeft] = useState<number>(AD_REFRESH_INTERVAL_SECONDS);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Register slot with Google Ad Manager & AdSense
  useEffect(() => {
    registerGAMSlot(GAM_SLOTS.BOTTOM_ANCHOR);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshAllAdSlots([GAM_SLOTS.BOTTOM_ANCHOR.divId]);
    setTimeLeft(AD_REFRESH_INTERVAL_SECONDS);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // 30s Auto-refresh timer
  useEffect(() => {
    if (isMinimized) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshAllAdSlots([GAM_SLOTS.BOTTOM_ANCHOR.divId]);
          return AD_REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMinimized]);

  const progressPercent = ((AD_REFRESH_INTERVAL_SECONDS - timeLeft) / AD_REFRESH_INTERVAL_SECONDS) * 100;

  if (isMinimized) {
    return (
      <div className="fixed bottom-3 right-4 z-40">
        <button
          id="btn-expand-anchor-ad"
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-zinc-800 hover:text-indigo-600 border border-zinc-300 shadow-xl text-xs font-bold transition-all hover:bg-zinc-50 cursor-pointer"
        >
          <ChevronUp className="w-4 h-4 text-indigo-600" />
          <span>Google Ad Manager ({ADSENSE_PUB_ID})</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="anchor-ad-banner"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 shadow-2xl transition-all"
    >
      {/* 30-Second Auto-refresh progress bar */}
      <div className="w-full h-1 bg-zinc-100 relative overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-xs">
        {/* Left: GAM Badge & Publisher & 30s timer */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-wider uppercase border border-indigo-200">
            <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
            <span>Google Ad Manager</span>
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
            {ADSENSE_PUB_ID}
          </span>
          <button
            id="btn-refresh-anchor-ad"
            type="button"
            onClick={handleManualRefresh}
            title={`Atualizar anúncio âncora (refresh em ${timeLeft}s)`}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-0.5 rounded-full hover:bg-zinc-100 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="tabular-nums font-mono text-[11px] font-semibold text-zinc-700">
              {timeLeft}s
            </span>
          </button>
        </div>

        {/* Center: Real GAM Anchor Slot / AdSense container */}
        <div
          onClick={onAdClick}
          className="flex-1 min-h-[50px] flex items-center justify-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200 px-2 py-1 relative overflow-hidden"
        >
          {/* GPT Target Div */}
          <div
            id={GAM_SLOTS.BOTTOM_ANCHOR.divId}
            className="w-full flex items-center justify-center min-h-[50px]"
          />

          {/* AdSense Unit */}
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '50px', width: '100%' }}
            data-ad-client={ADSENSE_PUB_ID}
            data-ad-slot="3819201948"
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />

          {/* Clean slot descriptor */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-60 text-[10px] text-zinc-400 font-medium">
            <span>Anúncio Âncora 728x90 • 320x50 (Google Ad Manager)</span>
          </div>
        </div>

        {/* Right: Close/Minimize button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="btn-minimize-anchor-ad"
            type="button"
            onClick={() => setIsMinimized(true)}
            title="Minimizar anúncio"
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
