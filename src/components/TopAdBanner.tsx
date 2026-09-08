import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Sparkles, Camera, Printer, Film } from 'lucide-react';
import { TOP_ADS } from '../data/ads';
import { AdCreative } from '../types';

interface TopAdBannerProps {
  onAdClick?: (ad: AdCreative) => void;
}

export const TopAdBanner: React.FC<TopAdBannerProps> = ({ onAdClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const ad = TOP_ADS[currentIndex];

  const handleNextAd = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % TOP_ADS.length);
      setTimeLeft(25);
      setIsRefreshing(false);
    }, 200);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextAd();
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Camera':
        return <Camera className="w-4 h-4 text-indigo-600" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'Printer':
        return <Printer className="w-4 h-4 text-emerald-600" />;
      case 'Film':
        return <Film className="w-4 h-4 text-pink-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div id="top-ad-banner" className="w-full bg-zinc-50 border-b border-zinc-200 px-3 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        {/* Ad Tag & Refresh Info */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600 text-[10px] font-bold tracking-wider uppercase">
            Publicidade
          </span>
          <span className="text-[11px] text-zinc-400 font-medium hidden md:inline">
            Leaderboard (Auto-Refresh)
          </span>
          <button
            id="btn-refresh-top-ad"
            onClick={handleNextAd}
            title={`Atualizar anúncio (próximo em ${timeLeft}s)`}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-0.5 rounded-full hover:bg-zinc-200"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="tabular-nums font-mono text-[11px] text-zinc-600 font-semibold">
              {timeLeft}s
            </span>
          </button>
        </div>

        {/* Ad Content Pill / Card */}
        <div
          onClick={() => onAdClick?.(ad)}
          className="flex-1 max-w-2xl flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group w-full"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="p-1.5 rounded-lg bg-zinc-100 shrink-0">
              {renderIcon(ad.iconName)}
            </div>
            <div className="truncate">
              <span className="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors mr-1.5">
                {ad.sponsor}:
              </span>
              <span className="text-zinc-600 truncate hidden sm:inline text-xs font-normal">
                {ad.title}
              </span>
              <span className="text-zinc-600 truncate sm:hidden text-xs font-normal">
                {ad.title.slice(0, 36)}...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <span className="text-[11px] font-bold text-indigo-600 group-hover:underline hidden lg:inline">
              {ad.ctaText}
            </span>
            <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
