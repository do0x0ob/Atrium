import React, { useState, useEffect } from 'react';

interface WindowProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isActive?: boolean;
  resizable?: boolean;
  zIndex: number;
  onClose: (id: string) => void;
  onDragStart: (e: React.MouseEvent<Element>, id: string) => void;
  onResize?: (e: React.MouseEvent, id: string) => void;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Window - A retro-styled window component with white/gray theme
 * 
 * Features:
 * - Beveled 3D edges with white/gray color scheme
 * - Grayscale gradient title bar
 * - Draggable and resizable on desktop
 * - Fullscreen on mobile (responsive)
 * - Consistent with retro OS aesthetic
 * - Supports multiple instances via unique ID
 */
const Window: React.FC<WindowProps> = ({
  id,
  title,
  position,
  size,
  isActive = false,
  resizable = false,
  zIndex,
  onClose,
  onDragStart,
  onResize,
  onClick,
  children,
  className,
}) => {
  const [windowSize, setWindowSize] = useState(size);
  const [isMobile, setIsMobile] = useState(false);

  // 檢測是否為移動設備
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind 的 md 斷點
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setWindowSize(size);
  }, [size]);

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!resizable || !onResize) return;
    onResize(e, id);
  };

  return (
    <div
      className={`flex flex-col ${isMobile ? 'fixed' : 'absolute'} ${className || ''}`}
      style={{
        ...(isMobile ? {
          // 手機版：全屏
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          transform: 'none',
        } : {
          // 桌面版：可拖曳視窗
          width: `${windowSize.width}px`,
          height: `${windowSize.height}px`,
          transform: `translate(${position.x}px, ${position.y}px)`,
        }),
        zIndex: zIndex,
        backgroundColor: '#f5f5f5',
        fontFamily: 'Georgia, serif',
        
        // Outer frame - raised 3D effect (light from top-left)
        borderTop: '2px solid #ffffff',
        borderLeft: '2px solid #ffffff',
        borderBottom: '2px solid #6b7280',
        borderRight: '2px solid #6b7280',
  
        boxShadow: isActive
          ? `
              inset 1px 1px 0 rgba(255, 255, 255, 0.9),
              inset -1px -1px 0 rgba(0, 0, 0, 0.15),
              0 6px 20px rgba(0, 0, 0, 0.25),
              0 0 0 1px rgba(107, 114, 128, 0.3)
            `
          : `
              inset 1px 1px 0 rgba(255, 255, 255, 0.9),
              inset -1px -1px 0 rgba(0, 0, 0, 0.12),
              0 4px 12px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(156, 163, 175, 0.2)
            `
      }}
      onClick={onClick}
    >
      {/* Title bar */}
      <div
        className={`h-12 md:h-8 px-3 md:px-2 flex items-center justify-between select-none ${
          isMobile ? 'cursor-default' : 'cursor-move'
        }`}
        style={{
          background: isActive 
            ? 'linear-gradient(to bottom, #e5e7eb, #d1d5db)'
            : 'linear-gradient(to bottom, #d1d5db, #9ca3af)',
          
          // Title bar raised effect
          borderTop: '2px solid rgba(255, 255, 255, 0.8)',
          borderLeft: '2px solid rgba(255, 255, 255, 0.6)',
          borderBottom: '2px solid rgba(0, 0, 0, 0.3)',
          borderRight: '2px solid rgba(0, 0, 0, 0.2)',
          
          boxShadow: `
            inset 1px 1px 1px rgba(255, 255, 255, 0.5),
            inset -1px -1px 1px rgba(0, 0, 0, 0.15)
          `
        }}
        onClick={(e) => {
          // Activate window on header click
          if (!(e.target as HTMLElement).closest('button')) {
            onClick?.();
          }
        }}
        onMouseDown={(e) => {
          // 手機版不支援拖曳
          if (isMobile) return;
          if ((e.target as HTMLElement).closest('button')) return;
          onDragStart(e, id);
        }}
      >
        <span 
          className="text-sm md:text-xs font-bold truncate"
          style={{
            color: '#1f2937',
            textShadow: '0px 1px 0px rgba(255, 255, 255, 0.8)',
          }}
        >
          {title}
        </span>
        
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(id);
          }}
          className="w-8 h-8 md:w-5 md:h-5 flex items-center justify-center text-base md:text-xs font-bold flex-shrink-0 ml-2
             transition-all"
          style={{
            backgroundColor: '#e5e7eb',
            color: '#1f2937',
            borderTop: '2px solid #ffffff',
            borderLeft: '2px solid #ffffff',
            borderBottom: '2px solid #9ca3af',
            borderRight: '2px solid #9ca3af',
            boxShadow: 'inset 1px 1px 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 rgba(0, 0, 0, 0.1)',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.borderTop = '2px solid #9ca3af';
            e.currentTarget.style.borderLeft = '2px solid #9ca3af';
            e.currentTarget.style.borderBottom = '2px solid #ffffff';
            e.currentTarget.style.borderRight = '2px solid #ffffff';
            e.currentTarget.style.boxShadow = 'inset -1px -1px 0 rgba(255, 255, 255, 0.8), inset 1px 1px 1px rgba(0, 0, 0, 0.15)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.borderTop = '2px solid #ffffff';
            e.currentTarget.style.borderLeft = '2px solid #ffffff';
            e.currentTarget.style.borderBottom = '2px solid #9ca3af';
            e.currentTarget.style.borderRight = '2px solid #9ca3af';
            e.currentTarget.style.boxShadow = 'inset 1px 1px 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderTop = '2px solid #ffffff';
            e.currentTarget.style.borderLeft = '2px solid #ffffff';
            e.currentTarget.style.borderBottom = '2px solid #9ca3af';
            e.currentTarget.style.borderRight = '2px solid #9ca3af';
            e.currentTarget.style.boxShadow = 'inset 1px 1px 0 rgba(255, 255, 255, 0.8), inset -1px -1px 0 rgba(0, 0, 0, 0.1)';
          }}
        >
          ×
        </button>
      </div>
      
      {/* Content area */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          backgroundColor: '#ffffff',
          
          // Content area inset effect
          borderTop: '2px solid #9ca3af',
          borderLeft: '2px solid #9ca3af',
          borderBottom: '2px solid #e5e7eb',
          borderRight: '2px solid #e5e7eb',
          
          boxShadow: `
            inset 2px 2px 3px rgba(0, 0, 0, 0.08),
            inset -1px -1px 2px rgba(255, 255, 255, 0.9)
          `
        }}
      >
        {children}
      </div>

      {/* Resize Handle - 只在桌面版顯示 */}
      {resizable && onResize && !isMobile && (
        <div
          className="absolute group"
          style={{
            bottom: '6px',
            right: '6px',
            width: '16px',
            height: '16px',
            cursor: 'nwse-resize',
          }}
          onMouseDown={handleResizeStart}
        >
          <div className="w-full h-full relative">
            <div 
              className="absolute transition-colors"
              style={{
                bottom: '0',
                right: '0',
                width: '12px',
                height: '2px',
                backgroundColor: '#9ca3af',
                boxShadow: '0 -1px 0 rgba(255, 255, 255, 0.6)'
              }} 
            />
            <div 
              className="absolute transition-colors"
              style={{
                bottom: '4px',
                right: '0',
                width: '8px',
                height: '2px',
                backgroundColor: '#9ca3af',
                boxShadow: '0 -1px 0 rgba(255, 255, 255, 0.6)'
              }} 
            />
            <div 
              className="absolute transition-colors"
              style={{
                bottom: '8px',
                right: '0',
                width: '4px',
                height: '2px',
                backgroundColor: '#9ca3af',
                boxShadow: '0 -1px 0 rgba(255, 255, 255, 0.6)'
              }} 
            />
          </div>  
        </div>
      )}
    </div>
  );
};

export default Window;
export { Window };

