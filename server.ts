import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!apiKey });
});

// AI Hidden Spot Recommendation Endpoint
app.post('/api/ai/recommend', async (req, res) => {
  try {
    const {
      preference = '조용한 바다 뷰 서점 & 로컬 차실',
      targetRegion = '전체',
      visitedPlaces = [],
      minScore = 80,
    } = req.body;

    if (!apiKey) {
      // Fallback structured mock if API key is not yet set in environment
      return res.json({
        spots: [
          {
            id: `ai-spot-${Date.now()}-1`,
            name: '영도 봉래산 자락 숨은 다원',
            category: '산복도로 다실 & 약초차',
            subCategory: '로컬 발효차 & 파노라마 오션뷰',
            region: '영도구',
            district: '영도구 봉래산로',
            address: '부산 영도구 봉래산로 102번길 18',
            hiddenScore: 89,
            scoreLabel: 'AI 발굴 로컬 명소',
            scoreBreakdown: { rarity: 93, quality: 95, growth: 84, freshness: 91 },
            matchRate: 96,
            matchReason: `회원님의 '${preference}' 취향과 96% 일치하며 기방문지(${visitedPlaces.slice(0, 3).join(', ') || '주요 관광지'})를 완벽히 제외했습니다.`,
            detailedWhy: [
              '관광객이 전혀 없는 산복도로 숲길 안쪽 위치',
              '영도 앞바다와 오륙도가 한눈에 내려다보이는 독립 테라스',
              '지역 어르신들이 채취한 야생 쑥차 및 발효 약초차 제공'
            ],
            tags: ['#AI추천', '#산복도로바다전망', '#로컬다원', '#외지인비율5%미만'],
            recentTrend: '▲ 최근 로컬 30일 관심 급상승',
            transitTip: '남포역에서 7번 버스로 14분',
            crowdDensity: '혼잡도 6% (매우 여유)',
            crowdPercent: 6,
            touristRatio: '낮음 8%',
            localRevisitScore: 91,
            currentSeatsOrTeams: '매우 여유 (2팀)',
            shortDesc: '관광객의 발길이 닿지 않는 영도 봉래산 중턱, 고요한 숲과 바다를 동시에 품은 힐링 다원입니다.',
            fullDesc: '북적이는 해안가를 피해 산복도로 고지대에 위치한 비밀스러운 찻집입니다. 영도 바다를 굽어보며 따스한 수제 찻잔을 기울일 수 있습니다.',
            editorTips: [
              { type: 'time', title: '오후 4시 햇살이 스미는 원목 툇마루 좌석', description: '바다에 반사되는 윤슬을 가장 편안하게 감상할 수 있습니다.' },
              { type: 'transit', title: '마을버스 영도 3번 종점 하차 도보 2분', description: '골목길 경사가 있으니 편한 신발 착용을 권장합니다.' },
              { type: 'menu', title: '봉래산 야생 쑥차 & 제주 메밀 다식', description: '은은하고 구수한 향이 마음을 편안하게 해줍니다.' }
            ],
            images: [
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
              'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80'
            ],
            isSaved: false,
            isVisited: false,
            mapPosition: { x: 44, y: 70 },
            aiGenerated: true
          }
        ]
      });
    }

    const ai = getAiClient();
    const prompt = `당신은 부산 N차(재방문) 여행자를 위한 최정상 로컬 트래블 큐레이터이자 Hidden Score 알고리즘 엔진입니다.
이미 유명한 관광지(예: 해운대 해수욕장, 광안리 수변공원, 감천문화마을, 더베이101, 자갈치시장, 태종대 등)에 식상한 여행자를 위해, 실제로 부산 현지인들이나 매니아층만 아는 숨겨진 진짜 로컬 히든 스팟을 2~3개 추천해주세요.

사용자 정보 및 선호도:
- 원하는 취향/무드: "${preference}"
- 선호 지역: "${targetRegion}" (전체인 경우 영도구, 전포·서면, 망미동, 동구·초량, 기장·송정 중 최적 추천)
- 이미 가본 곳들(추천에서 엄격히 제외해야 함): [${visitedPlaces.join(', ')}]
- 최소 요구 Hidden Score: ${minScore}점 이상 (0~100점 만점 척도)

각 스팟에 대해:
1. 부산의 실제 위치 기반 (영도, 전포, 망미, 초량, 청사포, 문현, 좌천 등 숨은 골목)
2. Hidden Score (80~95 사이):
   - rarity (리뷰 희소성: 대중 리뷰는 적으나 숨은 매니아층 중심, 85~98)
   - quality (만족도 및 품질: 평점 4.8 이상 극찬 위주, 88~98)
   - growth (최근 성장성: 최근 30일 로컬 저장량 증가, 78~95)
   - freshness (신선도 보정: 단기 바이럴 아닌 꾸준한 로컬 관심, 82~96)
3. 왜 나에게 추천되었나요? 3가지 구체적 근거
4. 로컬 에디터 추천 팁 3가지 (시간대 꿀팁, 대중교통 팁, 시그니처 메뉴/체험)
5. 외지인 밀도(%), 혼잡도(%), 현지 재방문 점수`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  subCategory: { type: Type.STRING },
                  region: { type: Type.STRING },
                  district: { type: Type.STRING },
                  address: { type: Type.STRING },
                  hiddenScore: { type: Type.INTEGER },
                  scoreLabel: { type: Type.STRING },
                  scoreBreakdown: {
                    type: Type.OBJECT,
                    properties: {
                      rarity: { type: Type.INTEGER },
                      quality: { type: Type.INTEGER },
                      growth: { type: Type.INTEGER },
                      freshness: { type: Type.INTEGER },
                    },
                    required: ['rarity', 'quality', 'growth', 'freshness'],
                  },
                  matchRate: { type: Type.INTEGER },
                  matchReason: { type: Type.STRING },
                  detailedWhy: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  recentTrend: { type: Type.STRING },
                  transitTip: { type: Type.STRING },
                  crowdDensity: { type: Type.STRING },
                  crowdPercent: { type: Type.INTEGER },
                  touristRatio: { type: Type.STRING },
                  localRevisitScore: { type: Type.INTEGER },
                  currentSeatsOrTeams: { type: Type.STRING },
                  shortDesc: { type: Type.STRING },
                  fullDesc: { type: Type.STRING },
                  editorTips: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ['type', 'title', 'description'],
                    },
                  },
                },
                required: [
                  'name',
                  'category',
                  'region',
                  'district',
                  'address',
                  'hiddenScore',
                  'scoreBreakdown',
                  'matchRate',
                  'matchReason',
                  'detailedWhy',
                  'tags',
                  'transitTip',
                  'crowdDensity',
                  'touristRatio',
                  'localRevisitScore',
                  'shortDesc',
                  'editorTips',
                ],
              },
            },
          },
          required: ['spots'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{"spots":[]}');

    // Attach imagery and coordinates
    const curatedImages = [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80',
    ];

    const spotsWithMeta = parsedData.spots.map((spot: any, index: number) => {
      const fallbackImg = curatedImages[(index + Math.floor(Math.random() * 3)) % curatedImages.length];
      const secondImg = curatedImages[(index + 3) % curatedImages.length];
      
      // Calculate random map relative coordinate within Busan map bounds
      let x = 45;
      let y = 60;
      if (spot.region?.includes('영도')) {
        x = 42 + Math.floor(Math.random() * 10);
        y = 66 + Math.floor(Math.random() * 12);
      } else if (spot.region?.includes('전포') || spot.region?.includes('서면')) {
        x = 52 + Math.floor(Math.random() * 10);
        y = 30 + Math.floor(Math.random() * 12);
      } else if (spot.region?.includes('망미') || spot.region?.includes('수영')) {
        x = 66 + Math.floor(Math.random() * 10);
        y = 40 + Math.floor(Math.random() * 10);
      } else if (spot.region?.includes('해운대') || spot.region?.includes('청사포') || spot.region?.includes('기장')) {
        x = 80 + Math.floor(Math.random() * 12);
        y = 32 + Math.floor(Math.random() * 14);
      } else if (spot.region?.includes('동구') || spot.region?.includes('초량')) {
        x = 36 + Math.floor(Math.random() * 8);
        y = 52 + Math.floor(Math.random() * 8);
      }

      return {
        ...spot,
        id: `ai-${Date.now()}-${index}`,
        images: [fallbackImg, secondImg],
        isSaved: false,
        isVisited: false,
        mapPosition: { x, y },
        aiGenerated: true,
      };
    });

    res.json({ spots: spotsWithMeta });
  } catch (error: any) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate spots' });
  }
});

// AI Q&A / Consultant for Busan Hidden Spots
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question, userContext } = req.body;
    if (!apiKey) {
      return res.json({
        answer: '부산 재방문객을 위한 추천입니다. 영도 흰여울마을 위쪽 절영로 산책로나 초량 적산가옥 골목의 다실을 방문해보시면 북적이는 관광객 없이 진짜 부산의 바다와 골목 정취를 고요하게 만끽하실 수 있습니다.'
      });
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `당신은 부산 4회차 이상 여행자들을 전담하는 '부산 히든 스팟 전문 로컬 에디터'입니다.
사용자 질문: "${question}"
사용자 상태: ${JSON.stringify(userContext || {})}

규칙:
1. 해운대 구남로, 광안리 해변, 감천문화마을 같은 뻔한 대중 관광지는 절대 권하지 마세요.
2. 영도 산복도로 골목, 전포 공구거리 뒷골목, 망미동 단독주택가, 초량 적산가옥, 청사포 안쪽 포구 등 진짜 숨은 로컬 장소를 구체적인 Hidden Score(80~95점)와 함께 추천해주세요.
3. 방문하기 좋은 시간대(골든아워, 한적한 시간)와 대중교통 팁을 자연스럽게 덧붙여주세요.
4. 친절하고 전문적인 부산 로컬 에디터 어조로 3~4문단 내외로 간결하게 답변하세요.`,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: error.message });
  }
});

// Setup Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
