"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface NavigationControlsProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentStep?: number;
  totalSteps?: number;
}

/**
 * Controles de navegación para moverse entre secciones del tablero
 */
const NavigationControls: React.FC<NavigationControlsProps> = ({
  onNext,
  onPrevious,
  isFirst,
  isLast
}) => {
  return (
    <div className="fixed bottom-8 left-0 right-0 z-40 px-6 flex justify-center">
      <div className="flex items-center gap-4 backdrop-blur-sm bg-gray-500/10 px-4 py-2 rounded-full">
        {!isFirst && (
          <motion.button
            onClick={onPrevious}
            className="flex items-center justify-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            aria-label="Previous section"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </motion.button>
        )}
        
        <motion.button
          onClick={onNext}
          className="px-5 py-2 text-sm font-light text-gray-700 dark:text-gray-300 transition-all duration-200 rounded-full bg-white/50 hover:bg-white/70 dark:bg-gray-800/40 dark:hover:bg-gray-800/60 focus:outline-none transform hover:scale-[1.02]"
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15 }}
          aria-label={isLast ? "Finish" : "Next section"}
        >
          <span>{isLast ? "Finish" : "Next"}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default NavigationControls;
