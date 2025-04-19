"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ConfirmationVariant = "success" | "info" | "warning";

interface ConfirmationMessageProps {
  variant?: ConfirmationVariant;
  title: string;
  message?: string;
  className?: string;
}

/**
 * Componente reutilizable para mostrar mensajes de confirmación
 * Versión minimalista sin fondo ni bordes, solo texto centrado con icono
 */
const ConfirmationMessage: React.FC<ConfirmationMessageProps> = ({
  variant = "success",
  title,
  message,
  className = "",
}) => {
  // Configuraciones basadas en la variante
  const variantStyles = {
    success: {
      textColor: "text-neutral-800 dark:text-neutral-200",
      icon: <CheckCircle2 size={32} strokeWidth={1.5} className="text-neutral-800 dark:text-neutral-200" />
    },
    info: {
      textColor: "text-blue-600 dark:text-blue-400",
      icon: <Info size={36} className="text-blue-500 dark:text-blue-400" />
    },
    warning: {
      textColor: "text-amber-600 dark:text-amber-400",
      icon: <AlertCircle size={36} className="text-amber-500 dark:text-amber-400" />
    }
  };

  const styles = variantStyles[variant];

  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-8 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icono centrado en la parte superior */}
      <div className="mb-4">
        {styles.icon}
      </div>
      
      {/* Texto centrado */}
      <h4 className={`text-center text-base font-normal ${styles.textColor} mb-2`}>
        {title}
      </h4>
      
      {message && (
        <p className={`text-center text-sm font-light ${styles.textColor} opacity-90`}>
          {message}
        </p>
      )}
    </motion.div>
  );
};

export default ConfirmationMessage;
