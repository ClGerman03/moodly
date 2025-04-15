"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
      <div className="flex items-center gap-2 backdrop-blur-sm bg-gray-500/10 px-3 py-2 rounded-full">
        {!isFirst && (
          <motion.button
            onClick={onPrevious}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 focus:outline-none"
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            aria-label="Previous section"
          >
            <ArrowLeft size={16} className="text-gray-700" />
          </motion.button>
        )}
        
        <motion.button
          onClick={onNext}
          className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-gray-700 transition-all duration-200 rounded-full bg-white/50 hover:bg-white/70 focus:outline-none transform hover:scale-[1.02]"
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15 }}
          aria-label={isLast ? "Finish" : "Next section"}
        >
          <span>{isLast ? "Finish" : "Next"}</span>
          <ArrowRight size={14} className="opacity-70" />
        </motion.button>
      </div>
    </div>
  );
};

export default NavigationControls;
