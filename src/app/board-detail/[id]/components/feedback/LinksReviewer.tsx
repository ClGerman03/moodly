"use client";

import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, ExternalLink, Globe } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { cn } from "@/lib/utils";
import { SectionFeedback } from "@/types/supabase";

interface Link {
  id: string;
  url: string;
  title: string;
  description?: string;
  type?: "spotify" | "youtube" | "twitter" | "threads" | "instagram" | "other";
}

interface LinksReviewerProps {
  section: Section;
  sectionData: SectionFeedback;
}

/**
 * Specialized component for displaying links feedback from a reviewer
 */
const LinksReviewer: React.FC<LinksReviewerProps> = ({
  section,
  sectionData
}) => {
  // Get all links from section data
  const links = (section.data?.links || []) as Link[];
  
  // Process links with feedback based on feedbackItems
  const linkIds = sectionData.feedbackItems ? 
    Object.keys(sectionData.feedbackItems) : [];
  
  // Group comments by link
  const commentsByLink: Record<string, { comment: string, timestamp: string }[]> = {};
  
  if (sectionData.comments) {
    sectionData.comments.forEach(comment => {
      if (!commentsByLink[comment.itemId]) {
        commentsByLink[comment.itemId] = [];
      }
      commentsByLink[comment.itemId].push({
        comment: comment.comment,
        timestamp: comment.timestamp
      });
    });
  }
  
  // Get all unique links that have feedback or comments
  const allFeedbackLinks = Array.from(
    new Set([
      ...linkIds,
      ...Object.keys(commentsByLink)
    ])
  );
  
  // Helper to get link by ID
  const getLink = (linkId: string): Link | undefined => {
    return links.find(l => l.id === linkId);
  };
  
  // Get reaction type for a link
  const getReactionType = (linkId: string): 'positive' | 'negative' | 'neutral' => {
    if (sectionData.feedbackItems && sectionData.feedbackItems[linkId]) {
      return sectionData.feedbackItems[linkId].reaction;
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

  // Determine icon based on link type
  const getLinkIcon = (type?: string) => {
    switch(type) {
      case "spotify":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5s2.01-4.5 4.5-4.5 4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/>
          </svg>
        );
      case "youtube":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816z"/>
            <path d="M9.6 15.6V8.4l6.4 3.6-6.4 3.6z"/>
          </svg>
        );
      case "twitter":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
          </svg>
        );
      case "threads":
      case "instagram":
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        );
      default:
        return <Globe className="h-4 w-4" />;
    }
  };
  
  // Generate background color based on the link type
  const getLinkBackground = (type?: string) => {
    switch(type) {
      case "spotify": return "bg-green-50 text-green-700";
      case "youtube": return "bg-red-50 text-red-700";
      case "twitter": return "bg-blue-50 text-blue-700";
      case "instagram": return "bg-pink-50 text-pink-700";
      case "threads": return "bg-gray-50 text-gray-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };
  
  return (
    <div className="space-y-4">
      {allFeedbackLinks.length > 0 ? (
        allFeedbackLinks.map((linkId) => {
          const link = getLink(linkId);
          if (!link) return null;
          
          return (
            <div key={linkId} className="border-b border-gray-100 pb-3 mb-3 last:border-0">
              <div className="flex items-start">
                {/* Link icon and title */}
                <div className="flex-grow flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", getLinkBackground(link.type))}>
                    {getLinkIcon(link.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      {link.title}
                    </h4>
                    <div className="flex items-center gap-1">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline truncate max-w-[200px] inline-flex items-center gap-1"
                      >
                        {link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Feedback indicators */}
                <div>
                  {getReactionType(linkId) === 'positive' && (
                    <div className="flex items-center text-green-500">
                      <ThumbsUp size={14} className="mr-1" />
                      <span className="text-xs">Positive</span>
                    </div>
                  )}
                  {getReactionType(linkId) === 'negative' && (
                    <div className="flex items-center text-red-500">
                      <ThumbsDown size={14} className="mr-1" />
                      <span className="text-xs">Negative</span>
                    </div>
                  )}
                  {getReactionType(linkId) === 'neutral' && commentsByLink[linkId] && (
                    <div className="flex items-center text-amber-500">
                      <MessageSquare size={14} className="mr-1" />
                      <span className="text-xs">Comment</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Brief link description */}
              {link.description && (
                <div className="mt-2 mb-2 pl-11 text-xs text-gray-500">
                  {link.description.length > 120 ? `${link.description.substring(0, 120)}...` : link.description}
                </div>
              )}
              
              {/* Comments for this link */}
              {commentsByLink[linkId] && commentsByLink[linkId].length > 0 && (
                <div className="mt-3 pl-11 space-y-2">
                  {commentsByLink[linkId].map((comment, idx) => (
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
          No specific feedback for links in this section.
        </div>
      )}
    </div>
  );
};

export default LinksReviewer;
