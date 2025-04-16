"use client";

import { useMemo, useState, useEffect } from "react";
import GridLayout from "react-grid-layout";

// Define the ImageLayout type locally instead of importing from a non-existent module
type ImageLayout = "square" | "vertical" | "horizontal";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Configuraciones constantes
const MARGIN: [number, number] = [20, 20];
const BASE_HEIGHT = 160;

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImageGridLayoutProps {
  images: string[];
  imageLayouts: Record<number, ImageLayout>;
  containerWidth: number;
  gridCols: number;
  children: (imageUrl: string, index: number, dimensions: ImageDimensions) => React.ReactNode;
}

const ImageGridLayout: React.FC<ImageGridLayoutProps> = ({
  images,
  imageLayouts,
  containerWidth,
  gridCols,
  children
}) => {
  const [imageDimensions, setImageDimensions] = useState<Record<string, ImageDimensions>>({});

  // Cargar dimensiones reales de las imágenes
  useEffect(() => {
    const loadImageDimensions = async () => {
      const dimensions: Record<string, ImageDimensions> = {};
      
      for (const url of images) {
        try {
          const img = new Image();
          const loadedDimensions = await new Promise<ImageDimensions>((resolve, reject) => {
            img.onload = () => {
              resolve({
                width: img.naturalWidth,
                height: img.naturalHeight
              });
            };
            img.onerror = reject;
            img.src = url;
          });
          dimensions[url] = loadedDimensions;
        } catch (error) {
          console.error(`Error loading image dimensions for ${url}:`, error);
          // Usar dimensiones por defecto si hay error
          dimensions[url] = { width: BASE_HEIGHT, height: BASE_HEIGHT };
        }
      }
      
      setImageDimensions(dimensions);
    };

    loadImageDimensions();
  }, [images]);

  // Generar layout basado en las imágenes y sus dimensiones reales
  const layoutItems = useMemo(() => {
    if (!containerWidth || Object.keys(imageDimensions).length === 0) return [];

    const columnWidth = (containerWidth - MARGIN[0] * (gridCols - 1)) / gridCols;
    
    const blocks = images.map((url, index) => {
      const dimensions = imageDimensions[url] || { width: BASE_HEIGHT, height: BASE_HEIGHT };
      const layout = imageLayouts[index] || "square";
      
      // Calcular el número de columnas y filas basado en las dimensiones reales
      let w = Math.ceil(dimensions.width / columnWidth);
      let h = Math.ceil((dimensions.height * (w * columnWidth)) / (dimensions.width * BASE_HEIGHT));
      
      // Ajustar según el layout especificado
      if (layout === "square") {
        w = 1;
        h = 1;
      } else if (layout === "vertical") {
        w = 1;
        h = 2;
      } else if (layout === "horizontal") {
        w = 2;
        h = 1;
      }
      
      // Limitar el tamaño máximo
      w = Math.min(w, gridCols);
      h = Math.min(h, 3);
      
      return {
        i: `image-${index}`,
        w,
        h,
        x: 0,
        y: 0,
        static: true,
        dimensions
      };
    });

    // Posicionar elementos en la cuadrícula
    const positionedItems = [] as {
      i: string;
      x: number;
      y: number;
      w: number;
      h: number;
      static: boolean;
      dimensions: ImageDimensions;
    }[];

    let currentY = 0;
    const itemsInRow: { [key: number]: number } = {};

    blocks.forEach(item => {
      let posX = 0;
      let posY = currentY;
      let placed = false;

      while (!placed) {
        const collision = positionedItems.some(placedItem => (
          posX < placedItem.x + placedItem.w &&
          posX + item.w > placedItem.x &&
          posY < placedItem.y + placedItem.h &&
          posY + item.h > placedItem.y
        ));

        if (!collision) {
          placed = true;
          positionedItems.push({
            ...item,
            x: posX,
            y: posY
          });

          const rowEnd = posY + item.h;
          for (let y = posY; y < rowEnd; y++) {
            itemsInRow[y] = Math.max(itemsInRow[y] || 0, posX + item.w);
          }
        } else {
          posX++;
          if (posX + item.w > gridCols) {
            posX = 0;
            posY++;
            currentY = Math.max(currentY, posY);
          }
        }
      }
    });

    return positionedItems;
  }, [images, imageLayouts, gridCols, containerWidth, imageDimensions]);

  if (!containerWidth || layoutItems.length === 0) {
    return null;
  }

  return (
    <GridLayout
      className="layout"
      layout={layoutItems}
      cols={gridCols}
      rowHeight={BASE_HEIGHT}
      width={containerWidth}
      margin={MARGIN}
      isDraggable={false}
      isResizable={false}
      compactType="horizontal"
      useCSSTransforms={true}
    >
      {layoutItems.map((item, index) => {
        const imageUrl = images[index];
        return children(imageUrl, index, item.dimensions);
      })}
    </GridLayout>
  );
};

export default ImageGridLayout;
