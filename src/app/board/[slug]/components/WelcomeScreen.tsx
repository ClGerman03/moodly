"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  boardName: string;
  onStart: (clientName: string) => void;
}

/**
 * Pantalla de bienvenida para la experiencia de feedback
 * Muestra una introducción y solicita el nombre del cliente antes de comenzar
 */
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ boardName, onStart }) => {
  const [clientName, setClientName] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clientName.trim()) {
      onStart(clientName.trim());
    } else {
      setError("Por favor, introduce tu nombre para continuar");
    }
  };
  
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl font-light text-gray-800 dark:text-gray-100 mb-2">
            Bienvenido al tablero
          </h1>
          
          <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-6">
            {boardName}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Has sido invitado a revisar este tablero y proporcionar tu feedback. 
            Te mostraremos diferentes secciones para que puedas compartir tu opinión.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="client-name" className="block text-sm text-gray-600 dark:text-gray-400 text-left mb-1">
                ¿Cómo te llamas?
              </label>
              <input
                id="client-name"
                type="text"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Escribe tu nombre"
                className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-1 text-left">
                  {error}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Comenzar revisión
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;
