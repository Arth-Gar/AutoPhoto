import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCw, FlipHorizontal, Eye, Grid } from 'lucide-react';
import { AspectRatioType, FilterPreset, PlacedSticker } from '../types';
import { getCssFilterString } from '../data/filters';
import { StickerOverlay } from './StickerOverlay';
import { Translations } from '../i18n/translations';

interface WebcamViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  fallbackImgRef: React.RefObject<HTMLImageElement | null>;
  aspectRatio: AspectRatioType;
  filter: FilterPreset;
  manualBrightness: number;
  manualContrast: number;
  isMirrored: boolean;
  onToggleMirror: () => void;
  stickers: PlacedSticker[];
  onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  onRemoveSticker: (id: string) => void;
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  countdown: number | null;
  isFlashing: boolean;
  show3x4Guide: boolean;
  onToggle3x4Guide: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  t?: Translations;
}

export const WebcamView: React.FC<WebcamViewProps> = ({
  videoRef,
  fallbackImgRef,
  aspectRatio,
  filter,
  manualBrightness,
  manualContrast,
  isMirrored,
  onToggleMirror,
  stickers,
  onUpdateSticker,
  onRemoveSticker,
  selectedStickerId,
  onSelectSticker,
  countdown,
  isFlashing,
  show3x4Guide,
  onToggle3x4Guide,
  showGrid,
  onToggleGrid,
  t,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useSimulator, setUseSimulator] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Request webcam stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador não suporta acesso direto à câmera.');
      }

      // Stop previous stream if any
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
          facingMode: facingMode,
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasCameraAccess(true);
      setUseSimulator(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Permissão da câmera não autorizada';
      console.warn('Camera access issue, enabling simulator fallback:', msg);
      setHasCameraAccess(false);
      setCameraError('Câmera não detectada ou bloqueada. Modo simulador ativado.');
      setUseSimulator(true);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Compute aspect ratio CSS class
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case '3x4':
        return 'aspect-[3/4] w-full max-w-[420px]';
      case '1x1':
        return 'aspect-square w-full max-w-[420px]';
      case '4x3':
        return 'aspect-[4/3] w-full max-w-[540px]';
      case '16x9':
        return 'aspect-[16/9] w-full max-w-[580px]';
      case 'strip':
        return 'aspect-[1/2.4] w-full max-w-[260px]';
      default:
        return 'aspect-[3/4] w-full max-w-[420px]';
    }
  };

  const filterStyle = {
    filter: getCssFilterString(filter, manualBrightness, manualContrast),
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      {/* Viewfinder Frame Container with Bento-style border-4 border-white & rounded-3xl */}
      <div
        ref={containerRef}
        id="camera-viewfinder-container"
        className={`relative ${getAspectRatioClasses()} mx-auto rounded-3xl overflow-hidden bg-zinc-900 border-4 border-white shadow-2xl select-none flex items-center justify-center transition-all duration-300`}
      >
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-10" />

        {/* Top Left Badge: Aspect Guide */}
        <div className="absolute top-3 left-3 bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-wider border border-white/20 z-20 flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{aspectRatio === '3x4' ? '3:4 Aspect Guide' : `${aspectRatio} View`}</span>
        </div>

        {/* Live Video Element */}
        {!useSimulator ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={filterStyle}
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isMirrored ? 'scale-x-[-1]' : ''
            }`}
          />
        ) : (
          /* High quality friendly simulator portrait if camera not accessible */
          <div className="relative w-full h-full">
            <img
              ref={fallbackImgRef}
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85"
              alt="Simulador autophoto"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              style={filterStyle}
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isMirrored ? 'scale-x-[-1]' : ''
              }`}
            />
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-indigo-600/90 text-white font-bold text-[10px] tracking-wide uppercase backdrop-blur-sm z-20 shadow-sm">
              Modo Simulador Ativo
            </div>
          </div>
        )}

        {/* 3x4 Biometric Guide Overlay (Head Oval & Shoulders) */}
        {show3x4Guide && aspectRatio === '3x4' && (
          <div className="absolute inset-0 pointer-events-none z-15 flex flex-col items-center justify-center p-6">
            {/* Head oval guide */}
            <div className="w-[62%] h-[54%] -mt-6 border-2 border-dashed border-white/70 rounded-[50%/60%] relative flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {/* Eye level line */}
              <div className="absolute top-[42%] w-full flex items-center justify-between px-2">
                <span className="h-0.5 w-4 bg-white/80" />
                <span className="text-[9px] font-mono text-white/90 font-bold tracking-wider uppercase bg-black/40 px-1.5 py-0.5 rounded">
                  Olhos
                </span>
                <span className="h-0.5 w-4 bg-white/80" />
              </div>

              {/* Nose/Center vertical line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/30" />

              {/* Chin line */}
              <div className="absolute bottom-[4%] w-10 h-0.5 bg-white/80 rounded" />
            </div>

            {/* Shoulder arch guide */}
            <div className="w-[84%] h-20 -mt-1 border-t-2 border-dashed border-white/60 rounded-t-[50%] flex items-center justify-center">
              <span className="text-[9px] font-mono text-white/90 uppercase -mt-3.5 bg-black/50 px-2 py-0.5 rounded font-bold">
                Ombros
              </span>
            </div>
          </div>
        )}

        {/* Rule of Thirds Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-15 grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div className="" />
          </div>
        )}

        {/* Viewfinder Corner Brackets */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-white/40 pointer-events-none z-10 rounded-tl-sm" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-white/40 pointer-events-none z-10 rounded-tr-sm" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-white/40 pointer-events-none z-10 rounded-bl-sm" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-white/40 pointer-events-none z-10 rounded-br-sm" />

        {/* Placed Stickers Layer */}
        <StickerOverlay
          stickers={stickers}
          onUpdateSticker={onUpdateSticker}
          onRemoveSticker={onRemoveSticker}
          selectedId={selectedStickerId}
          onSelectSticker={onSelectSticker}
          containerRef={containerRef}
          t={t}
        />

        {/* Countdown Visual Overlay */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white text-zinc-950 flex items-center justify-center font-black text-5xl sm:text-6xl font-mono shadow-2xl animate-ping duration-700">
              {countdown}
            </div>
          </div>
        )}

        {/* Shutter Flash Screen Overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-300" />
        )}

        {/* Viewfinder Quick Controls (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <button
            type="button"
            onClick={onToggleMirror}
            title={isMirrored ? 'Desativar espelhamento' : 'Espelhar câmera'}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
              isMirrored
                ? 'bg-white text-zinc-900 shadow-md font-bold'
                : 'bg-black/40 text-white hover:bg-black/60 border border-white/20'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleGrid}
            title={showGrid ? 'Ocultar grade' : 'Mostrar grade'}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
              showGrid
                ? 'bg-white text-zinc-900 shadow-md font-bold'
                : 'bg-black/40 text-white hover:bg-black/60 border border-white/20'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {aspectRatio === '3x4' && (
            <button
              type="button"
              onClick={onToggle3x4Guide}
              title={show3x4Guide ? 'Ocultar guia 3x4' : 'Ativar guia 3x4'}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
                show3x4Guide
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'bg-black/40 text-white hover:bg-black/60 border border-white/20'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {!useSimulator && (
            <button
              type="button"
              onClick={toggleFacingMode}
              title="Alternar câmera frontal / traseira"
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Simulator Switcher Banner if camera failed */}
        {cameraError && (
          <div className="absolute bottom-3 left-3 right-3 bg-zinc-900/90 border border-zinc-700 p-2.5 rounded-2xl backdrop-blur-md flex items-center justify-between text-xs z-20 text-white">
            <div className="flex items-center gap-2">
              <CameraOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate text-zinc-200">Foto de demonstração ativada</span>
            </div>
            <button
              type="button"
              onClick={startCamera}
              className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium shrink-0 flex items-center gap-1.5 border border-zinc-700"
            >
              <RefreshCw className="w-3 h-3" />
              Detectar Câmera
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
