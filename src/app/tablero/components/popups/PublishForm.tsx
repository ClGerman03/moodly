'use client';

import React from 'react';
import { LucideCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

interface PublishFormProps {
  customUrlSegment: string;
  setCustomUrlSegment: (value: string) => void;
  boardLink: string;
  showAuthPrompt: boolean;
  publishingError: string | null;
  isPublishing: boolean;
  isPublished: boolean;
  onPublish: () => void;
}

export const PublishForm: React.FC<PublishFormProps> = ({
  customUrlSegment,
  setCustomUrlSegment,
  boardLink,
  showAuthPrompt,
  publishingError,
  isPublishing,
  isPublished,
  onPublish
}) => {
  return (
    <div className="space-y-4">
      {/* Formulario de URL personalizada */}
      <div>
        <label
          htmlFor="custom-url"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Custom URL
        </label>
        <div className="flex items-center">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
            {typeof window !== 'undefined' ? window.location.origin : ''}/board/
          </span>
          <input
            type="text"
            id="custom-url"
            value={customUrlSegment}
            onChange={(e) => setCustomUrlSegment(e.target.value)}
            disabled={isPublished}
            placeholder="your-board-name"
            className="focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0 block w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-r-md"
          />
        </div>
        
        {/* Mensajes de error */}
        <AnimatePresence>
          {publishingError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-2 mt-2 text-xs flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md"
            >
              {publishingError}
            </motion.div>
          )}
          
          {/* Mensaje de éxito */}
          {(isPublished || showAuthPrompt) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-2 mt-2 text-xs flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-md"
            >
              <LucideCheck size={14} className="mr-1.5" />
              {showAuthPrompt 
                ? "Board ready! Sign in to publish it."
                : "Board published successfully!"}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Prompt de autenticación para usuarios no autenticados */}
        {showAuthPrompt && (
          <div className="mt-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Your board is almost ready! Sign in with Google to publish and share it with others.
            </p>
            <GoogleSignInButton text="Sign in with Google" />
          </div>
        )}
        
        {/* Botón de publicar */}
        <button
          onClick={onPublish}
          disabled={isPublishing || isPublished}
          className={`w-full py-2 px-4 rounded-md transition-colors mt-4 ${
            isPublished
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : isPublishing
              ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-wait"
              : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          }`}
        >
          {isPublished
            ? "Published"
            : isPublishing
            ? "Checking..."
            : "Publish Board"}
        </button>

        {/* Enlace para compartir */}
        {isPublished && boardLink && (
          <div className="mt-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              Share this link with others:
            </div>
            <div className="flex">
              <input
                type="text"
                value={boardLink}
                readOnly
                className="flex-1 px-3 py-2 text-sm rounded-l-md border-0 outline-none bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(boardLink);
                  // Feedback visual (opcional)
                  const copyBtn = document.activeElement as HTMLButtonElement;
                  if (copyBtn) {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = "Copied!";
                    setTimeout(() => {
                      copyBtn.textContent = originalText;
                    }, 2000);
                  }
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-r-md"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
