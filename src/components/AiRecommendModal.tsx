import React, { useState } from 'react';
import { Sparkles, X, MessageSquare, Send, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { Spot } from '../types';

interface AiRecommendModalProps {
  visitedList: string[];
  onAddAiSpots: (newSpots: Spot[]) => void;
  onClose: () => void;
}

export const AiRecommendModal: React.FC<AiRecommendModalProps> = ({
  visitedList,
  onAddAiSpots,
  onClose,
}) => {
  const [activeMode, setActiveMode] = useState<'generate' | 'chat'>('generate');
  const [preferenceText, setPreferenceText] = useState('비 오는 날 바다를 보며 혼자 조용히 사색할 수 있는 차실이나 독립서점');
  const [targetRegion, setTargetRegion] = useState('영도구');
  const [minScore, setMinScore] = useState<number>(85);
  const [loading, setLoading] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);

  // Chat consultant state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `반갑습니다! 부산 4회차 이상 여행자 전담 AI 로컬 큐레이터입니다.
해운대나 광안리 같은 유명 관광지는 제외하고, 영도 산복도로 골목이나 전포 뒷골목, 초량 적산가옥처럼 부산 현지인들만 아는 히든 스팟을 추천해드릴게요. 오늘 어떤 분위기의 장소를 찾고 계신가요?`,
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Preset keywords
  const presetPrompts = [
    '비 오는 날 영도 바다 뷰 조용한 차실',
    '전포 공구거리 깊숙한 아날로그 LP 리스닝바',
    '관광객 5% 미만인 산복도로 일몰 명소',
    '망미동 단독주택 골목 안 수제 도자기 카페',
    '초량 1930년대 적산가옥 숨은 다도 체험',
  ];

  // Call Gemini AI Recommend Endpoint
  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedCount(null);
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preference: preferenceText,
          targetRegion,
          visitedPlaces: visitedList,
          minScore,
        }),
      });
      const data = await res.json();
      if (data.spots && data.spots.length > 0) {
        onAddAiSpots(data.spots);
        setGeneratedCount(data.spots.length);
      }
    } catch (err) {
      console.error('Failed to generate AI spots', err);
    } finally {
      setLoading(false);
    }
  };

  // Call Gemini AI Chat Endpoint
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          userContext: {
            visitedCount: visitedList.length,
            targetRegion,
            minScore,
          },
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer || '답변을 불러오지 못했습니다.' },
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '일시적인 네트워크 오류가 발생했습니다. 잠시 후 다시 질문해주세요.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">
                Gemini AI 히든 스팟 추천 엔진
              </h3>
              <p className="text-[11px] text-stone-500">
                부산 N차 방문자 전담 · Hidden Score 알고리즘
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

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-stone-100 bg-stone-50/70 px-4 pt-2">
          <button
            onClick={() => setActiveMode('generate')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeMode === 'generate'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            취향 기반 즉시 발굴
          </button>
          <button
            onClick={() => setActiveMode('chat')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMode === 'chat'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI 로컬 에디터와 대화</span>
          </button>
        </div>

        {/* Mode 1: Instant Spot Generator */}
        {activeMode === 'generate' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Notification */}
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-3 text-[11px] text-amber-900 leading-relaxed">
              💡 회원님이 등록하신 <strong className="font-bold text-rose-600">{visitedList.length}곳</strong>의 기방문 명소는 추천 후보에서 엄격하게 제외됩니다.
            </div>

            {/* Region Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">탐험 희망 지역</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['전체', '영도구', '전포·서면', '망미동', '동구·초량', '기장·송정'].map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setTargetRegion(reg)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      targetRegion === reg
                        ? 'bg-stone-900 text-white shadow-xs font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Hidden Score Slider */}
            <div className="space-y-1.5 bg-stone-50 p-3 rounded-2xl border border-stone-100">
              <div className="flex justify-between items-center text-xs font-bold text-stone-800">
                <span>최소 Hidden Score 필터</span>
                <span className="text-rose-600 font-black">{minScore}점 이상</span>
              </div>
              <input
                type="range"
                min="75"
                max="95"
                step="1"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>75점 (로컬 유망)</span>
                <span>85점 (숨은 보석)</span>
                <span>95점 (극비 로컬)</span>
              </div>
            </div>

            {/* Preference Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">
                어떤 분위기나 감성을 원하시나요?
              </label>
              <textarea
                value={preferenceText}
                onChange={(e) => setPreferenceText(e.target.value)}
                rows={3}
                placeholder="예: 영도에서 혼자 책 읽기 좋은 조용한 바다 전망 다원..."
                className="w-full p-3 bg-stone-100 rounded-2xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-medium resize-none"
              />
            </div>

            {/* Preset quick pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-400">
                빠른 추천 키워드 프리셋
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presetPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreferenceText(prompt)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-600 text-[11px] transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Confirmation */}
            {generatedCount !== null && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  새로운 히든 스팟 <strong>{generatedCount}곳</strong>이 발굴되어 내 목록 및 지도에 즉시 반영되었습니다!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Realtime Chat Consultant */}
        {activeMode === 'chat' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
            {/* Message Feed */}
            <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-rose-500 text-white rounded-br-xs font-medium'
                        : 'bg-stone-100 text-stone-800 rounded-bl-xs border border-stone-200/60'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-stone-100 text-stone-500 rounded-2xl p-3 text-xs flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    <span>부산 로컬 데이터를 심층 분석 중입니다...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="예: 영도에서 비 오는 날 갈 만한 조용한 곳?"
                className="flex-1 px-3 py-2 bg-stone-100 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Footer (for Mode 1) */}
        {activeMode === 'generate' && (
          <div className="p-3 border-t border-stone-100 bg-stone-50">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>
                {loading
                  ? 'Gemini AI가 부산 로컬 데이터 분석 중...'
                  : 'AI 맞춤 히든 스팟 발굴 시작하기'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
