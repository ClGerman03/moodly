"use client";

import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Section } from "@/app/tablero/types";
import Image from 'next/image';
import { SectionFeedback } from "@/types/supabase";

interface ImageGalleryReviewerProps {
  section: Section;
  sectionData: SectionFeedback;
}

/**
 * Specialized component for displaying image gallery feedback from a reviewer
 */
const ImageGalleryReviewer: React.FC<ImageGalleryReviewerProps> = ({
  section,
  sectionData
}) => {
  // Get all images from section data (if available)
  const images = (section.data?.images || []) as string[];
  
  // Create a mapping of image URLs to their indices
  const imageIndexMap: Record<string, number> = {};
  images.forEach((url, index) => {
    imageIndexMap[url] = index;
  });
  
  // Process image feedback from the reviewer's data
  const imagesWithFeedback = sectionData.imageFeedback ? 
    Object.keys(sectionData.imageFeedback) : [];
  
  // Group comments by image
  const commentsByImage: Record<string, { comment: string, timestamp: string }[]> = {};
  
  if (sectionData.comments) {
    sectionData.comments.forEach(comment => {
      if (!commentsByImage[comment.itemId]) {
        commentsByImage[comment.itemId] = [];
      }
      commentsByImage[comment.itemId].push({
        comment: comment.comment,
        timestamp: comment.timestamp
      });
    });
  }
  
  // Get all unique images that have feedback or comments
  const allFeedbackImages = Array.from(
    new Set([
      ...imagesWithFeedback,
      ...Object.keys(commentsByImage)
    ])
  );
  
  // Get reaction type for an image
  const getReactionType = (imageUrl: string) => {
    return sectionData.imageFeedback?.[imageUrl] || 'neutral';
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
      {allFeedbackImages.length > 0 ? (
        allFeedbackImages.map((imageUrl, index) => (
          <div key={index} className="border-b border-gray-100 pb-3 mb-3 last:border-0">
            <div className="flex items-start gap-4">
              {/* Image preview */}
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                <Image 
                  src={imageUrl}
                  alt={`Image ${imageIndexMap[imageUrl] !== undefined ? imageIndexMap[imageUrl] + 1 : ''}`}
                  fill
                  sizes="80px"
                  className="object-cover" 
                />
              </div>
              
              <div className="flex-grow">
                {/* Image title and reaction */}
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    {imageIndexMap[imageUrl] !== undefined ? 
                      `Image ${imageIndexMap[imageUrl] + 1}` : 
                      'Image'
                    }
                  </h4>
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
                    {getReactionType(imageUrl) === 'neutral' && commentsByImage[imageUrl] && (
                      <div className="flex items-center text-amber-500">
                        <MessageSquare size={14} className="mr-1" />
                        <span className="text-xs">Comment</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Comments for this image */}
                {commentsByImage[imageUrl] && commentsByImage[imageUrl].length > 0 && (
                  <div className="space-y-2">
                    {commentsByImage[imageUrl].map((comment, idx) => (
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
            </div>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500 italic py-2">
          No specific feedback for images in this section.
        </div>
      )}
    </div>
  );
};

export default ImageGalleryReviewer;
