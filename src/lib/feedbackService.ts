/**
 * Servicio para gestionar datos de feedback
 * 
 * Este servicio se encarga de cargar y procesar los datos de feedback de revisores
 * desde localStorage, siguiendo el principio de separaciu00f3n de responsabilidades.
 */

// Tipos para los datos de feedback
export interface FeedbackItem {
  itemId: string;
  reaction: 'positive' | 'negative' | 'neutral';
  comments: { text: string; timestamp: string }[];
}

export interface SectionFeedback {
  feedbackItems: Record<string, FeedbackItem>;
  comments: { itemId: string; comment: string; timestamp: string }[];
  paletteFeedbacks?: { paletteId: string; type: 'positive' | 'negative' | 'neutral'; timestamp: string }[];
  paletteComments?: { paletteId: string; comment: string; timestamp: string }[];
  imageFeedback?: Record<string, string>;
}

export interface ReviewerFeedback {
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  lastUpdated: string;
  responses: Record<string, SectionFeedback>;
}

export interface BoardFeedback {
  boardId: string;
  clientName?: string;
  reviewers: ReviewerFeedback[];
}

/**
 * Genera un número aleatorio determinista basado en un string como semilla
 * @param seed - String que actúa como semilla para generar el número aleatorio
 * @returns Número aleatorio entre 0 y 1, determinista para la misma semilla
 */
export const generateSeededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Normalize to a value between 0 and 1
  // Using a modulo and division to get a decimal between 0 and 1
  return (Math.abs(hash) % 1000) / 1000;
};

/**
 * Genera un color aleatorio pero determinista basado en un ID
 * @param id - Identificador único para generar un color consistente
 * @returns String de color hexadecimal
 */
export const generateColor = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Lista de colores pastel modernos
  const colors = [
    '#FFD1DC', // Rosa pastel
    '#FFADAD', // Rojo claro
    '#FFD6A5', // Naranja pastel
    '#FDFFB6', // Amarillo pastel
    '#CAFFBF', // Verde pastel
    '#9BF6FF', // Cian pastel
    '#A0C4FF', // Azul pastel
    '#BDB2FF', // Lavanda
    '#FFC6FF'  // Magenta pastel
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Busca todos los datos de feedback para un tablero especu00edfico en localStorage
 * @param boardId - ID del tablero para el que se busca feedback
 * @returns Objeto con los datos de feedback organizados por revisor
 */
export const loadBoardFeedback = (boardId: string): BoardFeedback => {
  if (typeof window === 'undefined') {
    return { boardId, reviewers: [] };
  }
  
  // Buscar en localStorage todos los items con el patru00f3n "moodly-feedback-{boardId}*"
  const feedbackItems: ReviewerFeedback[] = [];
  const reviewerAvatars: Record<string, string> = {};
  
  try {
    // Buscar items que coincidan con el patru00f3n
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      // Buscar items de feedback
      if (key.startsWith(`moodly-feedback-${boardId}-`)) {
        const item = localStorage.getItem(key);
        if (!item) continue;
        
        try {
          const feedbackData = JSON.parse(item);
          
          // Comprobar si el formato coincide con lo esperado
          if (feedbackData.boardId === boardId && feedbackData.responses) {
            // Extraer ID de revisor del nombre de la clave
            const reviewerId = key.replace(`moodly-feedback-${boardId}-`, '');
            const reviewerName = feedbackData.clientName || 'Anonymous Reviewer';
            
            // Crear o reutilizar avatar para este revisor
            if (!reviewerAvatars[reviewerId]) {
              reviewerAvatars[reviewerId] = `https://source.boringavatars.com/beam/120/${encodeURIComponent(reviewerName)}?colors=${encodeURIComponent(generateColor(reviewerId).substring(1))}`;
            }
            
            // Au00f1adir a la lista de feedback
            feedbackItems.push({
              reviewerId,
              reviewerName,
              reviewerAvatar: reviewerAvatars[reviewerId],
              lastUpdated: feedbackData.lastUpdated || new Date().toISOString(),
              responses: feedbackData.responses
            });
          }
        } catch (e) {
          console.error(`Error parsing feedback data for key ${key}:`, e);
        }
      }
    }
    
    // Si no hay feedback real, devolver un objeto vacu00edo
    return {
      boardId,
      reviewers: feedbackItems
    };
  } catch (e) {
    console.error('Error loading feedback data:', e);
    return { boardId, reviewers: [] };
  }
};

/**
 * Guarda los datos de feedback de un revisor para un tablero especu00edfico
 * @param boardId - ID del tablero
 * @param reviewerId - ID del revisor
 * @param data - Datos de feedback a guardar
 */
export const saveFeedback = (boardId: string, reviewerId: string, data: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Asegurarse de que los datos tienen la estructura correcta
    if (!data.boardId) data.boardId = boardId;
    if (!data.lastUpdated) data.lastUpdated = new Date().toISOString();
    
    // Guardar en localStorage
    localStorage.setItem(`moodly-feedback-${boardId}-${reviewerId}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving feedback:', e);
  }
};

/**
 * Carga un feedback especu00edfico desde localStorage
 * @param boardId - ID del tablero
 * @param reviewerId - ID del revisor
 * @returns Datos de feedback o null si no existe
 */
export const loadSingleFeedback = (boardId: string, reviewerId: string): Record<string, unknown> | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = `moodly-feedback-${boardId}-${reviewerId}`;
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    return JSON.parse(item);
  } catch (e) {
    console.error('Error loading single feedback:', e);
    return null;
  }
};

/**
 * Funciu00f3n de utilidad para simular datos de feedback para pruebas
 * @param boardId - ID del tablero
 * @param clientName - Nombre del cliente/revisor
 */
export const createTestFeedback = (boardId: string, clientName: string = 'Test Reviewer'): void => {
  if (typeof window === 'undefined') return;
  
  const reviewerId = `test-${Date.now()}`;
  const mockData = {
    boardId,
    clientName,
    responses: {
      'section-example1': {
        feedbackItems: {
          'item1': {
            itemId: 'item1',
            comments: [{ text: 'This looks great!', timestamp: new Date().toISOString() }],
            reaction: 'positive'
          },
          'item2': {
            itemId: 'item2',
            comments: [{ text: 'Not sure about this one.', timestamp: new Date().toISOString() }],
            reaction: 'negative'
          }
        },
        imageFeedback: {
          'item1': 'positive',
          'item2': 'negative'
        },
        comments: [
          { itemId: 'item1', comment: 'This looks great!', timestamp: new Date().toISOString() },
          { itemId: 'item2', comment: 'Not sure about this one.', timestamp: new Date().toISOString() }
        ],
        paletteFeedbacks: [
          { paletteId: 'item1', type: 'positive', timestamp: new Date().toISOString() },
          { paletteId: 'item2', type: 'negative', timestamp: new Date().toISOString() }
        ],
        paletteComments: [
          { paletteId: 'item1', comment: 'This looks great!', timestamp: new Date().toISOString() },
          { paletteId: 'item2', comment: 'Not sure about this one.', timestamp: new Date().toISOString() }
        ]
      }
    },
    lastUpdated: new Date().toISOString()
  };
  
  saveFeedback(boardId, reviewerId, mockData);
};
