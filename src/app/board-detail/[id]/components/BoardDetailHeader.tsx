"use client";

import React from 'react';
import { CalendarDays, Edit2, Share2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BoardDetailHeaderProps {
  board: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    isPublished?: boolean;
  };
}

// Componente de botón reutilizable para acciones
interface ActionButtonProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  target?: string;
  primary?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, text, href, target, primary = false }) => {
  return (
    <Link href={href} target={target}>
      <motion.div
        className={`px-3 py-1 md:px-3 md:py-1.5 rounded-full text-sm md:text-sm flex items-center justify-center transition-all duration-300 ${
          primary
            ? 'bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600'
            : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/50'
        } focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {icon}
        <span className="ml-1 md:ml-1.5">{text}</span>
      </motion.div>
    </Link>
  );
};

const BoardDetailHeader: React.FC<BoardDetailHeaderProps> = ({ board }) => {
  // Formato de fechas con función reutilizable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-gray-800 dark:text-gray-200 mb-1">
            {board.name}
          </h1>
          <div className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
            <CalendarDays size={14} className="mr-1" />
            <span className="truncate">
              Updated {formatDate(board.updatedAt)}
              <span className="mx-1">·</span>
              Created {formatDate(board.createdAt)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Indicador de estado */}
      <div className="flex flex-col md:flex-row md:justify-between gap-3 md:gap-4 mb-4">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center">
            <div className="relative w-2.5 h-2.5 mr-1.5">
              <div className="absolute inset-0 bg-green-300 dark:bg-green-400 rounded-full opacity-30"></div>
              <div className="absolute inset-0.5 bg-green-400 dark:bg-green-500 rounded-full opacity-60"></div>
              <div className="absolute inset-1 bg-green-500 dark:bg-green-600 rounded-full"></div>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {board.isPublished ? 'Published' : 'Active'}
            </span>
          </div>
          
          {board.isPublished && (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 text-gray-600 dark:text-gray-300">
              Public Link Available
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <ActionButton
            icon={<Edit2 size={12} className="md:w-4 md:h-4" />}
            text="Edit Board"
            href={`/tablero?boardId=${board.id}`}
          />
          
          <ActionButton
            icon={<Share2 size={12} className="md:w-4 md:h-4" />}
            text="View Public"
            href={`/board/${board.id}`}
            target="_blank"
            primary
          />
        </div>
      </div>
    </div>
  );
};

export default BoardDetailHeader;
