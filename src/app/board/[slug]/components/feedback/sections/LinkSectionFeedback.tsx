"use client";

import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowUpRight, ArrowLeft, ArrowRight, Globe, Maximize, Minimize } from "lucide-react";
import { Section } from "@/app/tablero/types";
import { useSectionFeedback } from "../hooks/useSectionFeedback";
import FeedbackButtons from "../shared/FeedbackButtons";
import FeedbackIndicator from "../shared/FeedbackIndicator";
import CommentSection from "../shared/CommentSection";
import SpotifyEmbed from "@/components/players/SpotifyEmbed";

// Importar react-player con lazy loading para mejorar el rendimiento
const ReactPlayer = lazy(() => import('react-player/lazy'));

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
  // Mostrar reproductor automáticamente para contenido de Spotify
  const isSpotifyContent = useMemo(() => {
    return link.type === "spotify" || /spotify\.com/.test(link.url);
  }, [link.url, link.type]);
  
  // Determinar si es contenido de YouTube específicamente
  const isYouTubeContent = useMemo(() => {
    return link.type === "youtube" || /youtube\.com|youtu\.be/.test(link.url);
  }, [link.url, link.type]);

  // Determinar si es contenido premium (Spotify o YouTube)
  const isPremiumContent = useMemo(() => {
    return isSpotifyContent || isYouTubeContent;
  }, [isSpotifyContent, isYouTubeContent]);
  
  // Para contenido no-Spotify, mantener el comportamiento anterior (toggle manual)
  const [showPlayer, setShowPlayer] = useState(isPremiumContent);
  // Expandir por defecto para Spotify y YouTube
  const [isExpanded, setIsExpanded] = useState(isPremiumContent);
  
  // Verificar si el enlace es compatible con ReactPlayer
  const isPlayable = useMemo(() => {
    // Verificar los patrones de URL más comunes para contenido reproducible
    return (
      link.type === "youtube" || 
      link.type === "spotify" || 
      /youtube\.com|youtu\.be|spotify\.com|soundcloud\.com|vimeo\.com/.test(link.url)
    );
  }, [link.url, link.type]);

  // Determinar si es contenido de audio
  const isAudioContent = useMemo(() => {
    return (
      link.type === "spotify" || 
      /spotify\.com|soundcloud\.com/.test(link.url)
    );
  }, [link.url, link.type]);

  // Tamaño del reproductor basado en si está expandido o no
  const playerHeight = isExpanded ? '320px' : '200px';
  
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
      case "spotify": return "bg-black text-white dark:bg-black dark:text-white";
      case "youtube": return "bg-black text-white dark:bg-black dark:text-white";
      case "twitter": return "bg-blue-50 dark:bg-blue-900/20";
      case "instagram": return "bg-pink-50 dark:bg-pink-900/20";
      case "threads": return "bg-gray-50 dark:bg-gray-900/20";
      default: return "bg-gray-50 dark:bg-gray-800/20";
    }
  };

  // Función para alternar la visualización del reproductor
  const togglePlayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    // No permitir ocultar reproductor de Spotify una vez mostrado
    if (!isPremiumContent || !showPlayer) {
      setShowPlayer(!showPlayer);
    }
  };

  // Función para alternar el modo expandido
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
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
      {/* Reproductor embebido si es compatible y está activado */}
      {isPlayable && showPlayer ? (
        <div className="w-full mb-3 relative">
          <div className={`w-full overflow-hidden rounded-xl ${isExpanded ? 'shadow-md' : 'shadow-sm'}`}>
            {isSpotifyContent ? (
              // Reproductor embebido oficial de Spotify
              <SpotifyEmbed 
                url={link.url}
                compact={false} // Siempre en modo completo
                className={`w-full ${isExpanded ? 'p-0' : 'p-0'}`}
              />
            ) : isYouTubeContent ? (
              // ReactPlayer para YouTube optimizado
              <Suspense fallback={
                <div className={`w-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center`} style={{ height: playerHeight }}>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Cargando reproductor...</div>
                </div>
              }>
                <ReactPlayer
                  url={link.url}
                  width="100%"
                  height={playerHeight}
                  controls={true}
                  light={false} // Sin vista previa para reproducción directa
                  playing={true} // Reproducir automáticamente
                  className="react-player"
                  config={{
                    youtube: {
                      playerVars: { 
                        modestbranding: 1,
                        rel: 0
                      }
                    }
                  }}
                />
              </Suspense>
            ) : isAudioContent ? (
              // Reproductor para otro contenido de audio (si lo hay en el futuro)
              <Suspense fallback={
                <div className={`w-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center`} style={{ height: playerHeight }}>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Cargando reproductor...</div>
                </div>
              }>
                <ReactPlayer
                  url={link.url}
                  width="100%"
                  height={playerHeight}
                  controls={true}
                  light={false}
                  className="react-player"
                />
              </Suspense>
            ) : (
              // ReactPlayer para video
              <Suspense fallback={
                <div className={`w-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center`} style={{ height: playerHeight }}>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Cargando reproductor...</div>
                </div>
              }>
                <ReactPlayer
                  url={link.url}
                  width="100%"
                  height={playerHeight}
                  controls={true}
                  light={true} 
                  className="react-player"
                  config={{
                    youtube: {
                      playerVars: { 
                        modestbranding: 1,
                        rel: 0
                      }
                    }
                  }}
                />
              </Suspense>
            )}
            
            {/* Controles para expandir/contraer el reproductor */}
            {!isPremiumContent && (
              <div className="absolute top-2 right-2 flex gap-1">
                <button 
                  onClick={toggleExpand} 
                  className="p-1 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 rounded-full shadow-sm text-gray-700 dark:text-gray-300"
                  aria-label={isExpanded ? "Contraer reproductor" : "Expandir reproductor"}
                >
                  {isExpanded ? <Minimize size={14} /> : <Maximize size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
      
      <div 
        className={`p-3 rounded-xl ${getLinkBackground()} transition-all duration-200 hover:shadow-sm cursor-pointer ${isPremiumContent && showPlayer ? 'py-2 px-3' : 'p-3'} ${isPremiumContent ? 'bg-black text-white hover:bg-black/90' : ''}`}
        onClick={() => onOpenLink(link)}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-1.5 mb-1.5">
            <div className="text-gray-600 dark:text-gray-300">
              {getLinkIcon()}
            </div>
            <span className={`text-xs ${isPremiumContent ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'} font-normal capitalize`}>
              {link.type}
            </span>
          </div>
          
          <div className="flex space-x-1">
            {/* Botón para abrir/cerrar el reproductor si es compatible */}
            {isPlayable && !isPremiumContent && (
              <button 
                onClick={togglePlayer} 
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 rounded-full transition-colors"
                aria-label={showPlayer ? "Ocultar reproductor" : "Mostrar reproductor"}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 3l14 9-14 9V3z"/>
                </svg>
              </button>
            )}
            
            {/* Botón para abrir enlace en nueva pestaña */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.open(link.url, '_blank', 'noopener,noreferrer');
              }} 
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 rounded-full transition-colors"
              aria-label="Abrir enlace en nueva pestaña"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        
        <h4 className={`text-xs font-medium ${isPremiumContent ? 'text-white' : 'text-gray-800 dark:text-gray-200'} mb-1 line-clamp-1`}>
          {link.title}
        </h4>
        
        {!isPremiumContent && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-1.5">
            {link.description}
          </p>
        )}
        
        <div className={`flex items-center text-[10px] ${isPremiumContent ? 'text-gray-400' : 'text-gray-500 dark:text-gray-500'} font-light overflow-hidden whitespace-nowrap text-ellipsis`}>
          {link.url}
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
        This board has no links
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {activeLink.title}
          </h3>

          {/* Indicador de feedback para el enlace actual */}
          {(getItemFeedback(activeLink.id) || getItemComments(activeLink.id).length > 0) && (
            <FeedbackIndicator 
              type={getItemFeedback(activeLink.id) || 'hasComments'}
              hasComments={getItemComments(activeLink.id).length > 0}
              size={16}
              className="shadow-md"
            />
          )}
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
              title="Leave a comment about this link"
            />
          ) : (
            <motion.div 
              key="feedback-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="text-sm text-gray-600 dark:text-gray-300">
                What do you think about this link?
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
