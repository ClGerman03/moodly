"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BentoImageGrid, { ImageLayout } from './sections/BentoImageGrid';
import ColorPaletteComponent from './sections/ColorPalette';
import LinkSection from './sections/LinkSection';
import TypographySection from './sections/TypographySection';
import TextSection from './sections/TextSection';
import AddSection from './AddSection';
import { SectionType, ColorPalette, LinkItem, ImageMetadata, FontOption, TextContent } from '../types';

// Usando los tipos importados desde ../types

interface Section {
  id: string;
  type: SectionType;
  title: string;
  data?: {
    colors?: string[];
    palettes?: ColorPalette[];
    images?: string[];
    imageLayouts?: { [key: number]: ImageLayout };
    imageMetadata?: { [key: string]: ImageMetadata };
    links?: LinkItem[];
    fonts?: FontOption[];
    textContent?: TextContent;
  };
}

interface SectionManagerProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLiveMode?: boolean;
}

const SectionManager = ({ fileInputRef, isLiveMode = false }: SectionManagerProps) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  
  // Función eliminada ya que no se usa después de la actualización del AddSection
  
  // Manejar la adición de una nueva sección
  const handleAddSection = (type: SectionType) => {
    // Asignar titulo predeterminado segun el tipo
    const defaultTitle = type === "bento" ? "Bento Images" : 
                     type === "palette" ? "Color Palette" : 
                     type === "typography" ? "Tipografía" : 
                     type === "text" ? "Texto" : "Enlaces";
    
    // Preparar datos iniciales según el tipo de sección
    let initialData: Record<string, unknown> = {};
    
    if (type === "bento") {
      initialData = { images: [], imageLayouts: {}, imageMetadata: {} };
    } else if (type === "links") {
      initialData = { links: [] };
    } else if (type === "typography") {
      initialData = { fonts: [] };
    } else if (type === "text") {
      initialData = { textContent: { title: "", subtitle: "", size: "medium" } };
    }
    
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      title: defaultTitle,
      data: initialData
    };
    
    setSections([...sections, newSection]);
    
    // Activar inmediatamente la edicion del nuevo titulo
    setTimeout(() => {
      setEditingSectionId(newSection.id);
    }, 100);
  };
  
  // Eliminar una sección
  const handleRemoveSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };
  
  // Actualizar el título de una sección
  const updateSectionTitle = (id: string, newTitle: string) => {
    const updatedSections = sections.map(section => 
      section.id === id ? { ...section, title: newTitle } : section
    );
    setSections(updatedSections);
  };
  
  // Actualizar datos específicos de una sección (colores, etc.)
  // Utilizamos un tipo más específico en lugar de 'any'
  // Usamos Record<string, unknown> que es más específico que 'any' pero mantiene compatibilidad
  const updateSectionData = (id: string, newData: Record<string, unknown>) => { 
    const updatedSections = sections.map(section => 
      section.id === id ? { ...section, data: { ...section.data, ...newData } } : section
    );
    setSections(updatedSections);
  };
  
  // Actualizar imágenes de una sección específica
  const handleImagesUpdate = (sectionId: string, newImages: string[]) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const currentImages = section.data?.images || [];
    const updatedImages = [...currentImages, ...newImages];
    
    updateSectionData(sectionId, { images: updatedImages });
  };
  
  // Manejar la reordenación de imágenes mediante arrastre
  const handleImagesReorder = (sectionId: string, reorderedImages: string[]) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    // Actualizar directamente el array de imágenes con el nuevo orden
    updateSectionData(sectionId, { images: reorderedImages });
  };

  // Eliminar una imagen de una sección específica
  const handleImageRemove = (sectionId: string, index: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.data?.images) return;
    
    const removedImageUrl = section.data.images[index];
    const updatedImages = [...section.data.images];
    updatedImages.splice(index, 1);
    
    // Actualizar layouts para mantener consistencia
    const currentLayouts = section.data.imageLayouts || {};
    const updatedLayouts: { [key: number]: ImageLayout } = {};
    
    // Reasignar layouts, desplazando todos los índices posteriores al eliminado
    Object.entries(currentLayouts).forEach(([i, layout]) => {
      const imageIndex = parseInt(i);
      if (imageIndex < index) {
        updatedLayouts[imageIndex] = layout;
      } else if (imageIndex > index) {
        updatedLayouts[imageIndex - 1] = layout;
      }
      // El layout del índice eliminado simplemente se descarta
    });
    
    // Actualizar metadatos, eliminando el de la imagen removida
    const currentMetadata = section.data.imageMetadata || {};
    const updatedMetadata = { ...currentMetadata };
    if (removedImageUrl) {
      delete updatedMetadata[removedImageUrl];
    }
    
    updateSectionData(sectionId, { 
      images: updatedImages,
      imageLayouts: updatedLayouts,
      imageMetadata: updatedMetadata
    });
  };

  // Cambiar el layout de una imagen en una sección específica
  const handleLayoutChange = (sectionId: string, index: number, layout: ImageLayout) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.data) return;
    
    const currentLayouts = section.data.imageLayouts || {};
    updateSectionData(sectionId, { 
      imageLayouts: { ...currentLayouts, [index]: layout }
    });
  };
  
  // Manejar cambios en los metadatos de una imagen
  const handleImageMetadataChange = (sectionId: string, imageUrl: string, metadata: ImageMetadata) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.data) return;
    
    const currentMetadata = section.data.imageMetadata || {};
    updateSectionData(sectionId, { 
      imageMetadata: { ...currentMetadata, [imageUrl]: metadata }
    });
  };

  // Renderizar el título de una sección (editable o no)
  const renderSectionTitle = (section: Section) => {
    // No permitir edición en modo live
    const isEditing = !isLiveMode && editingSectionId === section.id;
    
    return (
      <div className="flex justify-between items-center mb-4">
        {isEditing ? (
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
            onBlur={() => setEditingSectionId(null)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingSectionId(null)}
            className="text-xl font-light bg-transparent focus:outline-none text-gray-700 dark:text-gray-300 w-full max-w-sm"
            autoFocus
          />
        ) : (
          <motion.h2 
            className={`text-xl font-light text-gray-700 dark:text-gray-300 ${!isLiveMode ? 'cursor-pointer' : ''} group max-w-sm`}
            onClick={() => !isLiveMode && setEditingSectionId(section.id)}
            whileHover={!isLiveMode ? { x: 2 } : undefined}
            title={isLiveMode ? section.title : "Haz click para editar"}
          >
            {section.title}
            {!isLiveMode && <span className="inline-block w-0 group-hover:w-full h-[1px] bg-gray-400/30 dark:bg-gray-500/30 mt-1 transition-all duration-300"></span>}
          </motion.h2>
        )}
        
        {hoveredSectionId === section.id && !isLiveMode && (
          <motion.button
            onClick={() => handleRemoveSection(section.id)}
            className="ml-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            title="Eliminar sección"
            aria-label="Eliminar sección"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </motion.button>
        )}
      </div>
    );
  };
  
  // Renderizar una sección basada en su tipo
  const renderSection = (section: Section) => {
    switch (section.type) {
      case "bento":
        return (
          <motion.div 
            key={section.id} 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setHoveredSectionId(section.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            {renderSectionTitle(section)}
            <BentoImageGrid 
              images={section.data?.images || []} 
              imageLayouts={new Map(Object.entries(section.data?.imageLayouts || {}).map(([key, value]) => [parseInt(key), value]))}
              imageMetadata={new Map(Object.entries(section.data?.imageMetadata || {}).map(([key, value]) => [key, value]))}
              onLayoutChange={(index, layout) => handleLayoutChange(section.id, index, layout)} 
              onImagesAdd={(newImages) => handleImagesUpdate(section.id, newImages)}
              onImageRemove={(index) => handleImageRemove(section.id, index)}
              onImageMetadataChange={(imageUrl, metadata) => handleImageMetadataChange(section.id, imageUrl, metadata)}
              onReorder={(reorderedImages) => handleImagesReorder(section.id, reorderedImages)}
              fileInputRef={fileInputRef}
              isLiveMode={isLiveMode}
            />
          </motion.div>
        );
      case "palette":
        return (
          <motion.div 
            key={section.id} 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setHoveredSectionId(section.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            {renderSectionTitle(section)}
            <ColorPaletteComponent 
              initialPalettes={section.data?.palettes} 
              onChange={(palettes) => updateSectionData(section.id, { palettes })}
              isLiveMode={isLiveMode}
            />
          </motion.div>
        );
      case "links":
        return (
          <motion.div 
            key={section.id} 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setHoveredSectionId(section.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            {renderSectionTitle(section)}
            <LinkSection 
              initialLinks={section.data?.links} 
              onChange={(links) => updateSectionData(section.id, { links })}
              isLiveMode={isLiveMode}
            />
          </motion.div>
        );
      case "typography":
        return (
          <motion.div 
            key={section.id} 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setHoveredSectionId(section.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            {renderSectionTitle(section)}
            <TypographySection 
              initialFonts={section.data?.fonts} 
              onChange={(fonts) => updateSectionData(section.id, { fonts })}
              isLiveMode={isLiveMode}
            />
          </motion.div>
        );
      case "text":
        return (
          <motion.div 
            key={section.id} 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setHoveredSectionId(section.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            {renderSectionTitle(section)}
            <TextSection 
              initialText={section.data?.textContent} 
              onChange={(textContent) => updateSectionData(section.id, { textContent })}
              isLiveMode={isLiveMode}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full">
      <AnimatePresence>
        {sections.map(renderSection)}
      </AnimatePresence>
      {!isLiveMode && (
        <AddSection 
          onAddSection={handleAddSection} 
        />
      )}
    </div>
  );
};

export default SectionManager;
