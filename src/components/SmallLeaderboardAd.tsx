import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import {
  ADSENSE_PUB_ID,
  GAM_SLOTS,
  AD_REFRESH_INTERVAL_SECONDS,
  registerGAMSlot,
  refreshAllAdSlots,
} from '../utils/adManager';
import { Translations } from '../i18n/translations';

interface SmallLeaderboardAdProps {
  onAdClick?: () => void;
  t: Translations;
}

export const SmallLeaderboardAd: React.FC<SmallLeaderboardAdProps> = ({
  onAdClick,
  t,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(AD_REFRESH_INTERVAL_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Register slot with Google Ad Manager & AdSense
  useEffect(() => {
    registerGAMSlot(GAM_SLOTS.SMALL_LEADERBOARD);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshAllAdSlots([GAM_SLOTS.SMALL_LEADERBOARD.divId]);
    setTimeLeft(AD_REFRESH_INTERVAL_SECONDS);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // 30s Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshAllAdSlots([GAM_SLOTS.SMALL_LEADERBOARD.divId]);
          return AD_REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = ((AD_REFRESH_INTERVAL_SECONDS - timeLeft) / AD_REFRESH_INTERVAL_SECONDS) * 100;

  return (
    <div
      id="small-leaderboard-ad-container"
      className="w-full bg-white rounded-3xl border border-zinc-200 p-3.5 sm:p-4 shadow-sm flex flex-col gap-2.5 overflow-hidden transition-all relative"
    >
      {/* 30s Progress line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-100 overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Top micro bar: Ad label & Publisher info & 30s Refresh */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 text-[10px]">
            <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
            <span>Google Ad Manager</span>
          </span>
          <span className="font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
            {ADSENSE_PUB_ID}
          </span>
        </div>

        <button
          id="btn-refresh-small-leaderboard"
          type="button"
          onClick={handleManualRefresh}
          title={`Atualizar anúncio (refresh em ${timeLeft}s)`}
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-zinc-100"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          <span className="tabular-nums font-mono text-[11px] font-semibold text-zinc-700">
            {timeLeft}s
          </span>
        </button>
      </div>

      {/* Real Small Leaderboard Slot (468x60 / 320x50 / 300x250) */}
      <div
        onClick={onAdClick}
        className="w-full bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-2 min-h-[60px] flex items-center justify-center relative overflow-hidden group hover:border-indigo-300 transition-all"
      >
        {/* GPT Target Div */}
        <div
          id={GAM_SLOTS.SMALL_LEADERBOARD.divId}
          className="w-full flex items-center justify-center min-h-[60px]"
        />

        {/* Real AdSense Tag with ca-pub-6786401860837559 */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '60px', width: '100%' }}
          data-ad-client={ADSENSE_PUB_ID}
          data-ad-slot="4829104812"
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />

        {/* Clean slot descriptor */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-60 text-[10px] text-zinc-400 font-medium">
          <span>Small Leaderboard 468x60 • 320x50 (Google Ad Manager)</span>
        </div>
      </div>
    </div>
  );
};
