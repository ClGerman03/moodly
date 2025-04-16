"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    const updatedPalettes = [...palettes];
    updatedPalettes[activePaletteIndex].colors[index] = newColor;
    setPalettes(updatedPalettes);
    onChange?.(updatedPalettes);
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
  
  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg p-6">
      {/* Palette selection and controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          {isEditingName ? (
            <input
              type="text"
              value={activePalette.name}
              onChange={(e) => updatePaletteName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              className="text-lg font-light bg-transparent border-b border-gray-200 dark:border-gray-700 px-0 py-1 focus:outline-none focus:border-gray-400 text-gray-700 dark:text-gray-300 w-full max-w-[12rem]"
              autoFocus
            />
          ) : (
            <motion.h3 
              className="text-lg font-light text-gray-700 dark:text-gray-300 cursor-text group flex items-center mr-4"
              onClick={() => setIsEditingName(true)}
              whileHover={{ x: 2 }}
            >
              {activePalette.name}
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </motion.svg>
            </motion.h3>
          )}
          
          {/* Navegación entre paletas */}
          {palettes.length > 1 && (
            <div className="flex space-x-1 ml-4">
              {palettes.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setActivePaletteIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === activePaletteIndex 
                    ? 'bg-gray-500 dark:bg-gray-300 scale-125' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'}`}
                  aria-label={`Select palette ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Color information */}
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {activePalette.colors.length} colors
          </div>
          
          {/* Palette controls */}
          <div className="flex space-x-1">
            {/* Button to add palette - hidden in live mode */}
            {!isLiveMode && (
              <motion.button 
                onClick={addPalette} 
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Add palette"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
            )}
            
            {/* Button to remove palette (only if there is more than one) - hidden in live mode */}
            {palettes.length > 1 && !isLiveMode && (
              <motion.button 
                onClick={removePalette} 
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Remove palette"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
      </div>
      
      {/* Palette visualization */}
      <div className="flex flex-wrap gap-3 mb-4">
        <AnimatePresence>
          {activePalette.colors.map((color, index) => (
            <motion.div 
              key={`${index}-${color}`}
              className="relative group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <motion.div
                className="w-12 h-12 rounded-md cursor-pointer shadow-sm relative overflow-hidden flex items-end justify-center"
                style={{ backgroundColor: temporaryColor && editingColorIndex === index ? temporaryColor : color }}
                onClick={() => {
                  if (!isLiveMode && !isColorPickerLocked) {
                    // If we weren't editing this color, start editing
                    if (editingColorIndex !== index) {
                      setEditingColorIndex(index);
                      setTemporaryColor(color); // Initialize temporary color with the current color
                      setTimeout(() => {
                        if (colorInputRef.current) {
                          colorInputRef.current.click();
                        }
                      }, 50);
                    } 
                    // If we were already editing this color, do nothing
                    // as the input's onBlur will take care of closing the picker
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {editingColorIndex === index && (
                  <input 
                    ref={colorInputRef}
                    type="color" 
                    value={temporaryColor || color}
                    onChange={(e) => {
                      // Only update the temporary color during selection
                      setTemporaryColor(e.target.value);
                    }}
                    onBlur={() => {
                      // When losing focus, apply the final change if there is a temporary color
                      if (temporaryColor) {
                        updateColor(index, temporaryColor);
                        setTemporaryColor(null);
                      }
                      setEditingColorIndex(null);
                      
                      // Briefly block the picker to prevent immediate reopenings
                      setIsColorPickerLocked(true);
                      setTimeout(() => {
                        setIsColorPickerLocked(false);
                      }, 200); // 200ms should be enough to prevent reopening
                    }}
                    className="absolute opacity-0"
                    aria-label={`Change color ${index + 1}`}
                  />
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 bg-black/20 w-full flex justify-center backdrop-blur-sm">
                  <span className="text-[10px] text-white/90 uppercase tracking-wider">
                    {(temporaryColor && editingColorIndex === index) ? temporaryColor.replace('#', '') : color.replace('#', '')}
                  </span>
                </div>
              </motion.div>
              
              {/* Remove button - hidden in live mode */}
              {activePalette.colors.length > 1 && !isLiveMode && (
                <motion.button
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
          ))}
          
          {/* Button to add color - hidden in live mode */}
          {activePalette.colors.length < 8 && !isLiveMode && (
            <motion.div 
              className="w-12 h-12 rounded-md border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer"
              onClick={addColor}
              whileHover={{ scale: 1.05, borderColor: "#aaaaaa" }}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Preview of the palette in use */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg transition-all duration-300">
        <h4 className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 font-light">Preview</h4>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {activePalette.colors.map((color, i) => (
              <div 
                key={`preview-${i}`}
                className="flex-1 h-5 rounded-sm" 
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          <div className="flex h-16 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
            <div className="w-2/3 p-3" style={{ backgroundColor: activePalette.colors[0] }}>
              <div className="text-xs font-medium mb-1" style={{ color: activePalette.colors[4] || activePalette.colors[activePalette.colors.length-1] }}>Title example</div>
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: activePalette.colors[1] }}></div>
              <div className="w-2/3 h-2 mt-1 rounded-full" style={{ backgroundColor: activePalette.colors[1] }}></div>
            </div>
            <div className="w-1/3 flex flex-col">
              <div className="flex-1" style={{ backgroundColor: activePalette.colors[3] || activePalette.colors[activePalette.colors.length > 3 ? 3 : 0] }}></div>
              <div className="flex-1" style={{ backgroundColor: activePalette.colors[2] || activePalette.colors[activePalette.colors.length > 2 ? 2 : 0] }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteComponent;
