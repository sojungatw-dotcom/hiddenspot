import React, { useState } from 'react';
import {
  ChevronLeft,
  Share2,
  Bookmark,
  Check,
  Navigation,
  Sparkles,
  Clock,
  Bus,
  Coffee,
  MapPin,
  Copy,
  Star,
  MessageSquare,
  Edit3,
  Database,
} from 'lucide-react';
import { Spot } from '../types';

interface SpotDetailModalProps {
  spot: Spot;
  onClose: () => void;
  onToggleSave: (spotId: string) => void;
  onToggleVisited: (spotId: string) => void;
}

export const SpotDetailModal: React.FC<SpotDetailModalProps> = ({
  spot,
  onClose,
  onToggleSave,
  onToggleVisited,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(spot.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: spot.name,
        text: `${spot.name} - Hidden Score ${spot.hiddenScore}점! 부산 숨은 로컬 명소`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyAddress();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden select-none animate-in slide-in-from-right duration-250">
      {/* Top Floating Nav Bar */}
      <div className="w-full bg-white/90 backdrop-blur-md border-b border-stone-100 px-4 py-2.5 flex items-center justify-between z-30 shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-700 cursor-pointer"
          title="뒤로가기"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold text-stone-900 truncate max-w-[180px]">
          {spot.name}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-600 cursor-pointer"
            title="공유하기"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleSave(spot.id)}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center cursor-pointer text-stone-600"
            title="저장"
          >
            <Bookmark
              className={`w-4 h-4 ${
                spot.isSaved ? 'fill-rose-500 text-rose-500' : 'text-stone-600'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto pb-24 space-y-5">
        {/* Photo Gallery Carousel */}
        <div className="relative h-64 sm:h-72 w-full bg-stone-900">
          <img
            src={spot.images[currentImgIndex % spot.images.length]}
            alt={spot.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

          {/* Indicator Pill */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-stone-950/70 backdrop-blur text-white text-[11px] font-bold">
            {currentImgIndex + 1} / {spot.images.length}
          </div>

          {/* Thumbnails Navigator */}
          {spot.images.length > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              {spot.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImgIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    currentImgIndex === idx ? 'bg-white w-5' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Title, Category & Location */}
        <div className="px-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
            <span>{spot.region}</span>
            <span>•</span>
            <span>{spot.category}</span>
          </div>

          <h2 className="text-xl font-black text-stone-900 tracking-tight leading-snug">
            {spot.name}
          </h2>

          <p className="text-xs text-stone-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{spot.address}</span>
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {spot.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[11px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 히든 스팟 점수 분석 */}
        <div className="mx-4 bg-amber-50/60 rounded-3xl p-4 border border-amber-200/60 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">✦</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                히든 스팟 점수
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold">
              로컬 검증
            </span>
          </div>

          {/* Main Score Hero Pill */}
          <div className="bg-rose-500 rounded-2xl p-3 text-white flex items-center justify-between shadow-md">
            <div>
              <div className="text-[11px] font-medium text-rose-100">
                {spot.scoreLabel || '숨은 로컬 스팟'}
              </div>
              <div className="text-2xl font-black tracking-tight mt-0.5">
                {spot.hiddenScore} <span className="text-sm font-normal text-rose-200">/ 100</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-rose-100 font-medium">
              <div>관광객 비율 {spot.touristRatio}</div>
              <div>재방문 의향 {spot.localRevisitScore}%</div>
            </div>
          </div>

          {/* 4 Bar Score Breakdowns */}
          <div className="space-y-3 pt-1">
            {/* 1. 리뷰 희소성 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-stone-800">
                <span>희소성</span>
                <span className="text-rose-600 font-extrabold">{spot.scoreBreakdown.rarity}점</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-amber-200/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{ width: `${spot.scoreBreakdown.rarity}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-500">
                SNS에는 덜 알려진 고요한 로컬 장소
              </p>
            </div>

            {/* 2. 만족도 및 품질 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-stone-800">
                <span>만족도</span>
                <span className="text-rose-600 font-extrabold">{spot.scoreBreakdown.quality}점</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-amber-200/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{ width: `${spot.scoreBreakdown.quality}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-500">
                다녀온 사람들의 재방문 만족도가 높은 곳
              </p>
            </div>

            {/* 3. 최근 성장성 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-stone-800">
                <span>관심도</span>
                <span className="text-rose-600 font-extrabold">{spot.scoreBreakdown.growth}점</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-amber-200/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{ width: `${spot.scoreBreakdown.growth}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-500">
                최근 여행자들의 저장이 늘어나는 중
              </p>
            </div>

            {/* 4. 신선도 보정 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-stone-800">
                <span>공간 고유성</span>
                <span className="text-rose-600 font-extrabold">{spot.scoreBreakdown.freshness}점</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-amber-200/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{ width: `${spot.scoreBreakdown.freshness}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-500">
                유행을 타지 않고 정체성이 뚜렷한 아지트
              </p>
            </div>
          </div>
        </div>

        {/* 이곳을 추천하는 이유 */}
        <div className="mx-4 bg-white rounded-3xl p-4 border border-stone-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-extrabold text-stone-900">
              이곳을 추천하는 이유
            </h3>
          </div>

          <div className="space-y-2.5">
            {spot.detailedWhy.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3px]" />
                </div>
                <p className="leading-snug">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 에디터 꿀팁 */}
        <div className="mx-4 bg-white rounded-3xl p-4 border border-stone-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900">
              에디터 꿀팁
            </h3>
            <span className="text-[10px] text-stone-400 font-medium">
              최근 확인
            </span>
          </div>

          <div className="space-y-3">
            {spot.editorTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs bg-stone-50 p-2.5 rounded-2xl">
                <div className="w-7 h-7 rounded-xl bg-white text-rose-500 flex items-center justify-center shrink-0 shadow-xs border border-stone-100">
                  {tip.type === 'time' && <Clock className="w-4 h-4" />}
                  {tip.type === 'transit' && <Bus className="w-4 h-4" />}
                  {tip.type === 'menu' && <Coffee className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-stone-900">{tip.title}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    {tip.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 나의 방문 별점 & 한줄평 기록 (Supabase 연동) */}
        {spot.isVisited && (
          <div className="mx-4 bg-emerald-50/70 rounded-3xl p-4 border border-emerald-200/70 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  <Check className="w-3 h-3 stroke-[3px]" />
                </div>
                <h3 className="text-xs font-black text-emerald-950">
                  내가 남긴 방문 평가 & 한줄평
                </h3>
              </div>
              <button
                onClick={() => onToggleVisited(spot.id)}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2 py-0.5 rounded-full border border-emerald-200 cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3 h-3" />
                <span>수정하기</span>
              </button>
            </div>

            {/* Rating Stars & Score */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= (spot.myReview?.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-stone-200 text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-amber-600">
                {(spot.myReview?.rating || 5)}.0점
              </span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 ml-auto font-medium">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Supabase 저장됨</span>
              </div>
            </div>

            {/* Comment */}
            {spot.myReview?.comment ? (
              <div className="bg-white/90 p-3 rounded-2xl border border-emerald-100 text-xs text-stone-800 leading-relaxed font-medium">
                "{spot.myReview.comment}"
              </div>
            ) : (
              <p className="text-[11px] text-stone-500 italic">
                한줄평 없이 방문 체크된 장소예요. '수정하기'를 눌러 한줄평을 남겨보세요!
              </p>
            )}
          </div>
        )}

        {/* 위치 및 주변 거리 */}
        <div className="mx-4 bg-white rounded-3xl p-4 border border-stone-100 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900">
              위치 및 접근성
            </h3>
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? '복사됨!' : '주소 복사'}</span>
            </button>
          </div>

          <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            {spot.address}
          </p>
        </div>
      </div>

      {/* Sticky Bottom Action Bar (Image 9 style) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-100 p-3 flex items-center gap-2 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {/* 가봤어요 Button */}
        <button
          onClick={() => onToggleVisited(spot.id)}
          className={`py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
            spot.isVisited
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>
            {spot.isVisited
              ? spot.myReview
                ? `★ ${spot.myReview.rating}.0 가봤어요`
                : '다녀온 곳'
              : '가봤어요'}
          </span>
        </button>

        {/* 길찾기 Button */}
        <button
          onClick={() => alert(`${spot.name} 길안내: ${spot.transitTip}`)}
          className="py-3 px-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-sky-200"
        >
          <Navigation className="w-4 h-4" />
          <span>길찾기</span>
        </button>

        {/* 내 보관함에 저장 Button */}
        <button
          onClick={() => onToggleSave(spot.id)}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
            spot.isSaved
              ? 'bg-stone-900 text-white'
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${spot.isSaved ? 'fill-white' : ''}`} />
          <span>{spot.isSaved ? '보관함에 저장됨' : '내 보관함에 저장'}</span>
        </button>
      </div>
    </div>
  );
};
