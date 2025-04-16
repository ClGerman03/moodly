"use client";

import { useState, useRef, useMemo } from "react";
import { motion, PanInfo } from "framer-motion";
import Image from "next/image";
import { ThumbsUp, ThumbsDown, HelpCircle, MessageSquare } from "lucide-react";
import { Section } from "@/app/tablero/types";
import ImageFeedbackPopup from "./ImageFeedbackPopup";
import ImageGridLayout from "./layout/ImageGridLayout";
import ImageCarousel from "./layout/ImageCarousel";
import { useResponsiveLayout } from "./hooks/useResponsiveLayout";

// Define the ImageLayout type that was missing
type ImageLayout = "square" | "vertical" | "horizontal";

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
  const { containerWidth, gridCols, isMobile } = useResponsiveLayout(containerRef);
  
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [tappedImage, setTappedImage] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<Record<string, 'positive' | 'negative' | 'neutral' | null>>({});
  
  // Estados para el popup de comentarios
  const [isCommentPopupOpen, setIsCommentPopupOpen] = useState(false);
  const [selectedImageForComment, setSelectedImageForComment] = useState("");
  
  // Estados para carrusel móvil
  const [currentMobileImageIndex, setCurrentMobileImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Extraer datos de la sección
  const images = useMemo(() => section.data?.images || [], [section.data?.images]);
  const imageLayouts = useMemo(() => {
    const layouts = section.data?.imageLayouts || {};
    return Object.entries(layouts).reduce((acc, [key, value]) => {
      const layout = value as ImageLayout;
      if (layout === "square" || layout === "vertical" || layout === "horizontal") {
        acc[parseInt(key)] = layout;
      }
      return acc;
    }, {} as Record<number, ImageLayout>);
  }, [section.data?.imageLayouts]);
  
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
  const handleImageFeedback = (imageUrl: string, type: 'positive' | 'negative' | 'neutral' | 'comment') => {
    if (type === 'comment') {
      setSelectedImageForComment(imageUrl);
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
      [selectedImageForComment]: 'neutral'
    }));
    
    onFeedback?.(section.id, {
      imageFeedback: {
        ...userFeedback,
        [selectedImageForComment]: 'neutral'
      },
      commentContent: {
        imageUrl: selectedImageForComment,
        comment,
        timestamp: new Date().toISOString()
      }
    });
    
    setIsCommentPopupOpen(false);
  };
  
  const handleImageTap = (imageUrl: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isMobile) {
      setTappedImage(tappedImage === imageUrl ? null : imageUrl);
    }
  };

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
        {['positive', 'negative', 'neutral', 'comment'].map((type) => (
          <motion.button
            key={type}
            className={`${
              type === 'comment' ? 'bg-amber-400 text-black' : 'bg-black/70 text-white'
            } p-2 rounded-full hover:bg-black/80 transition-colors`}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleImageFeedback(imageUrl, type as 'positive' | 'negative' | 'neutral' | 'comment')}
            aria-label={type}
          >
            <motion.div
              whileHover={{
                color: type === 'positive' ? "rgba(167, 243, 208, 0.9)" :
                       type === 'negative' ? "rgba(252, 165, 165, 0.9)" :
                       type === 'neutral' ? "rgba(186, 230, 253, 0.9)" :
                       "rgba(0, 0, 0, 0.7)"
              }}
            >
              {type === 'positive' ? <ThumbsUp size={16} strokeWidth={1.5} /> :
               type === 'negative' ? <ThumbsDown size={16} strokeWidth={1.5} /> :
               type === 'neutral' ? <HelpCircle size={16} strokeWidth={1} /> :
               <MessageSquare size={16} strokeWidth={1.5} />}
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Popup para comentarios */}
      <ImageFeedbackPopup
        isOpen={isCommentPopupOpen}
        onClose={() => setIsCommentPopupOpen(false)}
        imageUrl={selectedImageForComment}
        imageTitle={section.title}
        onSubmitComment={handleSubmitComment}
      />

      {isMobile ? (
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
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/70 text-white">
                  {userFeedback[imageUrl] === 'positive' ? (
                    <ThumbsUp size={11} strokeWidth={2} />
                  ) : userFeedback[imageUrl] === 'negative' ? (
                    <ThumbsDown size={11} strokeWidth={2} />
                  ) : (
                    <HelpCircle size={11} strokeWidth={1.5} />
                  )}
                </div>
              )}
              {renderFeedbackPanel(imageUrl)}
            </>
          )}
        </ImageCarousel>
      ) : (
        <ImageGridLayout
          images={images}
          imageLayouts={imageLayouts}
          containerWidth={containerWidth}
          gridCols={gridCols}
        >
          {(imageUrl, index) => (
            <div key={`image-${index}`} className="overflow-hidden relative rounded-xl">
              <motion.div
                className="relative w-full h-full cursor-pointer"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                onHoverStart={() => !isMobile && setHoveredImage(imageUrl)}
                onHoverEnd={() => !isMobile && setHoveredImage(null)}
                onClick={(e) => handleImageTap(imageUrl, e)}
              >
                <Image
                  src={imageUrl}
                  alt={`Imagen ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain"
                  priority={index < 4}
                />
                
                {userFeedback[imageUrl] && !hoveredImage && !tappedImage && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/70 text-white">
                    {userFeedback[imageUrl] === 'positive' ? (
                      <ThumbsUp size={11} strokeWidth={2} />
                    ) : userFeedback[imageUrl] === 'negative' ? (
                      <ThumbsDown size={11} strokeWidth={2} />
                    ) : (
                      <HelpCircle size={11} strokeWidth={1.5} />
                    )}
                  </div>
                )}
                
                {(hoveredImage === imageUrl || tappedImage === imageUrl) && (
                  <motion.div
                    className="absolute inset-0 bg-black/40 flex items-end justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderFeedbackPanel(imageUrl)}
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </ImageGridLayout>
      )}
    </div>
  );
};

export default BentoImageFeedback;
