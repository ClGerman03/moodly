"use client";

import React from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { SectionFeedback } from '@/lib/feedbackService';

interface TextReviewerProps {
  section: Section;
  sectionData: SectionFeedback;
}

/**
 * Specialized component for displaying text feedback from a reviewer
 */
const TextReviewer: React.FC<TextReviewerProps> = ({
  section,
  sectionData
}) => {
  // Extract text content for display
  const textContent = section.data?.textContent as { title?: string; subtitle?: string } | undefined;
  
  // Determine the overall reaction for the text section
  const getReactionType = (): 'positive' | 'negative' | 'neutral' => {
    // Check if there is a specific feedbackItem for 'text'
    if (sectionData.feedbackItems && sectionData.feedbackItems['text']) {
      return sectionData.feedbackItems['text'].reaction;
    }
    
    // Alternatively check any other feedbackItems
    if (sectionData.feedbackItems) {
      const items = Object.values(sectionData.feedbackItems);
      if (items.length > 0) {
        return items[0].reaction;
      }
    }
    
    return 'neutral';
  };
  
  // Get all comments 
  const getComments = () => {
    if (!sectionData.comments || sectionData.comments.length === 0) {
      return [];
    }
    
    return sectionData.comments.map(comment => ({
      text: comment.comment,
      timestamp: comment.timestamp
    }));
  };
  
  const comments = getComments();
  const reaction = getReactionType();
  
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
      {/* Text content preview */}
      {textContent && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          {textContent.title && (
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              {textContent.title}
            </h3>
          )}
          {textContent.subtitle && (
            <p className="text-xs text-gray-600 line-clamp-3">
              {textContent.subtitle}
            </p>
          )}
        </div>
      )}
      
      {/* Display overall reaction */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <FileText size={16} />
          </div>
          <span className="text-sm font-medium text-gray-700">Text content</span>
        </div>
        
        <div className="flex items-center">
          {reaction === 'positive' ? (
            <div className="flex items-center text-green-500">
              <ThumbsUp size={16} className="mr-2" />
              <span className="text-sm">Positive</span>
            </div>
          ) : reaction === 'negative' ? (
            <div className="flex items-center text-red-500">
              <ThumbsDown size={16} className="mr-2" />
              <span className="text-sm">Negative</span>
            </div>
          ) : comments.length > 0 && (
            <div className="flex items-center text-amber-500">
              <MessageSquare size={16} className="mr-2" />
              <span className="text-sm">Comment</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Display comments */}
      {comments.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Comments:
          </h4>
          <div className="space-y-3">
            {comments.map((comment, idx) => (
              <div 
                key={idx} 
                className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md"
              >
                <p>&quot;{comment.text}&quot;</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(comment.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* If no feedback */}
      {reaction === 'neutral' && comments.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          No specific feedback was provided for this text section.
        </div>
      )}
    </div>
  );
};

export default TextReviewer;
