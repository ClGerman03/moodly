"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LucideX, LucideFileText, LucideDownload, LucideCheck, LucideSettings } from "lucide-react";

interface PdfExportPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Component for exporting the board to a PDF document
 */
const PdfExportPopup: React.FC<PdfExportPopupProps> = ({
  isOpen,
  onClose
}) => {
  // Estado para opciones de exportación
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "legal">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [quality, setQuality] = useState<"draft" | "normal" | "high">("normal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [historyStateAdded, setHistoryStateAdded] = useState(false);
  
  // Referencias para detectar clics fuera del popup
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Cerrar popup con escape o clic fuera
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener("keydown", handleEscKey);
      window.addEventListener("mousedown", handleClickOutside);
      
      // Manejar navegación del botón atrás en dispositivos móviles
      if (typeof window !== 'undefined' && !historyStateAdded) {
        window.history.pushState({ popup: true }, "");
        setHistoryStateAdded(true);
      }
    }
    
    return () => {
      window.removeEventListener("keydown", handleEscKey);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, historyStateAdded]);
  
  // Manejar el evento popstate (botón atrás del navegador)
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen && historyStateAdded) {
        onClose();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
      
      // Al desmontar, limpiar el estado del historial si fuimos nosotros quienes lo añadimos
      if (historyStateAdded && isOpen) {
        setHistoryStateAdded(false);
      }
    };
  }, [isOpen, historyStateAdded, onClose]);
  
  // Manejar la generación del PDF
  const handleGeneratePdf = () => {
    setIsGenerating(true);
    
    // Simulamos la generación del PDF
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      
      // Resetear el estado después de un tiempo
      setTimeout(() => {
        setIsGenerated(false);
      }, 3000);
    }, 1500);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          
          {/* Popup Container */}
          <motion.div
            ref={popupRef}
            className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 p-4">
              <h2 className="text-xl font-light text-gray-800 dark:text-gray-200 flex items-center">
                <LucideFileText size={18} className="mr-2" strokeWidth={1.5} /> Export to PDF
              </h2>
              <button 
                onClick={() => {
                  // Si añadimos una entrada al historial para este popup, volvemos atrás para que no se acumulen
                  if (historyStateAdded && typeof window !== 'undefined') {
                    setHistoryStateAdded(false);
                    window.history.back();
                  }
                  onClose();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <LucideX size={18} strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5">
              <div className="space-y-5">
                {/* Tamaño de página */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    Page Size
                  </label>
                  <div className="flex space-x-2">
                    <button
                      className={`flex-1 py-1.5 px-2 text-xs rounded-md transition-colors ${
                        pageSize === "a4" 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setPageSize("a4")}
                    >
                      A4
                    </button>
                    <button
                      className={`flex-1 py-1.5 px-2 text-xs rounded-md transition-colors ${
                        pageSize === "letter" 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setPageSize("letter")}
                    >
                      Letter
                    </button>
                    <button
                      className={`flex-1 py-1.5 px-2 text-xs rounded-md transition-colors ${
                        pageSize === "legal" 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setPageSize("legal")}
                    >
                      Legal
                    </button>
                  </div>
                </div>
                
                {/* Orientación */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    Orientation
                  </label>
                  <div className="flex space-x-2">
                    <button
                      className={`flex-1 py-1.5 px-2 text-xs rounded-md transition-colors ${
                        orientation === "portrait" 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setOrientation("portrait")}
                    >
                      Portrait
                    </button>
                    <button
                      className={`flex-1 py-1.5 px-2 text-xs rounded-md transition-colors ${
                        orientation === "landscape" 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setOrientation("landscape")}
                    >
                      Landscape
                    </button>
                  </div>
                </div>
                
                {/* Calidad */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    Quality
                  </label>
                  <div className="flex space-x-2">
                    <button
                      className={`flex-1 py-1.5 px-2 text-xs rounded-md transition-colors ${
                        quality === "draft" 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setQuality("draft")}
                    >
                      Draft
                    </button>
                    <button
                      className={`flex-1 py-1.5 px-2 text-xs rounded-md transition-colors ${
                        quality === "normal" 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setQuality("normal")}
                    >
                      Normal
                    </button>
                    <button
                      className={`flex-1 py-1.5 px-2 text-xs rounded-md transition-colors ${
                        quality === "high" 
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setQuality("high")}
                    >
                      High
                    </button>
                  </div>
                </div>
                
                {/* Opciones adicionales */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    Additional Options
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="include-header"
                        checked={includeHeader}
                        onChange={() => setIncludeHeader(!includeHeader)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-600"
                      />
                      <label htmlFor="include-header" className="ml-2 text-xs text-gray-600 dark:text-gray-300">
                        Include header and footer
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="include-page-numbers"
                        checked={includePageNumbers}
                        onChange={() => setIncludePageNumbers(!includePageNumbers)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-600"
                      />
                      <label htmlFor="include-page-numbers" className="ml-2 text-xs text-gray-600 dark:text-gray-300">
                        Include page numbers
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Vista previa */}
                <div className="mt-4 flex justify-center">
                  <div className={`w-24 h-32 border rounded-md p-2 flex flex-col ${
                    orientation === "landscape" ? "w-32 h-24" : "w-24 h-32"
                  } overflow-hidden`}>
                    <div className="bg-gray-100 dark:bg-gray-800 flex-grow mb-1 rounded"></div>
                    <div className="bg-gray-100 dark:bg-gray-800 h-1 mb-1 rounded w-3/4"></div>
                    <div className="bg-gray-100 dark:bg-gray-800 h-1 mb-1 rounded w-1/2"></div>
                    <div className="bg-gray-100 dark:bg-gray-800 h-1 rounded w-2/3"></div>
                  </div>
                </div>
                
                {/* Botón de generar PDF */}
                <button
                  onClick={handleGeneratePdf}
                  disabled={isGenerating}
                  className={`mt-2 w-full py-2.5 px-4 rounded-md flex items-center justify-center transition-colors ${
                    isGenerating
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-wait"
                      : isGenerated
                      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating PDF...
                    </>
                  ) : isGenerated ? (
                    <>
                      <LucideCheck size={16} className="mr-1.5" />
                      PDF Generated
                    </>
                  ) : (
                    <>
                      <LucideDownload size={16} className="mr-1.5" />
                      Generate PDF
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/40 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <LucideSettings size={14} className="mr-1.5" strokeWidth={1.5} />
              <span>Customize more options in settings</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PdfExportPopup;
