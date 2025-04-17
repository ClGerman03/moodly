"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Tag } from "lucide-react";

interface ImageTagsEditorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  isLiveMode?: boolean;
}

/**
 * Componente para gestionar etiquetas/características de una imagen
 * Permite agregar y eliminar etiquetas con una interfaz visual amigable
 */
const ImageTagsEditor: React.FC<ImageTagsEditorProps> = ({
  tags = [],
  onTagsChange,
  isLiveMode = false
}) => {
  const [newTag, setNewTag] = useState("");
  const [isInputActive, setIsInputActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus on input when it becomes active
  useEffect(() => {
    if (isInputActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputActive]);

  // Add new tag
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const updatedTags = [...tags, trimmedTag];
      onTagsChange(updatedTags);
      setNewTag("");
    } else {
      setNewTag("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onTagsChange(updatedTags);
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setIsInputActive(false);
      setNewTag("");
    } else if (e.key === 'Backspace' && newTag === "" && tags.length > 0) {
      // Remove last tag when backspace is pressed in empty input
      const updatedTags = [...tags];
      updatedTags.pop();
      onTagsChange(updatedTags);
    }
  };

  // Toggle input active state
  const toggleInput = () => {
    if (!isLiveMode) {
      setIsInputActive(true);
    }
  };

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <Tag size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <AnimatePresence>
            {tags.map((tag, index) => (
              <motion.div
                key={`${tag}-${index}`}
                className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                layout
              >
                <span className="text-gray-800 dark:text-gray-200">{tag}</span>
                {!isLiveMode && (
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Botón/input para añadir etiquetas */}
          {!isLiveMode && (
            <AnimatePresence mode="wait">
              {isInputActive ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                  key="input-active"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      if (newTag.trim()) {
                        handleAddTag();
                      }
                      setIsInputActive(false);
                    }}
                    className="px-2 py-1 text-sm bg-transparent border-none focus:outline-none text-gray-800 dark:text-gray-200 min-w-[80px] w-full"
                    placeholder="New tag..."
                    maxLength={20}
                  />
                </motion.div>
              ) : (
                <motion.button
                  className="flex items-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-2 py-1 rounded-lg text-sm transition-colors"
                  onClick={toggleInput}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="add-button"
                >
                  <Plus size={14} className="mr-1" />
                  <span>Add</span>
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ImageTagsEditor;
