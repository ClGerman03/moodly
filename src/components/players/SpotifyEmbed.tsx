"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SpotifyEmbedProps {
  url: string;
  className?: string;
  compact?: boolean;
}

/**
 * SpotifyEmbed - Componente para embeber reproductor oficial de Spotify
 * Soporta tracks, álbumes y playlists de Spotify
 */
const SpotifyEmbed: React.FC<SpotifyEmbedProps> = ({
  url,
  className = "",
  compact = false
}) => {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Extraer el ID de Spotify y el tipo (track, album, playlist) de la URL
  useEffect(() => {
    try {
      setLoading(true);
      
      // Patrones de URLs de Spotify
      const patterns = [
        // Formato con prefijo regional: https://open.spotify.com/intl-es/track/1234567890
        { regex: /spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]+)/, type: 'track' },
        // Formato con prefijo regional: https://open.spotify.com/intl-es/album/1234567890
        { regex: /spotify\.com\/(?:intl-[a-z]+\/)?album\/([a-zA-Z0-9]+)/, type: 'album' },
        // Formato con prefijo regional: https://open.spotify.com/intl-es/playlist/1234567890
        { regex: /spotify\.com\/(?:intl-[a-z]+\/)?playlist\/([a-zA-Z0-9]+)/, type: 'playlist' },
        // Formato: spotify:track:1234567890
        { regex: /spotify:track:([a-zA-Z0-9]+)/, type: 'track' },
        // Formato: spotify:album:1234567890
        { regex: /spotify:album:([a-zA-Z0-9]+)/, type: 'album' },
        // Formato: spotify:playlist:1234567890
        { regex: /spotify:playlist:([a-zA-Z0-9]+)/, type: 'playlist' }
      ];
      
      let foundMatch = false;
      
      // Buscar coincidencia con algún patrón
      for (const pattern of patterns) {
        const match = url.match(pattern.regex);
        if (match && match[1]) {
          // Construir URL de embebido
          const spotifyId = match[1].split('?')[0]; // Eliminar parámetros de consulta
          const embedType = pattern.type;
          const theme = 'dark'; // Tema acorde con el diseño minimalista de Moodly
          // La altura se usa directamente en el iframe más adelante
          
          setEmbedUrl(`https://open.spotify.com/embed/${embedType}/${spotifyId}?theme=${theme}`);
          foundMatch = true;
          break;
        }
      }
      
      if (!foundMatch) {
        setError("URL de Spotify no válida o no soportada");
      }
      
      setLoading(false);
    } catch (error) {
      // Capturar y registrar error para depuración
      console.error("Error procesando URL de Spotify:", error);
      setError("Error al procesar URL de Spotify");
      setLoading(false);
    }
  }, [url, compact]);

  if (loading) {
    return (
      <div className={cn("p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center", className)}>
        <div className="text-xs text-gray-500 dark:text-gray-400">Cargando reproductor de Spotify...</div>
      </div>
    );
  }

  if (error || !embedUrl) {
    return (
      <div className={cn("p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", className)}>
        <div className="text-xs text-red-500 dark:text-red-400 text-center">
          {error || "No se pudo cargar el reproductor de Spotify"}
        </div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center overflow-hidden text-ellipsis">
          {url}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("spotify-embed rounded-lg overflow-hidden", className)}>
      <iframe
        src={embedUrl}
        width="100%"
        height={compact ? "80" : "152"}
        frameBorder="0"
        allowTransparency={true}
        allow="encrypted-media; autoplay; clipboard-write; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ borderRadius: '8px' }}
      />
    </div>
  );
};

export default SpotifyEmbed;
