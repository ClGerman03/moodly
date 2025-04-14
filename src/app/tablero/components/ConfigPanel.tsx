"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideFileText, LucideUser, LucideEye } from "lucide-react";
import SharePopup from "./popups/SharePopup";
import PdfExportPopup from "./popups/PdfExportPopup";
import ProfilePopup from "./popups/ProfilePopup";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

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

// Componente específico para el botón de perfil
const ProfileButton: React.FC<{ onClick?: () => void, active?: boolean, avatarUrl?: string }> = ({ 
  onClick, 
  active = false,
  avatarUrl
}) => {
  return (
    <motion.button
      className={`p-1 mx-1 rounded-full focus:outline-none transition-colors duration-300 relative ${
        active ? 'ring-2 ring-blue-400 dark:ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {avatarUrl ? (
        <div className="w-7 h-7 rounded-full overflow-hidden">
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={28}
            height={28}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <LucideUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
      )}
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
  // Acceder al contexto de autenticación
  const { user, signOut } = useAuth();
  
  // Estado para controlar la visibilidad de los popups
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isPdfPopupOpen, setIsPdfPopupOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  
  // Estado para el proceso de cierre de sesión
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  
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
  
  // Manejadores para el popup de perfil
  const handleOpenProfilePopup = () => {
    setIsProfilePopupOpen(true);
  };
  
  const handleCloseProfilePopup = () => {
    setIsProfilePopupOpen(false);
  };
  
  // Manejar cierre de sesión
  const handleSignOut = async () => {
    try {
      // Mostrar estado de carga
      setIsSigningOut(true);
      setSignOutError(null);
      
      // Intentar cerrar sesión
      await signOut();
      
      // El cierre de la ventana de popup y la redirección sucederán automáticamente
      // desde la función signOut en AuthContext
    } catch (error) {
      // Mostrar error si algo falla
      console.error('Error al cerrar sesión desde UI:', error);
      setSignOutError('No se pudo cerrar sesión. Intenta nuevamente.');
      setIsSigningOut(false);
    }
  };
  
  // Obtener la URL del avatar si está disponible
  const avatarUrl = user?.user_metadata?.avatar_url;
  
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
          
          {/* Botón de perfil (último a la derecha) */}
          <div className="ml-auto">
            <ProfileButton 
              onClick={handleOpenProfilePopup}
              active={isProfilePopupOpen}
              avatarUrl={avatarUrl}
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
      
      {/* Popup de perfil */}
      <AnimatePresence>
        {isProfilePopupOpen && (
          <ProfilePopup
            isOpen={isProfilePopupOpen}
            onClose={handleCloseProfilePopup}
            user={user}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
            signOutError={signOutError}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfigPanel;
