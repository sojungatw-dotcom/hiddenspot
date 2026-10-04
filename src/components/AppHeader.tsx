import React, { useState } from 'react';
import { Search, ChevronDown, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface AppHeaderProps {
  title: string;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  user: UserProfile;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  onOpenAiGenerator?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  selectedRegion,
  onSelectRegion,
  user,
  onOpenSearch,
  onOpenProfile,
  onOpenAiGenerator,
}) => {
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const regionOptions = [
    { label: '부산 전체', value: '전체' },
    { label: '영도구 (봉래산·흰여울)', value: '영도구' },
    { label: '전포·서면 (전포 사잇길)', value: '전포·서면' },
    { label: '망미동 (망미 골목)', value: '망미동' },
    { label: '동구·초량 (초량 이바구길)', value: '동구·초량' },
    { label: '해운대·청사포 (청사포 포구)', value: '해운대·청사포' },
    { label: '기장·송정 (송정 해안가)', value: '기장·송정' },
  ];

  return (
    <div className="w-full bg-white border-b border-stone-100 px-4 pt-2 pb-2.5 z-30 shrink-0 select-none">
      <div className="flex items-center justify-between">
        {/* Left: Stamp Logo & Location Bar */}
        <div className="flex items-center gap-2">
          {/* Brand Logo - 네모 박스/테두리/그림자 없이 이미지 자체만 표시 */}
          <img
            src="/logo.jpg"
            alt="Hidden Spot IN BUSAN"
            className="h-10 w-auto max-w-[46px] object-contain shrink-0 cursor-pointer"
            referrerPolicy="no-referrer"
          />

          {/* Region selector & View title */}
          <div className="relative">
            <button
              id="header-region-selector-btn"
              onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <svg className="w-2.5 h-2.5 text-rose-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
              </svg>
              <span>{selectedRegion}</span>
              <ChevronDown className="w-3 h-3 text-rose-400" />
            </button>

            {/* Region Dropdown Menu */}
            {showRegionDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRegionDropdown(false)}
                />
                <div className="absolute left-0 top-6 mt-1 w-52 bg-white rounded-xl shadow-xl border border-stone-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-medium text-stone-400 px-2.5 py-1">탐험 지역 선택</div>
                  {regionOptions.map((opt) => {
                    const isActive =
                      selectedRegion === opt.value ||
                      (selectedRegion === '전체' && opt.value === '전체') ||
                      (selectedRegion === '부산 전체' && opt.value === '전체') ||
                      selectedRegion.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          onSelectRegion(opt.value);
                          setShowRegionDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between font-medium cursor-pointer ${
                          isActive
                            ? 'bg-rose-50 text-rose-600 font-bold'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <h1 className="text-lg font-extrabold text-stone-900 tracking-tight leading-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: AI Quick Action + Search + Profile Avatar */}
        <div className="flex items-center gap-2">
          {onOpenAiGenerator && (
            <button
              onClick={onOpenAiGenerator}
              className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
              title="AI 히든 스팟 추천"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
            title="검색"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User Profile avatar with Level 3 badge */}
          <button
            id="header-profile-btn"
            onClick={onOpenProfile}
            className="relative cursor-pointer group"
            title={`${user.name} 님 (LV.${user.level})`}
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-stone-200 group-hover:ring-2 group-hover:ring-rose-400 transition-all"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold border border-white">
              ✓
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
