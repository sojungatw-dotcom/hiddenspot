import React, { useState } from 'react';
import { Settings, ChevronRight, Check, Map as MapIcon, Sliders, Edit3, Sparkles } from 'lucide-react';
import { UserProfile, Spot } from '../types';
import { EditProfileModal } from './EditProfileModal';

interface MyBusanScreenProps {
  user: UserProfile;
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
  onToggleVisited: (spotId: string, e: React.MouseEvent) => void;
  onOpenVisitedManager: () => void;
  onGoToMap: () => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const MyBusanScreen: React.FC<MyBusanScreenProps> = ({
  user,
  spots,
  onSelectSpot,
  onToggleVisited,
  onOpenVisitedManager,
  onGoToMap,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'visited'>('saved');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Saved spots
  const savedSpots = spots.filter((s) => s.isSaved && !s.isVisited);
  // Visited spots
  const visitedSpots = spots.filter((s) => s.isVisited);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 pb-20 select-none">
      {/* Profile Header Card */}
      <div className="bg-amber-50/80 border border-amber-200/70 rounded-3xl p-4 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              onClick={() => setIsEditProfileOpen(true)}
              className="relative cursor-pointer group"
              title="프로필 사진 수정"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs group-hover:ring-2 group-hover:ring-rose-400 transition-all"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold border border-white">
                ✓
              </div>
              <div className="absolute inset-0 bg-stone-900/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-stone-900">
                  {user.name} 님
                </h2>
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  LV.{user.level}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium mt-0.5">
                {user.levelTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="edit-profile-btn"
              onClick={() => setIsEditProfileOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-stone-700 hover:text-rose-600 border border-amber-200/60 flex items-center gap-1 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
              title="내 프로필 수정"
            >
              <Edit3 className="w-3.5 h-3.5 text-rose-500" />
              <span>프로필 수정</span>
            </button>

            <button
              onClick={onOpenVisitedManager}
              className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-stone-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              title="방문장소 필터 관리"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* User Bio */}
        {user.bio && (
          <div className="bg-white/80 rounded-2xl px-3.5 py-2 text-xs text-stone-700 leading-relaxed border border-amber-100/80 font-medium">
            "{user.bio}"
          </div>
        )}

        {/* Travel Style Badges */}
        {user.travelStyles && user.travelStyles.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {user.travelStyles.map((style, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-white text-stone-600 text-[10px] font-medium border border-amber-200/50 shadow-2xs"
              >
                #{style}
              </span>
            ))}
          </div>
        )}

        {/* 3 Metric Stat Grid */}
        <div className="grid grid-cols-3 gap-2 bg-white/95 rounded-2xl p-2.5 border border-amber-100 shadow-xs text-center">
          <div>
            <div className="text-[10px] text-stone-400 font-medium">발견한 스팟</div>
            <div className="text-sm font-black text-stone-800 mt-0.5">
              {user.discoveredCount}곳
            </div>
          </div>
          <div className="border-x border-stone-100">
            <div className="text-[10px] text-stone-400 font-medium">저장된 보관함</div>
            <div className="text-sm font-black text-rose-500 mt-0.5">
              {user.savedCount}곳
            </div>
          </div>
          <div>
            <div className="text-[10px] text-stone-400 font-medium">제외된 기방문</div>
            <div className="text-sm font-black text-teal-600 mt-0.5">
              {user.excludedVisitedCount}곳
            </div>
          </div>
        </div>
      </div>

      {/* 나의 부산 탐험도 Card */}
      <div className="bg-white rounded-3xl p-4 border border-stone-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🌊</span>
            <h3 className="text-sm font-black text-stone-900">나의 부산 탐험도</h3>
          </div>
          <span className="text-[11px] font-bold text-rose-500">
            {user.discoveredCount}곳 발견 완료 / {user.savedCount}곳 저장
          </span>
        </div>

        <p className="text-[11px] text-stone-400 leading-tight">
          남들이 안 가는 숨은 골목을 걸을수록 탐험 지수가 올라갑니다.
        </p>

        {/* Regional Progress Bars */}
        <div className="space-y-2.5 pt-1">
          {user.regionExploration.map((region) => (
            <div key={region.region} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: region.color }}
                  />
                  <span className="font-bold text-stone-800">{region.region}</span>
                </div>
                <div className="flex items-center gap-1 text-stone-500 font-semibold text-[10px]">
                  <span>{region.title}</span>
                  <span className="text-stone-900 font-bold">{region.percentage}%</span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${region.percentage}%`,
                    backgroundColor: region.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 내가 가본 부산 명소 관리 Banner */}
      <div
        onClick={onOpenVisitedManager}
        className="bg-sky-50/70 border border-sky-200/60 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-sky-100/60 transition-colors shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <Check className="w-4 h-4 stroke-[2.5px]" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-900">
              내가 가본 부산 명소 관리
            </div>
            <div className="text-[11px] text-stone-500">
              이미 다녀온 {user.excludedVisitedCount}곳 추천에서 제외 중
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-sky-600 text-xs font-bold">
          <span>설정</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Tabs: 가보고 싶은 곳 (저장 24) vs 내가 다녀온 부산 (방문 18) */}
      <div className="space-y-3">
        <div className="flex items-center bg-stone-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            가보고 싶은 곳 (저장 {savedSpots.length})
          </button>
          <button
            onClick={() => setActiveTab('visited')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'visited'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            내가 다녀온 부산 (방문 {visitedSpots.length})
          </button>
        </div>

        {/* Spot Cards */}
        <div className="space-y-3">
          {(activeTab === 'saved' ? savedSpots : visitedSpots).map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden p-3 space-y-2.5 hover:shadow-md transition-all"
            >
              {/* Image & Trend Header */}
              <div
                onClick={() => onSelectSpot(spot)}
                className="relative h-40 rounded-xl overflow-hidden cursor-pointer group"
              >
                <img
                  src={spot.images[0]}
                  alt={spot.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

                {/* Badges on Image */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-sky-500/90 text-white text-[10px] font-bold">
                  {spot.recentTrend || '로컬 4회차 이상 추천'}
                </div>

                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/95 text-rose-500 text-[11px] font-black shadow-xs">
                  히든 {spot.hiddenScore}점
                </div>

                <div className="absolute bottom-2 left-2.5 text-stone-200 text-xs font-medium">
                  {spot.district}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-1">
                <h4
                  onClick={() => onSelectSpot(spot)}
                  className="text-sm font-extrabold text-stone-900 cursor-pointer hover:text-rose-600 transition-colors"
                >
                  {spot.name}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-1">
                  {spot.shortDesc}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {spot.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-stone-50 text-stone-600 text-[10px] font-medium border border-stone-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Card Footer: Action Button & Map Shortcut */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => onToggleVisited(spot.id, e)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    spot.isVisited
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/60'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{spot.isVisited ? '다녀온 곳' : '다녀왔어요'}</span>
                </button>

                <button
                  onClick={onGoToMap}
                  className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                  title="지도에서 보기"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {(activeTab === 'saved' ? savedSpots : visitedSpots).length === 0 && (
            <div className="text-center py-10 text-stone-400 text-xs">
              {activeTab === 'saved'
                ? '아직 저장된 스팟이 없습니다. 홈 또는 발견에서 마음에 드는 곳을 저장해보세요!'
                : '아직 다녀온 스팟으로 체크된 곳이 없습니다.'}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <EditProfileModal
          user={user}
          onSave={(updated) => {
            if (onUpdateProfile) {
              onUpdateProfile(updated);
            }
          }}
          onClose={() => setIsEditProfileOpen(false)}
        />
      )}
    </div>
  );
};
