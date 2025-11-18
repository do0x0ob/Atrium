'use client';

import { useCurrentAccount, ConnectButton } from '@mysten/dapp-kit';
import { RetroPanel } from '@/components/common/RetroPanel';
import { RetroHeading } from '@/components/common/RetroHeading';

export function SettingsPage() {
  const currentAccount = useCurrentAccount();

  return (
    <RetroPanel className="h-full flex flex-col">
      <RetroHeading 
        title="Settings"
        subtitle="Manage your account and preferences"
        className="mb-0"
      />

      {/* Wallet Section */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden px-3 md:px-6 pt-4 md:pt-6 pb-3 md:pb-6 space-y-4">
        <div>
          <h3 
            className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Wallet Connection
          </h3>
          
          <RetroPanel variant="inset" className="p-4">
            {currentAccount ? (
              <div className="space-y-3">
                <div>
                  <p 
                    className="text-xs text-gray-500 mb-1 uppercase tracking-wide"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Connected Address
                  </p>
                  <p 
                    className="text-sm font-mono text-gray-800 break-all"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {currentAccount.address}
                  </p>
                </div>
                
                <div className="pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <ConnectButton
                    connectText="Connect Wallet"
                    className="w-full md:w-auto"
                    style={{ fontFamily: 'Georgia, serif' }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p 
                  className="text-sm text-gray-600 mb-4"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  No wallet connected
                </p>
                <ConnectButton
                  connectText="Connect Wallet"
                  className="w-full md:w-auto"
                  style={{ fontFamily: 'Georgia, serif' }}
                />
              </div>
            )}
          </RetroPanel>
        </div>

        {/* Future Settings Sections */}
        <div>
          <h3 
            className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Preferences
          </h3>
          
          <RetroPanel variant="inset" className="p-4">
            <p 
              className="text-xs text-gray-500 text-center py-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              More settings coming soon...
            </p>
          </RetroPanel>
        </div>
      </div>
    </RetroPanel>
  );
}

