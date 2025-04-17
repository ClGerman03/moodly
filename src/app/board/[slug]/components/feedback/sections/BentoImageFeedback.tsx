"use client";

import { useState, useRef, useMemo } from "react";
import { motion, PanInfo } from "framer-motion";
import { ThumbsUp, ThumbsDown, PenTool } from "lucide-react";
import { Section } from "@/app/tablero/types";
import ImageFeedbackContainer from "../popups/imagefeedback/ImageFeedbackContainer";
import ImageCarousel from "../layout/ImageCarousel";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";


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
  
  const [hoveredImage] = useState<string | null>(null);
  const [tappedImage, setTappedImage] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<Record<string, 'positive' | 'negative' | null>>({});
  
  // Estados para el popup de comentarios
  const [isCommentPopupOpen, setIsCommentPopupOpen] = useState(false);
  const [selectedImageForComment, setSelectedImageForComment] = useState("");
  const [selectedImageMetadata, setSelectedImageMetadata] = useState<{ title?: string; description?: string; tags?: string[] } | null>(null);
  
  // Estados para carrusel móvil
  const [currentMobileImageIndex, setCurrentMobileImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Extraer datos de la sección
  const images = useMemo(() => section.data?.images || [], [section.data?.images]);
  const imageMetadata = useMemo(() => section.data?.imageMetadata || {}, [section.data?.imageMetadata]);
  // Mantenemos imageMetadata y removemos imageLayouts ya que no se usa
  
  
  // Handlers para el carrusel móvil
  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isMobile) return;
    
    if (info.offset.x < -50) {
      setDirection(1);
      setCurrentMobileImageIndex(prev => 
        prev < images.length - 1 ? prev + 1 : prev
      );
    } else if (info.offset.x > 50) {
      setDirection(-1);
      setCurrentMobileImageIndex(prev => 
        prev > 0 ? prev - 1 : prev
      );
    }
  };
  
  const goToPreviousImage = () => {
    if (currentMobileImageIndex > 0) {
      setDirection(-1);
      setCurrentMobileImageIndex(prev => prev - 1);
    }
  };
  
  const goToNextImage = () => {
    if (currentMobileImageIndex < images.length - 1) {
      setDirection(1);
      setCurrentMobileImageIndex(prev => prev + 1);
    }
  };

  // Handlers para feedback
  const handleImageFeedback = (imageUrl: string, type: 'positive' | 'negative' | 'comment') => {
    if (type === 'comment') {
      // Extraer y pasar también los metadatos de la imagen
      setSelectedImageForComment(imageUrl);
      setSelectedImageMetadata(imageMetadata[imageUrl] || null);
      setIsCommentPopupOpen(true);
      if (isMobile) setTappedImage(null);
      return;
    }
    
    setUserFeedback(prev => ({
      ...prev,
      [imageUrl]: type
    }));
    
    onFeedback?.(section.id, {
      imageFeedback: {
        ...userFeedback,
        [imageUrl]: type
      }
    });
    
    if (isMobile) setTappedImage(null);
  };
  
  const handleSubmitComment = (comment: string) => {
    setUserFeedback(prev => ({
      ...prev,
      [selectedImageForComment]: 'positive'
    }));
    
    onFeedback?.(section.id, {
      imageFeedback: {
        ...userFeedback,
        [selectedImageForComment]: 'positive'
      },
      commentContent: {
        imageUrl: selectedImageForComment,
        comment,
        timestamp: new Date().toISOString()
      }
    });
    
    setIsCommentPopupOpen(false);
  };
  
  // Eliminado handleImageTap ya que no se utiliza
  

  // Si no hay imágenes, mostrar mensaje
  if (!images.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        Este tablero no contiene imágenes
      </div>
    );
  }

  const renderFeedbackPanel = (imageUrl: string) => (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center mb-4 px-3">
      <div 
        className="flex gap-2 items-center bg-black/30 backdrop-blur-sm py-3 px-4 rounded-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Feedback buttons */}
        {['positive', 'negative', 'comment'].map((type) => (
          <motion.button
            key={type}
            className={`${
              type === 'comment' ? 'bg-yellow-400 text-black' : 'bg-black/70 text-white'
            } p-2 rounded-full ${
              type === 'comment' ? 'shadow-sm hover:bg-yellow-400' : 'hover:bg-black/80'
            } transition-colors`}
            whileHover={{ 
              scale: type === 'comment' ? 1.1 : 1.05,
              backgroundColor: type === 'comment' ? 'rgba(250, 204, 21, 1)' : undefined 
            }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleImageFeedback(imageUrl, type as 'positive' | 'negative' | 'comment')}
            aria-label={type}
          >
            <motion.div
              whileHover={{
                color: type === 'positive' ? "rgba(167, 243, 208, 0.9)" :
                       type === 'negative' ? "rgba(252, 165, 165, 0.9)" :
                       "rgba(0, 0, 0, 0.8)"
              }}
            >
              {type === 'positive' ? <ThumbsUp size={16} strokeWidth={1.5} /> :
               type === 'negative' ? <ThumbsDown size={16} strokeWidth={1.5} /> :
               <PenTool size={18} strokeWidth={1.5} />}
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Contenedor responsivo para comentarios (popup en móvil, popover en desktop) */}
      <ImageFeedbackContainer 
        isOpen={isCommentPopupOpen} 
        onClose={() => setIsCommentPopupOpen(false)}
        imageUrl={selectedImageForComment}
        imageTitle={selectedImageMetadata?.title || ""}
        imageTags={selectedImageMetadata?.tags || []}
        onSubmitComment={(comment) => {
          handleSubmitComment(comment);
          setIsCommentPopupOpen(false);
        }}
      />

      {/* Usamos el carrusel tanto en móvil como en desktop para una mejor visualización */}
      <ImageCarousel
        images={images}
        currentIndex={currentMobileImageIndex}
        direction={direction}
        onSwipe={handleSwipe}
        onPrevious={goToPreviousImage}
        onNext={goToNextImage}
      >
        {(imageUrl) => (
          <>
            {userFeedback[imageUrl] && !hoveredImage && !tappedImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center bg-black/70 text-white shadow-md"
              >
                {userFeedback[imageUrl] === 'positive' ? (
                  <ThumbsUp size={16} strokeWidth={1.5} />
                ) : (
                  <ThumbsDown size={16} strokeWidth={1.5} />
                )}
              </motion.div>
            )}
            {renderFeedbackPanel(imageUrl)}
          </>
        )}
      </ImageCarousel>
    </div>
  );
};

export default BentoImageFeedback;
