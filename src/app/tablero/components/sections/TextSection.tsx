"use client";

import { useState, useEffect, useRef } from "react";
import { TextContent, TextSize } from "../../types";

interface TextSectionProps {
  initialText?: TextContent;
  onChange?: (textContent: TextContent) => void;
  isLiveMode?: boolean;
}

const TextSection = ({ initialText, onChange, isLiveMode = false }: TextSectionProps) => {
  const [title, setTitle] = useState(initialText?.title || "");
  const [subtitle, setSubtitle] = useState(initialText?.subtitle || "");
  const [size, setSize] = useState<TextSize>(initialText?.size || "medium");

  // Synchronize with parent state when text changes
  // We use a reference to avoid unnecessary renders
  const prevTextRef = useRef<{title: string, subtitle: string, size: TextSize}>();
  
  useEffect(() => {
    // Only update if there are significant changes
    const hasChanged = !prevTextRef.current || 
      prevTextRef.current.title !== title || 
      prevTextRef.current.subtitle !== subtitle || 
      prevTextRef.current.size !== size;
    
    if (onChange && hasChanged) {
      // Save the current value to compare in future updates
      prevTextRef.current = {title, subtitle, size};
      
      const textContent: TextContent = {
        title,
        subtitle,
        size
      };
      onChange(textContent);
    }
  }, [title, subtitle, size, onChange]);

  // Determine text size classes based on the selected size
  const getTitleClass = () => {
    switch (size) {
      case "small":
        return "text-xl md:text-2xl font-light";
      case "large":
        return "text-3xl md:text-4xl font-light";
      case "medium":
      default:
        return "text-2xl md:text-3xl font-light";
    }
  };

  const getSubtitleClass = () => {
    switch (size) {
      case "small":
        return "text-sm md:text-base font-light";
      case "large":
        return "text-lg md:text-xl font-light";
      case "medium":
      default:
        return "text-base md:text-lg font-light";
    }
  };

  return (
    <div className="w-full">
      <div className="relative py-2">
        {/* Text display in edit and live mode */}
        <div>
          {isLiveMode ? (
            /* Live mode - view only */
            <div>
              {title ? (
                <h2 className={`${getTitleClass()} text-gray-800 dark:text-gray-100 mb-2`}>
                  {title}
                </h2>
              ) : (
                <div className="h-8 w-3/4 animate-pulse opacity-0"></div>
              )}
              
              {subtitle ? (
                <p className={`${getSubtitleClass()} text-gray-600 dark:text-gray-400`}>
                  {subtitle}
                </p>
              ) : (
                <div className="h-4 mt-3 w-1/2 animate-pulse opacity-0"></div>
              )}
            </div>
          ) : (
            /* Edit mode - editable fields */
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className={`w-full bg-transparent focus:outline-none ${getTitleClass()} py-1`}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Subtitle"
                  className={`w-full bg-transparent focus:outline-none ${getSubtitleClass()} py-1`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Size controls - only visible in edit mode */}
        {!isLiveMode && (
          <div className="flex justify-end space-x-2 mt-5 text-xs">
            <span className="text-gray-500 dark:text-gray-400 self-center mr-2">
              Size:
            </span>
            <button
              onClick={() => setSize("small")}
              className={`px-2 py-1 rounded ${
                size === "small" 
                  ? "border-b border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Small
            </button>
            <button
              onClick={() => setSize("medium")}
              className={`px-2 py-1 rounded ${
                size === "medium" 
                  ? "border-b border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setSize("large")}
              className={`px-2 py-1 rounded ${
                size === "large" 
                  ? "border-b border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Large
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextSection;
