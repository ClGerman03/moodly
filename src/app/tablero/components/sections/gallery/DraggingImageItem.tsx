"use client";

import Image from "next/image";
import { ImageMetadata } from "./types";

interface DraggingImageItemProps {
  url: string;
  metadata?: ImageMetadata;
}

/**
 * Componente para mostrar una imagen mientras está siendo arrastrada
 */
const DraggingImageItem: React.FC<DraggingImageItemProps> = ({ url, metadata }) => {
  return (
    <div 
      className="relative rounded-xl overflow-hidden shadow-md bg-white h-60 w-60 opacity-90 scale-90 rotate-2"
      style={{ 
        transformOrigin: '0 0',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
      }}
    >
      <div className="h-full w-full">
        <Image
          src={url}
          fill
          alt={metadata?.title || "Imagen arrastrada"}
          className="object-cover"
          sizes="240px"
        />
      </div>
      
      {metadata?.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
          <p className="text-sm text-white font-medium truncate">{metadata.title}</p>
        </div>
      )}
    </div>
  );
};

export default DraggingImageItem;
