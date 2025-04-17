"use client";

import { motion } from "framer-motion";

interface FarewellScreenProps {
  boardName: string;
  clientName: string;
  onFinish: () => void;
}

/**
 * Farewell screen for the feedback experience
 * Shows appreciation to the client after completing the feedback
 */
const FarewellScreen: React.FC<FarewellScreenProps> = ({ 
  boardName, 
  clientName, 
  onFinish 
}) => {
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="w-full max-w-md mx-auto">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl font-light text-gray-700 dark:text-gray-300 mb-3">
            Thank you for your feedback
          </h1>
          
          <h2 className="text-3xl font-light text-gray-800 dark:text-gray-100 mb-6">
            {clientName}
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 font-light mb-6 max-w-sm">
            Your insights for <span className="font-medium text-gray-700 dark:text-gray-300">{boardName}</span> are 
            incredibly valuable and will help us improve.
          </p>
          
          <p className="text-gray-500 dark:text-gray-400 font-light mb-10 max-w-sm">
            We appreciate the time you&apos;ve taken to share your thoughts with us.
          </p>
          
          <button
            onClick={onFinish}
            className="w-auto px-6 py-2 mx-auto mt-4 text-sm font-light text-white dark:text-gray-100 transition-all duration-300 rounded-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:ring-offset-2 transform hover:scale-[1.02] opacity-90 hover:opacity-100 flex items-center justify-center"
          >
            Done
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FarewellScreen;
