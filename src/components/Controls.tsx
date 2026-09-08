import React from 'react';
import { Camera, Timer, Sparkles, SlidersHorizontal, Layers, Check } from 'lucide-react';
import { AspectRatioType } from '../types';

interface ControlsProps {
  onCapture: () => void;
  aspectRatio: AspectRatioType;
  onChangeAspectRatio: (ratio: AspectRatioType) => void;
  timerSeconds: number;
  onChangeTimer: (seconds: number) => void;
  isCapturing: boolean;
  onToggleStickerDrawer: () => void;
  isStickerDrawerOpen: boolean;
  stickersCount: number;
  onToggleAdjustments: () => void;
  isAdjustmentsOpen: boolean;
  burstMode: boolean;
  onToggleBurstMode: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  onCapture,
  aspectRatio,
  onChangeAspectRatio,
  timerSeconds,
  onChangeTimer,
  isCapturing,
  onToggleStickerDrawer,
  isStickerDrawerOpen,
  stickersCount,
  onToggleAdjustments,
  isAdjustmentsOpen,
  burstMode,
  onToggleBurstMode,
}) => {
  const aspectOptions: { id: AspectRatioType; label: string; tag?: string }[] = [
    { id: '3x4', label: '3x4', tag: 'Doc' },
    { id: '1x1', label: '1:1', tag: 'Quad' },
    { id: '4x3', label: '4:3', tag: 'Cam' },
    { id: '16x9', label: '16:9', tag: 'Wide' },
    { id: 'strip', label: 'Tira 3x', tag: 'Toy' },
  ];

  const timerOptions = [0, 3, 5];

  return (
    <div id="camera-controls-bar" className="w-full max-w-xl mx-auto px-3 py-2 flex flex-col gap-3">
      {/* Top row: Format selection & Timer */}
      <div className="flex items-center justify-between gap-2">
        {/* Aspect Ratio Selector */}
        <div className="flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shadow-inner overflow-x-auto no-scrollbar">
          {aspectOptions.map((opt) => {
            const isSelected = aspectRatio === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                id={`btn-ratio-${opt.id}`}
                onClick={() => onChangeAspectRatio(opt.id)}
                className={`relative px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <span>{opt.label}</span>
                {opt.tag && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-neutral-950/20 text-neutral-950' : 'text-neutral-500'
                    }`}
                  >
                    {opt.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Timer selector */}
        <div className="flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shadow-inner shrink-0">
          <Timer className="w-3.5 h-3.5 text-neutral-400 ml-1.5 mr-0.5" />
          {timerOptions.map((sec) => (
            <button
              key={sec}
              type="button"
              id={`btn-timer-${sec}`}
              onClick={() => onChangeTimer(sec)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                timerSeconds === sec
                  ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {sec === 0 ? '0s' : `${sec}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Shutter Row */}
      <div className="flex items-center justify-between gap-4 px-2">
        {/* Left Action: Stickers Button */}
        <button
          type="button"
          id="btn-toggle-stickers"
          onClick={onToggleStickerDrawer}
          className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
            isStickerDrawerOpen
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
              : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
          title="Adicionar stickers divertidos"
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-medium mt-1">Stickers</span>
          {stickersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 font-bold text-[9px] flex items-center justify-center">
              {stickersCount}
            </span>
          )}
        </button>

        {/* Center: BIG RED SHUTTER BUTTON */}
        <div className="relative flex items-center justify-center">
          {/* Subtle glowing ring */}
          <div className="absolute -inset-2 rounded-full bg-rose-500/20 blur-sm pointer-events-none animate-pulse" />

          <button
            type="button"
            id="btn-shutter-capture"
            onClick={onCapture}
            disabled={isCapturing}
            aria-label="Tirar Foto"
            className="group relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 p-1.5 shadow-xl shadow-rose-950/60 transition-transform active:scale-95 hover:scale-105 border-4 border-neutral-900 flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            {/* Inner ring */}
            <div className="w-full h-full rounded-full border-2 border-rose-300/40 bg-gradient-to-b from-rose-500 to-rose-700 flex items-center justify-center shadow-inner group-hover:brightness-110">
              <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
            </div>
          </button>
        </div>

        {/* Right Action: Fine-tune Adjustments Slider Toggle */}
        <button
          type="button"
          id="btn-toggle-adjustments"
          onClick={onToggleAdjustments}
          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
            isAdjustmentsOpen
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
              : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
          }`}
          title="Ajuste fino de brilho e contraste"
        >
          <SlidersHorizontal className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-medium mt-1">Luz / Tom</span>
        </button>
      </div>

      {/* Mode pill: Burst mode indicator */}
      <div className="flex items-center justify-center gap-3 text-xs">
        <button
          type="button"
          id="btn-toggle-burst"
          onClick={onToggleBurstMode}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            burstMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Disparo Triplo (3 Fotos)</span>
          {burstMode && <Check className="w-3 h-3 text-amber-400 ml-0.5" />}
        </button>
      </div>
    </div>
  );
};
