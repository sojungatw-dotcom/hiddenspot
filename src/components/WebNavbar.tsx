import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  ChevronDown,
  Sparkles,
  Search,
  User,
  LogOut,
  Smartphone,
  Bookmark,
  Check,
  Map as MapIcon,
  Home,
  Sliders,
} from 'lucide-react';
import { NavTab } from './BottomNav';
import { UserProfile } from '../types';

interface WebNavbarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  user: UserProfile;
  savedCount: number;
  onOpenAiGenerator: () => void;
  aiLoading?: boolean;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onToggleViewMode: () => void;
  isMockupMode: boolean;
}

export const WebNavbar: React.FC<WebNavbarProps> = ({
  activeTab,
  onChangeTab,
  selectedRegion,
  onSelectRegion,
  user,
  savedCount,
  onOpenAiGenerator,
  aiLoading = false,
  onOpenAuth,
  onLogout,
  onToggleViewMode,
  isMockupMode,
}) => {
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const regionOptions = [
    { label: '부산 전체', value: '전체' },
    { label: '영도구 (봉래산·흰여울)', value: '영도구' },
    { label: '전포·서면 (전포 사잇길)', value: '전포·서면' },
    { label: '망미동 (망미 골목)', value: '망미동' },
    { label: '동구·초량 (초량 이바구길)', value: '동구·초량' },
    { label: '해운대·청사포 (청사포 포구)', value: '해운대·청사포' },
    { label: '기장·송정 (송정 해안가)', value: '기장·송정' },
  ];

  const currentRegionLabel =
    regionOptions.find(
      (opt) =>
        opt.value === selectedRegion ||
        (selectedRegion === '부산 전체' && opt.value === '전체')
    )?.label || selectedRegion;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs select-none">
      {/* Top Banner Notice */}
      <div className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-stone-200">
              부산 N차 재방문자를 위한 로컬 히든 스팟 웹 서비스
            </span>
            <span className="hidden md:inline text-stone-400">
              · 관광객 붐비는 곳을 피해 현지인이 찾는 진짜 골목을 큐레이션합니다.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <button
              onClick={onToggleViewMode}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium transition-colors cursor-pointer border border-stone-700"
              title="스마트폰 화면 목업으로 전환"
            >
              <Smartphone className="w-3 h-3 text-rose-400" />
              <span>모바일 목업 보기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onChangeTab('home')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <img
              src="/logo.jpg"
              alt="Hidden Spot IN BUSAN"
              className="h-11 w-auto max-w-[50px] object-contain shrink-0 group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-stone-950 group-hover:text-rose-600 transition-colors">
                  Hidden Spot
                </span>
                <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-black rounded-md tracking-wider">
                  BUSAN
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                부산 N차 여행자를 위한 AI 로컬 가이드
              </p>
            </div>
          </button>

          {/* Region Dropdown Selector */}
          <div className="relative hidden md:block">
            <button
              id="web-navbar-region-btn"
              onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100/90 hover:bg-stone-200/70 text-stone-800 text-xs font-bold transition-colors cursor-pointer border border-stone-200/60"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span className="max-w-[120px] truncate">{currentRegionLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {showRegionDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRegionDropdown(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold text-stone-400 px-3 py-1.5">
                    부산 탐험 권역 선택
                  </div>
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
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between font-medium cursor-pointer ${
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
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/50">
          <button
            onClick={() => onChangeTab('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Home className="w-4 h-4 text-rose-500" />
            <span>홈 피드</span>
          </button>

          <button
            onClick={() => onChangeTab('discover')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'discover'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Search className="w-4 h-4 text-amber-500" />
            <span>스팟 탐색</span>
          </button>

          <button
            onClick={() => onChangeTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <MapIcon className="w-4 h-4 text-emerald-500" />
            <span>로컬 지도</span>
          </button>

          <button
            onClick={() => onChangeTab('mybusan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'mybusan'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <User className="w-4 h-4 text-indigo-500" />
            <span>마이부산</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right: Actions (AI Generator, User Profile) */}
        <div className="flex items-center gap-3">
          {/* AI Generator CTA Button */}
          <button
            id="web-ai-generator-btn"
            onClick={onOpenAiGenerator}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {aiLoading ? 'AI 분석 중...' : 'AI 히든 스팟 발굴'}
            </span>
            <span className="sm:hidden">AI 발굴</span>
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200/80 border border-stone-200/60 transition-all cursor-pointer"
            >
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-white"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[7px] font-bold border border-white">
                  ✓
                </div>
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-stone-900 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-stone-500 font-medium">
                  LV.{user.level} {user.levelTitle}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Profile Dropdown */}
            {showUserDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">{user.name} 님</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email || '게스트 로그인 중'}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-md inline-flex">
                      <span>LV.{user.level} {user.levelTitle}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onChangeTab('mybusan');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 hover:bg-stone-50 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-rose-500" />
                      <span>보관한 스팟 & 후기 관리</span>
                    </button>
                    <button
                      onClick={() => {
                        onChangeTab('discover');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-700 hover:bg-stone-50 font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-amber-500" />
                      <span>새로운 스팟 탐색하기</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-stone-100">
                    {onLogout && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>로그아웃</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for small screens in Web view */}
      <div className="lg:hidden border-t border-stone-100 bg-stone-50/90 px-4 py-2 flex items-center justify-around text-xs font-semibold text-stone-600">
        <button
          onClick={() => onChangeTab('home')}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
            activeTab === 'home' ? 'bg-white text-rose-600 font-bold shadow-xs' : ''
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>홈</span>
        </button>
        <button
          onClick={() => onChangeTab('discover')}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
            activeTab === 'discover' ? 'bg-white text-amber-600 font-bold shadow-xs' : ''
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>탐색</span>
        </button>
        <button
          onClick={() => onChangeTab('map')}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
            activeTab === 'map' ? 'bg-white text-emerald-600 font-bold shadow-xs' : ''
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>지도</span>
        </button>
        <button
          onClick={() => onChangeTab('mybusan')}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg ${
            activeTab === 'mybusan' ? 'bg-white text-indigo-600 font-bold shadow-xs' : ''
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>마이부산</span>
        </button>
      </div>
    </header>
  );
};
