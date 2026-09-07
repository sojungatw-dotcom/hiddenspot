import React, { useState } from 'react';
import { Bookmark, Sparkles, TrendingUp, SlidersHorizontal, Check, Users, Navigation } from 'lucide-react';
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
  const regions = ['전체', '영도구', '전포·서면', '망미동', '기장·송정', '동구·초량'];

  // Filter spots by region and visited state
  const visibleSpots = spots.filter(
    (s) => !s.isVisited && (selectedRegion === '전체' || s.region.includes(selectedRegion.replace('·', '')))
  );

  // Pick top hero spot
  const heroSpot = visibleSpots.find((s) => s.id === 'spot-1') || visibleSpots[0] || spots[0];

  // Trending spots for horizontal carousel
  const trendingSpots = spots
    .filter((s) => !s.isVisited)
    .sort((a, b) => b.scoreBreakdown.growth - a.scoreBreakdown.growth);

  // Discovery spots with hidden score >= 80
  const discoverySpots = visibleSpots.filter((s) => s.hiddenScore >= 80);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 pb-8 select-none">
      {/* Top Tagline & Headline */}
      <div className="space-y-1.5 pt-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>N차 방문자를 위한 부산 히든 스팟</span>
        </div>
        <h2 className="text-[20px] font-black tracking-tight text-stone-900 leading-[1.3]">
          다시 찾은 부산, 가보지 않은 진짜 로컬을 발견해보세요
        </h2>
      </div>

      {/* Region Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        {regions.map((region) => {
          const isSelected = selectedRegion === region;
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

      {/* AI Assistant Quick Banner */}
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
              AI에게 지금 내 취향으로 히든 스팟 발굴 요청하기
            </div>
            <div className="text-[11px] text-stone-500">
              내가 가본 18곳 제외 & 감성 키워드 1:1 맞춤 계산
            </div>
          </div>
        </div>
        <span className="text-[11px] font-bold text-rose-600 group-hover:translate-x-0.5 transition-transform">
          발굴 →
        </span>
      </div>

      {/* FOR YOU · 미방문 큐레이션 Hero Card */}
      {heroSpot && (
        <div className="bg-amber-50/60 rounded-3xl p-3 border border-amber-100/70 shadow-xs">
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <span>FOR YOU</span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-600">미방문 큐레이션</span>
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
              <span>{heroSpot.hiddenScore}점 {heroSpot.scoreLabel || '발견하기 좋은 숨은 스팟'}</span>
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

          {/* Yellow Box: AI Recommendation Reason */}
          <div className="mt-3 bg-white/90 rounded-xl p-2.5 border border-amber-200/60 flex items-start gap-2 shadow-xs">
            <Sparkles className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-stone-700 leading-snug">
              <span className="font-bold text-rose-600">추천 이유:</span> 아직 방문하지 않은 장소예요 · 저장하신{' '}
              <span className="font-semibold text-stone-900 bg-amber-100/70 px-1 py-0.5 rounded">'조용한 공간/바다 전망'</span>{' '}
              취향과 <span className="font-extrabold text-stone-900">{heroSpot.matchRate}%</span> 일치해요.
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

      {/* 지금 관심이 급상승 중인 스팟 (Horizontal Carousel) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <h3 className="text-[15px] font-extrabold text-stone-900">
              지금 관심이 급상승 중인 스팟
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

      {/* 오늘의 발견 가치 추천 (Vertical List) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-extrabold text-stone-900">
              오늘의 발견 가치 추천
            </h3>
            <p className="text-[11px] text-stone-400">
              히든 스코어 80점 이상 & 관광객 밀집도 최저 스팟
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
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-[11px] font-medium transition-colors cursor-pointer border border-stone-200/60"
                  >
                    <Check className="w-3 h-3 text-stone-400" />
                    <span>가봤어요</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
