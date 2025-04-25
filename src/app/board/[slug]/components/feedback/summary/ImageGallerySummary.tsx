"use client";

import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { NormalizedFeedback } from '../adapters/feedbackNormalizer';
import Image from 'next/image';

interface ImageGallerySummaryProps {
  section: Section;
  normalizedFeedback: NormalizedFeedback;
}

/**
 * Component for displaying image gallery feedback summary
 */
const ImageGallerySummary: React.FC<ImageGallerySummaryProps> = ({
  normalizedFeedback
}) => {
  // Get all images with feedback
  const imagesWithFeedback = normalizedFeedback.reactions.map(r => r.id);
  
  // Group comments by image
  const commentsByImage: Record<string, string[]> = {};
  normalizedFeedback.comments.forEach(comment => {
    if (!commentsByImage[comment.id]) {
      commentsByImage[comment.id] = [];
    }
    commentsByImage[comment.id].push(comment.comment);
  });
  
  // Get all unique images that have feedback or comments
  const allFeedbackImages = Array.from(
    new Set([
      ...imagesWithFeedback,
      ...Object.keys(commentsByImage)
    ])
  );
  
  // Get reaction type for an image
  const getReactionType = (imageUrl: string) => {
    const reaction = normalizedFeedback.reactions.find(r => r.id === imageUrl);
    return reaction?.type;
  };
  
  return (
    <div className="space-y-6">
      {allFeedbackImages.map((imageUrl, index) => (
        <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 last:border-0">
          <div className="flex items-start gap-4">
            {/* Image preview */}
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
              <Image 
                src={imageUrl}
                alt="Gallery image"
                fill
                sizes="96px"
                className="object-cover" 
              />
            </div>
            
            <div className="flex-grow">
              {/* Reaction type badge */}
              <div className="flex justify-end items-center mb-3">
                <div>
                  {getReactionType(imageUrl) === 'positive' && (
                    <div className="flex items-center text-green-500">
                      <ThumbsUp size={14} className="mr-1" />
                      <span className="text-xs">Positive</span>
                    </div>
                  )}
                  {getReactionType(imageUrl) === 'negative' && (
                    <div className="flex items-center text-red-500">
                      <ThumbsDown size={14} className="mr-1" />
                      <span className="text-xs">Negative</span>
                    </div>
                  )}
                  {/* Show comment indicator if no specific reaction or comment type */}
                  {(!getReactionType(imageUrl) || getReactionType(imageUrl) === 'comment') && commentsByImage[imageUrl] && (
                    <div className="flex items-center text-amber-500">
                      <MessageSquare size={14} className="mr-1" />
                      <span className="text-xs">Comment</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Render all comments associated with this image */}
              {commentsByImage[imageUrl] && commentsByImage[imageUrl].length > 0 && (
                <div className="space-y-2">
                  {commentsByImage[imageUrl].map((comment, idx) => (
                    <div 
                      key={idx} 
                      className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md"
                    >
                      <div className="flex items-center mb-1 text-gray-500 dark:text-gray-400">
                        <MessageSquare size={12} className="mr-1" />
                        <span className="text-xs">
                          {commentsByImage[imageUrl].length > 1 ? `Comment ${idx + 1}:` : 'Comment:'}
                        </span>
                      </div>
                      <p className="text-sm">&quot;{comment}&quot;</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {allFeedbackImages.length === 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic py-2">
          No feedback provided for images in this section.
        </div>
      )}
    </div>
  );
};

export default ImageGallerySummary;
