"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface AddImageButtonProps {
  onClick: () => void;
}

/**
 * Button to add new images to the gallery
 */
const AddImageButton: React.FC<AddImageButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      className="mt-4 flex items-center justify-center w-full h-14 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 bg-white/50 backdrop-blur-sm hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 transition-all duration-200"
      whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
    >
      <Plus size={20} className="mr-2" />
      Add images
    </motion.button>
  );
};

export default AddImageButton;
