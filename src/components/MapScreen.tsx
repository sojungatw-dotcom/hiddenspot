import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown, RotateCw, Crosshair, Layers, Navigation, Bookmark, Check } from 'lucide-react';
import { Spot } from '../types';

interface MapScreenProps {
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
  onToggleSave: (spotId: string, e: React.MouseEvent) => void;
  onToggleVisited: (spotId: string, e: React.MouseEvent) => void;
  onOpenVisitedManager: () => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  spots,
  onSelectSpot,
  onToggleSave,
  onToggleVisited,
  onOpenVisitedManager,
}) => {
  const [searchQuery, setSearchQuery] = useState('영도구 흰여울마을 주변');
  const [selectedSpotId, setSelectedSpotId] = useState<string>('spot-1');
  const [activeRegion, setActiveRegion] = useState<string>('영도구');
  const [minScoreFilter, setMinScoreFilter] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Filter spots for map
  const mapSpots = spots.filter((spot) => {
    if (spot.isVisited) return false;
    if (minScoreFilter && spot.hiddenScore < 80) return false;
    return true;
  });

  const selectedSpot = spots.find((s) => s.id === selectedSpotId) || mapSpots[0] || spots[0];

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="flex-1 relative flex flex-col overflow-hidden select-none bg-sky-50">
      {/* Top Floating Controls Container */}
      <div className="absolute top-2 left-3 right-3 z-20 space-y-2">
        {/* Search Input */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-stone-100 flex items-center px-3.5 py-2.5 gap-2">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            id="map-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-xs font-semibold text-stone-800 bg-transparent focus:outline-none placeholder:text-stone-400"
            placeholder="동네 또는 테마 검색..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="w-px h-4 bg-stone-200 mx-0.5" />
          <button
            className="text-stone-500 hover:text-stone-800 cursor-pointer"
            title="필터"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Region & Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveRegion(activeRegion === '영도구' ? '전체' : '영도구')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-stone-900 text-white text-[11px] font-bold shadow-xs shrink-0 cursor-pointer"
          >
            <span>영도구</span>
            <ChevronDown className="w-3 h-3 text-stone-300" />
          </button>

          <button
            onClick={() => setActiveRegion('전포·서면')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 cursor-pointer ${
              activeRegion === '전포·서면'
                ? 'bg-stone-900 text-white font-bold'
                : 'bg-white/90 text-stone-700 hover:bg-white shadow-xs'
            }`}
          >
            전포·서면
          </button>

          <button
            onClick={() => setActiveRegion('망미동')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 cursor-pointer ${
              activeRegion === '망미동'
                ? 'bg-stone-900 text-white font-bold'
                : 'bg-white/90 text-stone-700 hover:bg-white shadow-xs'
            }`}
          >
            망미동
          </button>

          <button
            onClick={() => setMinScoreFilter(!minScoreFilter)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs shrink-0 cursor-pointer transition-colors ${
              minScoreFilter
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-stone-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>히든 스코어 80+</span>
          </button>
        </div>

        {/* Excluded Visited Notice Banner */}
        <div
          onClick={onOpenVisitedManager}
          className="bg-amber-50/90 backdrop-blur-xs border border-amber-200/70 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] text-amber-900 shadow-xs cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
            <span>가본 곳 <strong className="font-extrabold text-stone-900">18곳</strong>은 지도에서 제외 중</span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 underline shrink-0 ml-2">
            관리
          </span>
        </div>
      </div>

      {/* Stylized Busan Interactive Vector Map */}
      <div className="w-full h-full relative overflow-hidden bg-[#d9ecfa]">
        {/* SVG Coastline & Sea Gradients */}
        <svg
          className="w-full h-full absolute inset-0 select-none pointer-events-none"
          viewBox="0 0 400 650"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Subtle Grid Water Pattern */}
          <defs>
            <pattern id="sea-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#cae4f7" strokeWidth="0.8" />
            </pattern>
            <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="100%" height="100%" fill="url(#sea-grid)" />

          {/* Mainland Busan Landmass (Top/Center) */}
          <path
            d="M -20 -20 L 420 -20 L 420 380 Q 360 360 300 400 T 220 370 Q 150 360 100 420 Q 40 440 -20 400 Z"
            fill="#f7faf7"
            stroke="#d8e8d8"
            strokeWidth="2"
          />

          {/* Yeongdo Island Landmass (South) */}
          <path
            d="M 120 460 Q 180 430 260 450 Q 300 510 270 580 Q 210 630 140 590 Q 90 530 120 460 Z"
            fill="#ffffff"
            stroke="#d5e8dc"
            strokeWidth="3"
            filter="drop-shadow(0 2px 8px rgba(0,0,0,0.06))"
          />

          {/* Busan Harbor Bridge (Busanhangdaegyo) Curved Dashed Line */}
          <path
            d="M 240 450 Q 310 420 360 360"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />

          {/* Namhang Bridge (Namhangdaegyo) Dashed Line */}
          <path
            d="M 125 530 Q 80 520 40 510"
            fill="none"
            stroke="#f87171"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Coastal Text Labels */}
          <text x="50" y="470" fill="#94a3b8" fontSize="10" fontWeight="600">
            송도 해상둘레
          </text>
          <text x="130" y="560" fill="#64748b" fontSize="10" fontWeight="700">
            흰여울 해안절벽
          </text>
          <text x="250" y="320" fill="#94a3b8" fontSize="9" fontWeight="600">
            서면·전포 사잇길
          </text>
        </svg>

        {/* Radar Pulse / Scan Effect around active selected spot */}
        <div
          className={`absolute pointer-events-none transition-all duration-700 ${
            isScanning ? 'scale-125 opacity-100' : 'opacity-80'
          }`}
          style={{
            left: `${selectedSpot.mapPosition.x}%`,
            top: `${selectedSpot.mapPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-48 h-48 rounded-full bg-white/40 border-2 border-rose-300/60 animate-ping" />
          <div className="absolute inset-0 m-auto w-36 h-36 rounded-full bg-rose-400/10 border border-rose-400/30" />
        </div>

        {/* Map Interactive Pins */}
        {mapSpots.map((spot) => {
          const isSelected = spot.id === selectedSpotId;

          return (
            <div
              key={spot.id}
              onClick={() => setSelectedSpotId(spot.id)}
              className="absolute z-10 -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-300"
              style={{
                left: `${spot.mapPosition.x}%`,
                top: `${spot.mapPosition.y}%`,
              }}
            >
              {/* Custom Pin Label */}
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold whitespace-nowrap shadow-lg transition-transform ${
                  isSelected
                    ? 'bg-rose-500 text-white scale-110 ring-4 ring-rose-500/30 ring-offset-2'
                    : spot.hiddenScore >= 90
                    ? 'bg-white text-stone-900 hover:scale-105 border border-rose-200'
                    : 'bg-white/95 text-stone-800 hover:scale-105 border border-stone-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-white' : spot.hiddenScore >= 90 ? 'bg-rose-500' : 'bg-sky-500'
                  }`}
                />
                <span>
                  {spot.hiddenScore}점 {spot.name.split(' ')[0]}
                </span>
                {spot.recentTrend?.includes('+') && (
                  <span className="text-[10px] text-sky-300 font-semibold">
                    ▲
                  </span>
                )}
              </div>

              {/* Pin Pointer Stem */}
              <div className="w-0.5 h-2.5 bg-stone-700/60 mx-auto" />
            </div>
          );
        })}

        {/* Grayed out Pin: 이미 가본 곳 (예: 신기산업 본점) */}
        <div
          className="absolute z-0 -translate-x-1/2 -translate-y-full opacity-60 pointer-events-none"
          style={{ left: '48%', top: '48%' }}
        >
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-200/90 text-stone-500 text-[10px] font-medium border border-stone-300">
            <span>✓ 신기산업 본점</span>
          </div>
        </div>

        {/* Floating Map Actions (Re-search & Target & Layers) */}
        <div className="absolute right-3 top-36 flex flex-col gap-2 z-20">
          <button
            id="map-locate-btn"
            onClick={handleRescan}
            className="w-10 h-10 rounded-2xl bg-white/95 text-stone-700 hover:text-stone-950 shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-105"
            title="내 위치 중심"
          >
            <Crosshair className="w-4 h-4 text-sky-600" />
          </button>
          <button
            id="map-layers-btn"
            className="w-10 h-10 rounded-2xl bg-white/95 text-stone-700 hover:text-stone-950 shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-105"
            title="지도 레이어"
          >
            <Layers className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        {/* Center Re-search Floating Button */}
        <div className="absolute left-1/2 -translate-x-1/2 top-36 z-20">
          <button
            id="map-rescan-btn"
            onClick={handleRescan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-stone-800 text-[11px] font-bold shadow-md hover:bg-white active:scale-95 transition-all border border-stone-200 cursor-pointer"
          >
            <RotateCw className={`w-3 h-3 text-rose-500 ${isScanning ? 'animate-spin' : ''}`} />
            <span>이 지역 재검색</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet Selected Spot Card (Image 5 style) */}
      {selectedSpot && (
        <div className="bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-stone-100 p-4 space-y-3 z-30 shrink-0 max-h-[48%] overflow-y-auto">
          {/* Header row: Badge, Trend, Address */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  히든 {selectedSpot.hiddenScore}점
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200 text-[10px] font-bold">
                  {selectedSpot.recentTrend || '▲ 30일 저장 2.4배'}
                </span>
                <span className="text-stone-400 text-[11px] font-medium">
                  {selectedSpot.district}
                </span>
              </div>

              <h3
                onClick={() => onSelectSpot(selectedSpot)}
                className="text-base font-black text-stone-900 leading-tight hover:text-rose-600 transition-colors cursor-pointer"
              >
                {selectedSpot.name}
              </h3>

              <p className="text-[11px] text-stone-500 truncate">
                {selectedSpot.address} · {selectedSpot.category}
              </p>
            </div>

            {/* Thumbnail Image */}
            <div
              onClick={() => onSelectSpot(selectedSpot)}
              className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-xs cursor-pointer group"
            >
              <img
                src={selectedSpot.images[0]}
                alt={selectedSpot.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          </div>

          {/* Spot Recommendation Reason Box */}
          <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200/60 text-stone-800 text-xs flex items-start gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
            <p className="text-[11px] leading-snug">
              {selectedSpot.matchReason || `내 취향과 ${selectedSpot.matchRate}% 잘 맞는 곳이에요.`}
            </p>
          </div>

          {/* 3 Metric Badges: 외지인 밀도, 현지 재방문, 현재 여유도 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-stone-50 rounded-xl p-2 text-center border border-stone-100">
              <div className="text-[10px] text-stone-400 font-medium">외지인 밀도</div>
              <div className="text-xs font-black text-emerald-600 mt-0.5">
                {selectedSpot.touristRatio}
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-2 text-center border border-stone-100">
              <div className="text-[10px] text-stone-400 font-medium">현지 재방문</div>
              <div className="text-xs font-black text-stone-900 mt-0.5">
                {selectedSpot.localRevisitScore}점
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-2 text-center border border-stone-100">
              <div className="text-[10px] text-stone-400 font-medium">현재 여유도</div>
              <div className="text-xs font-black text-sky-600 mt-0.5">
                {selectedSpot.currentSeatsOrTeams || '보통 (6팀)'}
              </div>
            </div>
          </div>

          {/* Bottom 3 Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={(e) => onToggleVisited(selectedSpot.id, e)}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                selectedSpot.isVisited
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border-stone-200/60'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${selectedSpot.isVisited ? 'text-emerald-600' : 'text-stone-500'}`} />
              <span>
                {selectedSpot.isVisited
                  ? selectedSpot.myReview
                    ? `★ ${selectedSpot.myReview.rating}.0 다녀옴`
                    : '다녀온 곳'
                  : '가봤어요'}
              </span>
            </button>

            <button
              onClick={() => onSelectSpot(selectedSpot)}
              className="py-2.5 px-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-sky-200"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>길찾기 안내</span>
            </button>

            <button
              onClick={() => onSelectSpot(selectedSpot)}
              className="py-2.5 px-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-98 text-white text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-rose-500/20"
            >
              <Bookmark className="w-3.5 h-3.5 fill-white" />
              <span>상세보기 & 저장</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
