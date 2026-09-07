import React, { useState } from 'react';
import { X, Camera, Check, Sparkles, User, FileText, Compass, Link2 } from 'lucide-react';
import { UserProfile } from '../types';

interface EditProfileModalProps {
  user: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
}

// 감성적인 부산 여행자 프리셋 아바타
const PRESET_AVATARS = [
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    label: '클래식 포트레이트',
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    label: '영도 노을빛',
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    label: '골목 산책자',
  },
  {
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    label: '바다 사색',
  },
  {
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    label: '카메라 탐험가',
  },
  {
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    label: '카페 큐레이터',
  },
];

// 추천 칭호 목록
const TITLE_PRESETS = [
  '부산 4회차 여행자 · 탐험 레벨 3',
  '영도 골목길 마스터 · 탐험 레벨 3',
  '심야 LP바 & 찻집 매니아',
  '조용한 바다 헌터 · 로컬 큐레이터',
  '전포동 공구골목 산책자',
];

// 선호하는 탐험 스타일 태그
const AVAILABLE_STYLES = [
  '조용한 골목길',
  '바다 전망 티룸',
  '전포 LP/바',
  '독립서점',
  '로컬 노포 미식',
  '감성 소품샵',
  '오션뷰 일몰',
  '산책과 사색',
  '도자기·공방',
  '루프탑 야경',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(user.name);
  const [levelTitle, setLevelTitle] = useState(user.levelTitle);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [bio, setBio] = useState(user.bio || '부산 4회차, 북적이는 관광지보다 영도 골목길과 전포 뒷골목 LP바를 좋아해요.');
  const [travelStyles, setTravelStyles] = useState<string[]>(
    user.travelStyles || ['조용한 골목길', '바다 전망 티룸', '전포 LP/바']
  );
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  // 태그 토글 핸들러
  const toggleStyle = (style: string) => {
    if (travelStyles.includes(style)) {
      setTravelStyles(travelStyles.filter((s) => s !== style));
    } else {
      if (travelStyles.length >= 5) {
        alert('취향 태그는 최대 5개까지 선택할 수 있습니다.');
        return;
      }
      setTravelStyles([...travelStyles, style]);
    }
  };

  // 프로필 저장 핸들러
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    onSave({
      name: name.trim(),
      levelTitle: levelTitle.trim(),
      avatarUrl,
      bio: bio.trim(),
      travelStyles,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">내 프로필 수정</h3>
              <p className="text-[11px] text-stone-400">나만의 여행자 프로필을 꾸며보세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Avatar Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-stone-800">
              프로필 사진
            </label>

            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="미리보기"
                  className="w-16 h-16 rounded-full object-cover border-2 border-rose-400 shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm">
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold text-stone-700">추천 여행자 아바타 선택</p>
                <p className="text-[10px] text-stone-400 mt-0.5">아래 프리셋 사진을 눌러 바로 바꿀 수 있어요</p>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-6 gap-2 pt-1">
              {PRESET_AVATARS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAvatarUrl(preset.url);
                    setShowCustomUrlInput(false);
                  }}
                  className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all cursor-pointer ${
                    avatarUrl === preset.url
                      ? 'border-rose-500 ring-2 ring-rose-200 scale-105'
                      : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                  }`}
                  title={preset.label}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  {avatarUrl === preset.url && (
                    <div className="absolute inset-0 bg-rose-500/30 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom URL Input Toggle */}
            <div className="pt-1">
              {!showCustomUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomUrlInput(true)}
                  className="flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-rose-500 font-semibold cursor-pointer"
                >
                  <Link2 className="w-3 h-3" />
                  <span>직접 이미지 링크(URL) 입력하기</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://... 이미지 주소 입력"
                    className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-rose-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrl.trim()) {
                        setAvatarUrl(customUrl.trim());
                        setCustomUrl('');
                      }
                    }}
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
                  >
                    적용
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Nickname Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              닉네임 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              maxLength={12}
              onChange={(e) => setName(e.target.value)}
              placeholder="닉네임을 입력하세요 (최대 12자)"
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-400 transition-colors"
            />
          </div>

          {/* Level Title / Badge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-800">
                여행자 칭호
              </label>
              <span className="text-[10px] text-rose-500 font-medium">선택 또는 직접 입력</span>
            </div>
            <input
              type="text"
              value={levelTitle}
              onChange={(e) => setLevelTitle(e.target.value)}
              placeholder="예: 부산 4회차 여행자 · 탐험 레벨 3"
              className="w-full px-3.5 py-2 text-xs font-semibold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-400 transition-colors"
            />
            {/* Quick title presets */}
            <div className="flex flex-wrap gap-1 pt-1">
              {TITLE_PRESETS.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLevelTitle(t)}
                  className={`text-[10px] px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    levelTitle === t
                      ? 'bg-rose-500 text-white font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {t.split(' · ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Bio Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              한 줄 소개 (Bio)
            </label>
            <textarea
              rows={2}
              value={bio}
              maxLength={70}
              onChange={(e) => setBio(e.target.value)}
              placeholder="나만의 부산 여행 스타일을 짧게 소개해 주세요"
              className="w-full px-3.5 py-2 text-xs text-stone-800 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-400 transition-colors resize-none leading-relaxed"
            />
            <div className="text-right text-[10px] text-stone-400">
              {bio.length} / 70자
            </div>
          </div>

          {/* Travel Style Tags Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-800">
                선호하는 탐험 스타일 <span className="text-[10px] font-normal text-stone-400">(최대 5개)</span>
              </label>
              <span className="text-[10px] font-bold text-rose-500">{travelStyles.length}/5</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_STYLES.map((style) => {
                const isSelected = travelStyles.includes(style);
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleStyle(style)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-rose-50 text-rose-600 border border-rose-300 font-bold shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border border-stone-200/70 hover:bg-stone-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[2.5px]" />}
                    <span>{style}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save & Cancel Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md shadow-rose-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>수정 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
