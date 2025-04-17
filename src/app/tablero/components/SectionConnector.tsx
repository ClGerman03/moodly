"use client";

import { motion } from "framer-motion";

interface SectionConnectorProps {
  index: number;
}

/**
 * A minimalist visual connector between sections to show progression
 * Displays "Start" for the first connector, then numbers for subsequent ones
 */
const SectionConnector: React.FC<SectionConnectorProps> = ({ index }) => {
  return (
    <motion.div 
      className="flex items-center justify-center py-4 my-1 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      {/* Vertical line connector */}
      <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-gray-200 z-0" />
      
      {/* Circle with label */}
      <motion.div 
        className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 z-10 relative"
        whileHover={{ scale: 1.05, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-xs font-light text-gray-500">
          {index === 0 ? "0" : index}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default SectionConnector;
