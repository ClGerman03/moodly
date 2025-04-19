"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Section, TextContent, TextSize } from "@/app/tablero/types";
import { useSectionFeedback } from "../hooks/useSectionFeedback";
import FeedbackButtons from "../shared/FeedbackButtons";
import CommentSection from "../shared/CommentSection";

interface TextSectionFeedbackProps {
  section: Section;
  onFeedback?: (sectionId: string, data: Record<string, unknown>) => void;
}

/**
 * Component for displaying text section in the public board view
 * Allows viewing the title and subtitle with the configured size
 * and providing feedback
 */
const TextSectionFeedback: React.FC<TextSectionFeedbackProps> = ({
  section,
  onFeedback
}) => {
  // State for comment mode
  const [isCommentMode, setIsCommentMode] = useState<boolean>(false);

  // Use the common feedback hook
  const {
    currentComment,
    setCurrentComment,
    handleItemFeedback,
    handleSubmitComment,
    cancelComment,
    getItemFeedback,
    getItemComments
  } = useSectionFeedback({
    sectionId: section.id,
    onFeedbackChange: onFeedback
  });
  
  // Extract the text content from the section
  const textContent = section.data?.textContent as TextContent | undefined;
  
  // If there's no text content, show a message
  if (!textContent) {
    return (
      <div className="py-8 text-center text-gray-500">
        This section contains no text
      </div>
    );
  }

  // Determine size classes based on configuration
  const getTitleClass = (size: TextSize) => {
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

  const getSubtitleClass = (size: TextSize) => {
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

  // Handler for text feedback
  const handleTextFeedback = (type: string) => {
    // We use 'text' as the item ID since there's only one text component
    const textId = 'text';
    
    if (type === 'comment') {
      setIsCommentMode(true);
      handleItemFeedback(textId, type as any);
      return;
    }
    
    // Use our hook to manage feedback
    handleItemFeedback(textId, type as any);
  };
  
  // Handler for submitting text comments
  const handleTextCommentSubmit = () => {
    if (!currentComment.trim()) return;
    
    // Use our hook to submit the comment
    handleSubmitComment();
    
    // Reset UI
    setIsCommentMode(false);
  };
  
  // Handler for canceling comment
  const handleCancelComment = () => {
    cancelComment();
    setIsCommentMode(false);
  };

  return (
    <div className="p-6 md:p-8">
      <motion.div 
        className="max-w-4xl mx-auto mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {textContent.title && (
          <motion.h2 
            className={`${getTitleClass(textContent.size)} text-gray-800 dark:text-gray-100 mb-3`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {textContent.title}
          </motion.h2>
        )}
        
        {textContent.subtitle && (
          <motion.p 
            className={`${getSubtitleClass(textContent.size)} text-gray-600 dark:text-gray-400`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {textContent.subtitle}
          </motion.p>
        )}
      </motion.div>
      
      {/* Feedback panel */}
      <div className="mt-6 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {isCommentMode ? (
            <CommentSection
              itemId="text"
              currentComment={currentComment}
              setCurrentComment={setCurrentComment}
              onSubmitComment={handleTextCommentSubmit}
              onCancelComment={handleCancelComment}
              existingComments={getItemComments('text')}
              title="Add a comment about this text"
            />
          ) : (
            <motion.div 
              key="feedback-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="text-sm text-gray-600 dark:text-gray-300">
                What do you think about this text?
              </div>
              <FeedbackButtons 
                onFeedback={handleTextFeedback}
                currentFeedback={getItemFeedback('text')}
                useMessageIcon={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TextSectionFeedback;
