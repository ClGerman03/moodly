"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  boardName: string;
  onStart: (clientName: string) => void;
}

/**
 * Welcome screen for the feedback experience
 * Shows an introduction and requests the client's name before starting
 */
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ boardName, onStart }) => {
  const [clientName, setClientName] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clientName.trim()) {
      onStart(clientName.trim());
    } else {
      setError("Please enter your name to continue");
    }
  };
  
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
            Welcome to the board
          </h1>
          
          <h2 className="text-3xl font-light text-gray-800 dark:text-gray-100 mb-6">
            {boardName}
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 font-light mb-10 max-w-sm">
            You&apos;ve been invited to review this board and provide your feedback.
            We&apos;ll show you different sections where you can share your opinion.
          </p>
          
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="w-full">
              <label htmlFor="client-name" className="block text-sm text-gray-500 dark:text-gray-400 text-center mb-2 font-light">
                What&apos;s your name?
              </label>
              <input
                id="client-name"
                type="text"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Type your name"
                className="w-full py-2 text-xl text-center text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-transparent outline-none focus:outline-none border-b border-gray-200 dark:border-gray-700 transition-all duration-300"
                autoFocus
              />
              {error && (
                <motion.p 
                  className="text-red-500 dark:text-red-400 text-sm mt-2 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-auto px-6 py-2 mx-auto mt-4 text-sm font-light text-white dark:text-gray-100 transition-all duration-300 rounded-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:ring-offset-2 transform hover:scale-[1.02] opacity-90 hover:opacity-100 flex items-center justify-center"
            >
              Start review
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;
