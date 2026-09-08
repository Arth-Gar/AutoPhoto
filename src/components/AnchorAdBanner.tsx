import React, { useState, useEffect } from 'react';
import { RefreshCw, X, ChevronUp, ShieldCheck, Sun, MapPin, ExternalLink } from 'lucide-react';
import { ANCHOR_ADS } from '../data/ads';
import { AdCreative } from '../types';

interface AnchorAdBannerProps {
  onAdClick?: (ad: AdCreative) => void;
}

export const AnchorAdBanner: React.FC<AnchorAdBannerProps> = ({ onAdClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const ad = ANCHOR_ADS[currentIndex];

  const handleNextAd = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ANCHOR_ADS.length);
      setTimeLeft(20);
      setIsSpinning(false);
    }, 200);
  };

  useEffect(() => {
    if (isMinimized) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextAd();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, isMinimized]);

  const renderIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5 text-emerald-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
    }
  };

  const progressPercent = ((20 - timeLeft) / 20) * 100;

  if (isMinimized) {
    return (
      <div className="fixed bottom-3 right-4 z-40">
        <button
          id="btn-expand-anchor-ad"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-zinc-800 hover:text-indigo-600 border border-zinc-300 shadow-lg text-xs font-bold transition-all hover:bg-zinc-50"
        >
          <ChevronUp className="w-4 h-4 text-indigo-600" />
          <span>Anúncio (728x50)</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="anchor-ad-banner"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 shadow-2xl transition-all"
    >
      {/* Auto-refresh progress bar in indigo */}
      <div className="w-full h-1 bg-zinc-100 relative overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 text-xs">
        {/* Left Side: Badge & Refresh Control */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold tracking-wider uppercase border border-zinc-200">
            {ad.badge}
          </span>
          <button
            id="btn-refresh-anchor-ad"
            onClick={handleNextAd}
            title={`Atualizar anúncio (próximo em ${timeLeft}s)`}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-0.5 rounded-full hover:bg-zinc-100"
          >
            <RefreshCw className={`w-3 h-3 ${isSpinning ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="tabular-nums font-mono text-[11px] font-semibold text-zinc-700">{timeLeft}s</span>
          </button>
        </div>

        {/* Center: Sponsor details */}
        <div
          onClick={() => onAdClick?.(ad)}
          className="flex-1 flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <div className="p-2 rounded-xl bg-zinc-100 shrink-0 hidden sm:flex">
            {renderIcon(ad.iconName)}
          </div>

          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                {ad.sponsor}
              </span>
              <span className="text-zinc-400 text-[11px] hidden md:inline">•</span>
              <span className="text-zinc-600 truncate hidden md:inline font-normal">
                {ad.title}
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] truncate hidden sm:block font-normal">
              {ad.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button & Minimize */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onAdClick?.(ad)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-minimize-anchor-ad"
            onClick={() => setIsMinimized(true)}
            title="Minimizar anúncio"
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
