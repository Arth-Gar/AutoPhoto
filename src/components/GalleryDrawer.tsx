import React, { useState } from 'react';
import {
  X,
  Trash2,
  Download,
  Printer,
  Images,
  CloudCheck,
  HardDrive,
} from 'lucide-react';
import { CapturedPhoto, UserProfile } from '../types';
import { generatePrintableSheet3x4 } from '../utils/canvas';
import { Translations } from '../i18n/translations';

interface GalleryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  photos: CapturedPhoto[];
  onDeletePhoto: (id: string) => void;
  onClearGallery: () => void;
  userProfile: UserProfile | null;
  onOpenGoogleAuth: () => void;
  t?: Translations;
}

export const GalleryDrawer: React.FC<GalleryDrawerProps> = ({
  isOpen,
  onClose,
  photos,
  onDeletePhoto,
  onClearGallery,
  userProfile,
  onOpenGoogleAuth,
  t,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);
  const [isGeneratingSheet, setIsGeneratingSheet] = useState(false);

  if (!isOpen) return null;

  const handleDownload = (photo: CapturedPhoto) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `autophoto_${photo.aspectRatio}_${photo.timestamp}.jpg`;
    link.click();
  };

  const handleDownloadSheet = async (photo: CapturedPhoto) => {
    setIsGeneratingSheet(true);
    try {
      const sheetUrl = await generatePrintableSheet3x4(photo.dataUrl);
      const link = document.createElement('a');
      link.href = sheetUrl;
      link.download = `autophoto_cartela_3x4_${Date.now()}.jpg`;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSheet(false);
    }
  };

  const handleDownloadAll = () => {
    photos.forEach((photo, idx) => {
      setTimeout(() => {
        handleDownload(photo);
      }, idx * 250);
    });
  };

  const photosCountText = t?.photosSavedCount
    ? t.photosSavedCount(photos.length)
    : `${photos.length} foto${photos.length !== 1 ? 's' : ''} gravada${photos.length !== 1 ? 's' : ''}`;

  return (
    <div
      id="gallery-drawer-modal"
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md h-full bg-white border-l border-zinc-200 shadow-2xl p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-zinc-900">{t?.yourGallery || 'Sua Galeria'}</h3>
              <p className="text-xs text-zinc-500 font-medium">{photosCountText}</p>
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

        {/* Storage / Sync status card */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {userProfile?.isLoggedIn ? (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CloudCheck className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
            )}

            <div>
              <div className="font-bold text-zinc-800">
                {userProfile?.isLoggedIn
                  ? (t?.syncedGoogle || 'Sincronizado no Google')
                  : (t?.storedLocally || 'Armazenado no Navegador')}
              </div>
              <div className="text-[11px] text-zinc-500">
                {userProfile?.isLoggedIn
                  ? (t?.syncedAccountSub ? t.syncedAccountSub(userProfile.email) : `Vinculado a ${userProfile.email}`)
                  : (t?.storedLocallySub || 'Funciona 100% sem login! Fotos salvas localmente.')}
              </div>
            </div>
          </div>

          {!userProfile?.isLoggedIn && (
            <button
              type="button"
              onClick={onOpenGoogleAuth}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-zinc-100 text-indigo-600 font-bold text-xs border border-zinc-200 shrink-0 transition-colors shadow-xs"
            >
              {t?.connectGoogle || 'Conectar'}
            </button>
          )}
        </div>

        {/* Gallery actions */}
        {photos.length > 0 && (
          <div className="flex items-center justify-between text-xs font-semibold">
            <button
              type="button"
              onClick={handleDownloadAll}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t?.downloadAll || 'Baixar Todas'}</span>
            </button>

            <button
              type="button"
              onClick={onClearGallery}
              className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t?.clearGallery || 'Limpar Galeria'}</span>
            </button>
          </div>
        )}

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-400 gap-3">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200">
              <Images className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-700">{t?.noPhotosYet || 'Nenhuma foto ainda'}</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                {t?.noPhotosYetSub || 'Clique no botão de disparo na câmera para registrar sua primeira foto!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-1">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-2xl overflow-hidden border border-zinc-200 bg-white flex flex-col shadow-xs hover:border-indigo-400 hover:shadow-md transition-all"
              >
                <div
                  className="cursor-pointer overflow-hidden aspect-[3/4] flex items-center justify-center bg-zinc-100"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.dataUrl}
                    alt="Foto tirada"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-2 flex items-center justify-between text-[11px] bg-white border-t border-zinc-100">
                  <span className="font-mono text-zinc-500 font-bold uppercase">
                    {photo.aspectRatio}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDownload(photo)}
                      title="Download"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {photo.aspectRatio === '3x4' && (
                      <button
                        type="button"
                        onClick={() => handleDownloadSheet(photo)}
                        disabled={isGeneratingSheet}
                        title="3x4 Sheet"
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeletePhoto(photo.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Photo Modal Viewer */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="relative max-w-sm w-full bg-white border border-zinc-200 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-zinc-800 uppercase font-mono">
                  {t?.viewingPhoto || 'Visualizando Foto'} {selectedPhoto.aspectRatio}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <img
                src={selectedPhoto.dataUrl}
                alt="Foto"
                className="w-full rounded-2xl object-contain max-h-[55vh] bg-zinc-100 border border-zinc-200"
              />

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedPhoto)}
                  className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{t?.downloadPhoto || 'Baixar Foto'}</span>
                </button>

                {selectedPhoto.aspectRatio === '3x4' && (
                  <button
                    type="button"
                    onClick={() => handleDownloadSheet(selectedPhoto)}
                    className="flex-1 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-200"
                  >
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <span>{t?.printSheet3x4 || 'Cartela 3x4'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
