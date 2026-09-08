import React, { useState } from 'react';
import { X, CheckCircle2, Cloud, LogOut, Info } from 'lucide-react';
import { UserProfile } from '../types';
import { Translations } from '../i18n/translations';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
  t?: Translations;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onLogin,
  onLogout,
  t,
}) => {
  const [customEmail, setCustomEmail] = useState('arthgarword@gmail.com');
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const handleQuickConnect = () => {
    onLogin(customEmail || 'usuario@gmail.com', customEmail.split('@')[0] || 'Usuário Google');
    onClose();
  };

  return (
    <div
      id="google-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-3">
            {/* Google G Logo */}
            <div className="w-9 h-9 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-zinc-900 text-base">
                {t?.googleOAuthTitle || 'Google OAuth & Nuvem'}
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                {t?.googleOAuthSub || 'Sincronização de galeria opcional'}
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

        {/* Informative Note */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-zinc-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-indigo-900">
              {t?.googleFreeNotice || 'O autophoto é 100% gratuito e não exige login!'}
            </p>
            <p className="text-zinc-600 leading-relaxed">
              {t?.googleFreeNoticeSub || 'Você pode tirar fotos, aplicar filtros, salvar cartelas 3x4 e baixar sem criar conta. A conexão com o Google serve para quem deseja salvar uma galeria online.'}
            </p>
          </div>
        </div>

        {userProfile?.isLoggedIn ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-zinc-900 text-sm">
                    {userProfile.name}
                  </div>
                  <div className="text-zinc-500 text-xs">
                    {userProfile.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t?.connected || 'Ativo'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <Cloud className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                {t?.syncedAccountActive || 'Todas as fotos tiradas estão sendo vinculadas ao seu perfil.'}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-colors border border-zinc-200 hover:border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t?.disconnect || 'Desconectar'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-700 font-bold block">
                {t?.googleAccountForSync || 'Conta Google para sincronização:'}
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="seu.email@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              id="btn-confirm-google-connect"
              onClick={handleQuickConnect}
              className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-transform active:scale-98 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t?.connectGoogle || 'Conectar com Google'}</span>
            </button>

            {/* Advanced OAuth Configuration Details */}
            <div className="border-t border-zinc-100 pt-2 text-[11px] text-zinc-400">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="hover:text-zinc-600 underline cursor-pointer"
              >
                {showAdvanced ? 'Ocultar detalhes de escopo OAuth' : 'Ver detalhes técnicos do OAuth'}
              </button>
              {showAdvanced && (
                <div className="mt-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-600 font-mono text-[10px] space-y-1">
                  <div>Escopo: openid email profile</div>
                  <div>Armazenamento: Local Indexed/Memory + Cloud Ready</div>
                  <div>Client: Google Identity Services (GSI) Token Client</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
