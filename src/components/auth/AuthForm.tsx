'use client'

/**
 * Authentication Form
 * 
 * Component that handles the UI for authentication,
 * maintaining Moodly's minimalist style.
 */

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import GoogleSignInButton from './GoogleSignInButton'

export default function AuthForm() {
  const [error] = useState<string | null>(null)
  
  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Moodly Logo */}
      <div className="flex flex-col items-center">
        <Link href="/" className="mb-6">
          <Image
            src="/images/Moodly.png"
            alt="Moodly-Logo"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
        </Link>
        
        <h1 className="text-2xl font-light text-gray-800 mb-2">
          Welcome to Moodly
        </h1>
        <p className="text-gray-500 font-light text-center">
          Sign in to save and share your boards
        </p>
      </div>
      
      {/* Show error if it exists */}
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* Google Sign In Button */}
      <div className="space-y-4">
        <GoogleSignInButton />
        
        <div className="text-center">
          <span className="text-gray-500 text-xs">or</span>
        </div>
        
        <Link 
          href="/tablero" 
          className="w-full flex justify-center px-6 py-2.5 text-white bg-gray-800 hover:bg-gray-700 rounded-full font-light tracking-wide transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 opacity-90 hover:opacity-100"
          style={{ display: 'none' }}
        >
          Continue without signing up
        </Link>
      </div>
      
      {/* Additional information */}
      <div className="text-center text-xs text-gray-400 mt-10">
        <p>
          By signing in, you accept our{' '}
          <Link href="/terminos" className="text-gray-500 underline hover:text-gray-700">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacidad" className="text-gray-500 underline hover:text-gray-700">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
