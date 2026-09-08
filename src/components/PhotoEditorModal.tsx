import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Download,
  Printer,
  Copy,
  RotateCcw,
  Check,
  Share2,
  Images,
  X,
  Sparkles,
  Sliders,
  RefreshCw,
  Eye,
  Maximize2,
  Minimize2,
  Scissors,
  Wand2,
} from 'lucide-react';
import { CapturedPhoto } from '../types';
import { generatePrintableSheet3x4 } from '../utils/canvas';
import {
  createSegmentationSession,
  renderSegmentedCutout,
  SegmentationSession,
} from '../utils/backgroundRemoval';
import { Translations } from '../i18n/translations';

interface PhotoEditorModalProps {
  photo: CapturedPhoto | null;
  onClose: () => void;
  onOpenGallery: () => void;
  t?: Translations;
}

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  photo,
  onClose,
  onOpenGallery,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const [generatingSheet, setGeneratingSheet] = useState(false);
  const [printableSheetUrl, setPrintableSheetUrl] = useState<string | null>(null);
  const [showSheetPreview, setShowSheetPreview] = useState(false);

  // White Background & Contour state
  const [isWhiteBgActive, setIsWhiteBgActive] = useState(false);
  const [whiteBgDataUrl, setWhiteBgDataUrl] = useState<string | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [justRecalculated, setJustRecalculated] = useState(false);
  const [bgMethod, setBgMethod] = useState<'neural_mediapipe' | 'contour_adaptive' | null>(null);
  const [showTuning, setShowTuning] = useState(false);

  // Fine-tuning state
  const [sensitivity, setSensitivity] = useState(50); // 10 to 90 (50 is balanced)
  const [feather, setFeather] = useState(3); // 0 to 8 px
  const [edgeShift, setEdgeShift] = useState(0); // -3 to +3 px (shrink vs expand)

  // Cache of the neural or adaptive probability mask session
  const sessionRef = useRef<SegmentationSession | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentSettingsRef = useRef({ sensitivity: 50, feather: 3, edgeShift: 0 });

  // Reset state when photo changes
  useEffect(() => {
    sessionRef.current = null;
    setWhiteBgDataUrl(null);
    setIsWhiteBgActive(false);
    setShowSheetPreview(false);
    setPrintableSheetUrl(null);
    setShowTuning(false);
    setSensitivity(50);
    setFeather(3);
    setEdgeShift(0);
    currentSettingsRef.current = { sensitivity: 50, feather: 3, edgeShift: 0 };
  }, [photo?.id]);

  // Synchronous or frame-scheduled live cutout update
  const triggerLiveUpdate = useCallback((newSens: number, newFeath: number, newShift: number) => {
    currentSettingsRef.current = { sensitivity: newSens, feather: newFeath, edgeShift: newShift };
    
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    animFrameRef.current = requestAnimationFrame(() => {
      if (!sessionRef.current) return;
      try {
        const cutoutUrl = renderSegmentedCutout(sessionRef.current, {
          sensitivity: newSens,
          feather: newFeath,
          edgeShift: newShift,
          backgroundColor: '#FFFFFF',
        });
        setWhiteBgDataUrl(cutoutUrl);
        setIsWhiteBgActive(true);
      } catch (err) {
        console.error('Erro ao renderizar contorno:', err);
      }
    });
  }, []);

  if (!photo) return null;

  // Active image source
  const activeImageUrl = isWhiteBgActive && whiteBgDataUrl ? whiteBgDataUrl : photo.dataUrl;

  // Initial calculation / activation of white background
  const handleToggleWhiteBg = async () => {
    if (isWhiteBgActive) {
      setIsWhiteBgActive(false);
      return;
    }

    if (sessionRef.current && whiteBgDataUrl) {
      setIsWhiteBgActive(true);
      return;
    }

    // Process mask for the first time
    setIsProcessingBg(true);
    try {
      const session = await createSegmentationSession(photo.dataUrl);
      sessionRef.current = session;
      setBgMethod(session.method);

      const initialUrl = renderSegmentedCutout(session, {
        sensitivity,
        feather,
        edgeShift,
        backgroundColor: '#FFFFFF',
      });
      setWhiteBgDataUrl(initialUrl);
      setIsWhiteBgActive(true);
      setShowTuning(true); // Open sliders for immediate fine-tuning
    } catch (err) {
      console.error('Erro ao processar fundo branco:', err);
    } finally {
      setIsProcessingBg(false);
    }
  };

  // Explicit recalculate & reapply button
  const handleExplicitRecalculate = async () => {
    setIsRecalculating(true);
    try {
      if (!sessionRef.current) {
        const session = await createSegmentationSession(photo.dataUrl);
        sessionRef.current = session;
        setBgMethod(session.method);
      }

      const updatedUrl = renderSegmentedCutout(sessionRef.current, {
        sensitivity,
        feather,
        edgeShift,
        backgroundColor: '#FFFFFF',
      });
      setWhiteBgDataUrl(updatedUrl);
      setIsWhiteBgActive(true);
      setJustRecalculated(true);
      setTimeout(() => setJustRecalculated(false), 2200);
    } catch (err) {
      console.error('Erro ao recalcular contorno:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Slider change handlers with immediate visual feedback
  const handleSensitivityChange = (val: number) => {
    setSensitivity(val);
    triggerLiveUpdate(val, feather, edgeShift);
  };

  const handleFeatherChange = (val: number) => {
    setFeather(val);
    triggerLiveUpdate(sensitivity, val, edgeShift);
  };

  const handleEdgeShiftChange = (val: number) => {
    setEdgeShift(val);
    triggerLiveUpdate(sensitivity, feather, val);
  };

  // Preset buttons
  const handleApplyPreset = (sens: number, feath: number, shift: number) => {
    setSensitivity(sens);
    setFeather(feath);
    setEdgeShift(shift);
    triggerLiveUpdate(sens, feath, shift);
  };

  // Reset to default balanced settings
  const handleResetSettings = () => {
    handleApplyPreset(50, 3, 0);
  };

  // Single photo download
  const handleDownloadSingle = () => {
    const link = document.createElement('a');
    link.href = activeImageUrl;
    const bgTag = isWhiteBgActive ? '_fundo_branco' : '';
    link.download = `autophoto_${photo.aspectRatio}${bgTag}_${Date.now()}.jpg`;
    link.click();
  };

  // Generate and download 3x4 print sheet
  const handleGenerateSheet = async () => {
    setGeneratingSheet(true);
    try {
      const sheetUrl = await generatePrintableSheet3x4(activeImageUrl);
      setPrintableSheetUrl(sheetUrl);
      setShowSheetPreview(true);
    } catch (err) {
      console.error('Error generating printable sheet:', err);
    } finally {
      setGeneratingSheet(false);
    }
  };

  const handleDownloadSheet = () => {
    if (!printableSheetUrl) return;
    const link = document.createElement('a');
    link.href = printableSheetUrl;
    const bgTag = isWhiteBgActive ? '_fundo_branco' : '';
    link.download = `autophoto_cartela_3x4${bgTag}_${Date.now()}.jpg`;
    link.click();
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      const res = await fetch(activeImageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write error:', err);
      handleDownloadSingle();
    }
  };

  // Share if supported
  const handleShare = async () => {
    if (navigator.share) {
      try {
        const res = await fetch(activeImageUrl);
        const blob = await res.blob();
        const file = new File([blob], `autophoto_${photo.id}.jpg`, { type: 'image/jpeg' });
        await navigator.share({
          title: 'Minha foto com autophoto',
          text: 'Tirei essa foto no autophoto!',
          files: [file],
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      id="photo-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-3.5 max-h-[95vh] overflow-y-auto text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="font-black text-base text-zinc-900">
                {t?.photoCapturedSuccess || 'Foto Capturada!'}
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                {t?.photoAutoSavedNotice || 'Salva automaticamente na galeria'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-editor-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature: White Background / Contour Segmentation Toggle */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-zinc-900">
                    Fundo Branco (Foto 3x4 / Doc)
                  </span>
                  {bgMethod && isWhiteBgActive && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      {bgMethod === 'neural_mediapipe' ? 'IA Retrato' : 'Contorno Adaptativo'}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500">
                  Identifica o contorno da pessoa e substitui o fundo por branco puro
                </p>
              </div>
            </div>

            <button
              id="btn-toggle-white-bg"
              type="button"
              onClick={handleToggleWhiteBg}
              disabled={isProcessingBg}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isWhiteBgActive
                  ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                  : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {isProcessingBg ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Recortando...</span>
                </>
              ) : isWhiteBgActive ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ativo</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Aplicar</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Segmented Switcher & Adjust Toggle */}
          {whiteBgDataUrl && !isProcessingBg && (
            <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 text-xs">
              <div className="flex items-center bg-zinc-200/80 p-0.5 rounded-xl text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setIsWhiteBgActive(false)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    !isWhiteBgActive
                      ? 'bg-white text-zinc-900 shadow-xs font-bold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Original
                </button>
                <button
                  type="button"
                  onClick={() => setIsWhiteBgActive(true)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    isWhiteBgActive
                      ? 'bg-white text-zinc-900 shadow-xs font-bold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full border border-zinc-300 bg-white inline-block" />
                  <span>Fundo Branco</span>
                </button>
              </div>

              {/* Adjust sliders toggle button */}
              <button
                type="button"
                id="btn-toggle-contour-tuning"
                onClick={() => setShowTuning((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  showTuning
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'text-zinc-600 hover:text-zinc-900 bg-zinc-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>{showTuning ? 'Ocultar ajustes' : 'Ajustar contorno'}</span>
              </button>
            </div>
          )}

          {/* Real-time Fine Tuning Panel */}
          {showTuning && whiteBgDataUrl && (
            <div
              id="contour-tuning-panel"
              className="bg-white border border-zinc-200 rounded-2xl p-3.5 flex flex-col gap-3 animate-in fade-in duration-150 text-xs shadow-xs"
            >
              <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                <span className="font-bold text-zinc-800 text-[11px] flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Ajustes Finos do Contorno (Tempo Real)
                </span>
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="text-[10px] text-zinc-500 hover:text-indigo-600 font-semibold cursor-pointer underline"
                >
                  Restaurar padrão
                </button>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-zinc-400 font-medium">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(50, 3, 0)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    sensitivity === 50 && feather === 3 && edgeShift === 0
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  Padrão 3x4
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(68, 4, 1)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    sensitivity === 68
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  Mais Cabelo
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(35, 2, -1)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    sensitivity === 35
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  Corte Rígido
                </button>
              </div>

              {/* Slider 1: Sensitivity */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-zinc-700">Sensibilidade do Contorno</span>
                  <span className="font-mono text-indigo-600 font-bold">{sensitivity}%</span>
                </div>
                <input
                  id="slider-contour-sensitivity"
                  type="range"
                  min={10}
                  max={90}
                  step={1}
                  value={sensitivity}
                  onChange={(e) => handleSensitivityChange(Number(e.target.value))}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => handleSensitivityChange(Number((e.target as HTMLInputElement).value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg appearance-none"
                />
                <div className="flex items-center justify-between text-[9px] text-zinc-400 font-medium">
                  <span>Corte limpo (menos fundo)</span>
                  <span>Capturar mais fios/roupas</span>
                </div>
              </div>

              {/* Slider 2: Edge Shift (Shrink vs Expand) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-zinc-700">Tamanho da Borda (Expandir / Encolher)</span>
                  <span className="font-mono text-indigo-600 font-bold">
                    {edgeShift > 0 ? `+${edgeShift}px` : `${edgeShift}px`}
                  </span>
                </div>
                <input
                  id="slider-contour-edgeshift"
                  type="range"
                  min={-3}
                  max={3}
                  step={1}
                  value={edgeShift}
                  onChange={(e) => handleEdgeShiftChange(Number(e.target.value))}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => handleEdgeShiftChange(Number((e.target as HTMLInputElement).value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg appearance-none"
                />
                <div className="flex items-center justify-between text-[9px] text-zinc-400 font-medium">
                  <span>Encolher borda (remove halos)</span>
                  <span>Expandir silhueta</span>
                </div>
              </div>

              {/* Slider 3: Feather (Edge Softness) */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-zinc-700">Suavização de Borda (Feather)</span>
                  <span className="font-mono text-indigo-600 font-bold">{feather}px</span>
                </div>
                <input
                  id="slider-contour-feather"
                  type="range"
                  min={0}
                  max={8}
                  step={1}
                  value={feather}
                  onChange={(e) => handleFeatherChange(Number(e.target.value))}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => handleFeatherChange(Number((e.target as HTMLInputElement).value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg appearance-none"
                />
                <div className="flex items-center justify-between text-[9px] text-zinc-400 font-medium">
                  <span>Borda nítida (0px)</span>
                  <span>Borda difusa (8px)</span>
                </div>
              </div>

              {/* Explicit Recalculate and Reapply Button */}
              <button
                type="button"
                id="btn-recalculate-contour"
                onClick={handleExplicitRecalculate}
                disabled={isRecalculating}
                className="w-full mt-1 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-indigo-400' : 'text-indigo-400'}`} />
                <span>
                  {isRecalculating
                    ? 'Recalculando contorno...'
                    : justRecalculated
                    ? '✓ Ajustes Recalculados e Aplicados!'
                    : 'Recalcular e Reaplicar Ajustes'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Photo Display Area */}
        <div className="relative w-full flex items-center justify-center bg-zinc-100 rounded-2xl p-3 border border-zinc-200 overflow-hidden min-h-[220px]">
          {isProcessingBg && (
            <div className="absolute inset-0 z-10 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-zinc-800">
              <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
              <span className="text-xs font-bold">Identificando contorno da pessoa...</span>
              <span className="text-[10px] text-zinc-500">
                Processando máscara facial e silhueta para fundo branco
              </span>
            </div>
          )}

          {isRecalculating && (
            <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-full bg-zinc-900/85 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
              <span>Recalculando...</span>
            </div>
          )}

          {showSheetPreview && printableSheetUrl ? (
            <div className="flex flex-col items-center gap-2.5 w-full">
              <img
                src={printableSheetUrl}
                alt="Cartela 3x4 pronta para impressão"
                className="max-h-[300px] w-auto rounded-xl shadow-md object-contain border border-zinc-200"
              />
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  id="btn-download-printable-sheet"
                  onClick={handleDownloadSheet}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t?.downloadSheetAction || 'Baixar Cartela (6 Fotos 3x4)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSheetPreview(false)}
                  className="px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 mr-1 inline" />
                  <span>{t?.backToPhoto || 'Voltar'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              <img
                src={activeImageUrl}
                alt="Foto"
                className={`rounded-2xl shadow-xl object-cover max-h-[320px] w-auto border-2 transition-all ${
                  isWhiteBgActive ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-white'
                }`}
              />

              {/* Tags */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                {photo.aspectRatio === '3x4' && (
                  <div className="px-2 py-0.5 rounded-md bg-zinc-900/80 text-white font-bold font-mono text-[9px] uppercase shadow-xs">
                    {t?.standard3x4Tag || 'Padrão 3x4'}
                  </div>
                )}
                {isWhiteBgActive && (
                  <div className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[9px] shadow-xs flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    <span>Fundo Branco</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Direct Download */}
          <button
            type="button"
            id="btn-download-photo"
            onClick={handleDownloadSingle}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-transform active:scale-95 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>
              {t?.downloadPhoto || 'Baixar Foto'} {isWhiteBgActive ? '(Fundo Branco)' : ''}
            </span>
          </button>

          {/* Printable 3x4 sheet */}
          <button
            type="button"
            id="btn-generate-sheet"
            onClick={handleGenerateSheet}
            disabled={generatingSheet}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-sm border border-zinc-200 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>
              {generatingSheet
                ? t?.generatingSheet || 'Montando Cartela...'
                : isWhiteBgActive
                ? 'Cartela 3x4 (Fundo Branco)'
                : t?.printSheet3x4 || 'Cartela 3x4 (Impressão)'}
            </span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors font-medium cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <span>{copied ? t?.copied || 'Copiado!' : t?.copy || 'Copiar'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors font-medium cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>{t?.share || 'Compartilhar'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGallery();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors font-semibold cursor-pointer"
            >
              <Images className="w-3.5 h-3.5" />
              <span>{t?.viewInGallery || 'Ver na Galeria'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t?.newPhoto || 'Nova Foto'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
