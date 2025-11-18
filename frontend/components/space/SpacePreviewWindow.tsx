'use client';

import React, { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { RetroPanel } from '@/components/common/RetroPanel';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroHeading } from '@/components/common/RetroHeading';
import { ThreeScene } from '@/components/3d/ThreeScene';
import { CreateSpaceForm } from '@/components/space/CreateSpaceForm';
import { useRouter } from 'next/navigation';

interface SpaceData {
  kioskId: string;
  name: string;
  description: string;
  configQuilt: string;
  creator: string;
}

export function SpacePreviewWindow() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const router = useRouter();
  const [userSpaces, setUserSpaces] = useState<SpaceData[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpaceListOpen, setIsSpaceListOpen] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  useEffect(() => {
    loadUserSpaces();
  }, [currentAccount]);

  const loadUserSpaces = async () => {
    try {
      setLoading(true);
      
      // TODO: Load user's spaces from chain
      // For now, use mock data
      const mockSpaces: SpaceData[] = [
        {
          kioskId: currentAccount ? '0x' + currentAccount.address.slice(2, 10) + '001' : '0x12345001',
          name: 'Art Gallery',
          description: 'My digital art collection and exhibitions',
          configQuilt: '',
          creator: currentAccount?.address || '0x123',
        },
        {
          kioskId: currentAccount ? '0x' + currentAccount.address.slice(2, 10) + '002' : '0x12345002',
          name: 'Workshop Studio',
          description: 'Interactive tutorials and creative workspace',
          configQuilt: '',
          creator: currentAccount?.address || '0x123',
        },
        {
          kioskId: currentAccount ? '0x' + currentAccount.address.slice(2, 10) + '003' : '0x12345003',
          name: 'Social Lounge',
          description: 'Community hangout and discussion space',
          configQuilt: '',
          creator: currentAccount?.address || '0x123',
        },
      ];
      
      console.log('Loading spaces:', mockSpaces);
      setUserSpaces(mockSpaces);
      setSelectedSpace(mockSpaces[0]); // Select first space by default
      
    } catch (error) {
      console.error('Failed to load spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = () => {
    setIsCreatingSpace(true);
  };

  const handleSpaceCreated = () => {
    setIsCreatingSpace(false);
    loadUserSpaces(); // Refresh the spaces list
  };

  const handleCancelCreate = () => {
    setIsCreatingSpace(false);
  };

  const handleEnterSpace = () => {
    if (selectedSpace) {
      router.push(`/space/${selectedSpace.kioskId}`);
    }
  };

  const handleSelectSpace = (space: SpaceData) => {
    setSelectedSpace(space);
  };

  if (loading) {
    return (
      <RetroPanel className="h-full flex items-center justify-center p-4">
        <div 
          className="text-center"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          <div 
            className="inline-block animate-spin text-3xl md:text-4xl text-gray-400 mb-4"
          >
            ⟳
          </div>
          <p className="text-xs md:text-sm text-gray-600">Loading spaces...</p>
        </div>
      </RetroPanel>
    );
  }

  if (userSpaces.length === 0 && !isCreatingSpace) {
    return (
      <RetroPanel className="h-full flex flex-col">
        <RetroHeading 
          title="My Spaces"
          subtitle="Manage your creative 3D worlds"
          className="mb-0"
        />
        
        <div className="flex-1 flex items-center justify-center px-3 md:px-6 py-6 md:py-8">
          <div className="text-center max-w-md" style={{ fontFamily: 'Georgia, serif' }}>
            <div className="text-4xl md:text-6xl mb-4 md:mb-6">🏛️</div>
            <h3 className="text-lg md:text-xl text-gray-800 mb-2 md:mb-3">
              No Spaces Found
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
              You haven't created your space yet. Create one to start sharing your content with the world.
            </p>
            <RetroButton
              variant="primary"
              size="md"
              onClick={handleCreateSpace}
            >
              Create Your Space
            </RetroButton>
          </div>
        </div>
      </RetroPanel>
    );
  }
  
  // Show create form when no spaces exist and user wants to create one
  if (userSpaces.length === 0 && isCreatingSpace) {
    return (
      <RetroPanel className="h-full">
        <CreateSpaceForm 
          onClose={handleCancelCreate}
          onCreated={handleSpaceCreated}
        />
      </RetroPanel>
    );
  }

  return (
    <RetroPanel className="h-full flex flex-col">
      {/* Header */}
      <RetroHeading 
        title="My Spaces"
        subtitle="Manage your creative 3D worlds"
        className="mb-0"
      />

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile: Compact Space Selector */}
        <div className="md:hidden border-b relative" style={{ borderColor: '#d1d5db' }}>
          <div className="flex relative z-20">
            <div 
              className="flex-1 p-2 bg-gray-50 cursor-pointer flex items-center justify-between transition-colors duration-200"
              onClick={() => setIsSpaceListOpen(!isSpaceListOpen)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                  {selectedSpace ? selectedSpace.name : 'Select Space'}
                </span>
              </div>
              <span 
                className="text-sm text-gray-400 transition-transform duration-300 ease-in-out"
                style={{ transform: isSpaceListOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▼
              </span>
            </div>
            <div 
              className="border-l p-1" 
              style={{ 
                borderColor: '#d1d5db',
                background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
              }}
            >
              <RetroButton
                variant="primary"
                size="sm"
                onClick={handleCreateSpace}
              >
                +
              </RetroButton>
            </div>
          </div>
          
          {/* Mobile: Action Buttons for Selected Space */}
          {selectedSpace && (
            <div 
              className="p-2 border-t flex gap-2" 
              style={{ 
                borderColor: '#d1d5db',
                background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
              }}
            >
              <RetroButton
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => router.push(`/space/${selectedSpace.kioskId}/edit`)}
              >
                Edit
              </RetroButton>
              <RetroButton
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={handleEnterSpace}
              >
                Visit
              </RetroButton>
            </div>
          )}
          
          {/* Mobile: Collapsible Space List Overlay */}
          <div 
            className={`absolute left-0 right-0 bg-white border shadow-lg transition-all duration-300 ease-in-out overflow-hidden z-50 ${
              isSpaceListOpen 
                ? 'max-h-60 opacity-100 visible' 
                : 'max-h-0 opacity-0 invisible'
            }`}
            style={{ 
              top: '100%',
              borderColor: '#d1d5db',
              transform: isSpaceListOpen ? 'translateY(0)' : 'translateY(-10px)'
            }}
          >
            <div className="max-h-60 overflow-y-auto scrollbar-hidden">
              <div className="p-2 space-y-1.5">
                {loading ? (
                  <div className="p-2 text-xs text-gray-500 text-center" style={{ fontFamily: 'Georgia, serif' }}>
                    Loading spaces...
                  </div>
                ) : userSpaces.length === 0 ? (
                  <div className="p-2 text-xs text-gray-500 text-center" style={{ fontFamily: 'Georgia, serif' }}>
                    No spaces available
                  </div>
                ) : (
                  <>
                    {console.log('Rendering spaces:', userSpaces)}
                    {userSpaces.map((space) => (
                      <div 
                        key={space.kioskId}
                        className="cursor-pointer relative"
                        onClick={() => {
                          console.log('Selected space:', space.name);
                          handleSelectSpace(space);
                          setIsSpaceListOpen(false);
                        }}
                      >
                        <RetroPanel 
                          variant={selectedSpace?.kioskId === space.kioskId ? "inset" : "outset"}
                          className={`p-3 transition-all hover:shadow-sm ${
                            selectedSpace?.kioskId === space.kioskId ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div style={{ fontFamily: 'Georgia, serif' }}>
                            <h4 className="text-xs font-medium text-gray-800 mb-1 relative z-10">
                              {space.name}
                            </h4>
                            <p className="text-xs text-gray-600 relative z-10">
                              {space.description}
                            </p>
                          </div>
                        </RetroPanel>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
          
        </div>

        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Desktop: Spaces List Sidebar */}
          <div className="hidden md:flex w-80 flex-shrink-0 border-r" style={{ borderColor: '#d1d5db' }}>
            <div className="w-full flex flex-col">
              <div className="p-3 md:p-4 border-b" style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb' }}>
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                  Your Spaces ({userSpaces.length})
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-hidden">
                <div className="p-2 md:p-3 space-y-2">
                  {userSpaces.map((space) => (
                    <div 
                      key={space.kioskId}
                      className="cursor-pointer"
                      onClick={() => handleSelectSpace(space)}
                    >
                      <RetroPanel 
                        variant={selectedSpace?.kioskId === space.kioskId ? "inset" : "outset"}
                        className={`p-3 transition-all hover:shadow-sm ${
                          selectedSpace?.kioskId === space.kioskId ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div style={{ fontFamily: 'Georgia, serif' }}>
                          <h4 className="text-sm font-medium text-gray-800 mb-1">
                            {space.name}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {space.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {space.kioskId.slice(0, 8)}...{space.kioskId.slice(-4)}
                          </p>
                        </div>
                      </RetroPanel>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-3 md:p-4 border-t" style={{ borderColor: '#d1d5db' }}>
                <RetroButton
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={handleCreateSpace}
                >
                  + Create New Space
                </RetroButton>
              </div>
            </div>
          </div>

          {/* 3D Preview Area / Create Form */}
          <div className="flex-1 flex flex-col">
            {isCreatingSpace ? (
              /* Create Space Form */
              <CreateSpaceForm 
                onClose={handleCancelCreate}
                onCreated={handleSpaceCreated}
              />
            ) : selectedSpace ? (
              <>
                {/* 3D Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: '#f9fafb' }}>
          <ThreeScene
                      kioskId={selectedSpace.kioskId}
                      enableGallery={true}
          />
        </div>

        {/* Overlay Controls */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
          <RetroButton
            variant="secondary"
            size="sm"
            onClick={handleEnterSpace}
          >
                      <span className="hidden md:inline">Enter Full View</span>
                      <span className="md:hidden">Enter</span>
          </RetroButton>
        </div>
      </div>

                {/* Footer Actions - Desktop Only */}
      <div 
                  className="hidden md:flex px-3 md:px-4 py-3 border-t flex-col md:flex-row items-start md:items-center justify-between gap-3"
        style={{ 
          borderColor: '#d1d5db',
          backgroundColor: '#f9fafb',
                    fontFamily: 'Georgia, serif',
        }}
      >
                  <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Space ID
          </p>
                    <p className="text-xs text-gray-800">
                      {selectedSpace.kioskId.slice(0, 10)}...{selectedSpace.kioskId.slice(-8)}
          </p>
        </div>
        
                  <div className="flex gap-2 w-full md:w-auto">
          <RetroButton
            variant="secondary"
            size="sm"
                      className="flex-1 md:flex-none"
                      onClick={() => router.push(`/space/${selectedSpace.kioskId}/edit`)}
          >
            Edit
          </RetroButton>
          <RetroButton
            variant="primary"
            size="sm"
                      className="flex-1 md:flex-none"
            onClick={handleEnterSpace}
          >
            Visit
          </RetroButton>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center" style={{ fontFamily: 'Georgia, serif' }}>
                  <div className="text-4xl mb-4">🏛️</div>
                  <p className="text-sm text-gray-600">Select a space to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RetroPanel>
  );
}