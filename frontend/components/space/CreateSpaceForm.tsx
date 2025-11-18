"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { RetroPanel } from "@/components/common/RetroPanel";
import { RetroButton } from "@/components/common/RetroButton";
import { SpaceCategory } from "@/components/space/SpaceCategoryFilter";
import { uploadToWalrus } from "@/services/walrusApi";
import { initializeSpace, MIST_PER_SUI } from "@/utils/transactions";

interface CreateSpaceFormData {
  name: string;
  description: string;
  category: SpaceCategory;
  tags: string;
  coverImage: File | null;
}

interface CreateSpaceFormProps {
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateSpaceForm({ onClose, onCreated }: CreateSpaceFormProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateSpaceFormData>({
    name: "",
    description: "",
    category: "art",
    tags: "",
    coverImage: null,
  });

  // Category options
  const categoryOptions = [
    { value: "art", label: "Art & Creative" },
    { value: "gaming", label: "Gaming" },
    { value: "music", label: "Music" },
    { value: "tech", label: "Technology" },
    { value: "social", label: "Social" },
    { value: "portfolio", label: "Portfolio" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async () => {
    if (!currentAccount || !formData.name) return;

    try {
      setLoading(true);

      // Upload cover image to Walrus
      let coverImageBlobId = "";
      if (formData.coverImage) {
        coverImageBlobId = await uploadToWalrus(formData.coverImage);
      }

      // Create empty 3D config
      const emptyConfig = {
        scene_version: "1.0",
        objects: [],
        lighting: { ambient: "#ffffff" },
        metadata: {
          category: formData.category,
          tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
          isPublic: true,
          subscriptionType: "free",
        }
      };
      
      const configBlob = new Blob([JSON.stringify(emptyConfig)], {
        type: "application/json",
      });
      const configQuilt = await uploadToWalrus(configBlob);

      // Default to free subscription
      const subscriptionPriceInMist = 0;
      const initPriceInMist = 0.1 * MIST_PER_SUI;
      
      const tx = initializeSpace(
        currentAccount.address, // TODO: Use actual identity ID
        formData.name,
        formData.description,
        coverImageBlobId,
        configQuilt,
        subscriptionPriceInMist,
        initPriceInMist,
        currentAccount.address
      );

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            handleClose();
            onCreated?.();
          },
          onError: (error) => {
            console.error("Failed to create space:", error);
            alert(`Creation failed: ${error.message}`);
          },
        }
      );
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      category: "art",
      tags: "",
      coverImage: null,
    });
    onClose();
  };

  const updateFormData = (updates: Partial<CreateSpaceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden px-3 md:px-6 pt-4 md:pt-6 pb-3 md:pb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
              Space Name *
            </label>
            <RetroPanel variant="inset" className="p-0">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full px-3 py-2 bg-transparent border-0 outline-none"
                style={{ fontFamily: 'Georgia, serif' }}
                placeholder="Enter your space name"
              />
            </RetroPanel>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
              Description
            </label>
            <RetroPanel variant="inset" className="p-0">
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                className="w-full px-3 py-2 bg-transparent border-0 outline-none resize-none"
                style={{ fontFamily: 'Georgia, serif' }}
                rows={3}
                placeholder="Describe your creative space..."
              />
            </RetroPanel>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
              Category
            </label>
            <RetroPanel variant="inset" className="p-0">
              <select
                value={formData.category}
                onChange={(e) => updateFormData({ category: e.target.value as SpaceCategory })}
                className="w-full px-3 py-2 bg-transparent border-0 outline-none"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </RetroPanel>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
              Tags (comma separated)
            </label>
            <RetroPanel variant="inset" className="p-0">
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => updateFormData({ tags: e.target.value })}
                className="w-full px-3 py-2 bg-transparent border-0 outline-none"
                style={{ fontFamily: 'Georgia, serif' }}
                placeholder="3d, art, interactive"
              />
            </RetroPanel>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
              Upload Cover Image
            </label>
            <RetroPanel variant="inset" className="p-0">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => updateFormData({ coverImage: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 bg-transparent border-0 outline-none"
                style={{ fontFamily: 'Georgia, serif' }}
              />
            </RetroPanel>
            {formData.coverImage && (
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                Selected: {formData.coverImage.name}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t" style={{ borderColor: '#d1d5db' }}>
            <RetroButton
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </RetroButton>
            <RetroButton
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading || !formData.name}
            >
              {loading ? "Creating..." : "Create Space"}
            </RetroButton>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
              Creating a space requires 0.1 SUI initialization fee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
