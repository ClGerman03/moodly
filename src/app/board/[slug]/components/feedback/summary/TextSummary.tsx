"use client";

import React from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { NormalizedFeedback } from '../adapters/feedbackNormalizer';

interface TextSummaryProps {
  section: Section;
  normalizedFeedback: NormalizedFeedback;
}

/**
 * Component specialized in displaying text sections feedback summary
 */
const TextSummary: React.FC<TextSummaryProps> = ({
  section,
  normalizedFeedback
}) => {
  // Get the general text reaction
  const textReaction = normalizedFeedback.reactions.find(r => r.id === 'text');
  
  // Get all comments
  const comments = normalizedFeedback.comments.map(c => c.comment);
  
  // Extract text content for display
  const textContent = section.data?.textContent as { title?: string; subtitle?: string } | undefined;
  
  return (
    <div className="space-y-4">
      {/* Text content preview */}
      {textContent && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg">
          {textContent.title && (
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {textContent.title}
            </h3>
          )}
          {textContent.subtitle && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {textContent.subtitle}
            </p>
          )}
        </div>
      )}
      
      {/* Display overall reaction */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            <FileText size={16} />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Text Section</span>
        </div>
        
        {textReaction && (
          <div className="flex items-center">
            {textReaction.type === 'positive' ? (
              <div className="flex items-center text-green-500">
                <ThumbsUp size={16} className="mr-2" />
                <span className="text-sm">Positive</span>
              </div>
            ) : textReaction.type === 'negative' ? (
              <div className="flex items-center text-red-500">
                <ThumbsDown size={16} className="mr-2" />
                <span className="text-sm">Negative</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-500">
                <MessageSquare size={16} className="mr-2" />
                <span className="text-sm">Comment</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Display comments */}
      {comments.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comments:
          </h4>
          <div className="space-y-3">
            {comments.map((comment, idx) => (
              <div 
                key={idx} 
                className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md"
              >
                <div className="flex items-center mb-1 text-gray-500">
                  <MessageSquare size={12} className="mr-1" />
                  <span className="text-xs">Comment{comments.length > 1 ? ` ${idx + 1}` : ''}:</span>
                </div>
                &ldquo;{comment}&rdquo;
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* If no feedback */}
      {!textReaction && comments.length === 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          No feedback was provided for this text section.
        </div>
      )}
    </div>
  );
};

export default TextSummary;
