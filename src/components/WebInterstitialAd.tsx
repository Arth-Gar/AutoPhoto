import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ADSENSE_PUB_ID,
  GAM_SLOTS,
  triggerWebInterstitial,
  pushAdSenseTag,
} from '../utils/adManager';
import { CapturedPhoto } from '../types';
import { Translations } from '../i18n/translations';
import { soundManager } from '../utils/audio';

interface WebInterstitialAdProps {
  isOpen: boolean;
  onDismiss: () => void;
  pendingPhoto: CapturedPhoto | null;
  t: Translations;
}

export const WebInterstitialAd: React.FC<WebInterstitialAdProps> = ({
  isOpen,
  onDismiss,
  pendingPhoto,
  t,
}) => {
  const [skipTimer, setSkipTimer] = useState<number>(3);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  // When opening, trigger real Google Ad Manager Interstitial
  useEffect(() => {
    if (isOpen) {
      setSkipTimer(3);
      setCanSkip(false);

      // Trigger GPT Web Interstitial out-of-page refresh
      triggerWebInterstitial();
      pushAdSenseTag();
    }
  }, [isOpen]);

  // Countdown timer for user control
  useEffect(() => {
    if (!isOpen) return;

    if (skipTimer > 0) {
      const timer = setTimeout(() => {
        setSkipTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [isOpen, skipTimer]);

  if (!isOpen) return null;

  const handleSkipOrContinue = () => {
    soundManager.playTap();
    onDismiss();
  };

  return (
    <div
      id="web-interstitial-ad-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="web-interstitial-ad-card"
        className="w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative text-white"
      >
        {/* Top Header Bar: Google Ad Manager + Publisher ID + Skip/Close */}
        <div className="px-5 py-3.5 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Google Ad Manager</span>
            </span>
            <span className="font-mono text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
              {ADSENSE_PUB_ID}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canSkip ? (
              <button
                id="btn-skip-interstitial"
                type="button"
                onClick={handleSkipOrContinue}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all border border-zinc-600 cursor-pointer"
              >
                <span>{t.adInterstitialSkipNow}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs text-zinc-400 font-mono bg-zinc-800/80 px-2.5 py-1 rounded-full border border-zinc-700">
                {t.adInterstitialSkipIn(skipTimer)}
              </span>
            )}
          </div>
        </div>

        {/* Real AdSense Interstitial / Out-Of-Page Unit */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: '180px', width: '100%' }}
          data-ad-client={ADSENSE_PUB_ID}
          data-ad-slot="5839201923"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

        {/* Real GPT Interstitial target div */}
        <div
          id="div-gpt-ad-interstitial-container"
          className="w-full flex items-center justify-center min-h-[160px] p-4 bg-zinc-950/40 relative"
        >
          {/* GPT Target Placeholder / Live render */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Web Interstitial (Google Publisher Tag)</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Carregando criativo oficial do Google Ad Manager ({GAM_SLOTS.WEB_INTERSTITIAL.path})
            </p>
          </div>
        </div>

        {/* User Photo Preview confirmation card */}
        <div className="p-6 sm:p-7 flex flex-col gap-4 bg-zinc-900 border-t border-zinc-800/80">
          {pendingPhoto && (
            <div className="flex items-center justify-between gap-3 bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
                  <img
                    src={pendingPhoto.dataUrl}
                    alt="Foto capturada"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.adPhotoReady}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">
                    Proporção {pendingPhoto.aspectRatio} • Filtro e adesivos processados
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Anchor link recognized by GPT for Interstitial Transition */}
          <a
            id="link-continue-to-result"
            href="#photo-editor"
            data-google-interstitial="true"
            onClick={(e) => {
              e.preventDefault();
              handleSkipOrContinue();
            }}
            className="w-full bg-white hover:bg-zinc-100 text-zinc-900 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-101 active:scale-99"
          >
            <span>{t.adInterstitialViewResult}</span>
            <ArrowRight className="w-4 h-4 text-zinc-900" />
          </a>
        </div>
      </div>
    </div>
  );
};
