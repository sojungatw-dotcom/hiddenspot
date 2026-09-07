import React, { useState } from 'react';
import { INITIAL_SPOTS, INITIAL_USER } from './data/initialSpots';
import { Spot, UserProfile } from './types';
import { PhoneMockupFrame } from './components/PhoneMockupFrame';
import { AppHeader } from './components/AppHeader';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { DiscoverScreen } from './components/DiscoverScreen';
import { MapScreen } from './components/MapScreen';
import { MyBusanScreen } from './components/MyBusanScreen';
import { SpotDetailModal } from './components/SpotDetailModal';
import { VisitedPlacesModal } from './components/VisitedPlacesModal';
import { AiRecommendModal } from './components/AiRecommendModal';

export default function App() {
  const [spots, setSpots] = useState<Spot[]>(INITIAL_SPOTS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedRegion, setSelectedRegion] = useState<string>('부산 영도구 / 전포동');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Modals state
  const [isVisitedManagerOpen, setIsVisitedManagerOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

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

  // Toggle visited spot (which excludes it from recommendation)
  const handleToggleVisited = (spotId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = spots.find((s) => s.id === spotId);
    if (!target) return;

    const willBeVisited = !target.isVisited;
    setSpots((prev) =>
      prev.map((s) => (s.id === spotId ? { ...s, isVisited: willBeVisited } : s))
    );

    setUser((prev) => {
      const currentVisited = prev.visitedPlaces || [];
      const updatedList = willBeVisited
        ? [...currentVisited, target.name]
        : currentVisited.filter((name) => name !== target.name);

      return {
        ...prev,
        visitedPlaces: updatedList,
        excludedVisitedCount: updatedList.length,
        discoveredCount: willBeVisited ? prev.discoveredCount + 1 : Math.max(0, prev.discoveredCount - 1),
      };
    });
  };

  // Add newly generated AI spots
  const handleAddAiSpots = (newSpots: Spot[]) => {
    setSpots((prev) => [...newSpots, ...prev]);
    // Automatically open first new spot
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
    setUser((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  // Determine header title based on active tab
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

  return (
    <PhoneMockupFrame
      onOpenAiGenerator={() => setIsAiModalOpen(true)}
      aiLoading={aiLoading}
    >
      {/* Mobile App Header */}
      <AppHeader
        title={getHeaderTitle()}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        user={user}
        onOpenSearch={() => setActiveTab('discover')}
        onOpenProfile={() => setActiveTab('mybusan')}
        onOpenAiGenerator={() => setIsAiModalOpen(true)}
      />

      {/* Main Screen Views */}
      {activeTab === 'home' && (
        <HomeScreen
          spots={spots}
          selectedRegion={selectedRegion.includes('전체') ? '전체' : selectedRegion.split(' ')[1] || '전체'}
          onSelectRegion={(reg) => setSelectedRegion(reg === '전체' ? '부산 전체' : `부산 ${reg}`)}
          onSelectSpot={setSelectedSpot}
          onToggleSave={handleToggleSave}
          onToggleVisited={handleToggleVisited}
          onOpenAiGenerator={() => setIsAiModalOpen(true)}
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
        />
      )}

      {activeTab === 'map' && (
        <MapScreen
          spots={spots}
          onSelectSpot={setSelectedSpot}
          onToggleSave={handleToggleSave}
          onToggleVisited={handleToggleVisited}
          onOpenVisitedManager={() => setIsVisitedManagerOpen(true)}
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
        />
      )}

      {/* Mobile App Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        savedCount={spots.filter((s) => s.isSaved && !s.isVisited).length}
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

      {/* AI Recommendation Generator Modal */}
      {isAiModalOpen && (
        <AiRecommendModal
          visitedList={user.visitedPlaces}
          onAddAiSpots={handleAddAiSpots}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}
    </PhoneMockupFrame>
  );
}
