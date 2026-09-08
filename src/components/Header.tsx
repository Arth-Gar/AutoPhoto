import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Images, UserCheck, HelpCircle, Globe, ChevronDown, Check } from 'lucide-react';
import { CAMERA_LOGO_SRC } from '../assets/camera-logo';
import { UserProfile, Language } from '../types';
import { Translations } from '../i18n/translations';

interface HeaderProps {
  photoCount: number;
  userProfile: UserProfile | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenGallery: () => void;
  onOpenGoogleAuth: () => void;
  onOpenHelp: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  t: Translations;
}

interface LanguageOption {
  code: Language;
  label: string;
  shortLabel: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'pt', label: 'Português', shortLabel: 'PT', flag: '🇧🇷' },
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'Español', shortLabel: 'ES', flag: '🇪🇸' },
];

export const Header: React.FC<HeaderProps> = ({
  photoCount,
  userProfile,
  isMuted,
  onToggleMute,
  onOpenGallery,
  onOpenGoogleAuth,
  onOpenHelp,
  language,
  onSelectLanguage,
  t,
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLangOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="autophoto-header"
      className="w-full bg-white border-b border-zinc-200 sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3 transition-colors shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-2xl text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={CAMERA_LOGO_SRC}
                alt="autophoto logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-zinc-900 font-sans">
                autophoto
              </h1>
              <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 tracking-wide uppercase">
                {t.badge}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase hidden md:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Language Switcher Dropdown Button */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              id="btn-language-selector"
              onClick={() => setIsLangOpen(!isLangOpen)}
              title={t.languageSelect}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 border border-zinc-200 rounded-full text-xs font-bold text-zinc-800 bg-white hover:bg-zinc-50 transition-colors shadow-xs"
            >
              <span className="text-sm">{currentLangOption.flag}</span>
              <span className="font-mono tracking-wider">{currentLangOption.shortLabel}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div
                id="language-dropdown-menu"
                className="absolute right-0 mt-1.5 w-40 bg-white border border-zinc-200 rounded-2xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 mb-1">
                  {t.languageSelect}
                </div>

                {LANGUAGES.map((langOpt) => {
                  const isSelected = langOpt.code === language;
                  return (
                    <button
                      key={langOpt.code}
                      type="button"
                      onClick={() => {
                        onSelectLanguage(langOpt.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{langOpt.flag}</span>
                        <span>{langOpt.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mute button */}
          <button
            type="button"
            id="btn-toggle-sound"
            onClick={onToggleMute}
            title={isMuted ? t.soundOn : t.soundOff}
            className="p-2 sm:p-2.5 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Help / Guide */}
          <button
            type="button"
            id="btn-open-help"
            onClick={onOpenHelp}
            title={t.help}
            className="p-2 sm:p-2.5 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors hidden sm:flex"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Gallery Button */}
          <button
            type="button"
            id="btn-open-gallery"
            onClick={onOpenGallery}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-zinc-200 rounded-full text-xs sm:text-sm font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors shadow-xs"
          >
            <Images className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">{t.gallery}</span>
            {photoCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] leading-tight">
                {photoCount}
              </span>
            )}
          </button>

          {/* Google OAuth Login Button */}
          <button
            type="button"
            id="btn-google-auth"
            onClick={onOpenGoogleAuth}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs ${
              userProfile?.isLoggedIn
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800'
            }`}
            title={
              userProfile?.isLoggedIn
                ? `${t.connected}: ${userProfile.email}`
                : t.login
            }
          >
            {userProfile?.isLoggedIn ? (
              <>
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="truncate max-w-[80px] hidden md:inline">
                  {userProfile.name.split(' ')[0]}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>{t.login}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
