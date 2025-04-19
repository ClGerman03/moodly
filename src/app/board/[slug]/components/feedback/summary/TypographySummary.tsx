"use client";

import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { NormalizedFeedback } from '../adapters/feedbackNormalizer';

interface FontOption {
  id: string;
  name: string;
  family: string;
  category: "serif" | "sans-serif" | "display" | "monospace";
  weights: number[];
}

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
  // Get all fonts with reactions (positive, negative, comment)
  const fontsWithFeedback = normalizedFeedback.reactions.map(r => r.id);
  
  // Group comments by font
  const commentsByFont: Record<string, string[]> = {};
  normalizedFeedback.comments.forEach(comment => {
    if (!commentsByFont[comment.id]) {
      commentsByFont[comment.id] = [];
    }
    commentsByFont[comment.id].push(comment.comment);
  });
  
  // Get all unique fonts that have feedback or comments
  const allFeedbackFonts = Array.from(
    new Set([
      ...fontsWithFeedback,
      ...Object.keys(commentsByFont)
    ])
  );
  
  // Get the fonts from the section data
  const fonts = (section.data?.fonts || []) as FontOption[];
  
  // Helper to get font by ID
  const getFont = (fontId: string): FontOption | undefined => {
    return fonts.find(f => f.id === fontId);
  };
  
  // Get the reaction type for a font
  const getReactionType = (fontId: string) => {
    const reaction = normalizedFeedback.reactions.find(r => r.id === fontId);
    return reaction?.type;
  };
  
  return (
    <div className="space-y-4">
      {allFeedbackFonts.map((fontId) => {
        const font = getFont(fontId);
        if (!font) return null;
        
        return (
          <div key={fontId} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
            <div className="flex items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {font.name}
              </h4>
              
              <div className="ml-3">
                {getReactionType(fontId) === 'positive' && (
                  <div className="flex items-center text-green-500">
                    <ThumbsUp size={14} className="mr-1" />
                    <span className="text-xs">Positive</span>
                  </div>
                )}
                {getReactionType(fontId) === 'negative' && (
                  <div className="flex items-center text-red-500">
                    <ThumbsDown size={14} className="mr-1" />
                    <span className="text-xs">Negative</span>
                  </div>
                )}
                {getReactionType(fontId) === 'comment' && (
                  <div className="flex items-center text-amber-500">
                    <MessageSquare size={14} className="mr-1" />
                    <span className="text-xs">Comment</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Font preview */}
            <div className="flex items-center space-x-3 mb-2">
              <div 
                className="bg-gray-50 dark:bg-gray-800/50 rounded-md px-3 py-2"
                style={{ fontFamily: font.family, fontWeight: font.weights[0] || 400 }}
              >
                <span className="text-lg">Aa</span>
              </div>
              <div className="text-xs text-gray-500">
                {font.category} · {font.weights.length} weights
              </div>
            </div>
            
            {/* Comments about this font */}
            {commentsByFont[fontId] && commentsByFont[fontId].length > 0 && (
              <div className="mt-2">
                {commentsByFont[fontId].map((comment, idx) => (
                  <div 
                    key={idx} 
                    className="mb-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md"
                  >
                    <div className="flex items-center mb-1 text-gray-500">
                      <MessageSquare size={12} className="mr-1" />
                      <span className="text-xs">Comment{commentsByFont[fontId].length > 1 ? ` ${idx + 1}` : ''}:</span>
                    </div>
                    "{comment}"
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TypographySummary;
