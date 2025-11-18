"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { generateGLBFromImage, downloadGLB } from "@/services/meshyApi";
import { uploadToWalrus } from "@/services/walrusApi";
import { mintIdentity, bindAvatar as bindAvatarTx } from "@/utils/transactions";
import { RetroButton } from "@/components/common/RetroButton";
import { RetroInput } from "@/components/common/RetroInput";
import { RetroPanel } from "@/components/common/RetroPanel";
import { RetroHeading } from "@/components/common/RetroHeading";

interface IdentityRegistrationProps {
  onComplete: () => void;
}

export function IdentityRegistration({ onComplete }: IdentityRegistrationProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const [step, setStep] = useState<"input" | "generating" | "uploading" | "minting">("input");
  const [username, setUsername] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const handleDisconnect = () => {
    // Use window.location.reload to reset the wallet connection
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!username || !imageFile || !currentAccount) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setError("");
      
      // Step 1: Generate 3D avatar with Meshy AI
      setStep("generating");
      setProgress("Generating 3D avatar with AI...");
      
      const glbUrl = await generateGLBFromImage(imageFile);
      setProgress("3D model generated successfully");

      // Step 2: Download GLB
      setProgress("Downloading 3D model...");
      const glbBlob = await downloadGLB(glbUrl);

      // Step 3: Upload to Walrus
      setStep("uploading");
      setProgress("Uploading to Walrus decentralized storage...");
      
      const blobId = await uploadToWalrus(glbBlob);
      setProgress(`Upload successful. Blob ID: ${blobId.slice(0, 8)}...`);

      // Step 4: Mint Identity NFT
      setStep("minting");
      setProgress("Minting identity NFT...");

      const tx = mintIdentity(username, blobId);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            setProgress("Identity NFT minted successfully");
            
            // Wait a bit for transaction to finalize
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Now bind the avatar
            await bindAvatar(result.digest, blobId);
          },
          onError: (error) => {
            setError(`Minting failed: ${error.message}`);
            setStep("input");
          },
        }
      );
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      setStep("input");
    }
  };

  const bindAvatar = async (txDigest: string, blobId: string) => {
    try {
      setProgress("Binding 3D avatar to identity...");

      // Get the Identity object ID from the transaction
      const txResult = await suiClient.waitForTransaction({
        digest: txDigest,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      const identityObject = txResult.objectChanges?.find(
        (obj) => obj.type === "created" && obj.objectType?.includes("::identity::Identity")
      );

      if (!identityObject || identityObject.type !== "created") {
        throw new Error("Identity object not found");
      }

      const tx = bindAvatarTx(identityObject.objectId, blobId);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            setProgress("Complete! Welcome to Atrium!");
            setTimeout(() => {
              onComplete();
            }, 2000);
          },
          onError: (error) => {
            setError(`Binding failed: ${error.message}`);
            setStep("input");
          },
        }
      );
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      setStep("input");
    }
  };

  const handleSkipAI = async () => {
    // Allow direct GLB upload without AI generation
    if (!imageFile) {
      setError("Please select a GLB file");
      return;
    }

    try {
      setStep("uploading");
      setProgress("Uploading GLB to Walrus...");
      
      const blobId = await uploadToWalrus(imageFile);
      setProgress(`Upload successful. Blob ID: ${blobId.slice(0, 8)}...`);

      // Continue with minting...
      // (Same logic as handleSubmit but skip AI generation)
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
      setStep("input");
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <RetroPanel className="p-6 md:p-8">
          <RetroHeading 
            title="Identity Registration"
            subtitle="Create your Atrium identity and avatar"
            className="mb-6 md:mb-8"
          />

          {step === "input" && (
            <div className="space-y-4 md:space-y-6">

              {/* Username Input */}
              <div>
                <label className="block text-xs font-serif uppercase tracking-wide text-gray-600 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Username *
                </label>
                <RetroInput
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-serif uppercase tracking-wide text-gray-600 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                  Avatar Image * (Will be used to generate 3D model)
                </label>
                <RetroPanel variant="inset" className="p-6">
                  <input
                    type="file"
                    accept="image/*,.glb"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" className="cursor-pointer block">
                    {imagePreview ? (
                      <div className="flex justify-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48"
                          style={{
                            border: '2px solid #d1d5db',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-6xl mb-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                          +
                        </div>
                        <p className="text-sm font-serif text-gray-600 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                          Click to upload image
                        </p>
                        <p className="text-xs font-serif text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
                          Supports JPG, PNG or GLB files
                        </p>
                      </div>
                    )}
                  </label>
                </RetroPanel>
              </div>

              {error && (
                <RetroPanel variant="inset" className="p-4">
                  <div className="text-xs font-serif text-red-600" style={{ fontFamily: 'Georgia, serif' }}>
                    Error: {error}
                  </div>
                </RetroPanel>
              )}

              <div className="space-y-3 pt-4">
                <RetroButton
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!username || !imageFile}
                  className="w-full"
                >
                  Generate 3D Avatar with AI
                </RetroButton>
                {imageFile?.name.endsWith('.glb') && (
                  <RetroButton
                    variant="secondary"
                    size="md"
                    onClick={handleSkipAI}
                    className="w-full"
                  >
                    Direct Upload (GLB)
                  </RetroButton>
                )}
                <RetroButton
                  variant="secondary"
                  size="sm"
                  onClick={handleDisconnect}
                  className="w-full"
                >
                  Disconnect & Return
                </RetroButton>
              </div>

              <div className="text-center pt-4 space-y-2">
                <p className="text-xs font-serif text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
                Note: AI generation may take 30-60 seconds
              </p>
                <button
                  onClick={onComplete}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {(step === "generating" || step === "uploading" || step === "minting") && (
            <div className="py-16 text-center">
              <RetroPanel variant="inset" className="p-8 inline-block mb-6">
                <div 
                  className="inline-block animate-spin h-16 w-16 font-serif text-4xl text-gray-600"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  ⟳
                </div>
              </RetroPanel>
              <div className="text-lg font-serif text-gray-800 mb-2 uppercase tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
                {step === "generating" && "Generating..."}
                {step === "uploading" && "Uploading..."}
                {step === "minting" && "Minting..."}
              </div>
              <div className="text-sm font-serif text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>{progress}</div>
            </div>
          )}
        </RetroPanel>
      </div>
    </div>
  );
}

