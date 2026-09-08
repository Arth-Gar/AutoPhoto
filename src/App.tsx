import React, { useState, useEffect, useRef } from 'react';
import {
  AspectRatioType,
  CapturedPhoto,
  FilterPreset,
  PlacedSticker,
  StickerTemplate,
  UserProfile,
  AdCreative,
  Language,
} from './types';
import { FILTER_PRESETS } from './data/filters';
import { STICKER_TEMPLATES } from './data/stickers';
import { soundManager } from './utils/audio';
import { captureFrameToDataUrl } from './utils/canvas';
import { TRANSLATIONS } from './i18n/translations';
import { Header } from './components/Header';
import { TopAdBanner } from './components/TopAdBanner';
import { AnchorAdBanner } from './components/AnchorAdBanner';
import { WebcamView } from './components/WebcamView';
import { StickerDrawer } from './components/StickerDrawer';
import { PhotoEditorModal } from './components/PhotoEditorModal';
import { GalleryDrawer } from './components/GalleryDrawer';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { HelpModal } from './components/HelpModal';
import {
  Camera,
  Timer,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Layers,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

const STORAGE_KEY_PHOTOS = 'autophoto_saved_photos_v1';
const STORAGE_KEY_USER = 'autophoto_user_profile_v1';
const STORAGE_KEY_LANG = 'autophoto_lang_pref';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackImgRef = useRef<HTMLImageElement>(null);

  // Internationalization State (PT, EN, ES)
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language | null;
      if (savedLang && ['pt', 'en', 'es'].includes(savedLang)) {
        return savedLang;
      }
      // Check browser locale
      const browserLang = navigator.language?.toLowerCase() || '';
      if (browserLang.startsWith('es')) return 'es';
      if (browserLang.startsWith('en')) return 'en';
    } catch {
      // Ignore
    }
    return 'pt';
  });

  const t = TRANSLATIONS[language];

  const handleSelectLanguage = (newLang: Language) => {
    soundManager.playTap();
    setLanguage(newLang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, newLang);
    } catch (err) {
      console.warn('Could not save language preference:', err);
    }
  };

  // Webcam & Filter State
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('3x4');
  const [filter, setFilter] = useState<FilterPreset>(FILTER_PRESETS[0]);
  const [manualBrightness, setManualBrightness] = useState<number>(0);
  const [manualContrast, setManualContrast] = useState<number>(0);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [show3x4Guide, setShow3x4Guide] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Stickers State
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Capture & Shutter State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [burstMode, setBurstMode] = useState<boolean>(false);

  // Photos & Gallery
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [activePhotoForEditor, setActivePhotoForEditor] = useState<CapturedPhoto | null>(null);

  // UI Drawers & Modals
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = useState<boolean>(false);
  const [isAdjustmentsOpen, setIsAdjustmentsOpen] = useState<boolean>(false);
  const [showExtraFilters, setShowExtraFilters] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedPhotos = localStorage.getItem(STORAGE_KEY_PHOTOS);
      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        setUserProfile(JSON.parse(savedUser));
      }
    } catch (err) {
      console.warn('Failed to load saved photos from storage', err);
    }
  }, []);

  const savePhotosToStorage = (updatedPhotos: CapturedPhoto[]) => {
    setPhotos(updatedPhotos);
    try {
      localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updatedPhotos));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Sticker actions
  const handleAddSticker = (template: StickerTemplate) => {
    soundManager.playStickerPop();
    const newSticker: PlacedSticker = {
      id: `sticker_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      stickerId: template.id,
      type: template.type,
      content: template.content,
      x: 50 + (Math.random() * 12 - 6),
      y: 42 + (Math.random() * 12 - 6),
      scale: template.defaultScale || 1.2,
      rotation: 0,
      color: template.color,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleUpdateSticker = (id: string, updates: Partial<PlacedSticker>) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleRemoveSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAllStickers = () => {
    soundManager.playDelete();
    setStickers([]);
    setSelectedStickerId(null);
  };

  // Capture execution
  const executeInstantSnap = (): CapturedPhoto | null => {
    const source = videoRef.current?.videoWidth ? videoRef.current : fallbackImgRef.current;
    if (!source) return null;

    soundManager.playShutter();

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const dataUrl = captureFrameToDataUrl(
      source,
      aspectRatio,
      filter,
      manualBrightness,
      manualContrast,
      stickers,
      isMirrored
    );

    if (!dataUrl) return null;

    const newPhoto: CapturedPhoto = {
      id: `photo_${Date.now()}`,
      dataUrl,
      timestamp: Date.now(),
      aspectRatio,
      filterId: filter.id,
      stickersCount: stickers.length,
    };

    const updated = [newPhoto, ...photos];
    savePhotosToStorage(updated);
    return newPhoto;
  };

  const handleCapture = () => {
    if (isCapturing) return;

    if (timerSeconds > 0) {
      setIsCapturing(true);
      setCountdown(timerSeconds);
      soundManager.playBeep(false);

      let currentSec = timerSeconds;
      const interval = setInterval(() => {
        currentSec -= 1;
        if (currentSec > 0) {
          setCountdown(currentSec);
          soundManager.playBeep(false);
        } else {
          clearInterval(interval);
          setCountdown(null);
          soundManager.playBeep(true);

          if (burstMode) {
            triggerBurst();
          } else {
            const snapped = executeInstantSnap();
            setIsCapturing(false);
            if (snapped) {
              setActivePhotoForEditor(snapped);
            }
          }
        }
      }, 1000);
    } else {
      if (burstMode) {
        triggerBurst();
      } else {
        const snapped = executeInstantSnap();
        if (snapped) {
          setActivePhotoForEditor(snapped);
        }
      }
    }
  };

  // Triple burst capture
  const triggerBurst = () => {
    setIsCapturing(true);
    let count = 0;
    const snaps: CapturedPhoto[] = [];

    const takeOne = () => {
      count += 1;
      const snap = executeInstantSnap();
      if (snap) snaps.push(snap);

      if (count < 3) {
        setTimeout(takeOne, 750);
      } else {
        setIsCapturing(false);
        if (snaps.length > 0) {
          setActivePhotoForEditor(snaps[snaps.length - 1]);
        }
      }
    };

    takeOne();
  };

  const handleDeletePhoto = (id: string) => {
    soundManager.playDelete();
    const updated = photos.filter((p) => p.id !== id);
    savePhotosToStorage(updated);
    if (activePhotoForEditor?.id === id) {
      setActivePhotoForEditor(null);
    }
  };

  const handleClearGallery = () => {
    if (window.confirm(t.deleteConfirm)) {
      soundManager.playDelete();
      savePhotosToStorage([]);
      setActivePhotoForEditor(null);
    }
  };

  const handleGoogleLogin = (email: string, name: string) => {
    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      email,
      name,
      isLoggedIn: true,
      syncedCount: photos.length,
      lastSync: Date.now(),
    };
    setUserProfile(profile);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
  };

  const handleGoogleLogout = () => {
    setUserProfile(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const handleAdClick = (ad: AdCreative) => {
    alert(`${t.adSponsored}: ${ad.sponsor} - "${ad.title}"`);
  };

  const aspectOptions: { id: AspectRatioType; label: string; tag?: string }[] = [
    { id: '3x4', label: '3x4', tag: t.aspectDoc },
    { id: '1x1', label: '1:1', tag: t.aspectSquare },
    { id: '4x3', label: '4:3', tag: t.aspectCamera },
    { id: '16x9', label: '16:9', tag: t.aspectWide },
    { id: 'strip', label: 'Tira 3x', tag: t.aspectStrip },
  ];

  // Bento Quick Stickers preview
  const bentoQuickStickers = STICKER_TEMPLATES.slice(0, 15);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 text-zinc-900 font-sans selection:bg-indigo-600 selection:text-white pb-24">
      {/* Top Banner Ad (Auto-refresh) */}
      <TopAdBanner onAdClick={handleAdClick} />

      {/* Main Header with Language Switcher */}
      <Header
        photoCount={photos.length}
        userProfile={userProfile}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        t={t}
      />

      {/* Bento Grid Main Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT BENTO CELL: CAMERA VIEWFINDER & SHUTTER (col-span-7) */}
        {/* ======================================================== */}
        <div className="col-span-12 lg:col-span-7 bg-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col items-center justify-between border-4 border-white p-4 sm:p-6 min-h-[580px]">
          {/* Subtle gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Top Floating Bar: Aspect Ratio Switcher */}
          <div className="relative z-20 w-full flex items-center justify-between gap-2 mb-3">
            {/* Aspect Ratio Pills */}
            <div className="flex items-center bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20 overflow-x-auto no-scrollbar shadow-xs">
              {aspectOptions.map((opt) => {
                const isSelected = aspectRatio === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAspectRatio(opt.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-white text-zinc-900 shadow-md scale-102'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.tag && (
                      <span
                        className={`text-[9px] px-1 rounded font-mono uppercase ${
                          isSelected ? 'bg-zinc-200 text-zinc-900' : 'text-white/60'
                        }`}
                      >
                        {opt.tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Timer Pills */}
            <div className="flex items-center bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-xs shrink-0">
              <Timer className="w-3.5 h-3.5 text-white/70 ml-2 mr-1" />
              {[0, 3, 5].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTimerSeconds(sec)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    timerSeconds === sec
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {sec === 0 ? '0s' : `${sec}s`}
                </button>
              ))}
            </div>
          </div>

          {/* The Webcam / Simulator Stage */}
          <div className="relative z-10 w-full flex-1 flex items-center justify-center my-auto">
            <WebcamView
              videoRef={videoRef}
              fallbackImgRef={fallbackImgRef}
              aspectRatio={aspectRatio}
              filter={filter}
              manualBrightness={manualBrightness}
              manualContrast={manualContrast}
              isMirrored={isMirrored}
              onToggleMirror={() => setIsMirrored(!isMirrored)}
              stickers={stickers}
              onUpdateSticker={handleUpdateSticker}
              onRemoveSticker={handleRemoveSticker}
              selectedStickerId={selectedStickerId}
              onSelectSticker={setSelectedStickerId}
              countdown={countdown}
              isFlashing={isFlashing}
              show3x4Guide={show3x4Guide}
              onToggle3x4Guide={() => setShow3x4Guide(!show3x4Guide)}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
              t={t}
            />
          </div>

          {/* Bottom Floating Controls: Bento Shutter Button & Burst mode */}
          <div className="relative z-20 w-full flex items-center justify-between gap-4 mt-3 pt-2">
            {/* Left: Burst mode trigger */}
            <button
              type="button"
              onClick={() => setBurstMode(!burstMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all shadow-xs ${
                burstMode
                  ? 'bg-white text-zinc-900 border-white'
                  : 'bg-black/40 text-white/80 border-white/20 hover:bg-black/60 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.tripleShot}</span>
              <span className="sm:hidden">3x</span>
              {burstMode && <Check className="w-3 h-3 text-indigo-600 ml-0.5" />}
            </button>

            {/* Center: Iconic Bento Shutter Button */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                id="btn-shutter-capture"
                onClick={handleCapture}
                disabled={isCapturing}
                aria-label={t.shutterAria}
                className="w-16 h-16 sm:w-18 sm:h-18 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-95 hover:scale-105 transition-transform border-4 border-zinc-900 cursor-pointer group disabled:opacity-50"
              >
                <div className="w-11 h-11 sm:w-13 sm:h-13 border-2 border-zinc-900 rounded-full flex items-center justify-center bg-rose-500 group-hover:bg-rose-600 transition-colors shadow-inner">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </button>
            </div>

            {/* Right: Quick Drawer button for stickers */}
            <button
              type="button"
              onClick={() => setIsStickerDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-black/40 text-white/80 border border-white/20 hover:bg-black/60 hover:text-white backdrop-blur-md transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{t.library}</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT BENTO COLUMN: FILTROS BÁSICOS & ADESIVOS (col-span-5) */}
        {/* ======================================================== */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* Bento Card 1: Filtros Básicos */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase text-zinc-400 tracking-tighter">
                {t.basicFilters}
              </h2>
              <button
                type="button"
                onClick={() => setIsAdjustmentsOpen(!isAdjustmentsOpen)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isAdjustmentsOpen ? t.hideSliders : t.lightAdjustments}</span>
              </button>
            </div>

            {/* 4 Core Filters Grid matching Bento design */}
            <div className="grid grid-cols-4 gap-3">
              {/* 1: Normal */}
              <button
                type="button"
                onClick={() => setFilter(FILTER_PRESETS[0])}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className={`w-full aspect-square bg-zinc-200 rounded-2xl flex items-center justify-center transition-all ${
                    filter.id === 'normal'
                      ? 'border-2 border-indigo-600 shadow-md ring-2 ring-indigo-600/20'
                      : 'border border-zinc-200 group-hover:border-zinc-300'
                  }`}
                >
                  <span className="text-xs font-black text-zinc-600 font-mono">100%</span>
                </div>
                <span
                  className={`text-[11px] ${
                    filter.id === 'normal' ? 'font-bold text-indigo-700' : 'text-zinc-500 font-medium'
                  }`}
                >
                  {t.normal}
                </span>
              </button>

              {/* 2: P&B */}
              <button
                type="button"
                onClick={() => setFilter(FILTER_PRESETS[1])}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className={`w-full aspect-square bg-zinc-400 grayscale rounded-2xl flex items-center justify-center transition-all ${
                    filter.id === 'pb_classico'
                      ? 'border-2 border-indigo-600 shadow-md ring-2 ring-indigo-600/20'
                      : 'border border-zinc-300 group-hover:border-zinc-400'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-white to-black border border-zinc-500" />
                </div>
                <span
                  className={`text-[11px] ${
                    filter.id === 'pb_classico' ? 'font-bold text-indigo-700' : 'text-zinc-500 font-medium'
                  }`}
                >
                  {t.bw}
                </span>
              </button>

              {/* 3: Alta Luz */}
              <button
                type="button"
                onClick={() => setFilter(FILTER_PRESETS[2])}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className={`w-full aspect-square bg-white border rounded-2xl shadow-inner flex items-center justify-center transition-all ${
                    filter.id === 'alta_luz'
                      ? 'border-2 border-indigo-600 shadow-md ring-2 ring-indigo-600/20'
                      : 'border-zinc-200 group-hover:border-zinc-300'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                </div>
                <span
                  className={`text-[11px] ${
                    filter.id === 'alta_luz' ? 'font-bold text-indigo-700' : 'text-zinc-500 font-medium'
                  }`}
                >
                  {t.highLight}
                </span>
              </button>

              {/* 4: Baixa Luz */}
              <button
                type="button"
                onClick={() => setFilter(FILTER_PRESETS[3])}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className={`w-full aspect-square bg-zinc-900 rounded-2xl flex items-center justify-center transition-all ${
                    filter.id === 'baixa_luz'
                      ? 'border-2 border-indigo-600 shadow-md ring-2 ring-indigo-600/20'
                      : 'border border-zinc-800 group-hover:border-zinc-700'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-indigo-400/80 shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                </div>
                <span
                  className={`text-[11px] ${
                    filter.id === 'baixa_luz' ? 'font-bold text-indigo-700' : 'text-zinc-500 font-medium'
                  }`}
                >
                  {t.lowLight}
                </span>
              </button>
            </div>

            {/* Toggle More Presets button */}
            <button
              type="button"
              onClick={() => setShowExtraFilters(!showExtraFilters)}
              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 text-center pt-1 transition-colors cursor-pointer"
            >
              {showExtraFilters ? t.fewerFilters : t.moreFilters}
            </button>

            {/* Extra filters grid if opened */}
            {showExtraFilters && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-100">
                {FILTER_PRESETS.slice(4).map((p) => {
                  const isSelected = filter.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFilter(p)}
                      className={`p-2 rounded-xl text-center text-[10px] font-bold border transition-all truncate cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Collapsible Manual Light Tuning Sliders */}
            {isAdjustmentsOpen && (
              <div className="mt-2 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800">{t.manualExposure}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setManualBrightness(0);
                      setManualContrast(0);
                    }}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-indigo-600 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.reset}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-zinc-600 text-[11px] font-medium">
                    <span>{t.brightness}</span>
                    <span className="font-mono font-bold text-indigo-600">
                      {manualBrightness > 0 ? `+${manualBrightness}` : manualBrightness}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    value={manualBrightness}
                    onChange={(e) => setManualBrightness(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg appearance-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-zinc-600 text-[11px] font-medium">
                    <span>{t.contrast}</span>
                    <span className="font-mono font-bold text-indigo-600">
                      {manualContrast > 0 ? `+${manualContrast}` : manualContrast}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    value={manualContrast}
                    onChange={(e) => setManualContrast(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg appearance-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bento Card 2: Adesivos Fun */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-200 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase text-zinc-400 tracking-tighter">
                {t.funStickers}
              </h2>
              {stickers.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllStickers}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t.clearStickers} ({stickers.length})</span>
                </button>
              )}
            </div>

            {/* Quick Grid of Stickers matching Bento aesthetic */}
            <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-1 py-1 max-h-[220px]">
              {bentoQuickStickers.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  onClick={() => handleAddSticker(sticker)}
                  title={`Adicionar ${sticker.name}`}
                  className="aspect-square bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-center text-2xl cursor-pointer hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all shadow-xs"
                >
                  {sticker.type === 'emoji' ? (
                    <span>{sticker.content}</span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-tighter px-1 text-center font-mono">
                      {sticker.content}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
              <span>{t.dragTip}</span>
              <button
                type="button"
                onClick={() => setIsStickerDrawerOpen(true)}
                className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{t.moreStickers}</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleCapture}
                disabled={isCapturing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                <span>{photos.length > 0 ? t.capturePhoto : t.capture3x4}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Drawers & Modals with translations */}
      <StickerDrawer
        isOpen={isStickerDrawerOpen}
        onClose={() => setIsStickerDrawerOpen(false)}
        onAddSticker={handleAddSticker}
        onClearAllStickers={handleClearAllStickers}
        stickersCount={stickers.length}
        t={t}
      />

      <PhotoEditorModal
        photo={activePhotoForEditor}
        onClose={() => setActivePhotoForEditor(null)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        t={t}
      />

      <GalleryDrawer
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        photos={photos}
        onDeletePhoto={handleDeletePhoto}
        onClearGallery={handleClearGallery}
        userProfile={userProfile}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        t={t}
      />

      <GoogleAuthModal
        isOpen={isGoogleAuthOpen}
        onClose={() => setIsGoogleAuthOpen(false)}
        userProfile={userProfile}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        t={t}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        t={t}
      />

      {/* Bottom Sticky Anchor Ad Unit (Auto-refresh) */}
      <AnchorAdBanner onAdClick={handleAdClick} />
    </div>
  );
}
