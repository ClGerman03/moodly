"use client";

import { useAuth } from "@/contexts/AuthContext";
import HeaderOptions from "./components/HeaderOptions";
import BoardsSection from "./components/BoardsSection";

export default function Dashboard() {
  // Obtenemos el user para utilizarlo en algunos componentes
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-6xl mx-auto p-6 pt-10">
        {/* Header with title and user options */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-light text-gray-800">
            Dashboard
          </h1>
          
          {/* Header options component that includes ProfilePopover */}
          <HeaderOptions />
        </div>
        
        {/* Brief description */}
        <p className="text-gray-500 mb-6">
          Manage your visual boards, create new ones or access existing ones.
        </p>
        
        {/* Boards section */}
        {user ? (
          <BoardsSection />
        ) : (
          <div className="mt-8 bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              Loading user information...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
