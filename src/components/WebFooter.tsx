import React from 'react';
import { Compass, Sparkles, MapPin, Heart, ShieldCheck } from 'lucide-react';

interface WebFooterProps {
  onSelectRegion: (region: string) => void;
  onOpenAiGenerator: () => void;
}

export const WebFooter: React.FC<WebFooterProps> = ({
  onSelectRegion,
  onOpenAiGenerator,
}) => {
  return (
    <footer className="w-full bg-stone-900 text-stone-400 text-xs border-t border-stone-800 mt-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Hidden Spot IN BUSAN"
                className="h-10 w-auto max-w-[44px] object-contain rounded-lg bg-white p-0.5"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-white font-black text-base tracking-tight">
                  Hidden Spot Busan
                </span>
                <span className="block text-[11px] text-rose-400 font-semibold">
                  부산 N차 여행자를 위한 로컬 히든 스팟 아카이브
                </span>
              </div>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed max-w-md">
              해운대, 광안리 등 관광객이 붐비는 뻔한 명소를 넘어, 현지 주민들의 일상과
              골목 고유의 정취가 살아있는 진짜 부산의 스팟들을 발굴하고 큐레이션합니다.
              독자적인 Hidden Score 알고리즘으로 현지인 밀집도, 소음도, 접근 난이도를 종합 분석합니다.
            </p>
            <div className="flex items-center gap-3 text-stone-500 text-[11px]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                현지 데이터 검증 완료
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI 실시간 로컬 추천
              </span>
            </div>
          </div>

          {/* Col 2: 탐험 권역 바로가기 */}
          <div className="space-y-3">
            <h4 className="text-stone-200 font-bold text-xs uppercase tracking-wider">
              주요 로컬 탐험 권역
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <button
                  onClick={() => onSelectRegion('영도구')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  영도구 (봉래산·흰여울·청학동)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRegion('전포·서면')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  전포·서면 (전포 사잇길 카페거리)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRegion('망미동')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  망미동 (망미 골목 문화 예술 거리)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRegion('동구·초량')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  동구·초량 (초량 168계단 이바구길)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectRegion('기장·송정')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  기장·송정 (송정 옛 철길 및 해안가)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hidden Score 철학 */}
          <div className="space-y-3">
            <h4 className="text-stone-200 font-bold text-xs uppercase tracking-wider">
              Hidden Score 지표
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-800">
                <div className="font-semibold text-stone-300">👥 현지인 비율 75% 이상</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  관광객 쏠림이 덜한 현지인 중심 상권
                </div>
              </div>
              <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-800">
                <div className="font-semibold text-stone-300">🌿 여유로운 소음도 (Low)</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  도심의 소음을 피해 사색과 대화가 가능한 공간
                </div>
              </div>
              <div className="bg-stone-800/60 p-2.5 rounded-xl border border-stone-800">
                <div className="font-semibold text-stone-300">🗺️ 골목 깊숙한 접근성</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  대로변 체인점이 아닌 골목 안쪽 고유 매력
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <p>© 2026 Hidden Spot Busan. All rights reserved. 부산 로컬 히든 스팟 탐험 가이드</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-stone-400 cursor-pointer">개인정보처리방침</span>
            <span>·</span>
            <span className="hover:text-stone-400 cursor-pointer">이용약관</span>
            <span>·</span>
            <span className="hover:text-stone-400 cursor-pointer">스팟 제보 및 문의</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
