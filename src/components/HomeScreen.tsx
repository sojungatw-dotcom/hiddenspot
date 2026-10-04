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

  // 2. 단어 토큰 분리 비교 (예: '전포', '서면', '영도', '망미', '초량', '청사포', '기장', '송정')
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

  // Discovery spots for vertical list
  const discoverySpots = isAll
    ? visibleSpots.filter((s) => s.hiddenScore >= 80)
    : visibleSpots;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 pb-8 select-none">
      {/* Top Tagline & Headline */}
      <div className="space-y-1.5 pt-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>부산 N회차를 위한 숨은 스팟</span>
        </div>
        <h2 className="text-[20px] font-black tracking-tight text-stone-900 leading-[1.3]">
          다시 찾은 부산, 진짜 로컬을 발견해보세요
        </h2>
      </div>

      {/* Region Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        {regions.map((region) => {
          const isSelected = isRegionSelected(region);
          return (
            <button
              key={region}
              onClick={() => onSelectRegion(region)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              {region}
            </button>
          );
        })}
      </div>

      {/* Assistant Quick Banner */}
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

      {/* 결과가 없을 때: 정보 없음 화면 */}
      {visibleSpots.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs text-center space-y-4 my-3">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <MapPinOff className="w-8 h-8 stroke-[1.5]" />
          </div>

          <div className="space-y-1.5 max-w-xs mx-auto">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-bold">
              <span>검색 결과</span>
            </div>
            <h3 className="text-lg font-black text-stone-900 tracking-tight">
              정보 없음
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              선택하신 <strong className="text-stone-800 font-bold">'{selectedRegion}'</strong> 지역에는 아직 등록된 히든 스팟이 없습니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onSelectRegion('전체')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              전체 지역 히든 스팟 보기
            </button>
            <button
              onClick={onOpenAiGenerator}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/70 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{selectedRegion} 스팟 AI 추천받기</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 특정 지역 필터 선택 시 안내 헤더 */}
          {!isAll && (
            <div className="flex items-center justify-between px-1 -mb-2">
              <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{selectedRegion} 추천 히든 스팟</span>
                <span className="text-stone-400 font-medium text-[11px]">({visibleSpots.length}곳)</span>
              </div>
              <button
                onClick={() => onSelectRegion('전체')}
                className="text-[11px] text-stone-500 hover:text-stone-800 font-medium underline underline-offset-2 cursor-pointer"
              >
                전체 보기
              </button>
            </div>
          )}

          {/* FOR YOU · Hero Card */}
          {heroSpot && (
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
                  title={heroSpot.isSaved ? '저장 취소' : '보관함에 저장'}
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      heroSpot.isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-500'
                    }`}
                  />
                </button>
              </div>

              {/* Hero Image Container */}
              <div
                onClick={() => onSelectSpot(heroSpot)}
                className="relative h-56 rounded-2xl overflow-hidden cursor-pointer group shadow-sm"
              >
                <img
                  src={heroSpot.images[0]}
                  alt={heroSpot.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/90 backdrop-blur-sm text-white text-[11px] font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>{heroSpot.hiddenScore}점 {heroSpot.scoreLabel || '숨은 로컬 스팟'}</span>
                </div>

                {/* Bottom Content on Hero Image */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-medium text-stone-200 flex items-center gap-1">
                    <span>{heroSpot.district}</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-white mt-0.5">
                    {heroSpot.name}
                  </h3>
                </div>
              </div>

              {/* Recommendation Reason */}
              <div className="mt-3 bg-white/90 rounded-xl p-2.5 border border-amber-200/60 flex items-start gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-700 leading-snug">
                  <span className="font-bold text-rose-600">추천:</span> {heroSpot.matchReason || '아직 안 가본 곳이에요 · 로컬 감성과 잘 맞아요.'}
                </p>
              </div>

              {/* Tags */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {heroSpot.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white/80 text-stone-600 text-[10px] font-medium border border-stone-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 특정 지역 선택 시 스팟이 1개뿐인 경우 추가 스팟 발굴 안내 배너 */}
          {!isAll && visibleSpots.length === 1 && (
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 text-center space-y-2">
              <p className="text-xs text-stone-600">
                현재 <strong className="font-bold text-stone-900">{selectedRegion}</strong> 지역의 숨은 스팟 1곳이 등록되어 있습니다.
              </p>
              <button
                onClick={onOpenAiGenerator}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-rose-600 border border-rose-200/80 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>AI로 {selectedRegion} 추가 스팟 발굴하기</span>
              </button>
            </div>
          )}

          {/* 요즘 로컬들이 주목하는 스팟 (Horizontal Carousel) - 2개 이상일 때만 표시 */}
          {trendingSpots.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <h3 className="text-[15px] font-extrabold text-stone-900">
                    {isAll ? '요즘 로컬들이 주목하는 스팟' : `${selectedRegion} 인기 주목 스팟`}
                  </h3>
                </div>

                {/* 7일 / 30일 Toggle */}
                <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200/50 text-[11px] font-medium">
                  <button
                    onClick={() => setTrendDays(7)}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      trendDays === 7 ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500'
                    }`}
                  >
                    최근 7일
                  </button>
                  <button
                    onClick={() => setTrendDays(30)}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      trendDays === 30 ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-500'
                    }`}
                  >
                    최근 30일
                  </button>
                </div>
              </div>

              {/* Horizontal Carousel */}
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

                      {/* Rank Badge */}
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-stone-950/80 text-white font-bold text-xs flex items-center justify-center backdrop-blur-xs">
                        {index + 1}
                      </div>

                      {/* Trend Badge */}
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-sky-500/90 text-white text-[10px] font-bold shadow-xs">
                        {spot.recentTrend || '+38% 상승'}
                      </div>

                      {/* Score Pill */}
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-900/90 backdrop-blur text-white text-[11px] font-bold">
                        ◆ {spot.hiddenScore}점
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="text-[10px] text-stone-400 font-medium truncate">
                        {spot.district}
                      </div>
                      <h4 className="text-xs font-extrabold text-stone-900 truncate mt-0.5 group-hover:text-rose-600 transition-colors">
                        {spot.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {spot.shortDesc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 전체 또는 선택된 지역의 숨은 스팟 목록 (Vertical List) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-extrabold text-stone-900">
                  {isAll ? '여유롭게 머물기 좋은 스팟' : `${selectedRegion} 숨은 스팟 목록`}
                </h3>
                <p className="text-[11px] text-stone-400">
                  {isAll ? '관광객이 적고 분위기 좋은 숨은 공간' : `총 ${discoverySpots.length}곳의 로컬 공간`}
                </p>
              </div>
              <button
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                title="필터 옵션"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Spot List */}
            <div className="space-y-4">
              {discoverySpots.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => onSelectSpot(spot)}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                >
                  {/* Card Photo with Transit Badge & Score Pill */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={spot.images[0]}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent" />

                    {/* Score Circular Stamp Badge on Image Top-Right */}
                    <div className="absolute top-2.5 right-2.5 w-11 h-11 rounded-full bg-white/95 backdrop-blur-sm text-stone-900 flex flex-col items-center justify-center shadow-md border border-stone-100">
                      <span className="text-[15px] font-black text-rose-500 leading-none">
                        {spot.hiddenScore}
                      </span>
                      <span className="text-[7px] font-black tracking-widest text-stone-400 uppercase leading-none mt-0.5">
                        SCORE
                      </span>
                    </div>

                    {/* Transit Badge Bottom-Left */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-sm text-white text-[11px] font-medium">
                      <Navigation className="w-3 h-3 text-rose-400" />
                      <span>{spot.transitTip}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 space-y-1.5">
                    <div className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
                      <span className="text-rose-500 font-semibold">{spot.region}</span>
                      <span>•</span>
                      <span>{spot.category}</span>
                    </div>

                    <h4 className="text-[15px] font-bold text-stone-900 group-hover:text-rose-600 transition-colors">
                      {spot.name}
                    </h4>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {spot.shortDesc}
                    </p>

                    {/* Card Footer: Crowd Status & "가봤어요" button */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px]">
                        <Users className="w-3.5 h-3.5" />
                        <span>{spot.crowdDensity}</span>
                      </div>

                      <button
                        onClick={(e) => onToggleVisited(spot.id, e)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                          spot.isVisited
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/60'
                        }`}
                      >
                        <Check className={`w-3 h-3 ${spot.isVisited ? 'text-emerald-600' : 'text-stone-400'}`} />
                        <span>
                          {spot.isVisited
                            ? spot.myReview
                              ? `★ ${spot.myReview.rating}.0 다녀옴`
                              : '다녀온 곳'
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
