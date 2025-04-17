"use client";

import { motion } from "framer-motion";
import ProfilePopover from "../../../components/ui/popups/ProfilePopover";
import { useAuth } from "@/contexts/AuthContext";
import { LucideUpload, LucideLayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

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
      className="w-auto px-4 py-1.5 mx-1 text-xs font-light text-white dark:text-gray-100 transition-all duration-300 rounded-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-500 focus:ring-offset-1 transform hover:scale-[1.02] opacity-90 hover:opacity-100 flex items-center justify-center"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <LucideUpload className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
      <span>Publish</span>
    </motion.button>
  );
};



interface ConfigPanelProps {
  onShare?: () => void;
}

/**
 * Main configuration panel that displays available actions
 */
const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  onShare = () => {}
}) => {
  // Get authentication state
  const { user } = useAuth();
  const router = useRouter();
  
  const handleDashboardClick = () => {
    router.push('/dashboard');
  };
  
  return (
    <div className="flex flex-row items-center">
      {/* Removed Live mode button as requested */}
      
      {/* Other buttons - always visible */}
      {/* Share button with text */}
      <ShareButton onClick={onShare} />
      
      {/* Dashboard button - only visible if there's a user */}
      {user && (
        <ConfigButton 
          icon={<LucideLayoutDashboard className="w-4 h-4" />}
          onClick={handleDashboardClick}
          tooltip="Dashboard"
        />
      )}
      
      {/* Profile button - always visible if there's a user */}
      {user && (
        <div className="ml-4">
          <ProfilePopover user={user} />
        </div>
      )}
      
      {/* The Share Popup is now managed from the parent component */}
    </div>
  );
};

export default ConfigPanel;
