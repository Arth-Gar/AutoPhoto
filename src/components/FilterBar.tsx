import React from 'react';
import {
  SunMedium,
  Binary,
  Sparkles,
  Moon,
  Contrast,
  Flame,
  Zap,
  ScanLine,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { FilterPreset } from '../types';
import { FILTER_PRESETS } from '../data/filters';

interface FilterBarProps {
  selectedFilter: FilterPreset;
  onSelectFilter: (filter: FilterPreset) => void;
  manualBrightness: number;
  onChangeManualBrightness: (val: number) => void;
  manualContrast: number;
  onChangeManualContrast: (val: number) => void;
  showAdjustments: boolean;
  onResetAdjustments: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedFilter,
  onSelectFilter,
  manualBrightness,
  onChangeManualBrightness,
  manualContrast,
  onChangeManualContrast,
  showAdjustments,
  onResetAdjustments,
}) => {
  const getFilterIcon = (name: string) => {
    switch (name) {
      case 'SunMedium':
        return <SunMedium className="w-4 h-4" />;
      case 'Binary':
        return <Binary className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Moon':
        return <Moon className="w-4 h-4" />;
      case 'Contrast':
        return <Contrast className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'ScanLine':
        return <ScanLine className="w-4 h-4" />;
      case 'Heart':
        return <Heart className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div id="filters-container" className="w-full max-w-4xl mx-auto px-3 py-2 flex flex-col gap-3">
      {/* Filters Horizontal Scrollable Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
        {FILTER_PRESETS.map((preset) => {
          const isSelected = selectedFilter.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              id={`filter-btn-${preset.id}`}
              onClick={() => onSelectFilter(preset)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                isSelected
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-lg shadow-amber-500/20 font-bold scale-[1.02]'
                  : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800'
              }`}
            >
              <span className={isSelected ? 'text-neutral-950' : 'text-amber-400'}>
                {getFilterIcon(preset.iconName)}
              </span>
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* Manual Fine-Tuning Slider Panel (Collapsible) */}
      {showAdjustments && (
        <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-200">
              Ajuste Fino de Luz & Contraste
            </span>
            <button
              type="button"
              onClick={onResetAdjustments}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-amber-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Resetar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brightness slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-neutral-400">
                <span>Luminosidade / Brilho</span>
                <span className="font-mono text-amber-400">
                  {manualBrightness > 0 ? `+${manualBrightness}` : manualBrightness}%
                </span>
              </div>
              <input
                id="slider-brightness"
                type="range"
                min="-60"
                max="60"
                value={manualBrightness}
                onChange={(e) => onChangeManualBrightness(Number(e.target.value))}
                className="accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
              />
            </div>

            {/* Contrast slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-neutral-400">
                <span>Contraste</span>
                <span className="font-mono text-amber-400">
                  {manualContrast > 0 ? `+${manualContrast}` : manualContrast}%
                </span>
              </div>
              <input
                id="slider-contrast"
                type="range"
                min="-60"
                max="60"
                value={manualContrast}
                onChange={(e) => onChangeManualContrast(Number(e.target.value))}
                className="accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
