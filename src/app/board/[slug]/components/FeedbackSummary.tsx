"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/app/tablero/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { normalizeFeedback } from "./feedback/adapters/feedbackNormalizer";

// Import specialized components for each summary type
import ImageGallerySummary from "./feedback/summary/ImageGallerySummary";
import ColorPaletteSummary from "./feedback/summary/ColorPaletteSummary";
import TypographySummary from "./feedback/summary/TypographySummary";
import TextSummary from "./feedback/summary/TextSummary";
import LinksSummary from "./feedback/summary/LinksSummary";

interface FeedbackSummaryProps {
  sections: Section[];
  feedback: Record<string, Record<string, unknown>>;
  onFinish: () => void;
  clientName: string;
}

/**
 * Component that displays a summary of the feedback provided by the user
 * for all board sections
 */
const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({
  sections,
  feedback,
  onFinish,
  clientName
}) => {
  // Changed from Record<string, boolean> to just string to allow only one open section
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  // Function to expand/collapse sections - modified to only allow one open section
  const toggleSection = (sectionId: string) => {
    setExpandedSectionId(prevId => prevId === sectionId ? null : sectionId);
  };

  // Determine if a section has feedback
  const hasFeedback = (sectionId: string): boolean => {
    return !!feedback[sectionId] && Object.keys(feedback[sectionId]).length > 0;
  };
  
  // Render feedback for a specific section
  const renderSectionFeedback = (section: Section) => {
    const sectionFeedback = feedback[section.id] || {};
    const isExpanded = expandedSectionId === section.id;
    
    return (
      <motion.div 
        key={section.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 overflow-hidden"
      >
        <div 
          className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors rounded-lg"
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-center">
            <h3 className="text-lg font-light text-gray-800 dark:text-gray-200">
              {section.title}
            </h3>
          </div>
          <div className="flex items-center">
            {isExpanded ? 
              <ChevronUp size={18} className="text-gray-500 dark:text-gray-400" /> : 
              <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
            }
          </div>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-3 pr-3 pb-2"
            >
              {hasFeedback(section.id) ? (
                <div className="pt-2">
                  {/* Use specialized components based on section type */}
                  {renderSectionContent(section, sectionFeedback)}
                </div>
              ) : (
                <div className="py-3 text-center text-gray-500 dark:text-gray-400 italic text-sm">
                  No comments
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Render specific content based on section type
  const renderSectionContent = (section: Section, sectionFeedback: Record<string, unknown>) => {
    // Normalize feedback for this section type
    const normalizedFeedback = normalizeFeedback(section.type, sectionFeedback);
    
    // Render the appropriate component according to the type
    switch (section.type) {
      case "imageGallery":
        return <ImageGallerySummary section={section} normalizedFeedback={normalizedFeedback} />;
      case "palette":
        return <ColorPaletteSummary section={section} normalizedFeedback={normalizedFeedback} />;
      case "typography":
        return <TypographySummary section={section} normalizedFeedback={normalizedFeedback} />;
      case "text":
        return <TextSummary section={section} normalizedFeedback={normalizedFeedback} />;
      case "links":
        return <LinksSummary section={section} normalizedFeedback={normalizedFeedback} />;
      default:
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            Feedback not available for this section type
          </div>
        );
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="w-full max-w-2xl mx-auto">
        <motion.div
          className="flex flex-col items-center text-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl font-light text-gray-800 dark:text-gray-100 mb-3">
            Feedback Summary
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-light mb-6">
            {clientName ? `Feedback provided by ${clientName}` : 'Anonymous feedback'}
          </p>
        </motion.div>
        
        <div className="space-y-2">
          {sections.map(renderSectionFeedback)}
        </div>
        
        <div className="mt-12 flex justify-center">
          <button
            onClick={onFinish}
            className="w-auto px-6 py-2 text-sm font-light text-white dark:text-gray-100 transition-all duration-300 rounded-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:ring-offset-2 transform hover:scale-[1.02] opacity-90 hover:opacity-100 flex items-center justify-center"
          >
            Finish Review
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedbackSummary;
