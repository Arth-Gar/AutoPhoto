import React, { useRef, useState, useEffect } from 'react';
import { RotateCw, Trash2, ZoomIn, ZoomOut, X } from 'lucide-react';
import { PlacedSticker } from '../types';
import { soundManager } from '../utils/audio';
import { Translations } from '../i18n/translations';

interface StickerOverlayProps {
  stickers: PlacedSticker[];
  onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  onRemoveSticker: (id: string) => void;
  selectedId: string | null;
  onSelectSticker: (id: string | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  t?: Translations;
}

export const StickerOverlay: React.FC<StickerOverlayProps> = ({
  stickers,
  onUpdateSticker,
  onRemoveSticker,
  selectedId,
  onSelectSticker,
  containerRef,
  t,
}) => {
  const isDraggingRef = useRef(false);
  const dragStickerIdRef = useRef<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const trashZoneRef = useRef<HTMLDivElement>(null);
  const [deletedNotice, setDeletedNotice] = useState<string | null>(null);

  const dropText = t?.dropToDelete || 'Solte para Excluir!';
  const dragText = t?.dragHereToDelete || 'Arraste aqui para Excluir';
  const deletedText = t?.stickerDeleted || 'Adesivo excluído!';

  const checkIsOverTrash = (clientX: number, clientY: number, xPercent: number, yPercent: number) => {
    // Check using trash zone DOM element rect if available
    if (trashZoneRef.current) {
      const trashRect = trashZoneRef.current.getBoundingClientRect();
      const padding = 25; // generous hit-test area
      const insideX = clientX >= trashRect.left - padding && clientX <= trashRect.right + padding;
      const insideY = clientY >= trashRect.top - padding && clientY <= trashRect.bottom + padding;
      if (insideX && insideY) return true;
    }

    // Fallback based on relative percentage inside viewfinder container
    if (yPercent >= 75 && xPercent >= 25 && xPercent <= 75) {
      return true;
    }

    if (yPercent >= 85) {
      return true;
    }

    return false;
  };

  const handlePointerDown = (e: React.PointerEvent, sticker: PlacedSticker) => {
    e.stopPropagation();
    onSelectSticker(sticker.id);
    dragStickerIdRef.current = sticker.id;
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsOverTrash(false);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;
      setDragOffset({
        x: clickXPercent - sticker.x,
        y: clickYPercent - sticker.y,
      });
    }

    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !dragStickerIdRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const currentYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, currentXPercent - dragOffset.x));
    const newY = Math.max(0, Math.min(100, currentYPercent - dragOffset.y));

    onUpdateSticker(dragStickerIdRef.current, { x: newX, y: newY });

    const overTrash = checkIsOverTrash(e.clientX, e.clientY, newX, newY);
    setIsOverTrash(overTrash);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      const draggedId = dragStickerIdRef.current;
      isDraggingRef.current = false;
      dragStickerIdRef.current = null;
      setIsDragging(false);

      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // Ignore
      }

      if (isOverTrash && draggedId) {
        soundManager.playDelete();
        onRemoveSticker(draggedId);
        onSelectSticker(null);
        setIsOverTrash(false);

        // Visual toast
        setDeletedNotice(deletedText);
        setTimeout(() => setDeletedNotice(null), 1800);
      }
    }
  };

  const handleRotate = (e: React.MouseEvent | React.PointerEvent, sticker: PlacedSticker) => {
    e.stopPropagation();
    const newRot = (sticker.rotation + 15) % 360;
    onUpdateSticker(sticker.id, { rotation: newRot });
  };

  const handleScale = (e: React.MouseEvent | React.PointerEvent, sticker: PlacedSticker, delta: number) => {
    e.stopPropagation();
    const newScale = Math.max(0.6, Math.min(2.5, Number((sticker.scale + delta).toFixed(1))));
    onUpdateSticker(sticker.id, { scale: newScale });
  };

  const handleDelete = (e: React.MouseEvent | React.PointerEvent, id: string) => {
    e.stopPropagation();
    soundManager.playDelete();
    onRemoveSticker(id);
    onSelectSticker(null);
    setDeletedNotice(deletedText);
    setTimeout(() => setDeletedNotice(null), 1800);
  };

  return (
    <div
      className="absolute inset-0 pointer-events-auto overflow-hidden select-none z-20"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => {
        if (!isDraggingRef.current) {
          onSelectSticker(null);
        }
      }}
    >
      {/* Toast Notice when deleted */}
      {deletedNotice && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-xl border border-white/40 animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          {deletedNotice}
        </div>
      )}

      {/* DRAG-AND-DROP TRASH ZONE AT THE BOTTOM */}
      {isDragging && (
        <div
          ref={trashZoneRef}
          id="sticker-drag-trash-zone"
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-40 transition-all duration-200 pointer-events-none flex items-center justify-center ${
            isOverTrash
              ? 'scale-115 animate-pulse'
              : 'scale-100 animate-bounce'
          }`}
        >
          <div
            className={`px-4 py-2.5 rounded-full border-2 shadow-2xl flex items-center gap-2 transition-all ${
              isOverTrash
                ? 'bg-rose-600 text-white border-white ring-4 ring-rose-400/60 font-black scale-105'
                : 'bg-zinc-900/90 text-rose-300 border-rose-500/80 backdrop-blur-md font-bold'
            }`}
          >
            <Trash2 className={`w-4 h-4 ${isOverTrash ? 'animate-spin' : ''}`} />
            <span className="text-xs tracking-wide">
              {isOverTrash ? dropText : dragText}
            </span>
          </div>
        </div>
      )}

      {/* Render Placed Stickers */}
      {stickers.map((sticker) => {
        const isSelected = selectedId === sticker.id;
        const isThisBeingDragged = isDragging && dragStickerIdRef.current === sticker.id;
        const isThisOverTrash = isThisBeingDragged && isOverTrash;

        return (
          <div
            key={sticker.id}
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${
                isThisOverTrash ? sticker.scale * 0.75 : sticker.scale
              })`,
              transformOrigin: 'center center',
              opacity: isThisOverTrash ? 0.45 : 1,
            }}
            onPointerDown={(e) => handlePointerDown(e, sticker)}
            className={`absolute cursor-grab active:cursor-grabbing touch-none transition-all duration-100 ${
              isSelected
                ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black/50 rounded-xl p-1'
                : 'hover:scale-105'
            } ${isThisOverTrash ? 'filter grayscale brightness-50' : ''}`}
          >
            {/* Direct Close/Delete Button attached to top-right corner of selected sticker */}
            {isSelected && !isDragging && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => handleDelete(e, sticker.id)}
                title="Excluir"
                className="absolute -top-3 -right-3 z-30 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer transition-transform hover:scale-115 active:scale-90"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}

            {/* Sticker Content */}
            {sticker.type === 'stamp' ? (
              <div
                style={{ borderColor: sticker.color || '#059669', color: sticker.color || '#059669' }}
                className="px-2.5 py-1 bg-white/95 border-2 rounded-lg font-black font-mono text-xs sm:text-sm tracking-wider uppercase shadow-md whitespace-nowrap select-none"
              >
                {sticker.content}
              </div>
            ) : (
              <div className="text-4xl sm:text-5xl filter drop-shadow-md select-none leading-none">
                {sticker.content}
              </div>
            )}

            {/* Quick Controls Bar when selected (Scale / Rotate / Trash) */}
            {isSelected && !isDragging && (
              <div
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="absolute -bottom-11 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white text-zinc-900 border border-zinc-300 rounded-full px-2 py-1 shadow-2xl backdrop-blur-md z-30 whitespace-nowrap"
              >
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => handleScale(e, sticker, -0.15)}
                  title="-"
                  className="p-1.5 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => handleScale(e, sticker, 0.15)}
                  title="+"
                  className="p-1.5 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => handleRotate(e, sticker)}
                  title="15°"
                  className="p-1.5 rounded-full text-zinc-600 hover:text-indigo-600 hover:bg-zinc-100 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-3.5 bg-zinc-200 mx-0.5" />

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => handleDelete(e, sticker.id)}
                  title="X"
                  className="p-1.5 rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
