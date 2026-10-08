import React from 'react';
import { Gamepad2, Crown, Rocket, Disc, Gem, Fish } from 'lucide-react';
import { LobbyCategory } from '../types/game';

interface CategoryNavProps {
  activeCategory: LobbyCategory;
  onSelectCategory: (cat: LobbyCategory) => void;
}

interface CategoryItem {
  id: LobbyCategory;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'lobby', label: 'Lobby', icon: Gamepad2 },
  { id: 'popular', label: 'Popular', icon: Crown },
  { id: 'minigame', label: 'Mini Game', icon: Rocket },
  { id: 'lottery', label: 'Lottery', icon: Disc },
  { id: 'slots', label: 'Slots', icon: Gem },
  { id: 'fishing', label: 'Fishing', icon: Fish },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 px-1 border-b border-slate-800/80 no-scrollbar">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="flex flex-1 min-w-[56px] flex-col items-center justify-center py-1.5 transition-all group relative"
          >
            {/* 3D golden icon look */}
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/30 to-amber-700/20 text-amber-300 border border-amber-400/50 shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-amber-200 hover:bg-slate-850'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Label */}
            <span
              className={`text-[11px] font-bold mt-1 tracking-tight transition-colors ${
                isActive ? 'text-amber-300 font-extrabold' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            >
              {cat.label}
            </span>

            {/* Glowing yellow underline indicator */}
            {isActive && (
              <div className="absolute -bottom-1 h-0.5 w-8 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
