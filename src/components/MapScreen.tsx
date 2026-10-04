import React, { useState } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCw,
  Crosshair,
  Layers,
  Navigation,
  Bookmark,
  Check,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Spot } from '../types';

interface MapScreenProps {
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
  onToggleSave: (spotId: string, e: React.MouseEvent) => void;
  onToggleVisited: (spotId: string, e: React.MouseEvent) => void;
  onOpenVisitedManager: () => void;
  isWebMode?: boolean;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  spots,
  onSelectSpot,
  onToggleSave,
  onToggleVisited,
  onOpenVisitedManager,
  isWebMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpotId, setSelectedSpotId] = useState<string>('spot-1');
  const [activeRegion, setActiveRegion] = useState<string>('전체');
  const [minScoreFilter, setMinScoreFilter] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Filter spots for map
  const mapSpots = spots.filter((spot) => {
    if (spot.isVisited) return false;
    if (minScoreFilter && spot.hiddenScore < 80) return false;
    if (activeRegion !== '전체') {
      if (!spot.region.includes(activeRegion) && !spot.district.includes(activeRegion)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        spot.name.toLowerCase().includes(q) ||
        spot.district.toLowerCase().includes(q) ||
        spot.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedSpot =
    spots.find((s) => s.id === selectedSpotId) || mapSpots[0] || spots[0];

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  // Render Map Canvas Element
  const renderMapCanvas = (isWide: boolean) => (
    <div className="w-full h-full relative overflow-hidden bg-[#d9ecfa] rounded-2xl select-none">
      {/* SVG Coastline & Sea Gradients */}
      <svg
        className="w-full h-full absolute inset-0 select-none pointer-events-none"
        viewBox="0 0 400 650"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="sea-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#cae4f7" strokeWidth="0.8" />
          </pattern>
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

        <text x="280" y="390" fill="#60a5fa" fontSize="9" fontWeight="bold">
          부산항대교
        </text>
        <text x="180" y="550" fill="#9ca3af" fontSize="11" fontWeight="bold" opacity="0.6">
          영도구 (봉래산)
        </text>
        <text x="170" y="240" fill="#9ca3af" fontSize="11" fontWeight="bold" opacity="0.6">
          서면 · 전포동
        </text>
      </svg>

      {/* Radar Pulse / Scan Effect around active selected spot */}
      {selectedSpot && (
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
          <div className="w-40 h-40 rounded-full bg-white/40 border-2 border-rose-300/60 animate-ping" />
          <div className="absolute inset-0 m-auto w-28 h-28 rounded-full bg-rose-400/15 border border-rose-400/30" />
        </div>
      )}

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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap shadow-lg transition-transform ${
                isSelected
                  ? 'bg-rose-600 text-white scale-110 ring-4 ring-rose-500/30 ring-offset-2'
                  : 'bg-white text-stone-900 hover:scale-105 border border-stone-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSelected ? 'bg-white' : spot.hiddenScore >= 90 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
              <span>{spot.hiddenScore}점</span>
              <span className="font-semibold text-[11px]">{spot.name.split(' ')[0]}</span>
            </div>

            {/* Pin Pointer Stem */}
            <div className="w-0.5 h-3 bg-stone-800/70 mx-auto" />
          </div>
        );
      })}

      {/* Floating Map Actions */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 z-20">
        <button
          onClick={handleRescan}
          className="w-10 h-10 rounded-xl bg-white/95 text-stone-700 hover:text-stone-950 shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-105"
          title="내 위치 재검색"
        >
          <Crosshair className="w-4 h-4 text-sky-600" />
        </button>
        <button
          onClick={handleRescan}
          className="w-10 h-10 rounded-xl bg-white/95 text-stone-700 hover:text-stone-950 shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-105"
          title="새로고침"
        >
          <RotateCw className={`w-4 h-4 text-rose-500 ${isScanning ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Floating Center Badge in Map */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border border-stone-200/80 text-xs font-bold text-stone-700">
        <span className="text-rose-500 mr-1.5">●</span>
        <span>부산 로컬 히든 맵</span>
        <span className="text-stone-400 font-normal ml-1">({mapSpots.length}곳 표시 중)</span>
      </div>

      {/* Floating Preview Card on wide map */}
      {isWide && selectedSpot && (
        <div className="absolute bottom-6 left-6 right-6 max-w-lg bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 p-4 z-20 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <img
              src={selectedSpot.images[0]}
              alt={selectedSpot.name}
              className="w-16 h-16 rounded-xl object-cover shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {selectedSpot.hiddenScore}점
                </span>
                <span className="text-xs text-stone-400 font-medium">{selectedSpot.district}</span>
              </div>
              <h4 className="text-sm font-black text-stone-900 mt-0.5">{selectedSpot.name}</h4>
              <p className="text-[11px] text-stone-500 truncate max-w-xs">{selectedSpot.address}</p>
            </div>
          </div>

          <button
            onClick={() => onSelectSpot(selectedSpot)}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer shadow-xs"
          >
            상세보기
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`flex-1 select-none ${isWebMode ? 'space-y-6 pb-16' : 'relative flex flex-col overflow-hidden h-full'}`}>
      {/* ======================================================== */}
      {/* WEB DESKTOP SPLIT LAYOUT                                 */}
      {/* ======================================================== */}
      {isWebMode ? (
        <div className="space-y-6">
          {/* Header on Web */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                로컬 히든 맵 탐험
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                지도 위 핀을 클릭하여 주변 환경과 골목 히든 스팟을 한눈에 살펴보세요.
              </p>
            </div>

            {/* Already Visited Excluded Notice */}
            <div
              onClick={onOpenVisitedManager}
              className="bg-amber-50 border border-amber-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-amber-100/70 transition-colors shadow-xs"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-amber-900 font-medium">
                이미 가본 <strong className="text-stone-900 font-bold">18곳</strong>은 지도에서 제외 중
              </span>
              <span className="text-xs text-amber-800 font-bold underline ml-1">관리</span>
            </div>
          </div>

          {/* Desktop Split View: Left List (380px) + Right Map (flex-1) */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-4 flex flex-col lg:flex-row gap-4 h-[750px] overflow-hidden">
            {/* Left Column: Filter & Spots List */}
            <div className="w-full lg:w-[400px] flex flex-col shrink-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-100 pr-0 lg:pr-4">
              {/* Search & Region Filters */}
              <div className="space-y-2 pb-3 border-b border-stone-100 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="동네 또는 스팟 이름 검색..."
                    className="w-full pl-9 pr-8 py-2 bg-stone-100 rounded-xl text-xs text-stone-900 focus:outline-none focus:bg-white border border-transparent focus:border-stone-300"
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

                {/* Region Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {['전체', '영도구', '전포·서면', '망미동', '동구·초량'].map((reg) => (
                    <button
                      key={reg}
                      onClick={() => setActiveRegion(reg)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeRegion === reg
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Spots List */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
                {mapSpots.map((spot) => {
                  const isSelected = spot.id === selectedSpotId;
                  return (
                    <div
                      key={spot.id}
                      onClick={() => setSelectedSpotId(spot.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                        isSelected
                          ? 'bg-rose-50/70 border-rose-300 shadow-sm ring-1 ring-rose-200'
                          : 'bg-stone-50/60 hover:bg-stone-100 border-stone-200/70'
                      }`}
                    >
                      <img
                        src={spot.images[0]}
                        alt={spot.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-xs"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-rose-600 truncate">
                              {spot.region} · {spot.category}
                            </span>
                            <span className="px-1.5 py-0.2 rounded-md bg-stone-900 text-white text-[10px] font-bold">
                              {spot.hiddenScore}점
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-stone-900 truncate mt-0.5">
                            {spot.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            {spot.shortDesc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 text-[11px]">
                          <span className="text-stone-400 truncate">{spot.district}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSpot(spot);
                            }}
                            className="text-rose-600 font-bold hover:underline"
                          >
                            상세보기 →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Large Interactive Map Canvas */}
            <div className="flex-1 h-full min-h-[300px]">
              {renderMapCanvas(true)}
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* MOBILE VIEW WITH OVERLAY SEARCH & BOTTOM SHEET          */
        /* ======================================================== */
        <>
          {/* Top Floating Controls */}
          <div className="absolute top-2 left-3 right-3 z-20 space-y-2">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-stone-100 flex items-center px-3.5 py-2.5 gap-2">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-xs font-semibold text-stone-800 bg-transparent focus:outline-none placeholder:text-stone-400"
                placeholder="동네 또는 테마 검색..."
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-stone-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Region Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {['전체', '영도구', '전포·서면', '망미동'].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setActiveRegion(reg)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-xs shrink-0 cursor-pointer ${
                    activeRegion === reg ? 'bg-stone-900 text-white' : 'bg-white/90 text-stone-700'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          {/* Map canvas */}
          <div className="flex-1 w-full h-full">
            {renderMapCanvas(false)}
          </div>

          {/* Bottom Sheet */}
          {selectedSpot && (
            <div className="bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-stone-100 p-4 space-y-3 z-30 shrink-0 max-h-[48%] overflow-y-auto">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                      히든 {selectedSpot.hiddenScore}점
                    </span>
                    <span className="text-stone-400 text-[11px]">{selectedSpot.district}</span>
                  </div>
                  <h3
                    onClick={() => onSelectSpot(selectedSpot)}
                    className="text-base font-black text-stone-900 leading-tight hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    {selectedSpot.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 truncate">{selectedSpot.address}</p>
                </div>
                <div
                  onClick={() => onSelectSpot(selectedSpot)}
                  className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-xs cursor-pointer"
                >
                  <img src={selectedSpot.images[0]} alt={selectedSpot.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => onToggleSave(selectedSpot.id, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${selectedSpot.isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                  <span>{selectedSpot.isSaved ? '보관됨' : '보관하기'}</span>
                </button>
                <button
                  onClick={() => onSelectSpot(selectedSpot)}
                  className="px-4 py-1.5 rounded-xl bg-stone-900 text-white font-bold"
                >
                  상세보기
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
