'use client'

/**
 * Google Sign In Button
 * 
 * Reusable component for signing in with Google
 * following Moodly's minimalist style.
 */

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import Image from 'next/image'

interface GoogleSignInButtonProps {
  className?: string
  text?: string
}

export default function GoogleSignInButton({ 
  className = '', 
  text = 'Sign in with Google' 
}: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
    } catch (error) {
      console.error('Error signing in with Google:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 px-6 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-full font-light tracking-wide transition-all duration-300 transform hover:scale-[1.02] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 opacity-95 hover:opacity-100 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="h-5 w-5 rounded-full border-b-2 border-gray-400 animate-spin"></div>
      ) : (
        <>
          <Image
            src="/images/google-icon.svg"
            alt="Google"
            width={20}
            height={20}
            priority
          />
          <span>{text}</span>
        </>
      )}
    </button>
  )
}
