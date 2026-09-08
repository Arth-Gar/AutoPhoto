import React from 'react';
import { X, HelpCircle, Sparkles, Camera, ShieldCheck } from 'lucide-react';
import { Translations } from '../i18n/translations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t?: Translations;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div
      id="help-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-xs sm:text-sm max-h-[90vh] overflow-y-auto text-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-base">
                {t?.helpTitle || 'Como usar o autophoto'}
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                {t?.helpSub || 'Guia rápido de foto 3x4 e efeitos'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-700 text-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>{t?.helpDocTitle || 'Fotos 3x4 para Documentos'}</span>
            </div>
            <ul className="text-zinc-600 space-y-1 text-xs list-disc list-inside">
              <li>{t?.helpDocItem1 || 'Use a linha guia pontilhada para alinhar olhos e queixo.'}</li>
              <li>{t?.helpDocItem2 || 'Fique contra uma parede clara e com luz frontal suave.'}</li>
              <li>{t?.helpDocItem3 || 'Após tirar a foto, use o botão Cartela 3x4 para baixar uma folha com 6 cópias com marcas de corte prontas para impressão!'}</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm">
              <Camera className="w-4 h-4 text-zinc-700" />
              <span>{t?.helpFiltersTitle || 'Filtros de Luz e P&B'}</span>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed">
              {t?.helpFiltersDesc || 'Use Alta Luz para clarear webcam escura ou dar visual de estúdio, Baixa Luz para um tom intimista e P&B para fotos monocromáticas atemporais.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-700 text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t?.helpStickersTitle || 'Adesivos Fun & Brincadeiras'}</span>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed">
              {t?.helpStickersDesc || 'Toque nos adesivos na grade lateral para colar óculos, bigodes, selos ou emojis na tela. Você pode arrastá-los livremente pelo visor para encaixar no seu rosto ou arrastar para a lixeira para excluir!'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors mt-2 shadow-xs cursor-pointer"
        >
          {t?.helpGotIt || 'Entendido, vamos lá!'}
        </button>
      </div>
    </div>
  );
};
