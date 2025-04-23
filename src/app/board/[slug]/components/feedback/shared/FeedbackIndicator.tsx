"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import type { FeedbackType } from "./FeedbackButtons";

// Tipo para los indicadores individuales de feedback
export type FeedbackIndicatorType = FeedbackType | 'hasComments';

interface FeedbackIndicatorProps {
  // Se puede pasar un tipo único o un array de tipos para mostrar múltiples indicadores
  type: FeedbackIndicatorType | FeedbackIndicatorType[];
  // Indicador específico para comentarios (para evitar conflictos con el tipo 'comment')
  hasComments?: boolean;
  size?: number;
  className?: string;
}

/**
 * Componente que muestra un indicador visual del feedback dado
 * Usa íconos animados en lugar de simples círculos de color
 */
const FeedbackIndicator: React.FC<FeedbackIndicatorProps> = ({
  type,
  hasComments = false,
  size = 18,
  className = ""
}) => {
  // Convertir a array si es un solo tipo
  const types = Array.isArray(type) ? type : [type];
  
  // Añadir indicador de comentarios si existe
  if (hasComments && !types.includes('hasComments')) {
    types.push('hasComments');
  }
  
  // Determinar el ícono y color según el tipo de feedback
  const getIconAndColor = (type: FeedbackIndicatorType) => {
    switch (type) {
      case "positive":
        return {
          icon: <ThumbsUp size={size} strokeWidth={2} />,
          bgColor: "bg-gray-800",
          textColor: "text-white"
        };
      case "negative":
        return {
          icon: <ThumbsDown size={size} strokeWidth={2} />,
          bgColor: "bg-black",
          textColor: "text-white"
        };
      case "comment":
      case "hasComments":
        return {
          icon: <MessageSquare size={size} strokeWidth={2} />,
          bgColor: "bg-gray-600",
          textColor: "text-white"
        };
      default:
        return {
          icon: <ThumbsUp size={size} strokeWidth={2} />,
          bgColor: "bg-gray-500",
          textColor: "text-white"
        };
    }
  };

  // Animación de entrada para los indicadores
  const containerVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10,
        duration: 0.3
      }
    }
  };

  // Si hay más de un tipo de feedback, mostramos varios indicadores
  if (types.length > 1) {
    return (
      <div className="flex items-center gap-1">
        {types.map((t, index) => {
          // Saltamos los tipos 'comment' porque usaremos 'hasComments' en su lugar
          if (t === 'comment') return null;
          
          const { icon, bgColor, textColor } = getIconAndColor(t);
          return (
            <motion.div
              key={t}
              className={`rounded-full p-1.5 shadow-md ${bgColor} ${textColor} ${className}`}
              variants={containerVariants}
              initial="initial"
              animate="animate"
              whileHover={{ scale: 1.1 }}
              // Añadir un pequeño retardo en la animación para cada icono subsecuente
              transition={{ delay: index * 0.1 }}
            >
              {icon}
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Si solo hay un tipo, mostramos el indicador simple
  const { icon, bgColor, textColor } = getIconAndColor(types[0]);

  return (
    <motion.div
      className={`rounded-full p-1.5 shadow-md ${bgColor} ${textColor} ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.1 }}
    >
      {icon}
    </motion.div>
  );
};

export default FeedbackIndicator;
