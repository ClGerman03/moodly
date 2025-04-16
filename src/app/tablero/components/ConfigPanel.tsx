"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LucideFileText, LucideEye } from "lucide-react";
import PdfExportPopup from "./popups/PdfExportPopup";
import ProfilePopover from "../../../components/ui/popups/ProfilePopover";
import { useAuth } from "@/contexts/AuthContext";

interface ConfigButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  tooltip?: string;
}

// Component for configuration buttons with icon
const ConfigButton: React.FC<ConfigButtonProps> = ({ icon, onClick, active = false, tooltip }) => {
  return (
    <div className="relative group">
      <motion.button
        className={`p-2 mx-1 rounded-full focus:outline-none transition-colors duration-300 ${active ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        aria-label={tooltip}
      >
        {icon}
      </motion.button>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
};

interface ShareButtonProps {
  onClick?: () => void;
}

// Component for the share button with text
const ShareButton: React.FC<ShareButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      className="py-1.5 px-3 mx-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors duration-300 focus:outline-none"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      Share
    </motion.button>
  );
};



interface ConfigPanelProps {
  isLiveMode?: boolean;
  onToggleLiveMode?: () => void;
  onShare?: () => void;
}

/**
 * Main configuration panel that displays available actions
 */
const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  isLiveMode = false, 
  onToggleLiveMode = () => {},
  onShare = () => {}
}) => {
  // Get authentication state
  const { user } = useAuth();
  
  // State to control PDF popup visibility
  const [isPdfPopupOpen, setIsPdfPopupOpen] = useState(false);
  
  // Handlers for PDF export popup
  const handleOpenPdfPopup = () => {
    setIsPdfPopupOpen(true);
  };
  
  const handleClosePdfPopup = () => {
    setIsPdfPopupOpen(false);
  };
  

  
  return (
    <div className="flex flex-row items-center">
      {/* Live mode button - always visible */}
      <ConfigButton 
        icon={<LucideEye className="w-5 h-5" strokeWidth={1} />}
        onClick={onToggleLiveMode}
        active={isLiveMode}
        tooltip="View mode"
      />
      
      {/* Other buttons - only visible when NOT in live mode */}
      {!isLiveMode && (
        <>
          {/* Export to PDF button */}
          <ConfigButton 
            icon={<LucideFileText className="w-5 h-5" strokeWidth={1} />}
            onClick={handleOpenPdfPopup}
            tooltip="Export to PDF"
          />
          
          {/* Share button with text */}
          <ShareButton onClick={onShare} />
        </>
      )}
      
      {/* Profile button - always visible if there's a user */}
      {user && (
        <div className="ml-4">
          <ProfilePopover user={user} />
        </div>
      )}
      
      {/* The Share Popup is now managed from the parent component */}
      
      {/* PDF export popup */}
      <PdfExportPopup
        isOpen={isPdfPopupOpen}
        onClose={handleClosePdfPopup}
      />
    </div>
  );
};

export default ConfigPanel;
