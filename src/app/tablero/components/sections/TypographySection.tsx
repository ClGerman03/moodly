"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBackButtonHandler } from "@/hooks/useBackButtonHandler";

// Definition of available typography
interface FontOption {
  id: string;
  name: string;
  family: string;
  category: "serif" | "sans-serif" | "display" | "monospace";
  weights: number[];
}

interface TypographySectionProps {
  initialFonts?: FontOption[];
  onChange?: (fonts: FontOption[]) => void;
  isLiveMode?: boolean;
}

// List of popular fonts
const availableFonts: FontOption[] = [
  {
    id: "inter",
    name: "Inter",
    family: "'Inter', sans-serif",
    category: "sans-serif",
    weights: [300, 400, 500, 600, 700]
  },
  {
    id: "roboto",
    name: "Roboto",
    family: "'Roboto', sans-serif",
    category: "sans-serif",
    weights: [300, 400, 500, 700]
  },
  {
    id: "montserrat",
    name: "Montserrat",
    family: "'Montserrat', sans-serif",
    category: "sans-serif",
    weights: [300, 400, 500, 600, 700]
  },
  {
    id: "playfair",
    name: "Playfair Display",
    family: "'Playfair Display', serif",
    category: "serif",
    weights: [400, 500, 600, 700]
  },
  {
    id: "raleway",
    name: "Raleway",
    family: "'Raleway', sans-serif",
    category: "sans-serif",
    weights: [300, 400, 500, 600, 700]
  },
  {
    id: "poppins",
    name: "Poppins",
    family: "'Poppins', sans-serif",
    category: "sans-serif",
    weights: [300, 400, 500, 600, 700]
  },
  {
    id: "merriweather",
    name: "Merriweather",
    family: "'Merriweather', serif",
    category: "serif",
    weights: [300, 400, 700]
  },
  {
    id: "fira-code",
    name: "Fira Code",
    family: "'Fira Code', monospace",
    category: "monospace",
    weights: [300, 400, 500, 600, 700]
  }
];

const TypographySection: React.FC<TypographySectionProps> = ({
  initialFonts = [],
  onChange = () => {},
  isLiveMode = false,
}) => {
  const [selectedFonts, setSelectedFonts] = useState<FontOption[]>(initialFonts);
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog.");
  const [previewSize, setPreviewSize] = useState<"sm" | "md" | "lg">("md");
  const [isAddingFont, setIsAddingFont] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExampleMenuOpen, setIsExampleMenuOpen] = useState(false);

  // Load fonts from Google Fonts
  useState(() => {
    // Only load fonts if we're in the browser
    if (typeof window !== 'undefined') {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Fira+Code:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(linkElement);
    }
  });

  // Filter fonts based on search
  const filteredFonts = searchQuery.trim() === "" 
    ? availableFonts 
    : availableFonts.filter(font => 
        font.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Open the modal to add typography
  const openAddFontDialog = () => {
    setSearchQuery("");
    setIsAddingFont(true);
  };

  // Cerrar el modal
  const closeAddFontDialog = () => {
    setIsAddingFont(false);
  };

  // Usar el hook para manejar el botón "atrás" cuando el popup de tipografía está abierto
  useBackButtonHandler(isAddingFont, closeAddFontDialog);

  const addFont = (font: FontOption) => {
    // Check if the font is already selected
    if (selectedFonts.some(f => f.id === font.id)) return;
    
    // Add font
    const newSelectedFonts = [...selectedFonts, font];
    setSelectedFonts(newSelectedFonts);
    onChange(newSelectedFonts);
    
    // Close the modal
    setIsAddingFont(false);
  };
  
  const removeFont = (fontId: string) => {
    // Remove font
    const newSelectedFonts = selectedFonts.filter(f => f.id !== fontId);
    setSelectedFonts(newSelectedFonts);
    onChange(newSelectedFonts);
  };

  const fontSizeMappings = {
    sm: {
      heading: "text-xl md:text-2xl",
      subheading: "text-lg",
      body: "text-sm"
    },
    md: {
      heading: "text-2xl md:text-3xl",
      subheading: "text-xl",
      body: "text-base"
    },
    lg: {
      heading: "text-3xl md:text-4xl",
      subheading: "text-2xl",
      body: "text-lg"
    }
  };

  // Always show the selected fonts in the main view

  return (
    <div className="w-full bg-white dark:bg-gray-950 rounded-xl p-4">
      {/* Main controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">

        {!isLiveMode && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative group">
              <label htmlFor="preview-text" className="text-xs text-gray-500 dark:text-gray-400 mb-1 inline-block">
                Sample text:
              </label>
              <div className="relative">
                <button
                  id="preview-text"
                  className="text-xs bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg py-1.5 px-3 w-48 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 transition-colors"
                  onClick={() => setIsExampleMenuOpen(!isExampleMenuOpen)}
                >
                  <span className="truncate">
                    {previewText === "The quick brown fox jumps over the lazy dog." && "English text"}
                    {previewText === "El veloz zorro marrón salta sobre el perro perezoso." && "Spanish text"}
                    {previewText === "Lorem ipsum dolor sit amet, consectetur adipiscing elit." && "Lorem ipsum"}
                    {previewText === "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789" && "Characters"}
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className={`ml-2 transition-transform ${isExampleMenuOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                
                {/* Menú desplegable con bordes redondeados */}
                <AnimatePresence>
                  {isExampleMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700"
                    >
                      <ul className="py-1">
                        <li>
                          <button
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${previewText === "The quick brown fox jumps over the lazy dog." ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                            onClick={() => {
                              setPreviewText("The quick brown fox jumps over the lazy dog.");
                              setIsExampleMenuOpen(false);
                            }}
                          >
                            English text
                          </button>
                        </li>
                        <li>
                          <button
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${previewText === "El veloz zorro marrón salta sobre el perro perezoso." ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                            onClick={() => {
                              setPreviewText("El veloz zorro marrón salta sobre el perro perezoso.");
                              setIsExampleMenuOpen(false);
                            }}
                          >
                            Spanish text
                          </button>
                        </li>
                        <li>
                          <button
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${previewText === "Lorem ipsum dolor sit amet, consectetur adipiscing elit." ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                            onClick={() => {
                              setPreviewText("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
                              setIsExampleMenuOpen(false);
                            }}
                          >
                            Lorem ipsum
                          </button>
                        </li>
                        <li>
                          <button
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${previewText === "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789" ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
                            onClick={() => {
                              setPreviewText("ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789");
                              setIsExampleMenuOpen(false);
                            }}
                          >
                            Characters
                          </button>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="relative group ml-3">
              <label htmlFor="preview-size" className="text-xs text-gray-500 dark:text-gray-400 mb-1 inline-block">
                Size:
              </label>
               <div className="flex space-x-1 border border-gray-200 dark:border-gray-800 rounded-lg p-0.5">
                <button
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    previewSize === "sm" ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  onClick={() => setPreviewSize("sm")}
                >
                  S
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    previewSize === "md" ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  onClick={() => setPreviewSize("md")}
                >
                  M
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    previewSize === "lg" ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  onClick={() => setPreviewSize("lg")}
                >
                  L
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Button to add typography - hidden in live mode */}
      {!isLiveMode && (
        <motion.button 
          onClick={openAddFontDialog}
          className="px-3 py-2 text-sm font-light text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center transition-colors duration-200 mb-6 self-end"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add typography
        </motion.button>
      )}

      {/* List of selected fonts */}
      <div className="grid gap-6">
        <AnimatePresence>
          {selectedFonts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-10"
            >
              <p className="text-gray-400 dark:text-gray-600 text-sm">
                No typography selected. Click &quot;Add typography&quot; to get started.
              </p>
            </motion.div>
          ) : (
            selectedFonts.map((font) => (
              <motion.div
                key={font.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="pb-4 mb-4 relative group border-b border-gray-100 dark:border-gray-800/50 last:border-0 last:mb-0"
              >
                {/* Remove button - hidden in live mode */}
                {!isLiveMode && (
                  <button
                    onClick={() => removeFont(font.id)}
                    className="absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="Remove typography"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}

              {/* Font name */}
                <div className="flex items-start">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {font.name} <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">· {font.category}</span>
                  </p>
                </div>

                {/* Font samples */}
                <div style={{ fontFamily: font.family }} className="space-y-4 mt-3">
                  <div>
                    <h3 className={`font-bold leading-tight ${fontSizeMappings[previewSize].heading}`}>
                      {previewText}
                    </h3>
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold leading-snug ${fontSizeMappings[previewSize].subheading}`}>
                      {previewText}
                    </h4>
                  </div>
                  
                  <div>
                    <p className={`font-normal ${fontSizeMappings[previewSize].body}`}>
                      {previewText}
                    </p>
                  </div>
                </div>

                {/* Font weights */}
                <div className="mt-4 pt-2 border-t border-gray-50 dark:border-gray-800/30">
                  <div className="flex flex-wrap gap-3">
                    {font.weights.map((weight) => (
                      <div 
                        key={`${font.id}-${weight}`}
                        className="text-xs"
                      >
                        <span className="text-gray-400 dark:text-gray-500">
                          {weight}
                        </span>
                        <span 
                          style={{ fontFamily: font.family, fontWeight: weight }}
                          className="ml-1 text-gray-800 dark:text-gray-200"
                        >
                          Aa
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      {/* Modal to add typography */}
      <AnimatePresence>
        {isAddingFont && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeAddFontDialog}
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeAddFontDialog} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <motion.h2 
                  className="text-xl font-light text-gray-700 dark:text-gray-300 group"
                >
                  Add typography
                </motion.h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={closeAddFontDialog}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {/* Search - Minimalist style */}
              <div className="relative mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mr-2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search typography..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-1 bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  {searchQuery && (
                    <button
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
                      onClick={() => setSearchQuery("")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* List of filtered fonts */}
              <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-2">
                {filteredFonts.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No results found for &quot;{searchQuery}&quot;
                  </p>
                ) : (
                  filteredFonts.map((font) => (
                    <motion.div
                      key={font.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex items-center justify-between ${
                        selectedFonts.some(f => f.id === font.id) ? 'opacity-50' : ''
                      }`}
                      onClick={() => addFont(font)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{font.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{font.category}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span 
                          style={{ fontFamily: font.family }} 
                          className="text-sm text-gray-700 dark:text-gray-300 mr-3"
                        >
                          Aa
                        </span>
                        
                        {selectedFonts.some(f => f.id === font.id) ? (
                          <span className="text-green-500 dark:text-green-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14"></path>
                              <path d="M5 12h14"></path>
                            </svg>
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TypographySection;
