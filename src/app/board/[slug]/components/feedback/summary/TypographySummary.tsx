"use client";

import React from 'react';
import { PenTool, ThumbsUp } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { NormalizedFeedback } from '../adapters/feedbackNormalizer';

interface TypographySummaryProps {
  section: Section;
  normalizedFeedback: NormalizedFeedback;
}

/**
 * Specialized component to display typography feedback summary
 */
const TypographySummary: React.FC<TypographySummaryProps> = ({
  section,
  normalizedFeedback
}) => {
  // Get all fonts with positive reactions
  const selectedFonts = normalizedFeedback.reactions
    .filter(r => r.type === 'positive')
    .map(r => r.id);
  
  // Get multiple fonts with comments
  const fontComments = normalizedFeedback.comments.map(c => ({
    fontId: c.id,
    comment: c.comment
  }));
  
  // Get the fonts from the section data for display names
  const fonts = (section.data?.fonts || []) as Array<{id: string; name: string}>;
  
  // Helper to get font name by ID
  const getFontName = (fontId: string): string => {
    const font = fonts.find(f => f.id === fontId);
    return font?.name || fontId;
  };
  
  return (
    <div>
      {selectedFonts.length > 0 ? (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selected typography:
          </h4>
          <div className="space-y-2">
            {selectedFonts.map(fontId => (
              <div 
                key={fontId}
                className="flex items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md"
              >
                <ThumbsUp size={14} className="text-emerald-500 mr-2" />
                <span className="text-amber-500">{getFontName(fontId)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          No typography selected
        </div>
      )}
      
      {fontComments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comments:
          </h4>
          <div className="space-y-3">
            {fontComments.map((item, index) => (
              <div 
                key={index}
                className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
              >
                <div className="flex items-center mb-1 text-gray-500">
                  <PenTool size={12} className="mr-1" />
                  <span className="text-xs">
                    {getFontName(item.fontId)}:
                  </span>
                </div>
                "{item.comment}"
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TypographySummary;
