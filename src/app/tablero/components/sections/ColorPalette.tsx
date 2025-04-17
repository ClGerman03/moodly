"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, PanInfo, useTransform } from "framer-motion";
import { useDeviceDetection } from "../hooks/useDeviceDetection";
import { cn } from "@/lib/utils";

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

interface ColorPaletteProps {
  initialPalettes?: ColorPalette[];
  onChange?: (palettes: ColorPalette[]) => void;
  isLiveMode?: boolean;
}

const defaultColors = [
  "#F9F5F1", // Cream
  "#E9D8C4", // Beige
  "#D7B797", // Light brown
  "#AA7C60", // Medium brown
  "#5C4030"  // Dark brown
];

const defaultPalette: ColorPalette = {
  id: "default",
  name: "My palette",
  colors: defaultColors
};

const ColorPaletteComponent = ({ initialPalettes, onChange, isLiveMode = false }: ColorPaletteProps) => {
  // Initialize with at least one default palette if there are no initial palettes
  const [palettes, setPalettes] = useState<ColorPalette[]>(
    initialPalettes && initialPalettes.length > 0 
      ? initialPalettes 
      : [defaultPalette]
  );
  
  const [activePaletteIndex, setActivePaletteIndex] = useState<number>(0);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [temporaryColor, setTemporaryColor] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isColorPickerLocked, setIsColorPickerLocked] = useState<boolean>(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  // Get the active palette
  const activePalette = palettes[activePaletteIndex];
  
  // Update a color in the active palette
  const updateColor = (index: number, newColor: string) => {
    // Crear una copia profunda de las paletas
    const updatedPalettes = JSON.parse(JSON.stringify(palettes));
    updatedPalettes[activePaletteIndex].colors[index] = newColor;
    setPalettes(updatedPalettes);
    // Llamar a onChange para notificar al componente padre
    if (onChange) {
      onChange(updatedPalettes);
    }
  };
  
  // Add a new color to the active palette
  const addColor = () => {
    if (activePalette.colors.length < 8) { // Limit to 8 colors maximum
      const updatedPalettes = [...palettes];
      updatedPalettes[activePaletteIndex].colors.push("#EEEEEE");
      setPalettes(updatedPalettes);
      onChange?.(updatedPalettes);
      
      // Open the color picker for the new color
      setTimeout(() => {
        const newIndex = activePalette.colors.length;
        setEditingColorIndex(newIndex - 1);
        if (colorInputRef.current) {
          colorInputRef.current.click();
        }
      }, 100);
    }
  };
  
  // Remove a color from the active palette
  const removeColor = (index: number) => {
    if (activePalette.colors.length > 1) { // Keep at least one color
      const updatedPalettes = [...palettes];
      updatedPalettes[activePaletteIndex].colors.splice(index, 1);
      setPalettes(updatedPalettes);
      onChange?.(updatedPalettes);
    }
  };
  
  // Update the name of the active palette
  const updatePaletteName = (newName: string) => {
    const updatedPalettes = [...palettes];
    updatedPalettes[activePaletteIndex].name = newName;
    setPalettes(updatedPalettes);
    onChange?.(updatedPalettes);
  };
  
  // Add a new palette
  const addPalette = () => {
    const id = `palette-${Date.now()}`;
    const newPalette: ColorPalette = {
      id,
      name: `Palette ${palettes.length + 1}`,
      colors: [...defaultColors] // Use default colors for the new palette
    };
    
    const updatedPalettes = [...palettes, newPalette];
    setPalettes(updatedPalettes);
    setActivePaletteIndex(updatedPalettes.length - 1); // Activate the new palette
    onChange?.(updatedPalettes);
  };
  
  // Remove the active palette
  const removePalette = () => {
    if (palettes.length > 1) { // Keep at least one palette
      const updatedPalettes = palettes.filter((_, index) => index !== activePaletteIndex);
      setPalettes(updatedPalettes);
      
      // Adjust the active index if necessary
      if (activePaletteIndex >= updatedPalettes.length) {
        setActivePaletteIndex(updatedPalettes.length - 1);
      }
      
      onChange?.(updatedPalettes);
    }
  };
  
  // Track drag motion for swipe navigation on mobile
  const dragX = useMotionValue(0);
  const dragXInput = [-200, 0, 200];
  const dragXOutput = [1, 0, -1];
  useTransform(dragX, dragXInput, dragXOutput); // Usado indirectamente en el sistema de drag
  
  // Track if user is on mobile
  const isMobile = useDeviceDetection();
  
  // Function to handle drag end - change palette based on drag direction
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only activate if drag was significant (>100px)
    if (Math.abs(info.offset.x) > 100) {
      // Dragged right - go to previous palette
      if (info.offset.x > 0 && activePaletteIndex > 0) {
        setActivePaletteIndex(activePaletteIndex - 1);
      } 
      // Dragged left - go to next palette
      else if (info.offset.x < 0 && activePaletteIndex < palettes.length - 1) {
        setActivePaletteIndex(activePaletteIndex + 1);
      }
    }
  }
  
  // Navigate to previous palette
  const goToPreviousPalette = () => {
    if (activePaletteIndex > 0) {
      setActivePaletteIndex(activePaletteIndex - 1);
    }
  };
  
  // Navigate to next palette
  const goToNextPalette = () => {
    if (activePaletteIndex < palettes.length - 1) {
      setActivePaletteIndex(activePaletteIndex + 1);
    }
  };
  
  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg p-6">
      {/* Section header with title */}
      <div className="flex items-center justify-between mb-5">
        {/* Título editable movido a la parte superior */}
        <div className="flex items-center">
          <motion.button 
            className="flex items-center text-gray-700 dark:text-gray-300 group"
            onClick={() => !isLiveMode && setIsEditingName(true)}
            whileHover={{ scale: 1.01 }}
            disabled={isLiveMode}
            aria-label="Edit palette name"
          >
            <span className="text-base font-medium">{activePalette.name}</span>
            {!isLiveMode && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
          </motion.button>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full ml-2">
            {activePalette.colors.length} colors
          </div>
        </div>
        
        {!isLiveMode && palettes.length > 1 && (
          <div className="hidden md:flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <button 
              onClick={goToPreviousPalette}
              disabled={activePaletteIndex === 0}
              className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${activePaletteIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              aria-label="Previous palette"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-xs font-medium">Palette {activePaletteIndex + 1} of {palettes.length}</span>
            
            <button 
              onClick={goToNextPalette}
              disabled={activePaletteIndex === palettes.length - 1}
              className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${activePaletteIndex === palettes.length - 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
              aria-label="Next palette"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      {/* Palette visualization as a bento box layout with drag gesture support */}
      <div className="mb-3">
        <AnimatePresence>
          <motion.div 
            className="relative w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            layout
            drag={isMobile && palettes.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            onDragEnd={handleDragEnd}
            style={{ x: dragX }}
          >
            {/* Minimalist inline palette name editing */}
            {isEditingName && (
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <input
                  type="text"
                  value={activePalette.name}
                  onChange={(e) => updatePaletteName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 transition text-sm font-medium"
                  autoFocus
                  placeholder="My awesome palette"
                />
                <button 
                  onClick={() => setIsEditingName(false)}
                  className="ml-2 p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Bento box grid layout */}
            <div className="bento-grid p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {activePalette.colors.map((color, index) => {
                // Determine the size of this color cell (some larger than others for visual interest)
                const isLarge = index === 0 || index === 3; // First and fourth colors are larger
                const gridClass = isLarge 
                  ? "col-span-2 row-span-2" 
                  : "col-span-1 row-span-1";
                
                return (
                  <motion.div 
                    key={`${index}-${color}`}
                    className={cn(
                      "relative group min-h-[60px]",
                      gridClass
                    )}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    layout
                  >
                    <motion.div
                      className={cn(
                        "w-full h-full rounded-xl cursor-pointer shadow-sm relative overflow-hidden flex items-end justify-center",
                        isLarge ? "min-h-[120px]" : "min-h-[60px]"
                      )}
                      style={{ backgroundColor: temporaryColor && editingColorIndex === index ? temporaryColor : color }}
                      onClick={() => {
                        if (!isLiveMode && !isColorPickerLocked) {
                          if (editingColorIndex !== index) {
                            setEditingColorIndex(index);
                            setTemporaryColor(color);
                            setTimeout(() => {
                              if (colorInputRef.current) {
                                colorInputRef.current.click();
                              }
                            }, 50);
                          }
                         }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {editingColorIndex === index && (
                        <input 
                          ref={colorInputRef}
                          type="color" 
                          value={temporaryColor || color}
                          onChange={(e) => {
                            setTemporaryColor(e.target.value);
                            // Actualizar el color inmediatamente cuando cambia
                            updateColor(index, e.target.value);
                          }}
                          onBlur={() => {
                            // Al perder el foco, asegurarse de que se ha actualizado el color
                            if (temporaryColor) {
                              updateColor(index, temporaryColor);
                            }
                            // Limpiar el estado temporal
                            setTemporaryColor(null);
                            setEditingColorIndex(null);
                            
                            setIsColorPickerLocked(true);
                            setTimeout(() => {
                              setIsColorPickerLocked(false);
                            }, 200);
                          }}
                          className="absolute opacity-0 top-0 left-0 w-full h-full cursor-pointer"
                          aria-label={`Change color ${index + 1}`}
                        />
                      )}
                      
                      {/* Color hex code tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 bg-black/30 w-full flex justify-center backdrop-blur-sm">
                        <span className="text-[10px] text-white/90 uppercase tracking-wider font-medium">
                          {(temporaryColor && editingColorIndex === index) ? temporaryColor.toUpperCase() : color.toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                    
                    {/* Remove button - hidden in live mode */}
                    {activePalette.colors.length > 1 && !isLiveMode && (
                      <motion.button
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-gray-100 dark:border-gray-700"
                        onClick={() => removeColor(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
              
              {/* Button to add color - hidden in live mode */}
              {activePalette.colors.length < 8 && !isLiveMode && (
                <motion.div 
                  className="col-span-1 row-span-1 min-h-[60px] rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer gap-1"
                  onClick={addColor}
                  whileHover={{ scale: 1.05, borderColor: "#aaaaaa" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-[10px] text-gray-400 font-medium">Add color</span>
                </motion.div>
              )}
            </div>
            
            {/* Simplified palette header with name and controls */}
            <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between p-3 border-t border-gray-100 dark:border-gray-800">
              {/* Mantenemos vacío - eliminamos el nombre de la paleta de aquí */}
              
              {/* Palette actions */}
              {!isLiveMode && (
                <div className="flex items-center">
                  
                  {/* Add new palette button with label */}
                  <motion.button 
                    onClick={addPalette} 
                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 px-2 py-1 rounded-md mr-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Add new palette"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New palette</span>
                  </motion.button>
                  
                  {/* Remove palette button - only visible when more than one palette exists */}
                  {palettes.length > 1 && (
                    <motion.button 
                      onClick={removePalette} 
                      className="flex items-center justify-center h-6 w-6 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Delete palette"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation dots - moved below the palette */}
      <div className="flex items-center justify-end mt-3 mb-4">
        
        {/* Palette navigation dots */}
        {palettes.length > 1 && (
          <div className="flex items-center">
            {/* Mobile swipe indicator */}
            <div className="md:hidden text-xs text-gray-400 dark:text-gray-500 mr-2">
              Swipe to navigate
            </div>
            
            {/* Palette dots for navigation */}
            <div className="flex items-center justify-center gap-2">
              {palettes.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActivePaletteIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${index === activePaletteIndex 
                    ? 'bg-gray-500 dark:bg-gray-300 scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'}`}
                  aria-label={`Select palette ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPaletteComponent;
