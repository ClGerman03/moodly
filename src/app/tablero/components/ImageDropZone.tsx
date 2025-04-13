"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";

interface ImageDropZoneProps {
  images: string[];
  setImages: (newImages: string[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ImageDropZone = ({ images, setImages, fileInputRef }: ImageDropZoneProps) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Manejar el arrastre y soltar de imu00e1genes
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Manejar la selecciu00f3n de archivos mediante el input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Procesar los archivos
  const handleFiles = (files: FileList) => {
    const newImages: string[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        newImages.push(imageUrl);
      }
    });
    
    // Actualizar el estado con todas las imu00e1genes (las anteriores y las nuevas)
    setImages([...images, ...newImages]);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center p-8 mt-4 border border-dashed rounded-lg min-h-[280px] 
                 transition-all duration-300 ease-in-out ${isDragging ? 'border-gray-400 dark:border-gray-500 bg-gray-50/70 dark:bg-gray-900/40' : 'border-gray-200 dark:border-gray-800 bg-transparent'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={images.length === 0 ? openFileDialog : undefined}
      style={{ borderWidth: '1px', borderStyle: 'dashed', borderSpacing: '4px' }}
    >
      {images.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="mb-3 text-gray-500 dark:text-gray-400 text-sm font-light tracking-wide">
            Selecciona o arrastra tus imu00e1genes aquu00ed
          </p>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 animate-floatSubtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
            {images.map((imageUrl, index) => (
              <div 
                key={index} 
                className="relative overflow-hidden rounded-md aspect-square bg-white dark:bg-gray-800 transform-gpu transition-all duration-300 hover:shadow group"
                style={{ 
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <Image 
                  src={imageUrl} 
                  alt={`Imagen ${index + 1}`} 
                  fill 
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 will-change-transform group-hover:scale-103" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-colors duration-300"></div>
              </div>
            ))}
            <div 
              onClick={openFileDialog} 
              className="flex items-center justify-center aspect-square rounded-md bg-transparent border border-dashed border-gray-200 dark:border-gray-800 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer"
              style={{ borderRadius: '8px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*"
        className="hidden"
        aria-label="Seleccionar imu00e1genes"
      />
    </div>
  );
};

export default ImageDropZone;
