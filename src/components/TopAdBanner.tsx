import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import {
  ADSENSE_PUB_ID,
  GAM_SLOTS,
  AD_REFRESH_INTERVAL_SECONDS,
  registerGAMSlot,
  refreshAllAdSlots,
} from '../utils/adManager';

interface TopAdBannerProps {
  onAdClick?: () => void;
}

export const TopAdBanner: React.FC<TopAdBannerProps> = ({ onAdClick }) => {
  const [timeLeft, setTimeLeft] = useState<number>(AD_REFRESH_INTERVAL_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Register slot with Google Ad Manager & AdSense
  useEffect(() => {
    registerGAMSlot(GAM_SLOTS.TOP_LEADERBOARD);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshAllAdSlots([GAM_SLOTS.TOP_LEADERBOARD.divId]);
    setTimeLeft(AD_REFRESH_INTERVAL_SECONDS);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // 30-second Auto-refresh cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshAllAdSlots([GAM_SLOTS.TOP_LEADERBOARD.divId]);
          return AD_REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progressPercent = ((AD_REFRESH_INTERVAL_SECONDS - timeLeft) / AD_REFRESH_INTERVAL_SECONDS) * 100;

  return (
    <div
      id="top-ad-banner"
      className="w-full bg-white border-b border-zinc-200 px-3 py-2 shadow-xs transition-all relative"
    >
      {/* 30s Refresh Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-100 overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
        {/* Ad Manager Header & Refresh Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-wider uppercase border border-indigo-200">
            <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
            <span>Google Ad Manager</span>
          </span>
          <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
            {ADSENSE_PUB_ID}
          </span>
          <button
            id="btn-refresh-top-ad"
            type="button"
            onClick={handleManualRefresh}
            title={`Atualizar anúncio (refresh em ${timeLeft}s)`}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-0.5 rounded-full hover:bg-zinc-100 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="tabular-nums font-mono text-[11px] text-zinc-700 font-semibold">
              {timeLeft}s
            </span>
          </button>
        </div>

        {/* Real Ad Slot Container (Google Publisher Tag & AdSense) */}
        <div
          onClick={onAdClick}
          className="w-full md:max-w-2xl flex items-center justify-center min-h-[60px] md:min-h-[50px] bg-zinc-50 rounded-xl border border-dashed border-zinc-200 p-1 relative overflow-hidden"
        >
          {/* GPT Target Div */}
          <div
            id={GAM_SLOTS.TOP_LEADERBOARD.divId}
            className="w-full flex items-center justify-center overflow-hidden min-h-[50px]"
          />

          {/* AdSense Unit fallback */}
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '50px', width: '100%' }}
            data-ad-client={ADSENSE_PUB_ID}
            data-ad-slot="1029384756"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />

          {/* Clean slot descriptor */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-60 text-[10px] text-zinc-400 font-medium">
            <span>Leaderboard 728x90 • 320x50 (Google Ad Manager)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
