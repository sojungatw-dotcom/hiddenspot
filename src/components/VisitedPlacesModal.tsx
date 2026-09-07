import React, { useState } from 'react';
import { X, Check, Plus, Trash2, ShieldCheck, MapPin } from 'lucide-react';

interface VisitedPlacesModalProps {
  visitedList: string[];
  onUpdateVisitedList: (newList: string[]) => void;
  onClose: () => void;
}

export const VisitedPlacesModal: React.FC<VisitedPlacesModalProps> = ({
  visitedList,
  onUpdateVisitedList,
  onClose,
}) => {
  const [newPlaceInput, setNewPlaceInput] = useState('');

  // Preset famous tourist spots in Busan that repeat visitors have typically visited
  const presetTouristySpots = [
    '해운대 해수욕장 & 구남로',
    '광안리 해변 & 드론쇼',
    '감천문화마을 어린왕자',
    '더베이101 야경',
    '태종대 전망대 & 유람선',
    '자갈치 시장 & 남포동 BIFF거리',
    '용궁사 (해동용궁사)',
    '흰여울문화마을 메인 포토존',
    '송도 해상케이블카',
    '부산타워 & 용두산공원',
    '신세계 센텀시티 스파랜드',
    '기장 아난티 코브 & 오시리아',
    '밀락더마켓',
    '영도 흰여울마을 계단길',
    '서면 젊음의 거리 메인로',
    '오륙도 스카이워크',
    '동백섬 순환산책로',
    '부산항 대교 롤러코스터 진입로',
  ];

  const togglePlace = (place: string) => {
    if (visitedList.includes(place)) {
      onUpdateVisitedList(visitedList.filter((p) => p !== place));
    } else {
      onUpdateVisitedList([...visitedList, place]);
    }
  };

  const handleAddCustomPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceInput.trim()) return;
    if (!visitedList.includes(newPlaceInput.trim())) {
      onUpdateVisitedList([...visitedList, newPlaceInput.trim()]);
    }
    setNewPlaceInput('');
  };

  const handleRemoveCustom = (place: string) => {
    onUpdateVisitedList(visitedList.filter((p) => p !== place));
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">
                내가 이미 가본 부산 명소 관리
              </h3>
              <p className="text-[11px] text-stone-500">
                체크된 곳은 모든 AI 추천과 지도에서 자동 제외됩니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status Counter */}
          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200/60 flex items-center justify-between text-xs">
            <span className="text-amber-900 font-medium">
              현재 제외 설정된 기방문 장소
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-xs">
              {visitedList.length}곳 제외 중
            </span>
          </div>

          {/* Add custom place form */}
          <form onSubmit={handleAddCustomPlace} className="flex gap-2">
            <input
              type="text"
              value={newPlaceInput}
              onChange={(e) => setNewPlaceInput(e.target.value)}
              placeholder="직접 가본 곳 입력 (예: 영도 피아크, 전포 카페거리)"
              className="flex-1 px-3 py-2 bg-stone-100 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-medium"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>추가</span>
            </button>
          </form>

          {/* Preset Tourist Spots Checklist */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              부산 대표 관광지 (클릭하여 기방문 체크)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetTouristySpots.map((spot) => {
                const isChecked = visitedList.includes(spot);
                return (
                  <button
                    key={spot}
                    type="button"
                    onClick={() => togglePlace(spot)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-rose-50/70 border-rose-300 text-stone-900 font-bold'
                        : 'bg-stone-50 border-stone-200/60 text-stone-600 hover:bg-stone-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="text-xs truncate">{spot}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                        isChecked
                          ? 'bg-rose-500 text-white'
                          : 'border border-stone-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3px]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom added places list if any */}
          {visitedList.filter((p) => !presetTouristySpots.includes(p)).length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                직접 등록한 기방문지
              </div>
              <div className="space-y-1.5">
                {visitedList
                  .filter((p) => !presetTouristySpots.includes(p))
                  .map((place) => (
                    <div
                      key={place}
                      className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800"
                    >
                      <span>{place}</span>
                      <button
                        onClick={() => handleRemoveCustom(place)}
                        className="p-1 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-stone-100 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black transition-colors cursor-pointer"
          >
            설정 완료 및 추천 스팟 업데이트
          </button>
        </div>
      </div>
    </div>
  );
};
