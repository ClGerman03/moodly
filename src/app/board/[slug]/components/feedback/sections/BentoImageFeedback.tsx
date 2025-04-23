"use client";

import { useState, useRef, useMemo } from "react";
import { PanInfo } from "framer-motion";
import { Section } from "@/app/tablero/types";
import ImageFeedbackContainer from "../popups/imagefeedback/ImageFeedbackContainer";
import ImageCarousel from "../layout/ImageCarousel";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import FeedbackButtons from "../shared/FeedbackButtons";
import FeedbackIndicator from "../shared/FeedbackIndicator";
import { useSectionFeedback } from "../hooks/useSectionFeedback";

interface BentoImageFeedbackProps {
  section: Section;
  onFeedback?: (sectionId: string, data: Record<string, unknown>) => void;
}

const BentoImageFeedback: React.FC<BentoImageFeedbackProps> = ({ 
  section,
  onFeedback
}) => {
  // Referencias y estados
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useResponsiveLayout(containerRef);
  
  // Estas variables no se utilizan en el componente actual, pero se mantienen 
  // para futuros desarrollos o porque se usan en partes del código que no hemos modificado
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [tappedImage, setTappedImage] = useState<string | null>(null);
  
  // Estados para carrusel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Utilizar el hook común para gestión de feedback
  const {
    selectedItemForComment,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentComment,
    setCurrentComment,
    handleItemFeedback,
    handleSubmitComment,
    cancelComment,
    getItemFeedback,
    getItemComments
  } = useSectionFeedback({
    sectionId: section.id,
    onFeedbackChange: onFeedback
  });
  
  // Extraer datos de la sección
  const images = useMemo(() => section.data?.images || [], [section.data?.images]);
  const imageMetadata = useMemo(() => section.data?.imageMetadata || {}, [section.data?.imageMetadata]);
  
  // Handlers para el carrusel
  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -50) {
      setDirection(1);
      setCurrentImageIndex(prev => 
        prev < images.length - 1 ? prev + 1 : prev
      );
    } else if (info.offset.x > 50) {
      setDirection(-1);
      setCurrentImageIndex(prev => 
        prev > 0 ? prev - 1 : prev
      );
    }
  };
  
  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setDirection(-1);
      setCurrentImageIndex(prev => prev - 1);
    }
  };
  
  const goToNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setDirection(1);
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  // Esta función se define pero no se utiliza en el componente actual
  // Se mantiene para futuros desarrollos o porque podría usarse en partes del código
  // que no hemos modificado
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleImageTap = (imageUrl: string) => {
    setTappedImage(imageUrl === tappedImage ? null : imageUrl);
  };

  // Obtener metadatos de la imagen seleccionada para comentario
  const selectedImageMetadata = selectedItemForComment ? 
    imageMetadata[selectedItemForComment] || null : null;

  // Ajustar altura del carrusel según el dispositivo
  const carouselHeight = isMobile ? "h-[70vh]" : "h-[60vh]";

  return (
    <div className="py-4" ref={containerRef}>
      {/* Carrusel de imágenes (tanto para móvil como desktop) */}
      <div className={isMobile ? "mb-8" : "mb-4"}>
        <div className={`relative ${carouselHeight} transition-all duration-300 max-w-4xl mx-auto`}>
          <ImageCarousel
            images={images}
            currentIndex={currentImageIndex}
            direction={direction}
            onSwipe={handleSwipe}
            onPrevious={goToPreviousImage}
            onNext={goToNextImage}
            isMobile={isMobile}
          >
            {(imageUrl: string) => {
              const metadata = imageMetadata[imageUrl] || {};
              const reaction = getItemFeedback(imageUrl);
              
              return (
                <div 
                  className="relative w-full h-full flex flex-col"
                  onMouseEnter={() => !isMobile && setHoveredImage(imageUrl)}
                  onMouseLeave={() => !isMobile && setHoveredImage(null)}
                >
                  {/* Contenedor principal de la imagen con metadata */}
                  <div className="relative flex-grow">
                    {/* Título de la imagen si existe */}
                    {metadata.title && (
                      <div className={`absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 text-sm text-center z-10`}>
                        {metadata.title}
                      </div>
                    )}
                    
                    {/* Indicador de feedback activo animado */}
                    {(reaction || getItemComments(imageUrl).length > 0) && (
                      <div className="absolute top-3 right-3 z-10">
                        <FeedbackIndicator 
                          type={reaction || 'hasComments'} 
                          hasComments={getItemComments(imageUrl).length > 0}
                          size={16} 
                          className="shadow-lg" 
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Botones de feedback en la parte inferior, siempre visibles */}
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center py-2 z-10">
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 shadow-sm">
                      <FeedbackButtons
                        onFeedback={(type) => handleItemFeedback(imageUrl, type)}
                        currentFeedback={reaction}
                        className="bg-transparent"
                        allowComment={true}
                        useMessageIcon={!isMobile}
                      />
                    </div>
                  </div>
                </div>
              );
            }}
          </ImageCarousel>
        </div>
      </div>
      
      {/* Popup de comentarios */}
      {selectedItemForComment && (
        <ImageFeedbackContainer
          isOpen={!!selectedItemForComment}
          onClose={cancelComment}
          imageUrl={selectedItemForComment}
          imageTitle={selectedImageMetadata?.title || ""}
          imageTags={[]}
          onSubmitComment={(comment) => {
            setCurrentComment(comment);
            handleSubmitComment(comment);
          }}
          existingComments={getItemComments(selectedItemForComment).map(c => ({
            imageUrl: c.itemId,
            comment: c.comment,
            timestamp: c.timestamp || ''
          }))}
        />
      )}
    </div>
  );
};

export default BentoImageFeedback;
