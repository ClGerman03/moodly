"use client";

import { useState, useRef } from "react";
import ConfigPanel from './components/ConfigPanel';
import SectionManager from './components/SectionManager';

export default function Tablero() {
  const [boardName, setBoardName] = useState<string>("");
  const [isNameSet, setIsNameSet] = useState<boolean>(false);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar la configuración del nombre del tablero
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (boardName.trim()) {
      setIsNameSet(true);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-all duration-500 ease-in-out">
      {!isNameSet ? (
        // Pantalla para configurar el nombre del tablero - Estilo minimalista sin fondo
        <div className="flex flex-col items-center justify-center h-screen w-full max-w-md mx-auto animate-fadeIn transition-all duration-500">
          <h1 className="mb-8 text-2xl font-light text-gray-800 dark:text-gray-100 tracking-wide">
            ¿Cómo se llamará tu tablero?
          </h1>
          <form onSubmit={handleNameSubmit} className="w-full space-y-6">
            <div className="relative w-full">
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Escribe un nombre"
                className="w-full py-3 text-xl text-center text-gray-700 placeholder-gray-400/60 bg-transparent border-b-2 border-gray-200 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-300"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full max-w-xs mx-auto px-4 py-2 mt-8 font-medium text-white transition-all duration-300 rounded-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transform hover:scale-102 opacity-90 hover:opacity-100 flex items-center justify-center"
            >
              Comenzar
            </button>
          </form>
        </div>
      ) : (
        // Pantalla del tablero comenzando desde la parte superior
        <div className="w-full max-w-6xl mx-auto p-6 pt-10 animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-light text-gray-800 dark:text-gray-100">
              {boardName}
            </h1>
            <ConfigPanel 
              isLiveMode={isLiveMode}
              onToggleLiveMode={() => setIsLiveMode(!isLiveMode)}
            />
          </div>
          
          {/* Gestor de secciones */}
          <SectionManager 
            fileInputRef={fileInputRef}
            isLiveMode={isLiveMode}
          />
        </div>
      )}
    </div>
  );
}
