import React, { useState } from 'react';
import {
  Bookmark,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  Check,
  Users,
  Navigation,
  MapPinOff,
  Compass,
  ArrowRight,
  ShieldCheck,
  Star,
  Eye,
  Sliders,
} from 'lucide-react';
import { Spot } from '../types';

interface HomeScreenProps {
  spots: Spot[];
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  onSelectSpot: (spot: Spot) => void;
  onToggleSave: (spotId: string, e: React.MouseEvent) => void;
  onToggleVisited: (spotId: string, e: React.MouseEvent) => void;
  onOpenAiGenerator: () => void;
  isWebMode?: boolean;
}

// 스팟의 지역과 선택된 지역 필터 매칭 함수
export const isSpotInRegion = (spot: Spot, targetRegion: string): boolean => {
  if (!targetRegion || targetRegion === '전체' || targetRegion === '부산 전체') {
    return true;
  }

  const cleanTarget = targetRegion.replace(/부산|[·\s,/]/g, '').trim().toLowerCase();
  const cleanSpotRegion = (spot.region || '').replace(/부산|[·\s,/]/g, '').trim().toLowerCase();
  const cleanSpotDistrict = (spot.district || '').replace(/부산|[·\s,/]/g, '').trim().toLowerCase();
  const cleanSpotAddress = (spot.address || '').replace(/부산|[·\s,/]/g, '').trim().toLowerCase();

  // 1. 직접 포함 관계 비교
  if (
    cleanSpotRegion.includes(cleanTarget) ||
    cleanTarget.includes(cleanSpotRegion) ||
    cleanSpotDistrict.includes(cleanTarget) ||
    cleanSpotAddress.includes(cleanTarget)
  ) {
    return true;
  }

  // 2. 단어 토큰 분리 비교
  const tokens = targetRegion
    .replace(/부산/g, '')
    .split(/[·\s,/]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  return tokens.some(
    (token) =>
      cleanSpotRegion.includes(token) ||
      cleanSpotDistrict.includes(token) ||
      cleanSpotAddress.includes(token)
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  spots,
  selectedRegion,
  onSelectRegion,
  onSelectSpot,
  onToggleSave,
  onToggleVisited,
  onOpenAiGenerator,
  isWebMode = false,
}) => {
  const [trendDays, setTrendDays] = useState<7 | 30>(7);

  // Region filter options
  const regions = [
    '전체',
    '영도구',
    '전포·서면',
    '망미동',
    '동구·초량',
    '해운대·청사포',
    '기장·송정',
  ];

  const isAll = !selectedRegion || selectedRegion === '전체' || selectedRegion === '부산 전체';

  // Helper for chip active state
  const isRegionSelected = (region: string) => {
    if (region === '전체') {
      return isAll;
    }
    const cleanR = region.replace(/부산|[·\s,/]/g, '').toLowerCase();
    const cleanSelected = (selectedRegion || '').replace(/부산|[·\s,/]/g, '').toLowerCase();
    return cleanR === cleanSelected || cleanSelected.includes(cleanR) || cleanR.includes(cleanSelected);
  };

  // Helper to count unvisited spots in a region
  const getRegionCount = (region: string) => {
    return spots.filter((s) => !s.isVisited && isSpotInRegion(s, region)).length;
  };

  // Filter spots strictly by region and unvisited state
  const visibleSpots = spots.filter(
    (s) => !s.isVisited && isSpotInRegion(s, selectedRegion)
  );

  // Pick top hero spot strictly from visibleSpots
  const heroSpot = visibleSpots.length > 0
    ? (isAll ? (visibleSpots.find((s) => s.id === 'spot-1') || visibleSpots[0]) : visibleSpots[0])
    : null;

  // Trending spots strictly from visibleSpots
  const trendingSpots = visibleSpots
    .slice()
    .sort((a, b) => b.scoreBreakdown.growth - a.scoreBreakdown.growth);

  // Discovery spots for vertical list / web grid
  const discoverySpots = isAll
    ? visibleSpots.filter((s) => s.hiddenScore >= 80)
    : visibleSpots;

  return (
    <div className={`flex-1 select-none ${isWebMode ? 'space-y-10 pb-16' : 'overflow-y-auto px-4 py-3 space-y-6 pb-8'}`}>
      {/* ======================================================== */}
      {/* 1. HERO SECTION (Web layout vs Mobile layout)           */}
      {/* ======================================================== */}
      {isWebMode ? (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white p-8 sm:p-12 shadow-xl border border-stone-800">
          {/* Subtle Ambient Background Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700/80 text-rose-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>부산 N차 재방문자를 위한 AI 로컬 큐레이션</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              관광객 붐비는 뻔한 곳은 그만,<br />
              진짜 부산의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-amber-400">숨은 골목</span>을 걷다
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl font-normal">
              현지인 생활권 비율, 소음도, 골목길 접근성을 종합 분석한 <strong className="text-white font-bold">Hidden Score</strong>로
              당신만의 취향이 담긴 로컬 공간을 찾아드립니다. 이미 가본 관광지는 추천에서 자동으로 제외됩니다.
            </p>

            {/* Quick Live Stats Row */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>검증된 로컬 스팟 <strong>{spots.length}곳</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <Star className="w-4 h-4 text-amber-400" />
                <span>평균 Hidden Score <strong>89점</strong></span>
              </div>
              <button
                onClick={onOpenAiGenerator}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md cursor-pointer ml-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI 맞춤 스팟 발굴</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* Mobile Top Tagline & Headline */
        <div className="space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>부산 N회차를 위한 숨은 스팟</span>
          </div>
          <h2 className="text-[20px] font-black tracking-tight text-stone-900 leading-[1.3]">
            다시 찾은 부산, 진짜 로컬을 발견해보세요
          </h2>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. REGION FILTER BAR (Interactive segmented buttons)     */}
      {/* ======================================================== */}
      <div className={`space-y-2 ${isWebMode ? 'bg-white p-4 rounded-2xl border border-stone-200 shadow-xs' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-rose-500" />
            <span>탐험 지역 선택</span>
            {!isAll && (
              <span className="text-rose-600 font-bold ml-1">· {selectedRegion} ({visibleSpots.length}곳)</span>
            )}
          </div>
          {!isAll && (
            <button
              onClick={() => onSelectRegion('전체')}
              className="text-xs text-stone-500 hover:text-stone-900 font-medium underline underline-offset-2 cursor-pointer"
            >
              부산 전체 보기
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {regions.map((region) => {
            const isSelected = isRegionSelected(region);
            const count = getRegionCount(region);
            return (
              <button
                key={region}
                onClick={() => onSelectRegion(region)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-stone-950 text-white shadow-md scale-102'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                <span>{region}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-rose-500 text-white' : 'bg-stone-200/70 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. ASSISTANT QUICK BANNER (Mobile-only quick bar)        */}
      {/* ======================================================== */}
      {!isWebMode && (
        <div
          onClick={onOpenAiGenerator}
          className="rounded-2xl p-3 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 border border-rose-200/60 flex items-center justify-between cursor-pointer hover:border-rose-300 transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 group-hover:text-rose-600 transition-colors">
                내 취향에 맞는 숨은 스팟 찾기
              </div>
              <div className="text-[11px] text-stone-500">
                이미 가본 곳은 빼고 로컬 감성 스팟을 추천해드려요
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-rose-600 group-hover:translate-x-0.5 transition-transform">
            추천받기 →
          </span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. CONTENT AREA (Zero spots state OR Spot Sections)      */}
      {/* ======================================================== */}
      {visibleSpots.length === 0 ? (
        /* Empty State: 정보 없음 */
        <div className={`bg-white rounded-3xl p-10 border border-stone-200 shadow-sm text-center space-y-4 my-6 ${isWebMode ? 'max-w-2xl mx-auto' : ''}`}>
          <div className="w-18 h-18 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <MapPinOff className="w-9 h-9 stroke-[1.5]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
              <span>지역 검색 결과</span>
            </div>
            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              정보 없음
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              선택하신 <strong className="text-stone-800 font-bold">'{selectedRegion}'</strong> 지역에는 아직 등록된 히든 스팟이 없습니다.
              AI 추천을 통해 해당 지역의 숨은 명소를 즉시 발굴해보세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onSelectRegion('전체')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              전체 지역 히든 스팟 보기
            </button>
            <button
              onClick={onOpenAiGenerator}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{selectedRegion} 스팟 AI 발굴하기</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* 5. HERO SPOTLIGHT CARD                                    */}
          {/* ======================================================== */}
          {heroSpot && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {isAll ? '🌟 이번 주 대표 추천 로컬 스팟' : `🌟 ${selectedRegion} 대표 추천 스팟`}
                  </h3>
                </div>
                <span className="text-xs text-stone-400 font-medium">
                  Hidden Score <strong>{heroSpot.hiddenScore}점</strong>
                </span>
              </div>

              {/* Web vs Mobile Spotlight Layout */}
              {isWebMode ? (
                /* Web Spotlight 2-Column Showcase */
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left: Big Photo */}
                  <div
                    onClick={() => onSelectSpot(heroSpot)}
                    className="lg:col-span-6 relative h-72 sm:h-96 rounded-2xl overflow-hidden cursor-pointer group shadow-inner"
                  >
                    <img
                      src={heroSpot.images[0]}
                      alt={heroSpot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black shadow-md">
                        <span>{heroSpot.hiddenScore}점</span>
                        <span>· {heroSpot.scoreLabel}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur text-white text-xs font-semibold">
                        {heroSpot.category}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="text-xs text-stone-300 font-medium">{heroSpot.district}</div>
                      <h4 className="text-2xl font-black mt-0.5 tracking-tight">{heroSpot.name}</h4>
                    </div>
                  </div>

                  {/* Right: Rich Details & Metrics */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                        {heroSpot.region} · {heroSpot.category}
                      </div>

                      <button
                        onClick={(e) => onToggleSave(heroSpot.id, e)}
                        className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-rose-600 cursor-pointer"
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            heroSpot.isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                          }`}
                        />
                        <span>{heroSpot.isSaved ? '보관됨' : '보관하기'}</span>
                      </button>
                    </div>

                    <div>
                      <h3
                        onClick={() => onSelectSpot(heroSpot)}
                        className="text-2xl font-black text-stone-900 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        {heroSpot.name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">{heroSpot.address}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {heroSpot.shortDesc}
                    </p>

                    {/* Local tip box */}
                    <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-3.5 space-y-1">
                      <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>로컬 큐레이터 팁</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-snug">
                        {heroSpot.localTip}
                      </p>
                    </div>

                    {/* Score Breakdown Bars */}
                    <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
                      <div className="flex items-center justify-between text-stone-500">
                        <span>현지인 밀집도 ({heroSpot.scoreBreakdown.localRatio}%)</span>
                        <div className="w-32 bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${heroSpot.scoreBreakdown.localRatio}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-stone-500">
                        <span>소음 여유도 (고요함 {heroSpot.scoreBreakdown.quietness}%)</span>
                        <div className="w-32 bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full"
                            style={{ width: `${heroSpot.scoreBreakdown.quietness}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-stone-500">
                        <span>골목길 접근성 ({heroSpot.scoreBreakdown.accessibility}%)</span>
                        <div className="w-32 bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${heroSpot.scoreBreakdown.accessibility}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => onSelectSpot(heroSpot)}
                        className="flex-1 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors cursor-pointer text-center"
                      >
                        상세 정보 & 리뷰 확인
                      </button>

                      <button
                        onClick={(e) => onToggleVisited(heroSpot.id, e)}
                        className={`px-4 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer border flex items-center gap-1.5 ${
                          heroSpot.isVisited
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                        }`}
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{heroSpot.isVisited ? '다녀왔어요' : '가봤어요'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mobile Spotlight Card */
                <div className="bg-amber-50/60 rounded-3xl p-3 border border-amber-100/70 shadow-xs">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <span>{isAll ? 'FOR YOU' : selectedRegion}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-600">{isAll ? '오늘의 추천' : '대표 추천 스팟'}</span>
                    </div>
                    <button
                      onClick={(e) => onToggleSave(heroSpot.id, e)}
                      className="p-1 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Bookmark
                        className={`w-5 h-5 ${
                          heroSpot.isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-500'
                        }`}
                      />
                    </button>
                  </div>

                  <div
                    onClick={() => onSelectSpot(heroSpot)}
                    className="relative h-56 rounded-2xl overflow-hidden cursor-pointer group shadow-sm"
                  >
                    <img
                      src={heroSpot.images[0]}
                      alt={heroSpot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/90 backdrop-blur-sm text-white text-[11px] font-bold shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span>{heroSpot.hiddenScore}점 {heroSpot.scoreLabel}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-xs font-medium text-stone-200">{heroSpot.district}</div>
                      <h3 className="text-lg font-black tracking-tight text-white mt-0.5">{heroSpot.name}</h3>
                    </div>
                  </div>

                  <div className="mt-3 bg-white/90 rounded-xl p-2.5 border border-amber-200/60 flex items-start gap-2 shadow-xs">
                    <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-stone-700 leading-snug">
                      <span className="font-bold text-rose-600">추천:</span> {heroSpot.matchReason || '아직 안 가본 곳이에요 · 로컬 감성과 잘 맞아요.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. TRENDING SPOTS SECTION                                */}
          {/* ======================================================== */}
          {trendingSpots.length > 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                    {isAll ? '🔥 요즘 로컬들이 주목하는 스팟' : `🔥 ${selectedRegion} 인기 급상승 스팟`}
                  </h3>
                </div>

                <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200/50 text-xs font-medium">
                  <button
                    onClick={() => setTrendDays(7)}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      trendDays === 7 ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500'
                    }`}
                  >
                    최근 7일
                  </button>
                  <button
                    onClick={() => setTrendDays(30)}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      trendDays === 30 ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500'
                    }`}
                  >
                    최근 30일
                  </button>
                </div>
              </div>

              {/* Grid on Web, Carousel on Mobile */}
              {isWebMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingSpots.slice(0, 4).map((spot, index) => (
                    <div
                      key={spot.id}
                      onClick={() => onSelectSpot(spot)}
                      className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-lg transition-all overflow-hidden cursor-pointer group flex flex-col"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={spot.images[0]}
                          alt={spot.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

                        <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-stone-950/90 text-white font-black text-xs flex items-center justify-center">
                          {index + 1}
                        </div>

                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-sky-500 text-white text-[11px] font-bold shadow-xs">
                          {spot.recentTrend || '+38% 상승'}
                        </div>

                        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-lg bg-white/95 backdrop-blur text-stone-900 text-xs font-black shadow-xs">
                          ◆ {spot.hiddenScore}점
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-xs text-rose-600 font-semibold">{spot.district}</div>
                          <h4 className="text-sm font-black text-stone-900 group-hover:text-rose-600 transition-colors mt-0.5">
                            {spot.name}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                            {spot.shortDesc}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                          <span className="text-stone-400 font-medium">{spot.category}</span>
                          <span className="text-rose-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                            자세히 <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Mobile Horizontal Carousel */
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
                  {trendingSpots.slice(0, 5).map((spot, index) => (
                    <div
                      key={spot.id}
                      onClick={() => onSelectSpot(spot)}
                      className="w-56 shrink-0 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                    >
                      <div className="relative h-28 overflow-hidden">
                        <img
                          src={spot.images[0]}
                          alt={spot.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-stone-950/80 text-white font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-sky-500/90 text-white text-[10px] font-bold">
                          {spot.recentTrend || '+38%'}
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-900/90 backdrop-blur text-white text-[11px] font-bold">
                          ◆ {spot.hiddenScore}점
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] text-stone-400 font-medium truncate">{spot.district}</div>
                        <h4 className="text-xs font-extrabold text-stone-900 truncate mt-0.5 group-hover:text-rose-600 transition-colors">
                          {spot.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{spot.shortDesc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. ALL DISCOVERY SPOTS (Web Multi-column Grid)            */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  {isAll ? '✨ 전체 추천 로컬 히든 스팟' : `✨ ${selectedRegion} 숨은 스팟 목록`}
                </h3>
                <p className="text-xs text-stone-500">
                  {isAll ? '관광객이 적고 분위기 좋은 골목 스팟들을 모았습니다.' : `총 ${discoverySpots.length}곳의 로컬 스팟이 발굴되어 있습니다.`}
                </p>
              </div>

              <div className="text-xs font-bold text-stone-500">
                총 {discoverySpots.length}곳
              </div>
            </div>

            {/* Grid container: Multi-column on web, single column on mobile */}
            <div className={`grid gap-6 ${isWebMode ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 space-y-4'}`}>
              {discoverySpots.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => onSelectSpot(spot)}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden cursor-pointer hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Card Photo with Transit Badge & Score Stamp */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={spot.images[0]}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

                      {/* Score Stamp Top-Right */}
                      <div className="absolute top-2.5 right-2.5 w-11 h-11 rounded-xl bg-white/95 backdrop-blur-sm text-stone-900 flex flex-col items-center justify-center shadow-md border border-stone-100">
                        <span className="text-[15px] font-black text-rose-500 leading-none">
                          {spot.hiddenScore}
                        </span>
                        <span className="text-[7px] font-black tracking-widest text-stone-400 uppercase leading-none mt-0.5">
                          SCORE
                        </span>
                      </div>

                      {/* Transit Badge Bottom-Left */}
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-sm text-white text-[11px] font-medium max-w-[80%] truncate">
                        <Navigation className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{spot.transitTip}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2">
                      <div className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                        <span className="text-rose-600 font-bold">{spot.region}</span>
                        <span>•</span>
                        <span>{spot.category}</span>
                      </div>

                      <h4 className="text-base font-extrabold text-stone-900 group-hover:text-rose-600 transition-colors">
                        {spot.name}
                      </h4>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {spot.shortDesc}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {spot.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Crowd Status & "가봤어요" button */}
                  <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>{spot.crowdDensity}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => onToggleSave(spot.id, e)}
                        className="p-1 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title={spot.isSaved ? '보관 취소' : '보관하기'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            spot.isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                          }`}
                        />
                      </button>

                      <button
                        onClick={(e) => onToggleVisited(spot.id, e)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          spot.isVisited
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${spot.isVisited ? 'text-emerald-600' : 'text-stone-400'}`} />
                        <span>
                          {spot.isVisited
                            ? spot.myReview
                              ? `★ ${spot.myReview.rating}.0`
                              : '다녀옴'
                            : '가봤어요'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
