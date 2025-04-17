"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { ImageMetadata } from "./gallery/types";
import ImageDetailPopup from "../popups/ImageDetailPopup";

// Custom hooks import
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { useImageUpload } from "../hooks/useImageUpload";

// Components import
import MobileGallery from "./gallery/MobileGallery";
import DesktopGallery from "./gallery/DesktopGallery";
import AddImageButton from "./gallery/AddImageButton";

interface ImageGallerySectionProps {
  images: string[];
  imageMetadata?: Map<string, ImageMetadata>;
  onImagesAdd: (newImages: string[]) => void;
  onImageRemove: (index: number) => void;
  onImageMetadataChange?: (imageUrl: string, metadata: ImageMetadata) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLiveMode?: boolean;
  onReorder?: (newImages: string[]) => void;
}

/**
 * Image gallery component with drag and organization functionality
 */
const ImageGallerySection: React.FC<ImageGallerySectionProps> = ({
  images,
  imageMetadata = new Map(),
  onImagesAdd,
  onImageRemove,
  onImageMetadataChange = () => {},
  fileInputRef,
  isLiveMode = false,
  onReorder = () => {}
}) => {
  // Device detection (mobile vs desktop)
  const isMobileDevice = useDeviceDetection();

  // Basic states
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [touchedImage, setTouchedImage] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState<boolean>(false);
  
  // Image loading management
  const { 
    handleDropFiles, 
    handleFileInputChange, 
    triggerFileDialog 
  } = useImageUpload({ 
    isLiveMode, 
    onImagesAdd, 
    fileInputRef 
  });
  
  // Event handlers for both views
  
  // Handle image click
  const handleImageClick = (index: number) => {
    if (isLiveMode) return;
    
    const imageUrl = images[index];
    
    // Different behavior for touch devices vs. mouse
    if (isMobileDevice) {
      // On mobile devices, we only toggle the selection state
      // to show/hide options. We never open the popup directly.
      setTouchedImage(touchedImage === imageUrl ? null : imageUrl);
    } else {
      // On non-touch devices, open the popup directly
      setSelectedImageIndex(index);
      setIsDetailPopupOpen(true);
    }
  };
  
  // Drag and drop on desktop
  const handleDragStart = (event: DragStartEvent) => {
    if (isLiveMode) return;
    
    const { active } = event;
    setActiveId(active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    if (isLiveMode) return;
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find indices
      const activeIndex = images.findIndex(url => `image-${url}` === active.id);
      const overIndex = images.findIndex(url => `image-${url}` === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        // Use reordering function provided by parent
        onReorder([...images.slice(0, activeIndex), ...images.slice(activeIndex + 1)].slice(0, overIndex).concat(images[activeIndex]).concat([...images.slice(0, activeIndex), ...images.slice(activeIndex + 1)].slice(overIndex)));
      }
    }
    
    setActiveId(null);
  };
  
  // Move image up (for mobile devices)
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      const newImages = [...images];
      // Swap with previous image
      [newImages[index-1], newImages[index]] = [newImages[index], newImages[index-1]];
      onReorder(newImages);
    }
  };
  
  // Move image down (for mobile devices)
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < images.length - 1) {
      const newImages = [...images];
      // Swap with next image
      [newImages[index], newImages[index+1]] = [newImages[index+1], newImages[index]];
      onReorder(newImages);
    }
  };
  
  // Expand image
  const handleImageExpand = (index: number, e?: React.MouseEvent) => {
    // Make sure to stop event propagation
    if (e) {
      e.stopPropagation();
      
      // On mobile devices, we should only open the popup
      // when the event comes explicitly from the expand button
      // and not from the click event on the image
      const isFromExpandButton = 
        e.currentTarget && 
        ((e.currentTarget as HTMLElement).classList.contains('bg-gray-800/90') ||
         (e.currentTarget as HTMLElement).classList.contains('bg-red-500/90'));
      
      // We only open the popup if:
      // 1. We are on desktop (not mobile)
      // 2. Or we are on mobile but the click came from the expand button specifically
      if (!isMobileDevice || isFromExpandButton) {
        setSelectedImageIndex(index);
        setIsDetailPopupOpen(true);
      }
    } else if (!isMobileDevice) {
      // If there is no event (e) and we are not on mobile, we proceed normally
      // (this can occur in some programmatic cases)
      setSelectedImageIndex(index);
      setIsDetailPopupOpen(true);
    }
  };
  
  // Remove image
  const handleImageRemove = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onImageRemove(index);
  };
  
  return (
    <motion.div
      className="w-full p-4 rounded-xl bg-gray-50/50 transition-colors duration-300 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <div 
        className="relative w-full"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropFiles}
      >
        {/* Conditional rendering based on device type */}
        {isMobileDevice ? (
          <MobileGallery
            images={images}
            imageMetadata={imageMetadata}
            hoveredImage={hoveredImage}
            touchedImage={touchedImage}
            isLiveMode={isLiveMode}
            onImageClick={handleImageClick}
            onHover={setHoveredImage}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onImageExpand={handleImageExpand}
            onImageRemove={handleImageRemove}
          />
        ) : (
          <DesktopGallery
            images={images}
            imageMetadata={imageMetadata}
            hoveredImage={hoveredImage}
            touchedImage={touchedImage}
            activeId={activeId}
            isLiveMode={isLiveMode}
            onImageClick={handleImageClick}
            onHover={setHoveredImage}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onImageRemove={handleImageRemove}
            onImageExpand={handleImageExpand}
          />
        )}

        {/* Popup for image details */}
        <AnimatePresence>
          {isDetailPopupOpen && selectedImageIndex !== null && (
            <ImageDetailPopup
              isOpen={isDetailPopupOpen}
              imageUrl={images[selectedImageIndex]}
              initialTitle={imageMetadata.get(images[selectedImageIndex])?.title || ''}
              initialDescription={imageMetadata.get(images[selectedImageIndex])?.description || ''}
              initialTags={imageMetadata.get(images[selectedImageIndex])?.tags || []}
              onClose={() => {
                setIsDetailPopupOpen(false);
                setSelectedImageIndex(null);
              }}
              onSave={(title, description, tags) => {
                if (selectedImageIndex !== null) {
                  onImageMetadataChange(images[selectedImageIndex], { title, description, tags });
                }
              }}
              isLiveMode={isLiveMode}
            />
          )}
        </AnimatePresence>
        
        {/* Button to add more images and hidden file input */}
        {!isLiveMode && (
          <>
            <AddImageButton onClick={triggerFileDialog} />
            
            {/* Invisible input for file selection */}
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
              ref={fileInputRef}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ImageGallerySection;
