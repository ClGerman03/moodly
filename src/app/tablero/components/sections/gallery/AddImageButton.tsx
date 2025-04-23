"use client";

import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";

interface AddImageButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Button to add new images to the gallery
 */
const AddImageButton: React.FC<AddImageButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <motion.button
      className={`mt-4 flex items-center justify-center w-full h-14 rounded-xl border-2 border-dashed 
        ${disabled 
          ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' 
          : 'border-gray-300 text-gray-500 bg-white/50 backdrop-blur-sm hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700'
        } transition-all duration-200`}
      whileHover={!disabled ? { scale: 1.01, backgroundColor: '#f3f4f6' } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={!disabled ? onClick : undefined}
    >
      {disabled ? (
        <Loader2 size={20} className="mr-2 animate-spin" />
      ) : (
        <Plus size={20} className="mr-2" />
      )}
      {disabled ? 'Subiendo...' : 'Add images'}
    </motion.button>
  );
};

export default AddImageButton;
