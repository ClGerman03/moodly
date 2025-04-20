import React, { useMemo } from 'react';
import { Palette, Link2, Type, FileText, Image as ImageIcon } from 'lucide-react';
import { Section, SectionType } from '@/app/tablero/types';

interface BoardDetailSectionsProps {
  board: {
    sections?: Section[];
  };
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

const BoardDetailSections: React.FC<BoardDetailSectionsProps> = ({ board }) => {
  const sections = board.sections || [];
  
  // Generar datos estables de feedback para cada sección
  const sectionFeedbackData = useMemo(() => {
    // Crear un objeto con IDs de sección como claves y datos de feedback aleatorios
    return sections.reduce((acc, section) => {
      // Usar generateSeededRandom para obtener valores consistentes
      const reactionsRandom = generateSeededRandom(`${section.id}-reactions`);
      const commentsRandom = generateSeededRandom(`${section.id}-comments`);
      
      acc[section.id] = {
        reactions: Math.floor(reactionsRandom * 10) + 1,
        comments: Math.floor(commentsRandom * 5) + 1
      };
      return acc;
    }, {} as Record<string, {reactions: number, comments: number}>);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map(s => s.id).join('-')]); // Deshabilitar regla para este caso específico
  
  // Función para obtener el icono adecuado según el tipo de sección
  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case 'palette':
        return <Palette className="w-5 h-5 text-orange-500" />;
      case 'links':
        return <Link2 className="w-5 h-5 text-blue-500" />;
      case 'typography':
        return <Type className="w-5 h-5 text-purple-500" />;
      case 'text':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'imageGallery':
        return <ImageIcon className="w-5 h-5 text-pink-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };
  
  // Función para obtener una vista previa de la sección según su tipo
  const getSectionPreview = (section: Section) => {
    switch (section.type) {
      case 'palette':
        return (
          <div className="flex space-x-1 mt-2">
            {section.data?.palettes?.[0]?.colors.slice(0, 5).map((color, index) => (
              <div 
                key={index}
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        );
      
      case 'links':
        return (
          <div className="mt-2 space-y-1">
            {section.data?.links?.slice(0, 2).map((link, index) => (
              <div key={index} className="text-xs text-gray-500 truncate">
                {link.title || link.url}
              </div>
            ))}
          </div>
        );
      
      case 'typography':
        return (
          <div className="mt-2 space-y-1">
            {section.data?.fonts?.slice(0, 2).map((font, index) => (
              <div key={index} className="text-xs text-gray-500">
                {font.name} ({font.category})
              </div>
            ))}
          </div>
        );
      
      case 'text':
        return (
          <div className="mt-2">
            {section.data?.textContent?.title && (
              <div className="text-xs text-gray-500 truncate">{section.data.textContent.title}</div>
            )}
          </div>
        );
      
      case 'imageGallery':
        return (
          <div className="flex space-x-1 mt-2">
            {section.data?.images?.slice(0, 3).map((image, index) => (
              <div key={index} className="w-10 h-10 rounded bg-gray-100 overflow-hidden">
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
  
  if (sections.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-500">This board doesn&apos;t have any sections yet.</p>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Board Sections</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              {getSectionIcon(section.type)}
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">{section.title}</h3>
                <p className="text-xs text-gray-500">{getSectionTypeName(section.type)}</p>
              </div>
            </div>
            
            {/* Vista previa de la sección */}
            {getSectionPreview(section)}
            
            {/* Feedback de la sección */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 mr-1.5">
                  {sectionFeedbackData[section.id]?.reactions || 0}
                </div>
                <span className="text-xs text-gray-500">reactions</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 mr-1.5">
                  {sectionFeedbackData[section.id]?.comments || 0}
                </div>
                <span className="text-xs text-gray-500">comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardDetailSections;
