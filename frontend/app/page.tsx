"use client";

import { useState } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";
import { IdentityRegistration } from "@/components/identity/IdentityRegistration";
import { Sidebar } from "@/components/layout/Sidebar";
import { SpacePreviewWindow } from "@/components/space/SpacePreviewWindow";
import { SpaceList } from "@/components/space/SpaceList";
import { SubscribedSpaces } from "@/components/space/SubscribedSpaces";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { RetroPanel } from "@/components/common/RetroPanel";
import { RetroButton } from "@/components/common/RetroButton";

export default function Home() {
  const currentAccount = useCurrentAccount();
  const [hasIdentity, setHasIdentity] = useState(false);
  const [activeView, setActiveView] = useState<'explore' | 'my-space' | 'subscribed' | 'settings'>('explore');

  // Welcome screen for non-connected users
  if (!currentAccount) {
    return (
      <main className="h-screen flex flex-col md:flex-row overflow-hidden" style={{ backgroundColor: '#fafafa' }}>
        {/* Sidebar - Hidden on mobile when not connected */}
        <div className="hidden md:block">
          <Sidebar onViewChange={setActiveView} activeView={activeView} isDisabled={true} />
        </div>
        
        {/* Welcome content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <RetroPanel className="p-6 md:p-12 max-w-2xl w-full">
            <div className="text-center">
              <h1 
                className="text-3xl md:text-6xl font-bold text-gray-800 mb-3 md:mb-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Atrium
              </h1>
              <p 
                className="text-sm md:text-xl text-gray-600 mb-4 md:mb-8"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Web3 Creator Platform - Connect creators and fans in interactive 3D spaces
              </p>
              <p 
                className="text-gray-500 text-xs md:text-sm mb-6"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Please connect your wallet to get started
              </p>
              <div className="flex justify-center">
                <ConnectButton
                  connectText="Connect Wallet"
                  style={{ fontFamily: 'Georgia, serif' }}
                />
              </div>
            </div>
          </RetroPanel>
        </div>
      </main>
    );
  }

  // Identity registration for new users
  if (!hasIdentity) {
    return (
      <main className="h-screen flex flex-col-reverse md:flex-row overflow-hidden" style={{ backgroundColor: '#fafafa' }}>
        {/* Sidebar - only Explore enabled */}
        <Sidebar onViewChange={setActiveView} activeView="explore" isRegistering={true} />
        
        {/* Identity registration content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 md:p-4">
          <IdentityRegistration onComplete={() => setHasIdentity(true)} />
        </div>
      </main>
    );
  }

  // Main application layout
  return (
    <main className="h-screen flex flex-col-reverse md:flex-row overflow-hidden" style={{ backgroundColor: '#fafafa' }}>
      {/* Sidebar - Desktop left, Mobile bottom */}
      <Sidebar onViewChange={setActiveView} activeView={activeView} />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 p-2 md:p-4 overflow-hidden">
        {activeView === 'explore' ? (
          <SpaceList />
        ) : activeView === 'my-space' ? (
        <SpacePreviewWindow />
        ) : activeView === 'subscribed' ? (
          <SubscribedSpaces />
        ) : activeView === 'settings' ? (
          <SettingsPage />
        ) : (
          <RetroPanel className="h-full flex items-center justify-center">
            <p className="text-gray-500">頁面開發中...</p>
          </RetroPanel>
        )}
      </div>
    </main>
  );
}

