"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { uploadToWalrus } from "@/services/walrusApi";
import { initializeSpace, MIST_PER_SUI } from "@/utils/transactions";

interface CreateSpaceButtonProps {
  onCreated: () => void;
}

export function CreateSpaceButton({ onCreated }: CreateSpaceButtonProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subscriptionPrice: "1",
    coverImage: null as File | null,
  });

  const handleSubmit = async () => {
    if (!currentAccount || !formData.name) return;

    try {
      setLoading(true);

      // Upload cover image to Walrus
      let coverImageBlobId = "";
      if (formData.coverImage) {
        coverImageBlobId = await uploadToWalrus(formData.coverImage);
      }

      // Create empty config
      const emptyConfig = {
        scene_version: "1.0",
        objects: [],
        lighting: { ambient: "#ffffff" },
      };
      const configBlob = new Blob([JSON.stringify(emptyConfig)], {
        type: "application/json",
      });
      const configQuilt = await uploadToWalrus(configBlob);

      // Create kiosk and initialize space
      const subscriptionPriceInMist = parseFloat(formData.subscriptionPrice) * MIST_PER_SUI;
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
            setIsOpen(false);
            onCreated();
            setFormData({
              name: "",
              description: "",
              subscriptionPrice: "1",
              coverImage: null,
            });
          },
          onError: (error) => {
            console.error("Failed to create space:", error);
            alert(`創建失敗: ${error.message}`);
          },
        }
      );
    } catch (error: any) {
      console.error("Error:", error);
      alert(`錯誤: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 rounded-lg bg-gradient-header text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        + 創建空間
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold bg-gradient-header bg-clip-text text-transparent mb-6">
          創建你的空間
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              空間名稱 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none"
              placeholder="輸入空間名稱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none"
              rows={3}
              placeholder="描述你的空間..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              訂閱價格 (SUI/天)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.subscriptionPrice}
              onChange={(e) =>
                setFormData({ ...formData, subscriptionPrice: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              封面圖片
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, coverImage: e.target.files?.[0] || null })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-purple"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.name}
              className="flex-1 py-3 px-6 rounded-lg font-medium transition-all
                bg-gradient-header text-white shadow-lg
                hover:shadow-xl hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "創建中..." : "創建空間"}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 rounded-lg font-medium border-2 border-gray-300 text-text-primary hover:border-primary-purple transition-all"
            >
              取消
            </button>
          </div>

          <p className="text-xs text-text-secondary">
            * 創建空間需要支付 0.1 SUI 初始化費用
          </p>
        </div>
      </div>
    </div>
  );
}

