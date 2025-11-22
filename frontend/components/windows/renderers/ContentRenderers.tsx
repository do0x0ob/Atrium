/**
 * Content Renderers - Strategy Pattern
 * Different rendering strategies for various content types
 */

import React from 'react';

/**
 * Text/Essay Renderer
 */
export const TextRenderer: React.FC<{ content: string; title: string }> = ({ content, title }) => {
  return (
    <div className="w-full h-full bg-white overflow-y-auto scrollbar-hidden p-8 font-serif">
      <article className="prose prose-slate max-w-none">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">{title}</h1>
        <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">
          {content}
        </div>
      </article>
    </div>
  );
};

/**
 * Video Renderer
 */
export const VideoRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="w-full h-full bg-black flex flex-col">
      {content ? (
        <video 
          src={content} 
          controls 
          autoPlay 
          className="w-full h-full object-contain"
          controlsList="nodownload"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Video unavailable
        </div>
      )}
    </div>
  );
};

/**
 * Image Renderer
 */
export const ImageRenderer: React.FC<{ content: string; title?: string }> = ({ content, title }) => {
  return (
    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-4">
      <img 
        src={content} 
        alt={title || 'Image'} 
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};

