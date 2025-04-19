"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import ImageTags from "../../../ImageTags";

interface ImageViewerProps {
  imageUrl: string;
  imageTitle?: string;
  imageTags?: string[];
  isPopover?: boolean;
}

/**
 * Componente reutilizable para mostrar una imagen con etiquetas
 */
const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  imageTitle = "",
  imageTags = [],
  isPopover = false
}) => {
  return (
    <motion.div 
      className={`relative ${isPopover ? 'mt-0' : 'mb-4'}`}
      initial={{ y: 0, opacity: 0.8 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <div className="relative">
        <Image
          src={imageUrl}
          alt={imageTitle || "Selected image"}
          width={800}
          height={600}
          className={`${isPopover ? 'max-h-[40vh]' : 'max-h-[70vh]'} w-auto object-contain mx-auto`}
          style={{ objectFit: 'contain' }}
          priority
          unoptimized={imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')}
        />
        
        {/* Mostrar etiquetas si existen */}
        {imageTags && imageTags.length > 0 && (
          <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
            <ImageTags tags={imageTags} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ImageViewer;
