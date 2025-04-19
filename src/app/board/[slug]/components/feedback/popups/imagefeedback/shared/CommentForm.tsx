"use client";

import React, { useRef, useEffect } from "react";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  maxLength?: number;
  placeholder?: string;
  onBlur?: () => void;
}

/**
 * Componente de campo de texto simple para feedback
 * Versión minimalista sin botón de envío
 */
const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  autoFocus = false,
  maxLength = 300,
  placeholder = "Add your feedback here...",
  onBlur
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autoenfoque del textarea si es necesario
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full p-2 bg-transparent text-gray-900 dark:text-gray-100
                 resize-none border-b border-gray-200 dark:border-gray-700
                 focus:outline-none focus:ring-0
                 transition-all placeholder-gray-400 dark:placeholder-gray-500"
        rows={3}
        maxLength={maxLength}
      />
      
      {/* Solo contador de caracteres */}
      <div className="flex justify-end items-center mt-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
};

export default TextArea;
