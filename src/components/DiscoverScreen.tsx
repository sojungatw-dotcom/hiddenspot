import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Bookmark,
  Map as MapIcon,
  ChevronRight,
  Check,
  Sparkles,
  Sliders,
  Filter,
} from 'lucide-react';
import { Spot } from '../types';

interface DiscoverScreenProps {
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
  onToggleSave: (spotId: string, e: React.MouseEvent) => void;
  onToggleVisited: (spotId: string, e: React.MouseEvent) => void;
  onOpenVisitedManager: () => void;
  onGoToMap: () => void;
  isWebMode?: boolean;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  spots,
  onSelectSpot,
  onToggleSave,
  onToggleVisited,
  onOpenVisitedManager,
  onGoToMap,
  isWebMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'score' | 'distance'>('trending');
  const [activeRegionFilter, setActiveRegionFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [minScoreFilter, setMinScoreFilter] = useState<number | null>(null);

  const categories = ['전체', '카페/디저트', '복합문화공간', '독립서점', '로컬바/펍', '산책/야경'];

  // Filter spots based on search query, region, score, category, and visited status
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

    if (activeRegionFilter) {
      const match =
        spot.region.includes(activeRegionFilter) ||
        spot.district.includes(activeRegionFilter);
      if (!match) return false;
    }

    if (selectedCategory !== '전체') {
      if (!spot.category.includes(selectedCategory)) {
        return false;
      }
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
    return a.crowdPercent - b.crowdPercent;
  });

  return (
    <div className={`flex-1 select-none relative ${isWebMode ? 'space-y-8 pb-16' : 'overflow-y-auto px-4 py-3 space-y-4 pb-20'}`}>
      {/* Top Header on Web */}
      {isWebMode && (
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>부산 로컬 스팟 전체 아카이브</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            취향별 히든 스팟 탐색
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            원하는 테마, 지역, 최소 Hidden Score를 설정하여 나만의 보석 같은 공간을 찾아보세요.
          </p>
        </div>
      )}

      {/* Search Bar & Toolbar */}
      <div className={`space-y-3 ${isWebMode ? 'bg-white p-5 rounded-2xl border border-stone-200 shadow-xs' : ''}`}>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="discover-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="부산의 숨은 골목, 로컬 카페, 책방, 펍 검색..."
              className="w-full pl-10 pr-8 py-3 bg-stone-100/90 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:bg-white transition-all font-medium border border-transparent focus:border-stone-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Quick Min Score 80+ Toggle */}
          <button
            onClick={() => setMinScoreFilter(minScoreFilter ? null : 80)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ml-auto border ${
              minScoreFilter
                ? 'bg-rose-50 text-rose-600 border-rose-300 font-black'
                : 'bg-stone-100 text-stone-600 border-transparent hover:bg-stone-200/80'
            }`}
          >
            ★ 80점 이상만
          </button>
        </div>
      </div>

      {/* Sort Buttons & Count Bar */}
      <div className="flex items-center justify-between text-xs pt-1 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy('trending')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
              sortBy === 'trending'
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:text-stone-900 bg-stone-100'
            }`}
          >
            인기순 ▲
          </button>
          <button
            onClick={() => setSortBy('score')}
            className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
              sortBy === 'score'
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-500 hover:text-stone-900 bg-stone-100'
            }`}
          >
            점수 높은순
          </button>
          <button
            onClick={() => setSortBy('distance')}
            className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
              sortBy === 'distance'
                ? 'bg-stone-900 text-white font-bold'
                : 'text-stone-500 hover:text-stone-900 bg-stone-100'
            }`}
          >
            한적함 순
          </button>
        </div>

        <span className="text-stone-500 font-bold text-xs shrink-0">
          총 {sortedSpots.length}곳 검색됨
        </span>
      </div>

      {/* Notice Banner: 방문했던 명소 추천 제외 */}
      <div
        onClick={onOpenVisitedManager}
        className="bg-amber-50/80 border border-amber-200/70 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-amber-900 cursor-pointer hover:bg-amber-100/70 transition-colors shadow-xs"
      >
        <span className="text-xs font-medium truncate">
          이미 가본 부산 관광지 <strong className="text-rose-600 font-bold">18곳</strong>은 추천에서 자동 제외 중입니다.
        </span>
        <span className="text-xs font-bold text-stone-800 flex items-center shrink-0 ml-2">
          가본 곳 목록 관리 <ChevronRight className="w-4 h-4 text-stone-400" />
        </span>
      </div>

      {/* Spot Feed Grid: Multi-column on Web, Vertical list on mobile */}
      <div className={`grid gap-6 ${isWebMode ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 space-y-4'}`}>
        {sortedSpots.map((spot) => (
          <div
            key={spot.id}
            className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Image Header with Trend Badge & Score Stamp */}
              <div
                onClick={() => onSelectSpot(spot)}
                className="relative h-48 overflow-hidden cursor-pointer group"
              >
                <img
                  src={spot.images[0]}
                  alt={spot.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

                {/* Trend Pill Top-Left */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-sky-500 text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                  <span>{spot.recentTrend || '▲ 관심 +45%'}</span>
                </div>

                {/* Score Stamp Top-Right */}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-black shadow-md flex items-center gap-1">
                  <span>✦</span>
                  <span>{spot.hiddenScore}점</span>
                </div>

                {/* District text on image bottom */}
                <div className="absolute bottom-2.5 left-3 text-stone-200 text-xs font-medium flex items-center gap-1">
                  <MapIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>{spot.district}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    onClick={() => onSelectSpot(spot)}
                    className="text-base font-extrabold text-stone-900 leading-snug cursor-pointer hover:text-rose-600 transition-colors"
                  >
                    {spot.name}
                  </h3>
                  <button
                    onClick={(e) => onToggleSave(spot.id, e)}
                    className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0 pt-0.5"
                    title={spot.isSaved ? '보관 취소' : '보관하기'}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        spot.isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Trait Chips Box */}
                <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-rose-600">
                    ✦ {spot.tags[0] || '최근 저장 급증'}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="text-stone-600 font-medium">
                    {spot.tags[1] || '로컬 감성'}
                  </span>
                </div>

                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {spot.shortDesc}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs">
              <button
                onClick={(e) => onToggleVisited(spot.id, e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                  spot.isVisited
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${spot.isVisited ? 'text-emerald-600' : 'text-stone-500'}`} />
                <span>
                  {spot.isVisited
                    ? spot.myReview
                      ? `★ ${spot.myReview.rating}.0 다녀옴`
                      : '다녀온 곳'
                    : '가봤어요'}
                </span>
              </button>

              <button
                onClick={() => onSelectSpot(spot)}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                <span>상세보기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
