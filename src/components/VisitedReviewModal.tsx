import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Check,
  Sparkles,
  Database,
  MapPin,
  Trash2,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { Spot, SpotReview, UserProfile } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface VisitedReviewModalProps {
  spot: Spot;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveReview: (review: { rating: number; comment: string }) => Promise<void>;
  onDeleteReview?: () => Promise<void>;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  5: '인생 스팟! 완벽한 부산의 숨은 보물이에요',
  4: '정말 좋았어요! 지인에게 추천하고 싶어요',
  3: '분위기 괜찮고 편안한 공간이었어요',
  2: '무난하지만 기대와는 살짝 달랐어요',
  1: '조금 아쉬웠어요',
};

const QUICK_TAGS = [
  '#조용해서좋음',
  '#일몰전망최고',
  '#커피향가득',
  '#인생사진스팟',
  '#골목감성충만',
  '#친절한응대',
];

export const VisitedReviewModal: React.FC<VisitedReviewModalProps> = ({
  spot,
  user,
  isOpen,
  onClose,
  onSaveReview,
  onDeleteReview,
}) => {
  const existing = spot.myReview;
  const [rating, setRating] = useState<number>(existing?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>(existing?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (spot.myReview) {
      setRating(spot.myReview.rating || 5);
      setComment(spot.myReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
  }, [spot]);

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;
  const supabaseReady = isSupabaseConfigured();

  const handleQuickTagClick = (tag: string) => {
    if (comment.includes(tag)) return;
    setComment((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${tag}` : tag;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveReview({
        rating,
        comment: comment.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimpleVisited = async () => {
    setIsSubmitting(true);
    try {
      await onSaveReview({
        rating: 5,
        comment: comment.trim() || '직접 다녀온 부산의 숨은 명소예요.',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <Check className="w-4 h-4 stroke-[3px]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">
                {existing ? '방문 기록 및 리뷰 수정' : '가봤어요 · 방문 기록 남기기'}
              </h3>
              <p className="text-[11px] text-stone-400">별점과 한줄평이 Supabase에 기록됩니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Target Spot Card Info */}
          <div className="flex items-center gap-3 p-3 bg-stone-50/80 rounded-2xl border border-stone-200/60">
            <img
              src={spot.images[0] || '/logo.jpg'}
              alt={spot.name}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold">
                <span>{spot.region}</span>
                <span>•</span>
                <span>{spot.category}</span>
              </div>
              <h4 className="text-xs font-black text-stone-900 truncate mt-0.5">
                {spot.name}
              </h4>
              <p className="text-[11px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="truncate">{spot.address}</span>
              </p>
            </div>
          </div>

          {/* Star Rating Section */}
          <div className="bg-amber-50/40 border border-amber-100/80 rounded-2xl p-4 text-center space-y-2">
            <label className="block text-xs font-bold text-stone-800">
              이 장소는 어떠셨나요?
            </label>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isActive = starVal <= currentDisplayRating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(starVal)}
                    className="p-1 text-amber-400 hover:scale-115 active:scale-95 transition-all cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isActive
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'fill-stone-100 text-stone-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Rating Number & Description */}
            <div className="space-y-0.5">
              <div className="text-base font-black text-amber-600">
                {currentDisplayRating}.0 <span className="text-xs font-medium text-stone-400">/ 5.0</span>
              </div>
              <p className="text-[11px] font-semibold text-stone-600 min-h-[16px]">
                {RATING_DESCRIPTIONS[currentDisplayRating]}
              </p>
            </div>
          </div>

          {/* Comment (한줄평) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-800 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                <span>방문 한줄평</span>
              </label>
              <span className="text-[10px] text-stone-400">
                {comment.length} / 100자
              </span>
            </div>

            <textarea
              rows={3}
              maxLength={100}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="직접 방문했을 때 느낀 솔직한 분위기나 꿀팁을 한 줄로 남겨주세요."
              className="w-full px-3.5 py-2.5 text-xs text-stone-800 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-400 transition-colors resize-none leading-relaxed"
            />

            {/* Quick tags */}
            <div className="pt-1">
              <p className="text-[10px] font-medium text-stone-400 mb-1">
                터치해서 한줄평에 키워드 추가:
              </p>
              <div className="flex flex-wrap gap-1">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTagClick(tag)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-600 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Supabase Cloud DB Badge */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Supabase DB 실시간 저장</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              {supabaseReady ? '연결 활성' : '로컬 & 클라우드 동기화'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Supabase 저장 중...</span>
                </span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3px]" />
                  <span>별점과 한줄평 등록 완료</span>
                </>
              )}
            </button>

            {/* Option to delete review if already visited */}
            {existing && onDeleteReview && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('방문 기록과 한줄평을 삭제하시겠습니까?')) {
                    setIsSubmitting(true);
                    await onDeleteReview();
                    setIsSubmitting(false);
                    onClose();
                  }
                }}
                disabled={isSubmitting}
                className="w-full py-2 rounded-xl text-stone-400 hover:text-rose-500 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>방문 기록(가봤어요) 취소하기</span>
              </button>
            )}

            {!existing && (
              <button
                type="button"
                onClick={handleSimpleVisited}
                disabled={isSubmitting}
                className="w-full py-2 text-stone-400 hover:text-stone-700 font-medium text-[11px] transition-colors cursor-pointer"
              >
                평가 없이 '가봤어요'만 체크하기
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
