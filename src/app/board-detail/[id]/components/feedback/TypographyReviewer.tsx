"use client";

import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Section } from "@/app/tablero/types";

// Definición local de tipos para evitar dependencias en servicios específicos
interface FeedbackItem {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  reaction: 'positive' | 'negative' | 'neutral';
  timestamp: string;
}

interface SectionFeedback {
  feedbackItems: Record<string, FeedbackItem>;
  comments?: { itemId: string; comment: string; timestamp: string }[];
  paletteFeedbacks?: { paletteId: string; type: 'positive' | 'negative' | 'neutral'; timestamp: string }[];
  paletteComments?: { paletteId: string; comment: string; timestamp: string }[];
  imageFeedback?: Record<string, string>;
}

interface FontOption {
  id: string;
  name: string;
  family: string;
  category: "serif" | "sans-serif" | "display" | "monospace";
  weights: number[];
}

interface TypographyReviewerProps {
  section: Section;
  sectionData: SectionFeedback;
}

/**
 * Specialized component for displaying typography feedback from a reviewer
 */
const TypographyReviewer: React.FC<TypographyReviewerProps> = ({
  section,
  sectionData
}) => {
  // Get all fonts from section data
  const fonts = (section.data?.fonts || []) as FontOption[];
  
  // Process fonts with feedback based on feedbackItems
  const fontIds = sectionData.feedbackItems ? 
    Object.keys(sectionData.feedbackItems) : [];
  
  // Group comments by font
  const commentsByFont: Record<string, { comment: string, timestamp: string }[]> = {};
  
  if (sectionData.comments) {
    sectionData.comments.forEach(comment => {
      if (!commentsByFont[comment.itemId]) {
        commentsByFont[comment.itemId] = [];
      }
      commentsByFont[comment.itemId].push({
        comment: comment.comment,
        timestamp: comment.timestamp
      });
    });
  }
  
  // Get all unique fonts that have feedback or comments
  const allFeedbackFonts = Array.from(
    new Set([
      ...fontIds,
      ...Object.keys(commentsByFont)
    ])
  );
  
  // Helper to get font by ID
  const getFont = (fontId: string): FontOption | undefined => {
    return fonts.find(f => f.id === fontId);
  };
  
  // Get reaction type for a font
  const getReactionType = (fontId: string): 'positive' | 'negative' | 'neutral' => {
    if (sectionData.feedbackItems && sectionData.feedbackItems[fontId]) {
      return sectionData.feedbackItems[fontId].reaction;
    }
    return 'neutral';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="space-y-4">
      {allFeedbackFonts.length > 0 ? (
        allFeedbackFonts.map((fontId) => {
          const font = getFont(fontId);
          if (!font) return null;
          
          return (
            <div key={fontId} className="border-b border-gray-100 pb-3 mb-3 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  {font.name}
                </h4>
                <div>
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
                  {getReactionType(fontId) === 'neutral' && commentsByFont[fontId] && (
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
                  className="bg-gray-50 rounded-md px-3 py-2"
                  style={{ fontFamily: font.family, fontWeight: font.weights[0] || 400 }}
                >
                  <span className="text-lg">Aa</span>
                </div>
                <div className="text-xs text-gray-500">
                  {font.category} · {font.weights.length} weights
                </div>
              </div>
              
              {/* Comments for this font */}
              {commentsByFont[fontId] && commentsByFont[fontId].length > 0 && (
                <div className="space-y-2">
                  {commentsByFont[fontId].map((comment, idx) => (
                    <div 
                      key={idx} 
                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md"
                    >
                      <p>&quot;{comment.comment}&quot;</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(comment.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-sm text-gray-500 italic py-2">
          No specific feedback for typography in this section.
        </div>
      )}
    </div>
  );
};

export default TypographyReviewer;
