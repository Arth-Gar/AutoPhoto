import React, { useState } from 'react';
import {
  Download,
  Printer,
  Copy,
  RotateCcw,
  Check,
  Share2,
  Images,
  X,
} from 'lucide-react';
import { CapturedPhoto } from '../types';
import { generatePrintableSheet3x4 } from '../utils/canvas';
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

  if (!photo) return null;

  // Single photo download
  const handleDownloadSingle = () => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `autophoto_${photo.aspectRatio}_${Date.now()}.jpg`;
    link.click();
  };

  // Generate and download 3x4 print sheet
  const handleGenerateSheet = async () => {
    setGeneratingSheet(true);
    try {
      const sheetUrl = await generatePrintableSheet3x4(photo.dataUrl);
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
    link.download = `autophoto_cartela_3x4_${Date.now()}.jpg`;
    link.click();
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      const res = await fetch(photo.dataUrl);
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
        const res = await fetch(photo.dataUrl);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[95vh] overflow-y-auto text-zinc-900">
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
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo Display */}
        <div className="relative w-full flex items-center justify-center bg-zinc-100 rounded-2xl p-3 border border-zinc-200 overflow-hidden">
          {showSheetPreview && printableSheetUrl ? (
            <div className="flex flex-col items-center gap-2.5 w-full">
              <img
                src={printableSheetUrl}
                alt="Cartela 3x4 pronta para impressão"
                className="max-h-[320px] w-auto rounded-xl shadow-md object-contain border border-zinc-200"
              />
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleDownloadSheet}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{t?.downloadSheetAction || 'Baixar Cartela (6 Fotos 3x4)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSheetPreview(false)}
                  className="px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold"
                >
                  {t?.backToPhoto || 'Voltar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              <img
                src={photo.dataUrl}
                alt="Foto tirada"
                className="rounded-2xl shadow-xl object-cover max-h-[340px] w-auto border-2 border-white"
              />
              {photo.aspectRatio === '3x4' && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-zinc-900/80 text-white font-bold font-mono text-[10px] uppercase shadow-xs">
                  {t?.standard3x4Tag || 'Padrão 3x4'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Direct Download */}
          <button
            type="button"
            id="btn-download-photo"
            onClick={handleDownloadSingle}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-transform active:scale-95 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t?.downloadPhoto || 'Baixar Foto'} ({photo.aspectRatio})</span>
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
              {generatingSheet ? (t?.generatingSheet || 'Montando Cartela...') : (t?.printSheet3x4 || 'Cartela 3x4 (Impressão)')}
            </span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
              <span>{copied ? (t?.copied || 'Copiado!') : (t?.copy || 'Copiar')}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors font-medium"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors font-semibold"
            >
              <Images className="w-3.5 h-3.5" />
              <span>{t?.viewInGallery || 'Ver na Galeria'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors font-medium"
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
