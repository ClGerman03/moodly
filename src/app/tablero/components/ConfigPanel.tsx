"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LucideFileText, LucideSettings, LucideEye } from "lucide-react";
import SharePopup from "./popups/SharePopup";
import PdfExportPopup from "./popups/PdfExportPopup";

interface ConfigButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

// Componente para botones de configuración con icono
const ConfigButton: React.FC<ConfigButtonProps> = ({ icon, onClick, active = false }) => {
  return (
    <motion.button
      className={`p-2 mx-1 rounded-full focus:outline-none transition-colors duration-300 ${active ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {icon}
    </motion.button>
  );
};

interface ShareButtonProps {
  onClick?: () => void;
}

// Componente para el botón de compartir con texto
const ShareButton: React.FC<ShareButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      className="py-1.5 px-3 mx-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors duration-300 focus:outline-none"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      Compartir
    </motion.button>
  );
};

interface ConfigPanelProps {
  isLiveMode?: boolean;
  onToggleLiveMode?: () => void;
}

/**
 * Panel de configuración principal que muestra acciones disponibles
 */
const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  isLiveMode = false, 
  onToggleLiveMode = () => {}
}) => {
  // Estado para controlar la visibilidad de los popups
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isPdfPopupOpen, setIsPdfPopupOpen] = useState(false);
  
  // Manejadores para el popup de compartir
  const handleOpenSharePopup = () => {
    setIsSharePopupOpen(true);
  };
  
  const handleCloseSharePopup = () => {
    setIsSharePopupOpen(false);
  };
  
  // Manejadores para el popup de exportar a PDF
  const handleOpenPdfPopup = () => {
    setIsPdfPopupOpen(true);
  };
  
  const handleClosePdfPopup = () => {
    setIsPdfPopupOpen(false);
  };
  
  return (
    <div className="flex flex-row items-center">
      {/* Botón de modo live - siempre visible */}
      <ConfigButton 
        icon={<LucideEye className="w-5 h-5" strokeWidth={1} />}
        onClick={onToggleLiveMode}
        active={isLiveMode}
      />
      
      {/* Resto de botones - solo visibles cuando NO está en modo live */}
      {!isLiveMode && (
        <>
          {/* Botón de exportar a PDF */}
          <ConfigButton 
            icon={<LucideFileText className="w-5 h-5" strokeWidth={1} />}
            onClick={handleOpenPdfPopup}
          />
          
          {/* Botón de compartir con texto */}
          <ShareButton onClick={handleOpenSharePopup} />
          
          {/* Botón de configuración (último a la derecha) */}
          <div className="ml-auto">
            <ConfigButton 
              icon={<LucideSettings className="w-5 h-5" strokeWidth={1} />}
            />
          </div>
        </>
      )}
      
      {/* Popup de compartir */}
      <SharePopup 
        isOpen={isSharePopupOpen} 
        onClose={handleCloseSharePopup}
        boardId="mi-tablero"
      />
      
      {/* Popup de exportar a PDF */}
      <PdfExportPopup
        isOpen={isPdfPopupOpen}
        onClose={handleClosePdfPopup}
      />
    </div>
  );
};

export default ConfigPanel;
