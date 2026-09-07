import React from 'react';
import { Compass, Star, Map as MapIcon, Bookmark } from 'lucide-react';

export type NavTab = 'home' | 'discover' | 'map' | 'mybusan';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  savedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  savedCount = 24,
}) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: '홈',
      icon: Compass,
    },
    {
      id: 'discover' as NavTab,
      label: '발견',
      icon: Star,
    },
    {
      id: 'map' as NavTab,
      label: '지도',
      icon: MapIcon,
    },
    {
      id: 'mybusan' as NavTab,
      label: '마이부산',
      icon: Bookmark,
      badge: savedCount,
    },
  ];

  return (
    <nav className="w-full bg-white border-t border-stone-100 py-1.5 px-3 flex items-center justify-around z-30 shrink-0 select-none shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
              isActive
                ? 'text-rose-500 font-bold scale-105'
                : 'text-stone-400 hover:text-stone-600 font-medium'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'
                }`}
              />
              {tab.id === 'mybusan' && savedCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full min-w-3.5 h-3.5 flex items-center justify-center border border-white">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
