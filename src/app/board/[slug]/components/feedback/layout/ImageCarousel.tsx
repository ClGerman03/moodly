"use client";

import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";

interface ImageCarouselProps {
  images: string[];
  currentIndex: number;
  direction: number;
  onSwipe: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  onPrevious: () => void;
  onNext: () => void;
  children: (imageUrl: string) => React.ReactNode;
  isMobile?: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  currentIndex,
  direction,
  onSwipe,
  onPrevious,
  onNext,
  children,
  isMobile = false
}) => {
  // Manejadores explícitos para los eventos de botones
  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPrevious();
  }, [onPrevious]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onNext();
  }, [onNext]);

  return (
    <div className="relative h-[75vh] w-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          className="absolute inset-0 w-full h-full flex items-center justify-center p-4"
          initial={{ opacity: 0, x: direction * 250 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 250 }}
          transition={{ duration: 0.3 }}
          {...(isMobile ? {
            drag: "x",
            dragConstraints: { left: 0, right: 0 },
            dragElastic: 0.7,
            onDragEnd: onSwipe
          } : {})}
        >
          <div className="relative w-full h-full overflow-hidden rounded-xl">
            <Image
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              fill
              className="object-contain rounded-xl"
              sizes="100vw"
              priority
            />

            {/* Controles de navegación */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-20">
              <motion.button
                className={`p-2 rounded-full bg-black/50 text-white ${
                  currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "opacity-70 cursor-pointer hover:opacity-100"
                }`}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                aria-label="Previous image"
                // Evitar la propagación para navegación en desktop
                onPointerDown={(e) => e.stopPropagation()}
              >
                <ChevronLeft size={16} />
              </motion.button>

              <motion.button
                className={`p-2 rounded-full bg-black/50 text-white ${
                  currentIndex === images.length - 1 ? "opacity-30 cursor-not-allowed" : "opacity-70 cursor-pointer hover:opacity-100"
                }`}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                disabled={currentIndex === images.length - 1}
                aria-label="Next image"
                // Evitar la propagación para navegación en desktop
                onPointerDown={(e) => e.stopPropagation()}
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>

            {/* Contenido adicional (feedback, etc.) */}
            {children(images[currentIndex])}

            {/* Indicador de posición */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${
                    idx === currentIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ImageCarousel;
