export interface ScoreBreakdown {
  rarity: number;      // 리뷰 희소성 (e.g. 92)
  quality: number;     // 만족도 및 품질 (e.g. 96)
  growth: number;      // 최근 성장성 (e.g. 85)
  freshness: number;   // 신선도 보정 (e.g. 90)
}

export interface EditorTip {
  type: 'time' | 'transit' | 'menu' | 'secret';
  title: string;
  description: string;
}

export interface Spot {
  id: string;
  name: string;
  category: string;
  region: '영도구' | '전포·서면' | '망미동' | '기장·송정' | '동구·초량' | '수영·광안' | '해운대·청사포';
  district: string; // e.g. "영도구 절영로", "부산진구 전포대로"
  address: string;
  subCategory?: string; // e.g. "독립서점 · 로컬 티룸"
  hiddenScore: number; // 0 - 100
  scoreLabel?: string; // e.g. "발견하기 좋은 숨은 스팟"
  scoreBreakdown: ScoreBreakdown;
  matchRate: number; // e.g. 94%
  matchReason: string; // e.g. "아직 방문하지 않은 장소예요 · 저장하신 '조용한 공간/바다 전망' 취향과 94% 일치해요."
  detailedWhy: string[]; // 3 points: 왜 나에게 추천되었나요?
  tags: string[]; // ["#리뷰는 적지만 만족도 4.9", "#최근 30일 저장 2.4배", "#로컬 주민 아지트"]
  recentTrend?: string; // "+42% 상승", "최근 30일 관심 +52%"
  transitTip: string; // e.g. "부산역에서 82번 버스로 18분", "전포역 7번 출구에서 4분"
  crowdDensity: string; // e.g. "혼잡도 8% (매우 여유)"
  crowdPercent: number; // 8
  touristRatio: string; // "낮음 18%", "외지인 비율 15% 미만"
  localRevisitScore: number; // e.g. 82
  currentSeatsOrTeams?: string; // "보통 (6팀)"
  shortDesc: string;
  fullDesc?: string;
  editorTips: EditorTip[];
  images: string[];
  isSaved: boolean;
  isVisited: boolean; // if user checked "가봤어요"
  mapPosition: { x: number; y: number }; // Relative coordinates 0-100 for custom interactive map
  aiGenerated?: boolean;
}

export interface UserProfile {
  name: string;
  level: number;
  levelTitle: string;
  avatarUrl: string;
  discoveredCount: number;
  savedCount: number;
  excludedVisitedCount: number;
  regionExploration: {
    region: string;
    title: string;
    percentage: number;
    color: string;
  }[];
  visitedPlaces: string[]; // List of famous/visited tourist places to exclude
  savedSpotIds: string[];
  bio?: string;
  travelStyles?: string[];
}
