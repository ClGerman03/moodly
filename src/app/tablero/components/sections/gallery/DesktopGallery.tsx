"use client";

import {
  DndContext, 
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from "@dnd-kit/sortable";
import { ImageMetadata } from "./types";
import SortableImageItem from "./SortableImageItem";
import DraggingImageItem from "./DraggingImageItem";

interface DesktopGalleryProps {
  images: string[];
  imageMetadata: Map<string, ImageMetadata>;
  hoveredImage: string | null;
  touchedImage: string | null;
  activeId: string | null;
  isLiveMode: boolean;
  onImageClick: (index: number) => void;
  onHover: (url: string | null) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onImageRemove: (index: number) => void;
  onImageExpand: (index: number) => void;
}

/**
 * Componente de galería optimizado para desktop con soporte para drag and drop
 */
const DesktopGallery: React.FC<DesktopGalleryProps> = ({
  images,
  imageMetadata,
  hoveredImage,
  touchedImage,
  activeId,
  isLiveMode,
  onImageClick,
  onHover,
  onDragStart,
  onDragEnd,
  onImageRemove,
  onImageExpand
}) => {
  // Configuración de sensores para dnd-kit
  const sensors = useSensors(
    // Sensor de puntero optimizado para desktop
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,     // Iniciar arrastre después de 8px de movimiento
      }
    }),
    // Soporte para navegación por teclado
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <SortableContext 
        items={images.map(url => `image-${url}`)} 
        strategy={rectSortingStrategy}
      >
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => {
            const metadata = imageMetadata.get(url);
            const itemId = `image-${url}`;
            
            return (
              <SortableImageItem
                key={itemId}
                id={itemId}
                url={url}
                index={index}
                metadata={metadata}
                isLiveMode={isLiveMode}
                isHovered={hoveredImage === url}
                isTouched={touchedImage === url}
                onHover={onHover}
                onClick={() => onImageClick(index)}
                onRemove={() => onImageRemove(index)}
                onExpand={() => onImageExpand(index)}
              />
            );
          })}
        </div>
      </SortableContext>
      
      {/* Overlay de arrastre */}
      <DragOverlay adjustScale style={{ transformOrigin: '0 0' }}>
        {activeId ? (
          <DraggingImageItem 
            url={activeId.replace('image-', '')}
            metadata={imageMetadata.get(activeId.replace('image-', ''))} 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DesktopGallery;
