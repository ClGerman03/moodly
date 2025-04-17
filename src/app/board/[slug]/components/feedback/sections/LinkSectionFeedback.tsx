"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ThumbsUp, ThumbsDown, MessageSquare, X, ArrowUpRight } from "lucide-react";
import { Section } from "@/app/tablero/types";

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

const LinkSectionFeedback: React.FC<LinkSectionFeedbackProps> = ({
  section,
  onFeedback
}) => {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<Record<string, 'positive' | 'negative'>>({});
  const [isCommentMode, setIsCommentMode] = useState<boolean>(false);
  const [activeLink, setActiveLink] = useState<LinkItem | null>(null);
  const [comment, setComment] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [expandedLink, setExpandedLink] = useState<string | null>(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const links = section.data?.links as LinkItem[] || [];
  
  const handleLinkClick = (link: LinkItem, e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile) {
      setExpandedLink(expandedLink === link.id ? null : link.id);
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };
  
  const handleFeedback = (linkId: string, type: 'positive' | 'negative') => {
    setUserFeedback(prev => ({
      ...prev,
      [linkId]: type
    }));
    
    onFeedback?.(section.id, {
      linkFeedback: {
        ...userFeedback,
        [linkId]: type
      }
    });
    
    if (isMobile) {
      setExpandedLink(null);
    }
  };

  const handleCommentSubmit = () => {
    if (!activeLink || !comment.trim()) return;
    
    onFeedback?.(section.id, {
      linkComments: {
        [activeLink.id]: comment.trim()
      }
    });
    
    setComment("");
    setIsCommentMode(false);
    setActiveLink(null);
    if (isMobile) {
      setExpandedLink(null);
    }
  };
  
  if (!links.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        Este tablero no contiene enlaces
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <div key={link.id} className="relative">
            <motion.div
              className="group relative overflow-hidden rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onHoverStart={() => !isMobile && setHoveredLink(link.id)}
              onHoverEnd={() => !isMobile && setHoveredLink(null)}
            >
              <div 
                className="cursor-pointer p-4"
                onClick={(e) => handleLinkClick(link, e)}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200/80 text-gray-600">
                    {link.type === "spotify" && <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5s2.01-4.5 4.5-4.5 4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/></svg>}
                    {link.type === "youtube" && <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>}
                    {link.type === "twitter" && <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>}
                    {link.type === "threads" && <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>}
                    {link.type === "instagram" && <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>}
                    {link.type === "other" && <ExternalLink className="h-4 w-4" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {link.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {link.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback Panel - Desktop */}
              {!isMobile && (
                <AnimatePresence>
                  {hoveredLink === link.id && (
                    <motion.div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex gap-3">
                        {(['positive', 'negative'] as const).map((type) => (
                          <motion.button
                            key={type}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFeedback(link.id, type);
                            }}
                            aria-label={type}
                          >
                            {type === 'positive' ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
                          </motion.button>
                        ))}
                        <motion.button
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLink(link);
                            setIsCommentMode(true);
                          }}
                          aria-label="comment"
                        >
                          <MessageSquare size={16} />
                        </motion.button>
                      </div>
                      <motion.button
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(link.url, "_blank", "noopener,noreferrer");
                        }}
                        aria-label="open link"
                      >
                        <ArrowUpRight size={16} />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Feedback Indicator */}
              {userFeedback[link.id] && !hoveredLink && !expandedLink && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200/80 text-gray-600">
                  {userFeedback[link.id] === 'positive' ? (
                    <ThumbsUp size={12} />
                  ) : (
                    <ThumbsDown size={12} />
                  )}
                </div>
              )}
            </motion.div>

            {/* Mobile Feedback Panel */}
            {isMobile && (
              <AnimatePresence>
                {expandedLink === link.id && (
                  <motion.div
                    className="mt-2 overflow-hidden rounded-lg bg-white shadow-sm"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 space-y-3">
                      <div className="flex justify-between items-center gap-3">
                        {(['positive', 'negative'] as const).map((type) => (
                          <button
                            key={type}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFeedback(link.id, type);
                            }}
                          >
                            {type === 'positive' ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
                            <span className="text-sm font-medium">
                              {type === 'positive' ? 'Me gusta' : 'No me gusta'}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLink(link);
                            setIsCommentMode(true);
                          }}
                        >
                          <MessageSquare size={16} />
                          <span className="text-sm font-medium">Comentar</span>
                        </button>
                        <button
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(link.url, "_blank", "noopener,noreferrer");
                          }}
                        >
                          <ArrowUpRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        ))}
      </div>

      {/* Comment Modal */}
      <AnimatePresence>
        {isCommentMode && activeLink && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setIsCommentMode(false);
                  setActiveLink(null);
                  setComment("");
                }}
              >
                <X size={20} />
              </button>
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Deja un comentario sobre {activeLink.title}
              </h3>
              <textarea
                className="mb-4 h-32 w-full resize-none rounded-lg border border-gray-200 p-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="¿Qué opinas sobre este enlace?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  onClick={handleCommentSubmit}
                >
                  Enviar comentario
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LinkSectionFeedback;
