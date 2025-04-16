import { useState, useEffect } from "react";

/**
 * Hook personalizado para detectar si el dispositivo es móvil o desktop
 * Usa múltiples técnicas para una detección más precisa
 * @returns {boolean} - true si es dispositivo móvil, false si es desktop
 */
export const useDeviceDetection = (): boolean => {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      // 1. Detectar por tipo de entrada (touchscreen)
      const hasTouchScreen = window.matchMedia('(pointer: coarse)').matches;
      
      // 2. Detectar por tamaño de pantalla (típicamente móviles < 768px)
      const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
      
      // 3. Detectar por agente de usuario (método de respaldo)
      const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera: string }).opera || '';
      const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileByUA = mobileRegex.test(userAgent.toLowerCase());
      
      // 4. Detectar por orientación (la mayoría de los móviles están en portrait)
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      
      // Combinar los resultados para una detección más precisa
      // Consideramos que es un móvil si:
      // - Tiene pantalla táctil Y (es una pantalla pequeña O está en modo retrato O el UA indica móvil)
      setIsMobileDevice(hasTouchScreen && (isSmallScreen || isPortrait || isMobileByUA));
      
      // Añadir un log para depuración
      console.log('Device detection:', { 
        hasTouchScreen, 
        isSmallScreen, 
        isMobileByUA, 
        isPortrait,
        isMobile: hasTouchScreen && (isSmallScreen || isPortrait || isMobileByUA)
      });
    };
    
    // Verificar al inicio
    checkIfMobile();
    
    // Añadir event listeners para cambios
    window.addEventListener('resize', checkIfMobile);
    window.addEventListener('orientationchange', checkIfMobile);
    
    // Limpiar al desmontar
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      window.removeEventListener('orientationchange', checkIfMobile);
    };
  }, []);
  
  return isMobileDevice;
};
