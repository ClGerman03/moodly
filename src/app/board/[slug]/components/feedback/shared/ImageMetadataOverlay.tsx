import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

// Definición local del tipo ImageMetadata para incluir tags
interface ImageMetadata {
  title?: string;
  description?: string;
  tags?: string[];
}

interface ImageMetadataOverlayProps {
  metadata: ImageMetadata;
  isMobile: boolean;
}

/**
 * Componente para mostrar metadatos de imagen (título y descripción) de manera sutil y moderna
 */
const ImageMetadataOverlay: React.FC<ImageMetadataOverlayProps> = ({
  metadata,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isMobile
}) => {
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  
  const hasDescription = metadata.description && 
    metadata.description !== '<p></p>' && 
    metadata.description !== '<p>&nbsp;</p>';
  
  const hasTags = metadata.tags && Array.isArray(metadata.tags) && metadata.tags.length > 0;
  
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showFullDetails) {
      // Guardar el overflow original para restaurarlo después
      const originalOverflow = document.body.style.overflow;
      // Prevenir scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restaurar el scroll al desmontar
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showFullDetails]);
  
  // Detectar si la descripción es demasiado larga y debe truncarse
  useEffect(() => {
    if (descriptionRef.current) {
      const isOverflowing = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      setIsDescriptionTruncated(isOverflowing);
    }
  }, [metadata.description]);
  
  if (!metadata.title && !hasDescription && !hasTags) return null;
  
  // Modal de detalles completos
  const renderModal = () => {
    if (!showFullDetails) return null;
    
    return createPortal(
      <AnimatePresence>
        <motion.div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowFullDetails(false)}
          style={{ isolation: 'isolate' }}
        >
          <motion.div 
            className="max-w-2xl w-full max-h-[80vh] overflow-auto"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            {metadata.title && (
              <h3 className="font-medium text-xl text-white mb-3">{metadata.title}</h3>
            )}
            
            {/* Tags en el modal completo */}
            {hasTags && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {metadata.tags?.map((tag: string, index: number) => (
                  <span key={index} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {hasDescription && (
              <div 
                className="text-sm text-white/90 prose prose-sm prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: metadata.description || '' }}
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  };
  
  return (
    <div className="h-full w-full relative">
      {/* Overlay clickable que cubre toda la imagen */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={() => setShowFullDetails(true)}
      />
      
      {/* Overlay de información siempre visible - alineado al fondo de la imagen */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent 
                     px-3 pb-4 pt-8 text-white transition-all duration-300">
        {metadata.title && (
          <h4 className="font-medium text-sm mb-1">{metadata.title}</h4>
        )}
        
        {/* Tags */}
        {hasTags && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {metadata.tags?.map((tag: string, index: number) => (
              <span key={index} className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {hasDescription && !showFullDetails && (
          <>
            <div 
              ref={descriptionRef}
              className="text-xs text-white/90 prose prose-sm prose-invert max-w-none overflow-hidden max-h-12"
              dangerouslySetInnerHTML={{ __html: metadata.description || '' }}
            />
            
            {isDescriptionTruncated && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDetails(true);
                }}
                className="text-xs flex items-center text-white/70 hover:text-white mt-1 transition-colors focus:outline-none bg-transparent"
              >
                See more
                <LucideChevronRight size={12} className="ml-0.5" />
              </button>
            )}
          </>
        )}
      </div>
      
      {/* Renderizar el modal con portal */}
      {renderModal()}
    </div>
  );
};

export default ImageMetadataOverlay;
