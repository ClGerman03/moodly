import { useState, useEffect, RefObject } from "react";

interface UseResponsiveLayoutReturn {
  containerWidth: number;
  gridCols: number;
  isMobile: boolean;
}

export const useResponsiveLayout = (
  containerRef: RefObject<HTMLElement>
): UseResponsiveLayoutReturn => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [gridCols, setGridCols] = useState(4);
  const [isMobile, setIsMobile] = useState(false);

  // Función para calcular el número de columnas según el ancho del contenedor
  const calculateColumns = (width: number) => {
    if (width < 640) return 1;      // Móviles
    else if (width < 960) return 2;  // Tablets
    else return 4;                   // Desktop
  };

  useEffect(() => {
    if (containerRef.current) {
      const updateLayout = () => {
        if (containerRef.current) {
          const newWidth = containerRef.current.offsetWidth;
          setContainerWidth(newWidth);
          
          // Actualizar el número de columnas según el ancho
          const newCols = calculateColumns(newWidth);
          setGridCols(newCols);
          
          // Detectar si estamos en un dispositivo móvil
          setIsMobile(window.innerWidth < 768);
        }
      };
      
      // Actualizar inmediatamente
      updateLayout();
      
      // Actualizar cuando la ventana cambie de tamaño
      window.addEventListener("resize", updateLayout);
      
      return () => {
        window.removeEventListener("resize", updateLayout);
      };
    }
  }, [containerRef]);

  return {
    containerWidth,
    gridCols,
    isMobile
  };
};
