"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ExternalLink, ArrowUpRight, ArrowLeft, ArrowRight, Globe } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { useSectionFeedback } from "../hooks/useSectionFeedback";
import FeedbackButtons from "../shared/FeedbackButtons";
import CommentSection from "../shared/CommentSection";
import { cn } from "@/lib/utils";

interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  type: "spotify" | "youtube" | "twitter" | "threads" | "instagram" | "other";
}

interface LinkSectionFeedbackProps {
  section: Section;
  onFeedback?: (sectionId: string, data: Record<string, unknown>) => void;
}

/**
 * LinkDisplayProps - Props for the LinkDisplay component
 */
interface LinkDisplayProps {
  link: LinkItem;
  isMobile: boolean;
  onSwipe: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  onOpenLink: (link: LinkItem) => void;
}

/**
 * LinkDisplay - Component to display a single link with preview
 */
const LinkDisplay: React.FC<LinkDisplayProps> = ({ 
  link, 
  isMobile,
  onSwipe,
  onOpenLink
}) => {
  // Determine icon based on link type
  const getLinkIcon = () => {
    switch(link.type) {
      case "spotify":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5s2.01-4.5 4.5-4.5 4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/>
          </svg>
        );
      case "youtube":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816z"/>
            <path d="M9.6 15.6V8.4l6.4 3.6-6.4 3.6z"/>
          </svg>
        );
      case "twitter":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
          </svg>
        );
      case "threads":
      case "instagram":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        );
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  // Generate a background color based on the link type
  const getLinkBackground = () => {
    switch(link.type) {
      case "spotify": return "bg-green-50 dark:bg-green-900/20";
      case "youtube": return "bg-red-50 dark:bg-red-900/20";
      case "twitter": return "bg-blue-50 dark:bg-blue-900/20";
      case "instagram": return "bg-pink-50 dark:bg-pink-900/20";
      case "threads": return "bg-gray-50 dark:bg-gray-900/20";
      default: return "bg-gray-50 dark:bg-gray-800/20";
    }
  };

  return (
    <motion.div 
      key={link.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
      drag={isMobile ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={onSwipe}
      whileTap={isMobile ? { cursor: "grabbing" } : undefined}
    >
      <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/20">
        {/* Link header with icon and title */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", getLinkBackground())}>
              {getLinkIcon()}
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
                {link.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-[300px]">
                {link.url}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onOpenLink(link)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Open link"
          >
            <ExternalLink size={16} />
          </button>
        </div>
        
        {/* Link content preview */}
        <div className="p-4">
          <div className="mb-3 text-sm text-gray-700 dark:text-gray-300">
            {link.description || "No description available for this link."}
          </div>
          
          {/* Link preview thumbnail (we could enhance this in the future) */}
          <div className="w-full h-48 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center mb-3 overflow-hidden relative">
            {/* This is a placeholder - in a real implementation we would fetch actual link previews */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
              <ArrowUpRight size={32} />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3 text-white text-sm font-medium">
              Preview - Click to open full content
            </div>
          </div>
          
          <button
            onClick={() => onOpenLink(link)}
            className="w-full py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/40 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            Visit {link.type === "other" ? "website" : link.type} <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * LinkSectionFeedback - Component to collect feedback on links in a carousel format
 */
const LinkSectionFeedback: React.FC<LinkSectionFeedbackProps> = ({
  section,
  onFeedback
}) => {
  // Estados para el manejo de enlaces
  const [activeLinkIndex, setActiveLinkIndex] = useState<number>(0);
  const [isCommentMode, setIsCommentMode] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Utilizar el hook común para gestión de feedback
  const {
    currentComment,
    setCurrentComment,
    handleItemFeedback,
    handleSubmitComment,
    cancelComment,
    getItemFeedback,
    getItemComments
  } = useSectionFeedback({
    sectionId: section.id,
    onFeedbackChange: onFeedback
  });
  
  // Obtener los enlaces del section
  const links = useMemo(() => {
    return section.data?.links as LinkItem[] || [];
  }, [section.data?.links]);
  
  // Enlace actualmente activo
  const activeLink = useMemo(() => {
    return links[activeLinkIndex] || null;
  }, [links, activeLinkIndex]);
  
  // Detectar si estamos en dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Función para manejar el cambio de enlace
  const handleLinkChange = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= links.length) return;
    
    setActiveLinkIndex(newIndex);
    setIsCommentMode(false);
  };

  // Manejar deslizamiento para navegar entre enlaces en móvil
  const handleSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;
    
    // Si el deslizamiento es suficientemente largo en X (horizontal)
    if (Math.abs(offset.x) > 100) {
      // Deslizamiento a la derecha (anterior)
      if (offset.x > 0 && activeLinkIndex > 0) {
        handleLinkChange(activeLinkIndex - 1);
      } 
      // Deslizamiento a la izquierda (siguiente)
      else if (offset.x < 0 && activeLinkIndex < links.length - 1) {
        handleLinkChange(activeLinkIndex + 1);
      }
    }
  };
  
  // Handler específico para feedback de enlaces
  const handleLinkFeedback = (type: 'positive' | 'negative' | 'comment') => {
    if (!activeLink) return;
    
    const linkId = activeLink.id;
    
    if (type === 'comment') {
      setIsCommentMode(true);
      // El hook useSectionFeedback lo manejará cuando pasemos el tipo 'comment'
      handleItemFeedback(linkId, type);
      return;
    }
    
    // Usar nuestro hook para gestionar el feedback
    handleItemFeedback(linkId, type);
  };
  
  // Handler para abrir el enlace en nueva pestaña
  const handleOpenLink = (link: LinkItem) => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  };
  
  // Handler específico para enviar comentarios de enlaces
  const handleLinkCommentSubmit = () => {
    if (!currentComment.trim() || !activeLink) return;
    
    // Usar nuestro hook para enviar el comentario
    handleSubmitComment();
    
    // Resetear UI
    setIsCommentMode(false);
  };
  
  // Handler para cancelar comentario
  const handleCancelComment = () => {
    cancelComment();
    setIsCommentMode(false);
  };
  
  // Si no hay enlaces, mostrar un mensaje
  if (!links.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        Este tablero no contiene enlaces
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-lg font-light text-gray-700 dark:text-gray-300">
            {activeLink.title}
          </h3>
        </div>
        
        {/* Navegación entre enlaces */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleLinkChange(activeLinkIndex - 1)}
            disabled={activeLinkIndex === 0}
            className={`p-2 rounded-full ${
              activeLinkIndex === 0 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Previous link"
          >
            <ArrowLeft size={16} />
          </button>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {activeLinkIndex + 1} / {links.length}
          </span>
          
          <button 
            onClick={() => handleLinkChange(activeLinkIndex + 1)}
            disabled={activeLinkIndex === links.length - 1}
            className={`p-2 rounded-full ${
              activeLinkIndex === links.length - 1 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Next link"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Componente presentacional para el enlace */}
      {activeLink && (
        <LinkDisplay 
          link={activeLink}
          isMobile={isMobile}
          onSwipe={handleSwipe}
          onOpenLink={handleOpenLink}
        />
      )}
      
      {/* Panel de feedback */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {isCommentMode ? (
            <CommentSection
              itemId={activeLink.id}
              currentComment={currentComment}
              setCurrentComment={setCurrentComment}
              onSubmitComment={handleLinkCommentSubmit}
              onCancelComment={handleCancelComment}
              existingComments={getItemComments(activeLink.id)}
              title="Deja un comentario sobre este enlace"
            />
          ) : (
            <motion.div 
              key="feedback-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="text-sm text-gray-600 dark:text-gray-300">
                ¿Qué opinas sobre este enlace?
              </div>
              <FeedbackButtons 
                onFeedback={handleLinkFeedback}
                currentFeedback={getItemFeedback(activeLink.id)}
                useMessageIcon={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LinkSectionFeedback;
