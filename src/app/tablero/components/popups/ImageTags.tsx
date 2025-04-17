"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag } from "lucide-react";

interface ImageTagsProps {
  tags: string[];
}

/**
 * Componente que muestra etiquetas sutilmente encima de la imagen
 */
const ImageTags: React.FC<ImageTagsProps> = ({
  tags = []
}) => {
  if (tags.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-3 pb-4 pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="flex flex-wrap gap-1.5 justify-center">
          {tags.map((tag, index) => (
            <motion.div
              key={`overlay-tag-${tag}-${index}`}
              className="bg-black/25 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs text-white flex items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: 0.1 * index, duration: 0.2 } 
              }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
            >
              <Tag size={10} className="mr-1 opacity-80" />
              <span>{tag}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageTags;
