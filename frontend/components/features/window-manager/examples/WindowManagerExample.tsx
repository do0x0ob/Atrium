'use client';

import React from 'react';
import { useWindowManager } from '../hooks/useWindowManager';
import Window from '../components/Window';

/**
 * Window Manager 使用範例
 * 
 * 展示如何：
 * 1. 開啟多個不同類型的視窗
 * 2. 開啟多個相同類型的視窗
 * 3. 傳遞自定義數據到視窗
 * 4. 渲染視窗內容
 */
export function WindowManagerExample() {
  const {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    activateWindow,
    startDragging,
    resizeWindow,
    getWindowsByType,
  } = useWindowManager();

  // 模擬資源數據
  const sampleVideos = [
    { id: 'v1', title: 'Introduction to Atrium', url: 'https://example.com/v1.mp4' },
    { id: 'v2', title: 'Gallery Tour', url: 'https://example.com/v2.mp4' },
    { id: 'v3', title: 'Advanced Features', url: 'https://example.com/v3.mp4' },
  ];

  const sampleEssays = [
    { id: 'e1', title: 'The Art of Digital Spaces', content: 'Lorem ipsum...' },
    { id: 'e2', title: 'Web3 and Creativity', content: 'Dolor sit amet...' },
    { id: 'e3', title: 'Future of Museums', content: 'Consectetur adipiscing...' },
  ];

  const sampleMerch = [
    { id: 'm1', title: 'Atrium T-Shirt', price: 29.99, image: '/merch1.jpg' },
    { id: 'm2', title: 'Collector Pin Set', price: 19.99, image: '/merch2.jpg' },
    { id: 'm3', title: 'Limited Edition Poster', price: 49.99, image: '/merch3.jpg' },
  ];

  // 開啟影片視窗
  const handleOpenVideo = (video: typeof sampleVideos[0]) => {
    openWindow('video-player', {
      title: `Video: ${video.title}`,
      data: video,
    });
  };

  // 開啟文章視窗
  const handleOpenEssay = (essay: typeof sampleEssays[0]) => {
    openWindow('essay-reader', {
      title: essay.title,
      data: essay,
    });
  };

  // 開啟商品視窗
  const handleOpenMerch = (item: typeof sampleMerch[0]) => {
    openWindow('merch-detail', {
      title: item.title,
      data: item,
    });
  };

  // 獲取視窗統計
  const videoWindowCount = getWindowsByType('video-player').length;
  const essayWindowCount = getWindowsByType('essay-reader').length;
  const merchWindowCount = getWindowsByType('merch-detail').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      {/* 控制面板 */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            Window Manager - 多視窗系統範例
          </h1>
          
          {/* 統計信息 */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h2 className="text-lg font-semibold mb-2">視窗統計</h2>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">總視窗數：</span>
                <span className="font-bold ml-2">{Object.keys(windows).length}</span>
              </div>
              <div>
                <span className="text-gray-600">影片播放器：</span>
                <span className="font-bold ml-2">{videoWindowCount}</span>
              </div>
              <div>
                <span className="text-gray-600">文章閱讀器：</span>
                <span className="font-bold ml-2">{essayWindowCount}</span>
              </div>
              <div>
                <span className="text-gray-600">商品詳情：</span>
                <span className="font-bold ml-2">{merchWindowCount}</span>
              </div>
            </div>
          </div>

          {/* 資源列表 */}
          <div className="grid grid-cols-3 gap-6">
            {/* 影片 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">影片</h3>
              <div className="space-y-2">
                {sampleVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleOpenVideo(video)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    <div className="text-sm font-medium">{video.title}</div>
                    <div className="text-xs text-gray-500 mt-1">點擊開啟視窗</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 文章 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">文章</h3>
              <div className="space-y-2">
                {sampleEssays.map((essay) => (
                  <button
                    key={essay.id}
                    onClick={() => handleOpenEssay(essay)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    <div className="text-sm font-medium">{essay.title}</div>
                    <div className="text-xs text-gray-500 mt-1">點擊開啟視窗</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 商品 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">商品</h3>
              <div className="space-y-2">
                {sampleMerch.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleOpenMerch(item)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">${item.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 說明 */}
          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              💡 <strong>提示：</strong>點擊上方的資源卡片即可開啟視窗。你可以同時開啟多個相同類型的視窗，每個都有獨立的內容。
              視窗可以拖曳、調整大小、聚焦。
            </p>
          </div>
        </div>
      </div>

      {/* 渲染所有開啟的視窗 */}
      {Object.values(windows).map((window) => (
        <Window
          key={window.id}
          id={window.id}
          title={window.title}
          position={window.position}
          size={window.size}
          isActive={activeWindowId === window.id}
          resizable={window.resizable}
          zIndex={window.zIndex}
          onClose={closeWindow}
          onDragStart={startDragging}
          onResize={resizeWindow}
          onClick={() => activateWindow(window.id)}
        >
          {/* 根據視窗類型渲染不同的內容 */}
          {window.type === 'video-player' && (
            <VideoPlayerContent data={window.data} />
          )}
          {window.type === 'essay-reader' && (
            <EssayReaderContent data={window.data} />
          )}
          {window.type === 'merch-detail' && (
            <MerchDetailContent data={window.data} />
          )}
        </Window>
      ))}
    </div>
  );
}

// 視窗內容元件

function VideoPlayerContent({ data }: { data?: any }) {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-1 bg-gray-900 rounded flex items-center justify-center text-white mb-4">
        <div className="text-center">
          <div className="text-4xl mb-4">▶️</div>
          <div className="text-sm">{data?.title || 'Video Player'}</div>
          <div className="text-xs text-gray-400 mt-2">{data?.url}</div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div><strong>Video ID:</strong> {data?.id}</div>
        <div className="text-gray-600">實際使用時這裡會是真實的影片播放器</div>
      </div>
    </div>
  );
}

function EssayReaderContent({ data }: { data?: any }) {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Georgia, serif' }}>
        {data?.title}
      </h2>
      <div className="prose prose-sm">
        <p className="text-gray-700 leading-relaxed">
          {data?.content || 'Essay content would be displayed here...'}
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          這是一個範例文章閱讀器視窗。實際使用時，這裡會顯示完整的文章內容，
          支援 Markdown 格式、圖片、引用等豐富內容。
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          你可以同時開啟多個文章視窗，每個都顯示不同的內容。視窗可以調整大小以適應閱讀需求。
        </p>
      </div>
    </div>
  );
}

function MerchDetailContent({ data }: { data?: any }) {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-1 bg-gray-100 rounded flex items-center justify-center mb-4">
        <div className="text-6xl">🎨</div>
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
          {data?.title}
        </h3>
        <div className="text-2xl font-bold text-blue-600">
          ${data?.price}
        </div>
        <p className="text-sm text-gray-600">
          商品詳情頁面。實際使用時會顯示商品圖片、描述、規格等詳細信息。
        </p>
        <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          加入購物車
        </button>
      </div>
    </div>
  );
}

export default WindowManagerExample;

