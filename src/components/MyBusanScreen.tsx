import React, { useState } from 'react';
import {
  Settings,
  ChevronRight,
  Check,
  Map as MapIcon,
  Sliders,
  Edit3,
  Sparkles,
  LogOut,
  Database,
  UserCheck,
  Star,
  MessageSquare,
  Bookmark,
  Share2,
} from 'lucide-react';
import { UserProfile, Spot } from '../types';
import { EditProfileModal } from './EditProfileModal';
import { isSupabaseConfigured } from '../lib/supabase';

interface MyBusanScreenProps {
  user: UserProfile;
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
  onToggleVisited: (spotId: string, e: React.MouseEvent) => void;
  onOpenVisitedManager: () => void;
  onGoToMap: () => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  isWebMode?: boolean;
}

export const MyBusanScreen: React.FC<MyBusanScreenProps> = ({
  user,
  spots,
  onSelectSpot,
  onToggleVisited,
  onOpenVisitedManager,
  onGoToMap,
  onUpdateProfile,
  onOpenAuth,
  onLogout,
  isWebMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'visited'>('saved');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const supabaseConnected = isSupabaseConfigured();

  // Saved spots
  const savedSpots = spots.filter((s) => s.isSaved && !s.isVisited);
  // Visited spots
  const visitedSpots = spots.filter((s) => s.isVisited);

  return (
    <div className={`flex-1 select-none ${isWebMode ? 'space-y-8 pb-16' : 'overflow-y-auto px-4 py-3 space-y-5 pb-20'}`}>
      {/* ======================================================== */}
      {/* 1. TOP PROFILE HEADER BANNER                             */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-rose-50/80 border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Info */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              onClick={() => setIsEditProfileOpen(true)}
              className="relative cursor-pointer group shrink-0"
              title="프로필 사진 수정"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-md group-hover:ring-4 group-hover:ring-rose-400 transition-all"
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-xs">
                ✓
              </div>
              <div className="absolute inset-0 bg-stone-900/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                  {user.name} 님
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black shadow-xs">
                  LV.{user.level} {user.levelTitle}
                </span>
              </div>

              {user.bio && (
                <p className="text-xs sm:text-sm text-stone-600 font-medium">
                  "{user.bio}"
                </p>
              )}

              {user.email && (
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons & Statistics */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 bg-white/90 rounded-2xl p-3 border border-amber-200/60 shadow-xs text-center shrink-0">
              <div className="px-2">
                <div className="text-[10px] text-stone-400 font-medium">발견한 스팟</div>
                <div className="text-base font-black text-stone-900 mt-0.5">{user.discoveredCount}곳</div>
              </div>
              <div className="px-2 border-x border-stone-100">
                <div className="text-[10px] text-stone-400 font-medium">저장 목록</div>
                <div className="text-base font-black text-rose-500 mt-0.5">{user.savedCount}곳</div>
              </div>
              <div className="px-2">
                <div className="text-[10px] text-stone-400 font-medium">가본 곳 제외</div>
                <div className="text-base font-black text-emerald-600 mt-0.5">{user.excludedVisitedCount}곳</div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex sm:flex-col gap-2 justify-center">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="flex-1 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-amber-200/80 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-rose-500" />
                <span>프로필 수정</span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex-1 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DASHBOARD BODY (2 Columns on Web, Stack on Mobile)    */}
      {/* ======================================================== */}
      <div className={`grid gap-8 ${isWebMode ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left Column: 부산 탐험도 & 다녀온 곳 관리 (lg:col-span-4) */}
        <div className={`space-y-6 ${isWebMode ? 'lg:col-span-4' : ''}`}>
          {/* 나의 부산 탐험도 Card */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌊</span>
                <h3 className="text-sm font-black text-stone-900">나의 부산 탐험도</h3>
              </div>
              <span className="text-xs font-bold text-rose-500">
                {user.discoveredCount}곳 발굴
              </span>
            </div>

            <p className="text-xs text-stone-400">
              부산의 숨은 골목을 탐색할수록 탐험 지수와 레벨이 상승합니다.
            </p>

            {/* Regional Progress Bars */}
            <div className="space-y-3 pt-1">
              {user.regionExploration.map((region) => (
                <div key={region.region} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: region.color }}
                      />
                      <span className="font-bold text-stone-800">{region.region}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-500 font-semibold text-[11px]">
                      <span>{region.title}</span>
                      <span className="text-stone-900 font-bold">{region.percentage}%</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
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
            className="bg-sky-50 border border-sky-200 rounded-3xl p-5 flex items-center justify-between cursor-pointer hover:bg-sky-100/70 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-stone-900">
                  다녀온 유명 관광지 관리
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  다녀온 <strong className="text-stone-900">{user.excludedVisitedCount}곳</strong>은 추천에서 제외 중
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sky-600 text-xs font-bold">
              <span>설정</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Right Column: 보관한 스팟 & 다녀온 곳 목록 (lg:col-span-8) */}
        <div className={`space-y-4 ${isWebMode ? 'lg:col-span-8' : ''}`}>
          {/* Tabs: 가보고 싶은 곳 (저장) vs 내가 다녀온 부산 (방문 & 리뷰) */}
          <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200/60">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'saved'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-rose-400" />
              <span>가보고 싶은 곳 (보관 {savedSpots.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('visited')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'visited'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>내가 다녀온 부산 (방문 {visitedSpots.length})</span>
            </button>
          </div>

          {/* Spot Cards Grid */}
          <div className={`grid gap-4 ${isWebMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 space-y-3'}`}>
            {(activeTab === 'saved' ? savedSpots : visitedSpots).map((spot) => (
              <div
                key={spot.id}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden p-4 space-y-3 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image & Trend Header */}
                  <div
                    onClick={() => onSelectSpot(spot)}
                    className="relative h-44 rounded-xl overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={spot.images[0]}
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-sky-500 text-white text-[11px] font-bold">
                      {spot.recentTrend || '단골 추천'}
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-white/95 text-rose-500 text-xs font-black shadow-xs">
                      히든 {spot.hiddenScore}점
                    </div>

                    <div className="absolute bottom-2.5 left-3 text-stone-200 text-xs font-medium">
                      {spot.district}
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-1 mt-3">
                    <h4
                      onClick={() => onSelectSpot(spot)}
                      className="text-base font-extrabold text-stone-900 cursor-pointer hover:text-rose-600 transition-colors"
                    >
                      {spot.name}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {spot.shortDesc}
                    </p>
                  </div>

                  {/* My Review Box */}
                  {spot.myReview && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 font-black text-amber-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{spot.myReview.rating}.0점</span>
                        </div>
                        <span className="text-[11px] text-stone-400">내가 남긴 후기</span>
                      </div>
                      {spot.myReview.comment && (
                        <p className="text-xs text-stone-700 font-medium line-clamp-2 leading-relaxed italic">
                          "{spot.myReview.comment}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Action Button & Map Shortcut */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => onToggleVisited(spot.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                      spot.isVisited
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {spot.isVisited
                        ? spot.myReview
                          ? `★ ${spot.myReview.rating}.0 리뷰 수정`
                          : '다녀온 곳'
                        : '가봤어요'}
                    </span>
                  </button>

                  <button
                    onClick={() => onSelectSpot(spot)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    상세보기 →
                  </button>
                </div>
              </div>
            ))}

            {(activeTab === 'saved' ? savedSpots : visitedSpots).length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-stone-200 text-stone-400 text-xs">
                {activeTab === 'saved'
                  ? '아직 저장된 스팟이 없습니다. 홈 또는 스팟 탐색에서 마음에 드는 곳을 보관해보세요!'
                  : '아직 다녀온 스팟으로 체크된 곳이 없습니다.'}
              </div>
            )}
          </div>
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
          onLogout={onLogout}
        />
      )}
    </div>
  );
};
