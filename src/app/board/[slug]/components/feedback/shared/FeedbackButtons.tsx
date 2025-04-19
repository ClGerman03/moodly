"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, PenTool, MessageSquare } from "lucide-react";

export type FeedbackType = 'positive' | 'negative' | 'comment';

interface FeedbackButtonsProps {
  /**
   * Callback que se ejecuta cuando se selecciona un tipo de feedback
   */
  onFeedback: (type: FeedbackType) => void;
  
  /**
   * Tipo de feedback actualmente seleccionado (para mostrar estado activo)
   */
  currentFeedback?: FeedbackType;
  
  /**
   * Determina si se debe mostrar el botón de comentarios
   * @default true
   */
  allowComment?: boolean;
  
  /**
   * Usar el icono MessageSquare en lugar de PenTool para comentarios
   * @default false
   */
  useMessageIcon?: boolean;
  
  /**
   * Clases CSS adicionales para el contenedor
   */
  className?: string;
}

/**
 * Componente reutilizable para botones de feedback
 * Proporciona una interfaz uniforme para dar feedback positivo, negativo o comentarios
 */
const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  onFeedback,
  currentFeedback,
  allowComment = true,
  useMessageIcon = false,
  className = ""
}) => {
  // Determinar qué botones mostrar
  const buttons: Array<{type: FeedbackType, icon: React.ReactNode, color: string, bgColor: string, hoverBgColor: string}> = [
    {
      type: 'positive',
      icon: <ThumbsUp size={16} strokeWidth={1.5} />,
      color: 'text-white',
      bgColor: 'bg-black/70',
      hoverBgColor: 'hover:bg-black/80'
    },
    {
      type: 'negative',
      icon: <ThumbsDown size={16} strokeWidth={1.5} />,
      color: 'text-white',
      bgColor: 'bg-black/70',
      hoverBgColor: 'hover:bg-black/80'
    }
  ];
  
  // Agregar botón de comentario si está permitido
  if (allowComment) {
    buttons.push({
      type: 'comment',
      icon: useMessageIcon ? <MessageSquare size={16} strokeWidth={1.5} /> : <PenTool size={16} strokeWidth={1.5} />,
      color: 'text-black',
      bgColor: 'bg-amber-400',
      hoverBgColor: 'hover:bg-amber-400'
    });
  }
  
  return (
    <div className={`flex gap-2 items-center ${className}`}>
      {buttons.map((button) => (
        <motion.button 
          key={button.type}
          className={`${button.bgColor} ${button.color} p-2 rounded-full ${button.hoverBgColor} 
                      transition-colors ${
            currentFeedback === button.type ? 'opacity-100 scale-105' : 'opacity-90'
          }`}
          whileHover={{ 
            scale: button.type === 'comment' ? 1.1 : 1.05,
            backgroundColor: button.type === 'comment' ? 'rgba(250, 204, 21, 1)' : undefined 
          }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onFeedback(button.type)}
          aria-label={button.type}
        >
          <motion.div
            whileHover={{
              color: button.type === 'positive' ? "rgba(167, 243, 208, 0.9)" :
                    button.type === 'negative' ? "rgba(252, 165, 165, 0.9)" :
                    "rgba(0, 0, 0, 0.8)"
            }}
          >
            {button.icon}
          </motion.div>
        </motion.button>
      ))}
    </div>
  );
};

export default FeedbackButtons;
