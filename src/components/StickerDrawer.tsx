import React, { useState } from 'react';
import { X, Trash2, Sparkles } from 'lucide-react';
import { STICKER_TEMPLATES } from '../data/stickers';
import { StickerTemplate } from '../types';
import { soundManager } from '../utils/audio';
import { Translations } from '../i18n/translations';

interface StickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSticker: (template: StickerTemplate) => void;
  onClearAllStickers: () => void;
  stickersCount: number;
  t?: Translations;
}

export const StickerDrawer: React.FC<StickerDrawerProps> = ({
  isOpen,
  onClose,
  onAddSticker,
  onClearAllStickers,
  stickersCount,
  t,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  if (!isOpen) return null;

  const categories = [
    { id: 'todos', label: t?.categoriesAll || 'Todos' },
    { id: 'acessorios', label: t?.categoriesAccessories || 'Acessórios' },
    { id: 'rosto', label: t?.categoriesFace || 'Rosto' },
    { id: 'emojis', label: t?.categoriesEmojis || 'Emojis' },
    { id: '3x4', label: t?.categories3x4 || 'Selos 3x4' },
    { id: 'molduras', label: t?.categoriesRetro || 'Retrô' },
  ];

  const filteredStickers = activeCategory === 'todos'
    ? STICKER_TEMPLATES
    : STICKER_TEMPLATES.filter((s) => s.category === activeCategory);

  const handleSelectSticker = (template: StickerTemplate) => {
    soundManager.playStickerPop();
    onAddSticker(template);
  };

  return (
    <div
      id="sticker-drawer-modal"
      className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-zinc-200 shadow-2xl backdrop-blur-xl p-5 max-h-[70vh] flex flex-col gap-3 animate-in slide-in-from-bottom duration-250 max-w-2xl mx-auto rounded-t-3xl text-zinc-900"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-zinc-900">
              {t?.stickerLibraryTitle || 'Biblioteca de Adesivos'}
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium">
              {t?.stickerLibrarySub || 'Toque para colar na câmera e arraste pelo visor para encaixar'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stickersCount > 0 && (
            <button
              type="button"
              onClick={onClearAllStickers}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t?.clearStickers || 'Limpar'} ({stickersCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Categories chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stickers Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 overflow-y-auto pr-1 py-1 max-h-[40vh]">
        {filteredStickers.map((sticker) => (
          <button
            key={sticker.id}
            type="button"
            onClick={() => handleSelectSticker(sticker)}
            className="aspect-square flex flex-col items-center justify-center p-2 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-indigo-400 hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 group shadow-xs cursor-pointer"
          >
            {sticker.type === 'emoji' ? (
              <span className="text-3xl select-none group-hover:scale-110 transition-transform">
                {sticker.content}
              </span>
            ) : (
              <div
                className="px-2 py-1 rounded font-bold text-[10px] tracking-wider uppercase border text-center shadow-xs"
                style={{
                  backgroundColor: `${sticker.color}20`,
                  color: sticker.color,
                  borderColor: sticker.color,
                }}
              >
                {sticker.content}
              </div>
            )}
            <span className="text-[10px] text-zinc-500 font-medium truncate mt-1 w-full text-center">
              {sticker.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
