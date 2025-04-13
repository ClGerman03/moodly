// Definición de tipos compartidos para componentes Bento

// Tipos de layout para bloques de imagen
export type ImageLayout = "square" | "vertical" | "horizontal";

// Posición en la cuadrícula - usado por la implementación anterior
export interface GridPosition {
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

// Metadata para imágenes
export interface ImageMetadata {
  title?: string;
  description?: string;
}

// Bloque de imagen con metadatos y posición
export interface ImageBlock {
  id: string;
  url: string;
  layout: ImageLayout;
  position?: GridPosition; // Ahora opcional porque usamos React-Grid-Layout
  metadata?: ImageMetadata;
}

// Props para el grid de imagen Bento
export interface BentoImageGridProps {
  images: string[];
  imageLayouts?: Map<number, ImageLayout>;
  imageMetadata?: Map<string, ImageMetadata>;
  onLayoutChange: (index: number, layout: ImageLayout) => void;
  onImagesAdd: (newImages: string[]) => void;
  onImageRemove: (index: number) => void;
  onImageMetadataChange?: (imageUrl: string, metadata: ImageMetadata) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLiveMode?: boolean;
  onReorder?: (newImages: string[]) => void;
}

// Props para un bloque de imagen individual
export interface ImageBlockProps {
  block: ImageBlock;
  isHovered: boolean;
  isDragged: boolean;
  isLiveMode: boolean;
  isDragging: boolean;
  draggedId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onPositionSwap: (sourceId: string, targetId: string) => void;
  onLayoutChange: (id: string, layout: ImageLayout) => void;
  onRemove: (id: string) => void;
  onClick: (block: ImageBlock, e: React.MouseEvent) => void;
  gridRef: React.RefObject<HTMLDivElement>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// Tipo para un ítem de React-Grid-Layout
export interface GridLayoutItem {
  i: string;  // ID único del elemento
  x: number;  // Posición x en la cuadrícula
  y: number;  // Posición y en la cuadrícula
  w: number;  // Ancho en unidades de columna
  h: number;  // Alto en unidades de fila
}
