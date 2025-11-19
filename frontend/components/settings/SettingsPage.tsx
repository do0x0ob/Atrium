'use client';

import { useCurrentAccount, ConnectButton, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { RetroPanel } from '@/components/common/RetroPanel';
import { RetroHeading } from '@/components/common/RetroHeading';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroInput } from '@/components/common/RetroInput';
import { useState, useEffect } from 'react';
import { IDENTITY_PACKAGE_ID, bindAvatar } from '@/utils/transactions';
import { generateGLBFromImage, downloadGLB } from '@/services/meshyApi';
import { uploadToWalrus } from '@/services/walrusApi';

export function SettingsPage() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [identity, setIdentity] = useState<any>(null);
  const [loadingIdentity, setLoadingIdentity] = useState(false);
  const [defaultSpaceId, setDefaultSpaceId] = useState("");
  
  // Avatar Update State
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    // Load default space ID from local storage
    const savedSpaceId = localStorage.getItem('atrium_default_space_id');
    if (savedSpaceId) setDefaultSpaceId(savedSpaceId);
  }, []);

  useEffect(() => {
    async function fetchIdentity() {
      if (!currentAccount) return;
      setLoadingIdentity(true);
      try {
        const { data } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: { StructType: `${IDENTITY_PACKAGE_ID}::identity::Identity` },
          options: { showContent: true, showDisplay: true }
        });
        
        if (data.length > 0) {
          const obj = data[0];
          setIdentity({
            id: obj.data?.objectId,
            content: obj.data?.content,
            display: obj.data?.display?.data
          });
        }
      } catch (e) {
        console.error("Failed to fetch identity", e);
      } finally {
        setLoadingIdentity(false);
      }
    }
    
    fetchIdentity();
  }, [currentAccount, suiClient]);

  const handleSaveDefaultSpace = () => {
    if (defaultSpaceId) {
      localStorage.setItem('atrium_default_space_id', defaultSpaceId);
      alert("Default space saved!");
    } else {
      localStorage.removeItem('atrium_default_space_id');
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarFile || !identity) return;
    
    try {
      setUploadStatus("Preparing...");
      let blobId = "";

      if (avatarFile.name.endsWith('.glb')) {
         setUploadStatus("Uploading GLB...");
         blobId = await uploadToWalrus(avatarFile);
      } else {
         setUploadStatus("Generating 3D Model (AI)...");
         const glbUrl = await generateGLBFromImage(avatarFile);
         setUploadStatus("Downloading Model...");
         const glbBlob = await downloadGLB(glbUrl);
         setUploadStatus("Uploading to Walrus...");
         blobId = await uploadToWalrus(glbBlob);
      }

      setUploadStatus("Updating Identity...");
      const tx = bindAvatar(identity.id, blobId);

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
             setUploadStatus("Avatar Updated!");
             setIsUpdatingAvatar(false);
             setAvatarFile(null);
             setAvatarPreview(null);
             // Refresh identity logic could go here
          },
          onError: (e) => {
             setUploadStatus("Error: " + e.message);
          }
        }
      );

    } catch (e: any) {
      setUploadStatus("Error: " + e.message);
    }
  };

  return (
    <RetroPanel className="h-full flex flex-col">
      <RetroHeading 
        title="Settings"
        subtitle="Manage your account and preferences"
        className="mb-0"
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden px-3 md:px-6 pt-4 md:pt-6 pb-3 md:pb-6 space-y-6">
        
        {/* Identity Section */}
        <div>
           <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
             Identity
           </h3>
           <RetroPanel variant="inset" className="p-4">
             {loadingIdentity ? (
               <div className="text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>Loading identity...</div>
             ) : identity ? (
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center">
                       {/* If we had a 2D image preview from display, show it here. 
                           But Identity display usually points to GLB or a placeholder. 
                           We'll just show a placeholder or the 'image_url' from display if valid image. */}
                       <span className="text-2xl">👤</span>
                    </div>
                    <div>
                       <div className="text-lg font-bold" style={{ fontFamily: 'Georgia, serif' }}>{(identity.content as any)?.fields?.username || "User"}</div>
                       <div className="text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>{identity.id}</div>
                    </div>
                  </div>

                  {!isUpdatingAvatar ? (
                    <RetroButton size="sm" onClick={() => setIsUpdatingAvatar(true)}>Change Avatar</RetroButton>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded border border-gray-300" style={{ fontFamily: 'Georgia, serif' }}>
                       <h4 className="text-sm font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>Update Avatar</h4>
                       <input 
                         type="file" 
                         accept="image/*,.glb" 
                         onChange={handleAvatarSelect} 
                         className="mb-2 text-sm" 
                         style={{ fontFamily: 'Georgia, serif' }}
                       />
                       {avatarPreview && (
                         <img src={avatarPreview} alt="Preview" className="h-32 w-auto object-contain mb-2 border" />
                       )}
                       <div className="flex gap-2">
                         <RetroButton size="sm" onClick={handleUpdateAvatar} disabled={!avatarFile || !!uploadStatus}>
                            {uploadStatus || "Confirm Update"}
                         </RetroButton>
                         <RetroButton size="sm" variant="secondary" onClick={() => { setIsUpdatingAvatar(false); setUploadStatus(""); }}>Cancel</RetroButton>
                       </div>
                    </div>
                  )}
               </div>
             ) : (
               <div className="text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
                  No identity found. Please register on the home page.
               </div>
             )}
           </RetroPanel>
        </div>

        {/* Space Settings */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            Default Space Configuration
          </h3>
          <RetroPanel variant="inset" className="p-4">
             <div className="space-y-2">
               <label className="text-xs text-gray-600 uppercase" style={{ fontFamily: 'Georgia, serif' }}>Default Space Kiosk ID</label>
               <RetroInput 
                 value={defaultSpaceId} 
                 onChange={(e) => setDefaultSpaceId(e.target.value)} 
                 placeholder="Enter Kiosk ID (e.g. 0x...)"
               />
               <p className="text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>This space will be used when you purchase items in the marketplace.</p>
               <div className="pt-2">
                 <RetroButton onClick={handleSaveDefaultSpace} size="sm">Save Preference</RetroButton>
               </div>
             </div>
          </RetroPanel>
        </div>

        {/* Wallet Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            Wallet Connection
          </h3>
          <RetroPanel variant="inset" className="p-4">
            {currentAccount ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                    Connected Address
                  </p>
                  <p className="text-sm text-gray-800 break-all" style={{ fontFamily: 'Georgia, serif' }}>
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
                <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
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

      </div>
    </RetroPanel>
  );
}
