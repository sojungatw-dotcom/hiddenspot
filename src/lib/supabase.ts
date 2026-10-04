import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, SpotReview } from '../types';

// Supabase 클라이언트 싱글톤 관리
let supabaseClient: SupabaseClient | null = null;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.trim() !== '' &&
    SUPABASE_ANON_KEY.trim() !== '' &&
    !SUPABASE_URL.includes('your-project')
  );
};

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseClient;
};

// 로컬 스토리지 키 상수
const LOCAL_USERS_KEY = 'hidden_busan_registered_users';
const LOCAL_SESSION_KEY = 'hidden_busan_auth_session';

interface StoredUser {
  id: string;
  email: string;
  password?: string;
  profile: UserProfile;
}

// 로컬 사용자 DB 헬퍼 (Supabase 키 미설정 시 또는 오프라인 Fallback)
const getLocalUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalUsers = (users: StoredUser[]) => {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save local users', err);
  }
};

export const getSavedSession = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSessionLocally = (profile: UserProfile | null) => {
  try {
    if (profile) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch (err) {
    console.error('Failed to save session', err);
  }
};

/**
 * 회원가입 (Supabase Auth + Fallback Local Auth)
 */
export async function registerUser(params: {
  email: string;
  password: string;
  name: string;
  bio?: string;
  travelStyles?: string[];
  avatarUrl?: string;
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const { email, password, name, bio, travelStyles, avatarUrl } = params;

  const defaultAvatar = avatarUrl || '/profile.jpg';
  const defaultTitle = '부산 1회차 탐험가 · 탐험 레벨 1';

  const newProfile: UserProfile = {
    id: 'user_' + Date.now(),
    email,
    name,
    level: 1,
    levelTitle: defaultTitle,
    avatarUrl: defaultAvatar,
    bio: bio || '부산의 숨겨진 골목길과 로컬 스팟을 탐험하고 있어요.',
    travelStyles: travelStyles || ['조용한 골목길', '전포 LP/바'],
    discoveredCount: 0,
    savedCount: 0,
    excludedVisitedCount: 0,
    regionExploration: [
      { region: '영도구', title: '봉래산·흰여울', percentage: 10, color: 'from-amber-400 to-orange-400' },
      { region: '전포·서면', title: '전포 사잇길', percentage: 15, color: 'from-rose-400 to-pink-500' },
      { region: '수영·망미', title: '망미 골목', percentage: 5, color: 'from-emerald-400 to-teal-500' },
    ],
    visitedPlaces: ['해운대 해수욕장', '광안리 해수욕장'],
    savedSpotIds: [],
  };

  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            avatarUrl: defaultAvatar,
            levelTitle: defaultTitle,
            bio: newProfile.bio,
            travelStyles: newProfile.travelStyles,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        newProfile.id = data.user.id;

        // Supabase profiles 테이블에 저장 시도 (테이블이 구성되어 있는 경우)
        try {
          await client.from('profiles').upsert({
            id: data.user.id,
            email,
            name,
            avatar_url: defaultAvatar,
            level_title: defaultTitle,
            bio: newProfile.bio,
            travel_styles: newProfile.travelStyles,
            updated_at: new Date().toISOString(),
          });
        } catch {
          // profiles 테이블이 아직 없어도 auth는 정상 동작
        }
      }
    } catch (err: unknown) {
      console.warn('Supabase sign-up failed, falling back to local storage', err);
      // 계속 진행하여 로컬에도 백업 저장
    }
  }

  // 로컬 백업 저장
  const localUsers = getLocalUsers();
  const existing = localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { success: false, error: '이미 등록된 이메일 계정입니다.' };
  }

  localUsers.push({
    id: newProfile.id || 'user_' + Date.now(),
    email,
    password, // 로컬 폴백용
    profile: newProfile,
  });
  saveLocalUsers(localUsers);
  saveSessionLocally(newProfile);

  return { success: true, user: newProfile };
}

/**
 * 로그인 (Supabase Auth + Fallback Local Auth)
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Supabase에서 오류 발생 시(키는 있지만 계정이 없는 경우 등)
        return { success: false, error: error.message };
      }

      if (data.user) {
        const metadata = data.user.user_metadata || {};
        
        // Supabase profiles 테이블에서 사용자 추가 정보 조회 시도
        let profileData: Partial<UserProfile> = {};
        try {
          const { data: dbProfile } = await client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (dbProfile) {
            profileData = {
              name: dbProfile.name,
              avatarUrl: dbProfile.avatar_url,
              levelTitle: dbProfile.level_title,
              bio: dbProfile.bio,
              travelStyles: dbProfile.travel_styles,
            };
          }
        } catch {
          // profiles 테이블 없으면 metadata 사용
        }

        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          name: profileData.name || metadata.name || email.split('@')[0],
          level: 1,
          levelTitle: profileData.levelTitle || metadata.levelTitle || '부산 1회차 탐험가 · 탐험 레벨 1',
          avatarUrl: profileData.avatarUrl || metadata.avatarUrl || '/profile.jpg',
          bio: profileData.bio || metadata.bio || '부산의 숨겨진 로컬 스팟을 탐험하고 있어요.',
          travelStyles: profileData.travelStyles || metadata.travelStyles || ['조용한 골목길', '전포 LP/바'],
          discoveredCount: 0,
          savedCount: 0,
          excludedVisitedCount: 0,
          regionExploration: [
            { region: '영도구', title: '봉래산·흰여울', percentage: 10, color: 'from-amber-400 to-orange-400' },
            { region: '전포·서면', title: '전포 사잇길', percentage: 15, color: 'from-rose-400 to-pink-500' },
            { region: '수영·망미', title: '망미 골목', percentage: 5, color: 'from-emerald-400 to-teal-500' },
          ],
          visitedPlaces: ['해운대 해수욕장', '광안리 해수욕장'],
          savedSpotIds: [],
        };

        saveSessionLocally(profile);
        return { success: true, user: profile };
      }
    } catch (err: unknown) {
      console.warn('Supabase sign-in error, trying local fallback:', err);
    }
  }

  // Supabase 키가 없거나 로컬 계정인 경우
  const localUsers = getLocalUsers();
  const matched = localUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (matched) {
    saveSessionLocally(matched.profile);
    return { success: true, user: matched.profile };
  }

  // 기본 데모 계정 제공 (초기 테스트 편의용)
  if (email === 'demo@busan.kr' && password === '12341234') {
    const demoProfile: UserProfile = {
      id: 'demo_user',
      email: 'demo@busan.kr',
      name: '김서연',
      level: 3,
      levelTitle: '부산 4회차 여행자 · 탐험 레벨 3',
      avatarUrl: '/profile.jpg',
      discoveredCount: 7,
      savedCount: 24,
      excludedVisitedCount: 18,
      regionExploration: [
        { region: '영도구', title: '봉래산·흰여울', percentage: 48, color: 'from-amber-400 to-orange-400' },
        { region: '전포·서면', title: '전포 사잇길', percentage: 65, color: 'from-rose-400 to-pink-500' },
        { region: '수영·망미', title: '망미 골목', percentage: 22, color: 'from-emerald-400 to-teal-500' },
      ],
      visitedPlaces: [
        '해운대 해수욕장',
        '광안리 해수욕장 메인 로드',
        '감천문화마을',
        '태종대 전망대',
        '자갈치시장 메인 골목',
        '기장 아난티 코브 메인광장'
      ],
      savedSpotIds: ['spot-1', 'spot-2', 'spot-9'],
      bio: '부산 4회차, 북적이는 관광지보다 영도 골목길과 전포 뒷골목 LP바를 좋아해요.',
      travelStyles: ['조용한 골목길', '바다 전망 티룸', '전포 LP/바', '독립서점'],
    };
    saveSessionLocally(demoProfile);
    return { success: true, user: demoProfile };
  }

  return { success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' };
}

/**
 * 로그아웃
 */
export async function logoutUser(): Promise<void> {
  const client = getSupabase();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign-out error', err);
    }
  }
  saveSessionLocally(null);
}

// ==========================================
// 스팟 '가봤어요' 별점 & 한줄평 (Spot Reviews)
// ==========================================
const LOCAL_REVIEWS_KEY = 'hidden_busan_spot_reviews';

/**
 * 로컬에 캐시된 리뷰 목록 가져오기 (spotId -> SpotReview)
 */
export function getLocalSpotReviews(): Record<string, SpotReview> {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * 로컬에 리뷰 목록 저장
 */
export function saveLocalSpotReviews(reviews: Record<string, SpotReview>): void {
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.error('Failed to save local spot reviews', err);
  }
}

/**
 * '가봤어요' 별점 & 한줄평 Supabase 및 로컬 저장
 */
export async function saveSpotReview(reviewData: {
  spotId: string;
  spotName: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; review: SpotReview; isSupabaseSaved: boolean; error?: string }> {
  const newReview: SpotReview = {
    id: 'rev_' + Date.now(),
    spotId: reviewData.spotId,
    spotName: reviewData.spotName,
    userId: reviewData.userId,
    userName: reviewData.userName || '익명의 여행자',
    userAvatar: reviewData.userAvatar || '/profile.jpg',
    rating: reviewData.rating,
    comment: reviewData.comment.trim(),
    createdAt: new Date().toISOString(),
  };

  let isSupabaseSaved = false;
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client
        .from('spot_reviews')
        .upsert(
          {
            spot_id: newReview.spotId,
            spot_name: newReview.spotName,
            user_id: newReview.userId || 'guest_user',
            user_name: newReview.userName,
            user_avatar: newReview.userAvatar,
            rating: newReview.rating,
            comment: newReview.comment,
            created_at: newReview.createdAt,
          },
          { onConflict: 'spot_id,user_id' }
        )
        .select();

      if (!error) {
        isSupabaseSaved = true;
        if (data && data[0]?.id) {
          newReview.id = data[0].id;
        }
      } else {
        console.warn('Supabase spot_reviews upsert note:', error.message);
      }
    } catch (err) {
      console.warn('Supabase review save error, saved locally instead:', err);
    }
  }

  // 로컬 스토리지에 항상 영구 보존 & 즉시 UI 반응
  const currentReviews = getLocalSpotReviews();
  currentReviews[newReview.spotId] = newReview;
  saveLocalSpotReviews(currentReviews);

  return {
    success: true,
    review: newReview,
    isSupabaseSaved,
  };
}

/**
 * 모든 스팟의 리뷰 조회 (Supabase 조회 후 로컬과 병합)
 */
export async function fetchSpotReviews(): Promise<Record<string, SpotReview>> {
  const localReviews = getLocalSpotReviews();
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client
        .from('spot_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const merged = { ...localReviews };
        data.forEach((row) => {
          if (row.spot_id) {
            merged[row.spot_id] = {
              id: row.id,
              spotId: row.spot_id,
              spotName: row.spot_name,
              userId: row.user_id,
              userName: row.user_name,
              userAvatar: row.user_avatar,
              rating: Number(row.rating) || 5,
              comment: row.comment || '',
              createdAt: row.created_at,
            };
          }
        });
        saveLocalSpotReviews(merged);
        return merged;
      }
    } catch (err) {
      console.warn('Failed to fetch reviews from Supabase:', err);
    }
  }

  return localReviews;
}

/**
 * '가봤어요' 방문 취소 시 리뷰 삭제
 */
export async function deleteSpotReview(
  spotId: string,
  userId?: string
): Promise<void> {
  const client = getSupabase();
  if (client) {
    try {
      let query = client.from('spot_reviews').delete().eq('spot_id', spotId);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      await query;
    } catch (err) {
      console.warn('Failed to delete review from Supabase:', err);
    }
  }

  const localReviews = getLocalSpotReviews();
  delete localReviews[spotId];
  saveLocalSpotReviews(localReviews);
}

