"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageGallerySection from './sections/ImageGallerySection';
import SectionConnector from './SectionConnector';

// Define the ImageLayout type locally instead of importing from a non-existent module
type ImageLayout = "square" | "vertical" | "horizontal";
import ColorPaletteComponent from './sections/ColorPalette';
import LinkSection from './sections/LinkSection';
import TypographySection from './sections/TypographySection';
import TextSection from './sections/TextSection';
import AddSection from './AddSection';
import { SectionType, ImageMetadata, Section } from '../types';
import { prepareForStorage, prepareForDisplay } from '@/utils/serialization/sectionAdapters';

// Usando los tipos importados desde ../types

// La interfaz Section ahora se importa desde '../types'

interface SectionManagerProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLiveMode?: boolean;
  initialSections?: Section[];
}

const SectionManager = forwardRef<{ getSections: () => Section[] }, SectionManagerProps>((
  { fileInputRef, isLiveMode = false, initialSections = [] }: SectionManagerProps,
  ref
) => {
  const [sections, setSections] = useState<Section[]>([]);
  
  // Procesar las secciones iniciales cuando se cargan
  useEffect(() => {
    if (initialSections && initialSections.length > 0) {
      console.log('SectionManager: Cargando secciones iniciales', initialSections);
      const processedSections = prepareForDisplay(initialSections);
      setSections(processedSections);
    }
  }, [initialSections]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingDescriptionId, setEditingDescriptionId] = useState<string | null>(null);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  
  // Función eliminada ya que no se usa después de la actualización del AddSection
  
  // Manejar la adición de una nueva sección
  const handleAddSection = (type: SectionType) => {
    // Asignar titulo predeterminado segun el tipo (todos en inglés)
    const defaultTitle = type === "imageGallery" ? "Image Gallery" :
                     type === "palette" ? "Color Palette" : 
                     type === "typography" ? "Typography" : 
                     type === "text" ? "Text" : "Links";
    
    // Preparar datos iniciales según el tipo de sección
    let initialData: Record<string, unknown> = {};
    
    if (type === "links") {
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
    
    // Eliminamos la activación automática de edición del título para mejor experiencia
    // El usuario puede hacer clic en el título cuando desee editarlo
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

  // Actualizar la descripción de una sección
  const updateSectionDescription = (id: string, newDescription: string) => {
    const updatedSections = sections.map(section => 
      section.id === id ? { ...section, description: newDescription } : section
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
    if (!section || !section.data) return;
    
    const currentImages = section.data.images || [];
    const currentLayouts = section.data.imageLayouts || {};
    
    // Crear un nuevo mapeo de layouts basado en las nuevas posiciones
    const newImageLayouts: { [key: number]: ImageLayout } = {};
    
    // Para cada imagen en el nuevo orden, encontrar su posición anterior y su layout
    reorderedImages.forEach((imageUrl, newIndex) => {
      const oldIndex = currentImages.findIndex(url => url === imageUrl);
      
      if (oldIndex !== -1 && currentLayouts[oldIndex]) {
        // Transferir el layout de la posición anterior a la nueva posición
        const layout = currentLayouts[oldIndex];
        // Verificar que sea un valor válido de ImageLayout
        if (layout === "square" || layout === "vertical" || layout === "horizontal") {
          newImageLayouts[newIndex] = layout;
        } else {
          // Valor por defecto si no es válido
          newImageLayouts[newIndex] = "square";
        }
      }
    });
    
    // Actualizar las secciones con las imágenes reordenadas y los layouts actualizados
    const updatedSections = sections.map(s => 
      s.id === sectionId ? { 
        ...s, 
        data: { 
          ...s.data, 
          images: reorderedImages,
          imageLayouts: newImageLayouts  // Actualizar los layouts con el nuevo mapeo
        } 
      } : s
    );
    
    setSections(updatedSections);
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
    Object.entries(currentLayouts).forEach(([i, layoutValue]) => {
      const imageIndex = parseInt(i);
      // Verificar que sea un valor válido de ImageLayout
      const layout = (layoutValue === "square" || layoutValue === "vertical" || layoutValue === "horizontal") 
        ? layoutValue as ImageLayout 
        : "square" as ImageLayout;
        
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

  // Función no utilizada actualmente, pero se mantiene comentada para implementación futura
  // const handleLayoutChange = (sectionId: string, index: number, layout: ImageLayout) => {
  //   const section = sections.find(s => s.id === sectionId);
  //   if (!section || !section.data) return;
  //   
  //   const currentLayouts = section.data.imageLayouts || {};
  //   updateSectionData(sectionId, { 
  //     imageLayouts: { ...currentLayouts, [index]: layout }
  //   });
  // };
  
  // Manejar cambios en los metadatos de una imagen
  const handleImageMetadataChange = (sectionId: string, imageUrl: string, metadata: ImageMetadata) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.data) return;
    
    const currentMetadata = section.data.imageMetadata || {};
    updateSectionData(sectionId, { 
      imageMetadata: { ...currentMetadata, [imageUrl]: metadata }
    });
  };

  // Renderizar el título y descripción de una sección (editable o no)
  const renderSectionTitle = (section: Section) => {
    const isEditingTitle = editingSectionId === section.id;
    const isEditingDescription = editingDescriptionId === section.id;
    const isHovered = hoveredSectionId === section.id;
    
    return (
      <div className="mb-3 flex justify-between items-start">
        <div className="flex-grow">
          {isEditingTitle ? (
            <input
              type="text"
              className="w-full p-0 pb-1 text-xl font-light text-gray-800 bg-transparent border-0 border-b border-gray-200 focus:border-gray-500 outline-none focus:outline-none focus:ring-0 transition-all duration-200"
              value={section.title}
              onChange={(e) => updateSectionTitle(section.id, e.target.value)}
              onBlur={() => setEditingSectionId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setEditingSectionId(null);
                }
              }}
              autoFocus
              spellCheck="false"
            />
          ) : (
            <h2
              className="text-xl font-light text-gray-700 cursor-pointer hover:text-gray-900 transition-colors duration-200 group relative"
              onClick={() => !isLiveMode && setEditingSectionId(section.id)}
            >
              {section.title}
              {!isLiveMode && <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gray-400/30 group-hover:w-full transition-all duration-300"></span>}
            </h2>
          )}
          
          {/* Description Field */}
          <div className="mt-1">
            {isEditingDescription ? (
              <input
                type="text"
                className="w-full p-0 pb-0.5 text-sm font-light text-gray-600 bg-transparent border-0 border-b border-gray-200 focus:border-gray-500 outline-none focus:outline-none focus:ring-0 transition-all duration-200"
                value={section.description || ''}
                placeholder="Add a description"
                onChange={(e) => updateSectionDescription(section.id, e.target.value)}
                onBlur={() => setEditingDescriptionId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingDescriptionId(null);
                  }
                }}
                autoFocus
                spellCheck="false"
              />
            ) : (
              <p
                className="text-sm font-light text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200 group relative inline-block"
                onClick={() => !isLiveMode && setEditingDescriptionId(section.id)}
              >
                {section.description || 
                  <span className="italic text-gray-400">Add a description</span>}
                {!isLiveMode && <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gray-400/30 group-hover:w-full transition-all duration-300"></span>}
              </p>
            )}
          </div>
        </div>
        {isHovered && !isLiveMode && (
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
      case "imageGallery":
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
            <ImageGallerySection 
              images={section.data?.images || []} 
              imageMetadata={new Map(Object.entries(section.data?.imageMetadata || {}).map(([key, value]) => [key, value]))}
              onImagesAdd={(newImages: string[]) => handleImagesUpdate(section.id, newImages)}
              onImageRemove={(index: number) => handleImageRemove(section.id, index)}
              onImageMetadataChange={(imageUrl: string, metadata: ImageMetadata) => handleImageMetadataChange(section.id, imageUrl, metadata)}
              onReorder={(reorderedImages: string[]) => handleImagesReorder(section.id, reorderedImages)}
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
  
  // Exponer la función getSections a través del ref
  useImperativeHandle(ref, () => ({
    getSections: () => {
      console.log('SectionManager: Obteniendo secciones para almacenamiento', sections);
      // Preparar secciones para almacenamiento antes de devolverlas
      return prepareForStorage(sections);
    }
  }));
  
  // Esta función renderiza secciones con conectores entre ellas
  const renderSectionsWithConnectors = () => {
    if (sections.length === 0) return null;
    
    const result: React.ReactNode[] = [];
    
    sections.forEach((section, index) => {
      // Add section
      result.push(renderSection(section));
      
      // Add connector after each section except the last one
      if (index < sections.length - 1) {
        result.push(
          <SectionConnector 
            key={`connector-${section.id}`}
            index={index} 
          />
        );
      }
    });
    
    return result;
  };

  return (
    <div className="w-full">
      <AnimatePresence>
        {renderSectionsWithConnectors()}
      </AnimatePresence>
      {!isLiveMode && (
        <AddSection 
          onAddSection={handleAddSection} 
        />
      )}
    </div>
  );
});

// Agregar displayName para evitar advertencia de eslint
SectionManager.displayName = 'SectionManager';

export default SectionManager;
