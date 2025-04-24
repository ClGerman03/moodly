import React, { useMemo } from 'react';
import { Palette, Link2, Type, FileText, Image as ImageIcon } from 'lucide-react';
import { Section, SectionType } from '@/app/tablero/types';

interface BoardDetailSectionsProps {
  // Soporte para el objeto board completo (compatibilidad anterior)
  board?: {
    sections?: Section[];
  };
  // Soporte para recibir directamente las secciones (para el nuevo hook)
  sections?: Section[];
  feedbackData?: {
    reviewers: {
      id: string;
      name: string;
      lastUpdated: string;
      completed: boolean;
      itemCount: number;
    }[];
    feedbackStats: {
      totalReactions: number;
      positiveReactions: number;
      negativeReactions: number;
      neutralReactions: number;
      totalComments: number;
      commentsBySection: Record<string, number>;
    };
    feedbackItems: Record<string, { itemId: string; section_id: string; reaction: 'positive' | 'negative' | 'neutral'; comments: { text: string; timestamp: string }[] }[]>;
  } | null;
}

// Función auxiliar para generar un número pseudoaleatorio determinístico basado en un string
function generateSeededRandom(seed: string) {
  // Convierte el string en un número simple
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convierte a entero de 32 bits
  }
  
  // Genera un número entre 0 y 1 basado en el hash
  const random = Math.abs(Math.sin(hash) * 10000) % 1;
  return random;
}

const BoardDetailSections: React.FC<BoardDetailSectionsProps> = ({ board, sections, feedbackData }) => {
  const sectionsToUse = sections || (board?.sections || []);
  
  // Generar o utilizar datos reales de feedback para cada sección
  const sectionFeedbackData = useMemo(() => {
    // Si tenemos datos de Supabase, extraerlos por sección
    if (feedbackData?.feedbackStats?.commentsBySection) {
      // Crear un objeto que contenga estadísticas de feedback por sección
      return sectionsToUse.reduce((acc, section) => {
        const sectionId = section.id;
        const comments = feedbackData.feedbackStats.commentsBySection[sectionId] || 0;
        
        // Contar reacciones para esta sección buscando en todos los items de feedback
        let reactions = 0;
        Object.values(feedbackData.feedbackItems).forEach(items => {
          // Filtrar items por sección y que tengan reacción
          const sectionItems = items.filter(item => 
            item.section_id === sectionId && item.reaction
          );
          reactions += sectionItems.length;
        });
        
        acc[sectionId] = {
          reactions,
          comments
        };
        return acc;
      }, {} as Record<string, {reactions: number, comments: number}>);
    } else {
      // Fallback a datos simulados si no tenemos datos reales
      return sectionsToUse.reduce((acc, section) => {
        // Usar generateSeededRandom para obtener valores consistentes
        const reactionsRandom = generateSeededRandom(`${section.id}-reactions`);
        const commentsRandom = generateSeededRandom(`${section.id}-comments`);
        
        acc[section.id] = {
          reactions: Math.floor(reactionsRandom * 10) + 1,
          comments: Math.floor(commentsRandom * 5) + 1
        };
        return acc;
      }, {} as Record<string, {reactions: number, comments: number}>);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsToUse.map(s => s.id).join('-'), feedbackData]); // Deshabilitar regla para este caso específico
  
  // Función para obtener el icono adecuado según el tipo de sección
  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case 'palette':
        return <Palette className="w-4 h-4 text-gray-600" />;
      case 'links':
        return <Link2 className="w-4 h-4 text-gray-600" />;
      case 'typography':
        return <Type className="w-4 h-4 text-gray-600" />;
      case 'text':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'imageGallery':
        return <ImageIcon className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };
  
  // Función para obtener una vista previa de la sección según su tipo
  const getSectionPreview = (section: Section) => {
    switch (section.type) {
      case 'palette':
        return (
          <div className="flex flex-wrap gap-1 mt-1">
            {section.data?.palettes?.[0]?.colors.slice(0, 5).map((color, index) => (
              <div 
                key={index}
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        );
      
      case 'links':
        return (
          <div className="mt-1">
            {section.data?.links?.slice(0, 2).map((link, index) => (
              <div key={index} className="text-xs text-gray-500 truncate flex items-center">
                <span className="w-1 h-1 rounded-full bg-gray-300 mr-1"></span>
                {link.title || link.url}
              </div>
            ))}
          </div>
        );
      
      case 'typography':
        return (
          <div className="mt-1">
            {section.data?.fonts?.slice(0, 2).map((font, index) => (
              <div key={index} className="text-xs text-gray-500 flex items-center">
                <span className="w-1 h-1 rounded-full bg-gray-300 mr-1"></span>
                {font.name}
              </div>
            ))}
          </div>
        );
      
      case 'text':
        return (
          <div className="mt-1">
            {section.data?.textContent?.title && (
              <div className="text-xs text-gray-500 truncate flex items-center">
                <span className="w-1 h-1 rounded-full bg-gray-300 mr-1"></span>
                {section.data.textContent.title}
              </div>
            )}
          </div>
        );
      
      case 'imageGallery':
        return (
          <div className="flex space-x-1 mt-1">
            {section.data?.images?.slice(0, 3).map((image, index) => (
              <div key={index} className="w-6 h-6 rounded-sm bg-gray-100 overflow-hidden">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: `url(${image})` }}
                />
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Función para obtener el nombre del tipo de sección
  const getSectionTypeName = (type: SectionType) => {
    switch (type) {
      case 'palette': return 'Color Palette';
      case 'links': return 'Links Collection';
      case 'typography': return 'Typography';
      case 'text': return 'Text Content';
      case 'imageGallery': return 'Image Gallery';
      default: return 'Section';
    }
  };
  
  if (sectionsToUse.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-500">This board doesn&apos;t have any sections yet.</p>
      </div>
    );
  }
  
  return (
    <div className="mt-8 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-gray-700">Board Sections</h2>
      </div>
      
      <div className="space-y-3">
        {sectionsToUse.map((section) => (
          <div key={section.id} className="bg-white border-b border-gray-100 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  {getSectionIcon(section.type)}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">{section.title}</h3>
                  <p className="text-xs text-gray-500">{getSectionTypeName(section.type)}</p>
                </div>
              </div>
              
              {/* Estadísticas de feedback en forma de badges minimalistas */}
              <div className="flex space-x-3">
                <div className="flex items-center">
                  <div className="px-2 py-1 bg-gray-50 rounded-full text-xs flex items-center">
                    <span className="text-gray-700">{sectionFeedbackData[section.id]?.reactions || 0}</span>
                    <span className="ml-1 text-gray-500">reactions</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="px-2 py-1 bg-gray-50 rounded-full text-xs flex items-center">
                    <span className="text-gray-700">{sectionFeedbackData[section.id]?.comments || 0}</span>
                    <span className="ml-1 text-gray-500">comments</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vista previa de la sección */}
            <div className="pl-11 mt-1">
              {getSectionPreview(section)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardDetailSections;
