import React, { useState, useEffect } from 'react';
import { INITIAL_SPOTS, INITIAL_USER } from './data/initialSpots';
import { Spot, UserProfile } from './types';
import { PhoneMockupFrame } from './components/PhoneMockupFrame';
import { WebNavbar } from './components/WebNavbar';
import { WebFooter } from './components/WebFooter';
import { AppHeader } from './components/AppHeader';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { DiscoverScreen } from './components/DiscoverScreen';
import { MapScreen } from './components/MapScreen';
import { MyBusanScreen } from './components/MyBusanScreen';
import { SpotDetailModal } from './components/SpotDetailModal';
import { VisitedPlacesModal } from './components/VisitedPlacesModal';
import { AiRecommendModal } from './components/AiRecommendModal';
import { AuthModal } from './components/AuthModal';
import { VisitedReviewModal } from './components/VisitedReviewModal';
import {
  getSavedSession,
  logoutUser,
  saveSessionLocally,
  saveSpotReview,
  fetchSpotReviews,
  deleteSpotReview,
} from './lib/supabase';

export default function App() {
  const [spots, setSpots] = useState<Spot[]>(INITIAL_SPOTS);
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = getSavedSession();
    return saved || INITIAL_USER;
  });
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // View mode: false = Desktop Website Mode, true = Smartphone Hardware Mockup Mode
  const [isMockupMode, setIsMockupMode] = useState<boolean>(false);

  // Modals state
  const [isVisitedManagerOpen, setIsVisitedManagerOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [reviewSpot, setReviewSpot] = useState<Spot | null>(null);

  // 초기 실행 시 저장된 세션이 없으면 로그인/회원가입 창 띄우기
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    return !getSavedSession();
  });

  // Supabase 및 로컬에 저장된 '가봤어요' 리뷰 데이터 로드 & 스팟에 동기화
  useEffect(() => {
    async function loadReviews() {
      try {
        const reviews = await fetchSpotReviews();
        if (reviews && Object.keys(reviews).length > 0) {
          setSpots((prev) =>
            prev.map((spot) => {
              const review = reviews[spot.id];
              if (review) {
                return {
                  ...spot,
                  isVisited: true,
                  myReview: review,
                };
              }
              return spot;
            })
          );
        }
      } catch (err) {
        console.warn('Failed to load spot reviews:', err);
      }
    }
    loadReviews();
  }, []);

  // Toggle spot save state
  const handleToggleSave = (spotId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSpots((prev) =>
      prev.map((s) => (s.id === spotId ? { ...s, isSaved: !s.isSaved } : s))
    );
    setUser((prev) => {
      const target = spots.find((s) => s.id === spotId);
      const isCurrentlySaved = target?.isSaved ?? false;
      return {
        ...prev,
        savedCount: isCurrentlySaved ? Math.max(0, prev.savedCount - 1) : prev.savedCount + 1,
      };
    });
  };

  // '가봤어요' 클릭 시: 별점 및 한줄평을 작성하는 모달 열기
  const handleToggleVisited = (spotId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = spots.find((s) => s.id === spotId);
    if (!target) return;
    setReviewSpot(target);
  };

  // 별점 및 한줄평 저장 핸들러 (Supabase & Local)
  const handleSaveReview = async (reviewInput: { rating: number; comment: string }) => {
    if (!reviewSpot) return;

    const result = await saveSpotReview({
      spotId: reviewSpot.id,
      spotName: reviewSpot.name,
      userId: user.id || 'guest',
      userName: user.name,
      userAvatar: user.avatarUrl,
      rating: reviewInput.rating,
      comment: reviewInput.comment,
    });

    const updatedReview = result.review;

    // 스팟 상태 갱신
    setSpots((prev) =>
      prev.map((s) =>
        s.id === reviewSpot.id
          ? { ...s, isVisited: true, myReview: updatedReview }
          : s
      )
    );

    // 상세 모달이 열려있다면 상세 모달도 갱신
    if (selectedSpot && selectedSpot.id === reviewSpot.id) {
      setSelectedSpot((prev) =>
        prev ? { ...prev, isVisited: true, myReview: updatedReview } : null
      );
    }

    // 유저 프로필 탐험 통계 갱신
    setUser((prev) => {
      const currentVisited = prev.visitedPlaces || [];
      const updatedList = currentVisited.includes(reviewSpot.name)
        ? currentVisited
        : [...currentVisited, reviewSpot.name];

      const updatedUser = {
        ...prev,
        visitedPlaces: updatedList,
        excludedVisitedCount: updatedList.length,
        discoveredCount: prev.discoveredCount + (reviewSpot.isVisited ? 0 : 1),
      };
      saveSessionLocally(updatedUser);
      return updatedUser;
    });
  };

  // '가봤어요' 및 리뷰 삭제/취소 핸들러
  const handleDeleteReview = async () => {
    if (!reviewSpot) return;

    await deleteSpotReview(reviewSpot.id, user.id);

    setSpots((prev) =>
      prev.map((s) =>
        s.id === reviewSpot.id
          ? { ...s, isVisited: false, myReview: undefined }
          : s
      )
    );

    if (selectedSpot && selectedSpot.id === reviewSpot.id) {
      setSelectedSpot((prev) =>
        prev ? { ...prev, isVisited: false, myReview: undefined } : null
      );
    }

    setUser((prev) => {
      const currentVisited = prev.visitedPlaces || [];
      const updatedList = currentVisited.filter((name) => name !== reviewSpot.name);
      const updatedUser = {
        ...prev,
        visitedPlaces: updatedList,
        excludedVisitedCount: updatedList.length,
        discoveredCount: Math.max(0, prev.discoveredCount - 1),
      };
      saveSessionLocally(updatedUser);
      return updatedUser;
    });
  };

  // Add newly generated AI spots
  const handleAddAiSpots = (newSpots: Spot[]) => {
    setSpots((prev) => [...newSpots, ...prev]);
    if (newSpots.length > 0) {
      setSelectedSpot(newSpots[0]);
    }
  };

  // Update visited places list from modal
  const handleUpdateVisitedList = (newList: string[]) => {
    setUser((prev) => ({
      ...prev,
      visitedPlaces: newList,
      excludedVisitedCount: newList.length,
    }));
  };

  // Update user profile
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const merged = {
        ...prev,
        ...updated,
      };
      saveSessionLocally(merged);
      return merged;
    });
  };

  // Auth Handlers
  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(INITIAL_USER);
    setIsAuthModalOpen(true);
  };

  // Determine header title based on active tab for mobile
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Hidden Spot';
      case 'discover':
        return '새로운 스팟 발견';
      case 'map':
        return '로컬 히든 맵';
      case 'mybusan':
        return '마이부산 보관함';
      default:
        return 'Hidden Spot';
    }
  };

  const savedSpotsCount = spots.filter((s) => s.isSaved && !s.isVisited).length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col antialiased selection:bg-rose-500 selection:text-white">
      {/* ======================================================== */}
      {/* 1. DESKTOP WEBSITE MODE (Full Web Page Layout)           */}
      {/* ======================================================== */}
      {!isMockupMode ? (
        <div className="w-full min-h-screen flex flex-col bg-stone-50">
          {/* Top Web Navbar */}
          <WebNavbar
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            user={user}
            savedCount={savedSpotsCount}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
            aiLoading={aiLoading}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onToggleViewMode={() => setIsMockupMode(true)}
            isMockupMode={false}
          />

          {/* Centered Web Content Container */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
            {activeTab === 'home' && (
              <HomeScreen
                spots={spots}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                onSelectSpot={setSelectedSpot}
                onToggleSave={handleToggleSave}
                onToggleVisited={handleToggleVisited}
                onOpenAiGenerator={() => setIsAiModalOpen(true)}
                isWebMode={true}
              />
            )}

            {activeTab === 'discover' && (
              <DiscoverScreen
                spots={spots}
                onSelectSpot={setSelectedSpot}
                onToggleSave={handleToggleSave}
                onToggleVisited={handleToggleVisited}
                onOpenVisitedManager={() => setIsVisitedManagerOpen(true)}
                onGoToMap={() => setActiveTab('map')}
                isWebMode={true}
              />
            )}

            {activeTab === 'map' && (
              <MapScreen
                spots={spots}
                onSelectSpot={setSelectedSpot}
                onToggleSave={handleToggleSave}
                onToggleVisited={handleToggleVisited}
                onOpenVisitedManager={() => setIsVisitedManagerOpen(true)}
                isWebMode={true}
              />
            )}

            {activeTab === 'mybusan' && (
              <MyBusanScreen
                user={user}
                spots={spots}
                onSelectSpot={setSelectedSpot}
                onToggleVisited={handleToggleVisited}
                onOpenVisitedManager={() => setIsVisitedManagerOpen(true)}
                onGoToMap={() => setActiveTab('map')}
                onUpdateProfile={handleUpdateProfile}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
                isWebMode={true}
              />
            )}
          </main>

          {/* Web Footer */}
          <WebFooter
            onSelectRegion={setSelectedRegion}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
          />
        </div>
      ) : (
        <PhoneMockupFrame
          onOpenAiGenerator={() => setIsAiModalOpen(true)}
          aiLoading={aiLoading}
          onToggleViewMode={() => setIsMockupMode(false)}
        >
          {/* Mobile App Header */}
          <AppHeader
            title={getHeaderTitle()}
            selectedRegion={
              selectedRegion === '전체'
                ? '부산 전체'
                : selectedRegion.startsWith('부산')
                ? selectedRegion
                : `부산 ${selectedRegion}`
            }
            onSelectRegion={setSelectedRegion}
            user={user}
            onOpenSearch={() => setActiveTab('discover')}
            onOpenProfile={() => setActiveTab('mybusan')}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
          />

          {/* Main Mobile Screen Views */}
          {activeTab === 'home' && (
            <HomeScreen
              spots={spots}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              onSelectSpot={setSelectedSpot}
              onToggleSave={handleToggleSave}
              onToggleVisited={handleToggleVisited}
              onOpenAiGenerator={() => setIsAiModalOpen(true)}
              isWebMode={false}
            />
          )}

          {activeTab === 'discover' && (
            <DiscoverScreen
              spots={spots}
              onSelectSpot={setSelectedSpot}
              onToggleSave={handleToggleSave}
              onToggleVisited={handleToggleVisited}
              onOpenVisitedManager={() => setIsVisitedManagerOpen(true)}
              onGoToMap={() => setActiveTab('map')}
              isWebMode={false}
            />
          )}

          {activeTab === 'map' && (
            <MapScreen
              spots={spots}
              onSelectSpot={setSelectedSpot}
              onToggleSave={handleToggleSave}
              onToggleVisited={handleToggleVisited}
              onOpenVisitedManager={() => setIsVisitedManagerOpen(true)}
              isWebMode={false}
            />
          )}

          {activeTab === 'mybusan' && (
            <MyBusanScreen
              user={user}
              spots={spots}
              onSelectSpot={setSelectedSpot}
              onToggleVisited={handleToggleVisited}
              onOpenVisitedManager={() => setIsVisitedManagerOpen(true)}
              onGoToMap={() => setActiveTab('map')}
              onUpdateProfile={handleUpdateProfile}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
              isWebMode={false}
            />
          )}

          {/* Mobile Bottom Navigation */}
          <BottomNav
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            savedCount={savedSpotsCount}
          />
        </PhoneMockupFrame>
      )}

      {/* ======================================================== */}
      {/* 3. MODALS (Accessible in both Web and Mockup mode)       */}
      {/* ======================================================== */}

      {/* Auth Modal (Login & Sign-Up on initial launch) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onSuccess={handleAuthSuccess}
        onSkip={() => setIsAuthModalOpen(false)}
      />

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <SpotDetailModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          onToggleSave={(id) => handleToggleSave(id)}
          onToggleVisited={(id) => handleToggleVisited(id)}
        />
      )}

      {/* Visited Places Manager Modal */}
      {isVisitedManagerOpen && (
        <VisitedPlacesModal
          visitedList={user.visitedPlaces}
          onUpdateVisitedList={handleUpdateVisitedList}
          onClose={() => setIsVisitedManagerOpen(false)}
        />
      )}

      {/* '가봤어요' 별점 & 한줄평 Supabase 작성/수정 모달 */}
      {reviewSpot && (
        <VisitedReviewModal
          spot={reviewSpot}
          user={user}
          isOpen={Boolean(reviewSpot)}
          onClose={() => setReviewSpot(null)}
          onSaveReview={handleSaveReview}
          onDeleteReview={handleDeleteReview}
        />
      )}

      {/* AI Recommendation Generator Modal */}
      {isAiModalOpen && (
        <AiRecommendModal
          visitedList={user.visitedPlaces}
          onAddAiSpots={handleAddAiSpots}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}
    </div>
  );
}
