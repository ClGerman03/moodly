import { useState, useEffect, RefObject } from 'react';

type Position = { x: number, y: number } | null;

interface UseDraggableGridOptions {
  isLiveMode?: boolean;
  onReorder: (sourceIndex: number, targetIndex: number) => void;
}

interface UseDraggableGridReturn {
  // Estados
  draggedIndex: number | null;
  dragOverIndex: number | null;
  touchedItem: string | null;
  
  // Funciones para escritorio
  handleDragStart: (e: React.DragEvent<HTMLElement>, index: number, itemId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLElement>, index: number) => void;
  handleDragLeave: () => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent<HTMLElement>, targetIndex: number) => void;
  
  // Funciones para móvil (touch)
  handleTouchStart: (index: number, itemId: string, e: React.TouchEvent, isHandle?: boolean) => void;
  handleTouchMove: (index: number, e: React.TouchEvent) => void;
  handleTouchEnd: (index: number, e: React.TouchEvent) => void;
  handleDragHandleTouchStart: (index: number, itemId: string, e: React.TouchEvent) => void;
  
  // Función para iniciar arrastre desde handle en desktop
  handleDragHandleMouseDown: (index: number, e: React.MouseEvent) => void;
  
  // Estado para controlar si el elemento es arrastrable
  isDraggingHandle: boolean;
  
  // Helper para cancelar un arrastre
  cancelDrag: () => void;
  
  // Mostrar/ocultar controles
  setTouchedItem: (itemId: string | null) => void;
}

/**
 * Hook personalizado para manejar la funcionalidad de arrastre en un grid
 * Encapsula toda la lógica de arrastre tanto para escritorio como para móvil
 */
export function useDraggableGrid({ 
  isLiveMode = false, 
  onReorder 
}: UseDraggableGridOptions): UseDraggableGridReturn {
  // Estados para arrastre
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [touchedItem, setTouchedItem] = useState<string | null>(null);
  const [isDraggingHandle, setIsDraggingHandle] = useState<boolean>(false);
  
  // Estados para arrastre táctil
  const [touchDragEnabled, setTouchDragEnabled] = useState<boolean>(false);
  const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<Position>(null);
  const [touchCurrentPos, setTouchCurrentPos] = useState<Position>(null);
  
  // Función para reordenar elementos
  const reorderItems = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return;
    
    // Notificar al componente padre
    onReorder(sourceIndex, targetIndex);
    
    // Limpiar estados
    resetDragState();
  };
  
  // Función para resetear todos los estados de arrastre
  const resetDragState = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTouchDragEnabled(false);
    setTouchDragIndex(null);
    setTouchStartPos(null);
    setTouchCurrentPos(null);
    setIsDraggingHandle(false);
    
    // Restaurar el scroll del documento
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      
      // Limpiar clases de estilo
      document.querySelectorAll('.touch-dragging, .drag-target').forEach(el => {
        el.classList.remove('touch-dragging');
        el.classList.remove('drag-target');
      });
    }
  };
  
  // Manejar arrastre de elementos (Desktop)
  const handleDragStart = (e: React.DragEvent<HTMLElement>, index: number, itemId: string) => {
    if (isLiveMode || !isDraggingHandle) return;
    
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
    
    // Configurar el fantasma del arrastre para que sea más visual
    if (e.dataTransfer.setDragImage && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      e.dataTransfer.setDragImage(e.currentTarget, rect.width / 2, rect.height / 2);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null) {
      setDragOverIndex(index);
    }
  };
  
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  
  const handleDragEnd = () => {
    setIsDraggingHandle(false);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLElement>, targetIndex: number) => {
    e.preventDefault();
    
    if (isLiveMode || draggedIndex === null) return;
    
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === targetIndex) return;
    
    reorderItems(sourceIndex, targetIndex);
  };
  
  // Manejadores de eventos táctiles para arrastre
  const handleTouchStart = (index: number, itemId: string, e: React.TouchEvent, isHandle: boolean = false) => {
    if (isLiveMode) return;
    
    // Si no es un handle de arrastre y no estamos en modo arrastre habilitado, salir
    if (!isHandle && !touchDragEnabled) return;
    
    // Guardamos la posición inicial del toque
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    
    // Si es un handle, activar inmediatamente el modo arrastre
    if (isHandle) {
      e.stopPropagation(); // Evitar que el evento llegue al contenedor padre
      e.preventDefault(); // Crucial para prevenir scroll en iOS
      
      setTouchDragEnabled(true);
      setTouchDragIndex(index);
      setDraggedIndex(index);
      setTouchedItem(null); // Ocultar opciones
      
      // Aplicar estilo visual de arrastre
      const itemElement = document.querySelector(`.draggable-item[data-index="${index}"]`);
      if (itemElement) {
        itemElement.classList.add('touch-dragging');
      }
      
      // Bloquear el scroll del documento mientras arrastramos
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
  };
  
  const handleTouchMove = (index: number, e: React.TouchEvent) => {
    if (isLiveMode || !touchStartPos) return;
    
    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY };
    setTouchCurrentPos(currentPos);
    
    // Solo procesar movimiento si está en modo arrastre
    if (touchDragEnabled && touchDragIndex !== null) {
      e.preventDefault(); // Evitar scroll durante el arrastre
      e.stopPropagation(); // Detener propagación
      
      // Encontrar sobre qué elemento estamos arrastrando
      const elements = document.querySelectorAll('.draggable-item');
      for (let i = 0; i < elements.length; i++) {
        const rect = elements[i].getBoundingClientRect();
        if (
          currentPos.x >= rect.left && currentPos.x <= rect.right &&
          currentPos.y >= rect.top && currentPos.y <= rect.bottom
        ) {
          if (i !== touchDragIndex) {
            setDragOverIndex(i);
            // Efecto visual de espacio para soltar
            elements.forEach((el, idx) => {
              if (idx === i) {
                el.classList.add('drag-target');
              } else {
                el.classList.remove('drag-target');
              }
            });
          }
          break;
        }
      }
    }
  };
  
  const handleTouchEnd = (index: number, e: React.TouchEvent) => {
    // Si estábamos en modo arrastre y tenemos un índice destino, reordenar
    if (touchDragEnabled && touchDragIndex !== null && dragOverIndex !== null && dragOverIndex !== touchDragIndex) {
      reorderItems(touchDragIndex, dragOverIndex);
    }
    
    resetDragState();
  };
  
  // Iniciar arrastre desde el botón de agarre en escritorio
  const handleDragHandleMouseDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiveMode) return;
    
    // Activar modo arrastre para HTML5 Drag and Drop
    setIsDraggingHandle(true);
  };
  
  // Manejar touch en el botón de agarre para iniciar arrastre en móvil
  const handleDragHandleTouchStart = (index: number, itemId: string, e: React.TouchEvent) => {
    e.preventDefault(); // Crucial para prevenir eventos de scroll en iOS
    handleTouchStart(index, itemId, e, true); // true indica que es un handle
  };
  
  // Helper para cancelar arrastre manualmente
  const cancelDrag = () => {
    resetDragState();
  };
  
  // Añadir estilos CSS necesarios para el arrastre
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        .touch-dragging {
          opacity: 0.7;
          transform: scale(0.98);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          z-index: 50;
          transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
          touch-action: none;
        }
        
        .drag-target {
          border: 2px dashed #3B82F6 !important;
          background-color: rgba(59, 130, 246, 0.05);
          transform: scale(1.01);
          z-index: 40;
          transition: all 0.2s ease;
        }
        
        .drag-handle {
          cursor: grab;
          touch-action: none;
        }
        
        .drag-handle:active {
          cursor: grabbing;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
  
  // Manejar eventos de escape para cancelar arrastre
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (touchDragEnabled || isDraggingHandle)) {
        cancelDrag();
      }
    };
    
    // Prevenir completamente los eventos de scroll durante el arrastre
    const preventScroll = (e: Event) => {
      if (touchDragEnabled && e instanceof TouchEvent) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchmove', preventScroll as EventListener, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchmove', preventScroll as EventListener);
      
      // Asegurar que se restauren los estilos si el hook se desmonta mientras hay un arrastre activo
      resetDragState();
    };
  }, [touchDragEnabled, isDraggingHandle]);
  
  return {
    // Estados
    draggedIndex,
    dragOverIndex,
    touchedItem,
    
    // Funciones para escritorio
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    
    // Funciones para móvil
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDragHandleTouchStart,
    
    // Función para iniciar arrastre desde handle en desktop
    handleDragHandleMouseDown,
    
    // Estado para controlar si el elemento es arrastrable
    isDraggingHandle,
    
    // Helpers
    cancelDrag,
    
    // Control de controles
    setTouchedItem
  };
}
