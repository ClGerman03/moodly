"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpotifyEmbed from "@/components/players/SpotifyEmbed";

interface LinkItem {
  id: string;
  url: string;
  title: string; // Optional custom title
  description: string; // Description or reason for the link
  type: "spotify" | "youtube" | "twitter" | "threads" | "instagram" | "other";
}

interface LinkSectionProps {
  initialLinks?: LinkItem[];
  onChange?: (links: LinkItem[]) => void;
  isLiveMode?: boolean;
}

const LinkSection: React.FC<LinkSectionProps> = ({ initialLinks = [], onChange, isLiveMode = false }) => {
  const [links, setLinks] = useState<LinkItem[]>(initialLinks);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  
  // Handles clicking on a link in live mode
  const handleLinkClick = (url: string) => {
    if (isLiveMode) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };
  
  // Automatically detect the link type
  const detectLinkType = (url: string): LinkItem["type"] => {
    if (url.includes("spotify.com")) return "spotify";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
    if (url.includes("threads.net")) return "threads";
    if (url.includes("instagram.com")) return "instagram";
    return "other";
  };
  
  // Extract suggested title from the link
  const getSuggestedTitle = (url: string, type: LinkItem["type"]): string => {
    try {
      const urlObj = new URL(url);
      switch (type) {
        case "spotify":
          return "Spotify";
        case "youtube":
          return "YouTube";
        case "twitter":
          return "Twitter";
        case "threads":
          return "Threads";
        case "instagram":
          return "Instagram";
        default:
          return urlObj.hostname.replace("www.", "");
      }
    } catch {
      return "Link";
    }
  };
  
  // Add a new link
  const handleAddLink = () => {
    if (!newUrl.trim()) return;
    
    // Try to format the URL if it doesn't have http/https
    let formattedUrl = newUrl;
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }
    
    try {
      // Verify if it's a valid URL
      new URL(formattedUrl);
      
      const type = detectLinkType(formattedUrl);
      const newLink: LinkItem = {
        id: `link-${Date.now()}`,
        url: formattedUrl,
        title: getSuggestedTitle(formattedUrl, type),
        description: newDescription.trim() || "Link added",
        type
      };
      
      const updatedLinks = [...links, newLink];
      setLinks(updatedLinks);
      setNewUrl("");
      setNewDescription("");
      setIsAddingLink(false);
      onChange?.(updatedLinks);
    } catch {
      // Invalid URL, we show a subtle message
      alert("Please enter a valid URL");
    }
  };

  // Cancel adding a new link
  const handleCancelAdd = () => {
    setNewUrl("");
    setNewDescription("");
    setIsAddingLink(false);
  };
  
  // Remove a link
  const handleRemoveLink = (id: string) => {
    const updatedLinks = links.filter(link => link.id !== id);
    setLinks(updatedLinks);
    onChange?.(updatedLinks);
  };
  
  // Update a link title
  const handleUpdateTitle = (id: string, newTitle: string) => {
    const updatedLinks = links.map(link => 
      link.id === id ? { ...link, title: newTitle } : link
    );
    setLinks(updatedLinks);
    onChange?.(updatedLinks);
  };

  // Update a link description
  const handleUpdateDescription = (id: string, newDescription: string) => {
    const updatedLinks = links.map(link => 
      link.id === id ? { ...link, description: newDescription } : link
    );
    setLinks(updatedLinks);
    onChange?.(updatedLinks);
  };
  
  // Get icon for the link type
  const getLinkIcon = (type: LinkItem["type"]) => {
    switch (type) {
      case "spotify":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        );
      case "youtube":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case "twitter":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case "threads":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.186 0c2.912 0 5.214.902 6.906 2.706 1.691 1.805 2.537 4.283 2.537 7.433v3.667c0 3.203-.846 5.68-2.537 7.434-1.692 1.752-3.994 2.629-6.906 2.629-2.912 0-5.214-.902-6.906-2.706-1.692-1.804-2.537-4.282-2.537-7.433V9.947c0-3.15.845-5.627 2.537-7.432C6.972.939 9.274.076 12.186.076V0zM9.441 4.864c-1.692.153-2.991.814-3.897 1.983-.906 1.17-1.359 2.768-1.359 4.794v1.868c0 2.027.453 3.625 1.36 4.794.904 1.17 2.203 1.754 3.897 1.907 1.692-.153 2.99-.737 3.896-1.754.905-1.017 1.358-2.614 1.358-4.794v-1.866c0-2.18-.453-3.778-1.358-4.795-.905-1.017-2.204-1.678-3.897-1.983v-.154z"/>
          </svg>
        );
      case "instagram":
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };
  
  return (
    <div className="w-full">
      {isAddingLink && (
        <AnimatePresence>
          <motion.div 
            className="mb-4 py-2 px-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                placeholder="Link URL"
                className="flex-1 py-1 px-2 text-sm font-light bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 text-gray-700 dark:text-gray-300"
                autoFocus
              />
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                placeholder="Description (optional)"
                className="flex-1 py-1 px-2 text-sm font-light bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 text-gray-700 dark:text-gray-300"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <motion.button
                onClick={handleCancelAdd}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 py-1 text-xs font-light text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleAddLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 py-1 text-xs font-light bg-gray-100/80 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200/80 dark:hover:bg-gray-700/70 transition-colors"
              >
                Add
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
      
      {/* List of links */}
      <div className="space-y-2 mb-4">
        <AnimatePresence>
          {links.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className={`group flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ${isLiveMode ? 'cursor-pointer' : ''}`}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
              onClick={() => handleLinkClick(link.url)}
            >
              <div className="flex items-start space-x-3 overflow-hidden">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-400 mt-0.5">
                  {getLinkIcon(link.type)}
                </div>
                
                <div className="min-w-0 flex-1">
                  <input 
                    className="w-full text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent border-b border-transparent focus:border-gray-300 dark:focus:border-gray-600 focus:outline-none transition-colors duration-200"
                    value={link.title}
                    onChange={(e) => handleUpdateTitle(link.id, e.target.value)}
                    readOnly={isLiveMode}
                  />
                  <input 
                    className="w-full text-xs text-gray-500 dark:text-gray-500 bg-transparent border-b border-transparent focus:border-gray-300 dark:focus:border-gray-600 focus:outline-none transition-colors duration-200 mt-0.5 italic"
                    value={link.description}
                    onChange={(e) => handleUpdateDescription(link.id, e.target.value)}
                    readOnly={isLiveMode}
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-600 truncate mt-1">
                    {link.url}
                  </p>
                  {link.type === "spotify" && (
                    <div className="mt-3">
                      <SpotifyEmbed 
                        url={link.url} 
                        compact={true}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <AnimatePresence>
                {(hoveredLink === link.id && !isLiveMode) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2"
                    onClick={() => handleRemoveLink(link.id)}
                    aria-label="Remove link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {links.length === 0 && !isAddingLink && (
          <div className="text-center py-6">
            <p className="text-sm font-light text-gray-400 dark:text-gray-500">
              Add links to your favorite platforms
            </p>
          </div>
        )}
      </div>
      
      {/* Button to add links (at the bottom) */}
      {!isAddingLink && !isLiveMode && (
        <div className={`flex ${links.length > 0 ? 'justify-end' : 'justify-center'} mt-2`}>
          <motion.button
            onClick={() => setIsAddingLink(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 text-xs font-light bg-gray-100/70 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-200/90 dark:hover:bg-gray-700/70 flex items-center transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Add
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default LinkSection;
