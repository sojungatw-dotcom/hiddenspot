import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Bookmark, Map as MapIcon, ChevronRight, Check } from 'lucide-react';
import { Spot } from '../types';

interface DiscoverScreenProps {
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
  onToggleSave: (spotId: string, e: React.MouseEvent) => void;
  onToggleVisited: (spotId: string, e: React.MouseEvent) => void;
  onOpenVisitedManager: () => void;
  onGoToMap: () => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  spots,
  onSelectSpot,
  onToggleSave,
  onToggleVisited,
  onOpenVisitedManager,
  onGoToMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'score' | 'distance'>('trending');
  const [activeRegionFilter, setActiveRegionFilter] = useState<string | null>('영도/전포');
  const [minScoreFilter, setMinScoreFilter] = useState<number | null>(75);

  // Filter spots based on search query, region, score, and visited status
  const filteredSpots = spots.filter((spot) => {
    if (spot.isVisited) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        spot.name.toLowerCase().includes(q) ||
        spot.category.toLowerCase().includes(q) ||
        spot.district.toLowerCase().includes(q) ||
        spot.shortDesc.toLowerCase().includes(q) ||
        spot.tags.some((t) => t.toLowerCase().includes(q));
      if (!matches) return false;
    }

    if (activeRegionFilter === '영도/전포') {
      const match = spot.region.includes('영도') || spot.region.includes('전포');
      if (!match) return false;
    }

    if (minScoreFilter && spot.hiddenScore < minScoreFilter) {
      return false;
    }

    return true;
  });

  // Sort
  const sortedSpots = [...filteredSpots].sort((a, b) => {
    if (sortBy === 'trending') {
      return b.scoreBreakdown.growth - a.scoreBreakdown.growth;
    }
    if (sortBy === 'score') {
      return b.hiddenScore - a.hiddenScore;
    }
    // distance mock
    return a.crowdPercent - b.crowdPercent;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20 select-none relative">
      {/* Search Bar with Filter Icon */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="discover-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="부산의 숨은 골목, 로컬 카페, 책방 검색..."
            className="w-full pl-9 pr-8 py-2.5 bg-stone-100/90 rounded-2xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200/80 flex items-center justify-center text-stone-600 transition-colors cursor-pointer shrink-0"
          title="필터 설정"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Active Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {activeRegionFilter && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900 text-white text-[11px] font-semibold shrink-0">
            <span>지역: {activeRegionFilter}</span>
            <button
              onClick={() => setActiveRegionFilter(null)}
              className="hover:text-rose-400 ml-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {minScoreFilter && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900 text-white text-[11px] font-semibold shrink-0">
            <span>최소 Hidden Score: {minScoreFilter}점+</span>
            <button
              onClick={() => setMinScoreFilter(null)}
              className="hover:text-rose-400 ml-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <button
          onClick={() => {
            if (!activeRegionFilter && !minScoreFilter) {
              setActiveRegionFilter('영도/전포');
              setMinScoreFilter(75);
            } else {
              setActiveRegionFilter(null);
              setMinScoreFilter(null);
            }
          }}
          className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          title="필터 초기화 또는 토글"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sort Buttons & Count Bar */}
      <div className="flex items-center justify-between text-xs pt-1 border-b border-stone-100 pb-2.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSortBy('trending')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              sortBy === 'trending'
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            급상승순 ▲
          </button>
          <button
            onClick={() => setSortBy('score')}
            className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
              sortBy === 'score'
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Hidden Score 높은순
          </button>
          <button
            onClick={() => setSortBy('distance')}
            className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
              sortBy === 'distance'
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            거리 가까운순
          </button>
        </div>

        <span className="text-stone-400 font-medium text-[11px] shrink-0">
          총 {sortedSpots.length}곳
        </span>
      </div>

      {/* Notice Banner: 방문했던 명소 추천 제외 */}
      <div
        onClick={onOpenVisitedManager}
        className="bg-amber-50/80 border border-amber-200/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-amber-900 cursor-pointer hover:bg-amber-100/70 transition-colors shadow-xs"
      >
        <span className="text-[11px] font-medium truncate">
          방문했던 명소 <strong className="text-rose-600 font-bold">18곳</strong>은 추천에서 제외 중입니다
        </span>
        <span className="text-[11px] font-bold text-stone-700 flex items-center shrink-0 ml-2">
          방문 목록 관리 <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        </span>
      </div>

      {/* Spot Feed List */}
      <div className="space-y-4">
        {sortedSpots.map((spot) => (
          <div
            key={spot.id}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
          >
            {/* Image Header with Trend Badge & Score Stamp */}
            <div
              onClick={() => onSelectSpot(spot)}
              className="relative h-44 overflow-hidden cursor-pointer group"
            >
              <img
                src={spot.images[0]}
                alt={spot.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

              {/* Trend Pill Top-Left */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-sky-500/90 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                <span>{spot.recentTrend || '▲ 최근 30일 관심 +45%'}</span>
              </div>

              {/* Score Stamp Top-Right */}
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-black shadow-md flex items-center gap-1">
                <span>✦</span>
                <span>{spot.hiddenScore}점</span>
              </div>

              {/* District text on image bottom */}
              <div className="absolute bottom-2 left-3 text-stone-200 text-xs font-medium flex items-center gap-1">
                <MapIcon className="w-3 h-3 text-rose-400" />
                <span>{spot.district}</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3
                  onClick={() => onSelectSpot(spot)}
                  className="text-[15px] font-extrabold text-stone-900 leading-snug cursor-pointer hover:text-rose-600 transition-colors"
                >
                  {spot.name}
                </h3>
                <button
                  onClick={(e) => onToggleSave(spot.id, e)}
                  className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0 pt-0.5"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      spot.isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                    }`}
                  />
                </button>
              </div>

              {/* Trait Chips Box */}
              <div className="bg-stone-50 rounded-xl p-2 border border-stone-100 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
                <span className="font-bold text-rose-500">
                  ✦ {spot.tags[0] || '최근 저장 급증'}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-600 font-medium">
                  {spot.tags[1] || '방문 기록 0회'}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-600 font-medium">
                  {spot.tags[2] || '심야 감성 무드'}
                </span>
              </div>

              <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                {spot.shortDesc}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => onToggleVisited(spot.id, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-stone-500" />
                  <span>가봤어요 (추천 제외)</span>
                </button>

                <button
                  onClick={() => onSelectSpot(spot)}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                >
                  <span>상세 스토리</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Button: 지도 보기 (18개 스팟) */}
      <div className="sticky bottom-3 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <button
          onClick={onGoToMap}
          className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-extrabold shadow-xl hover:bg-stone-800 active:scale-95 transition-all cursor-pointer border border-stone-700/50"
        >
          <MapIcon className="w-4 h-4 text-rose-400" />
          <span>지도 보기 ({filteredSpots.length}개 스팟)</span>
        </button>
      </div>
    </div>
  );
};
