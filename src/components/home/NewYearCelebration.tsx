// New Year Celebration Component - Dawan SO (Somali)
'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Frijole } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const frijole = Frijole({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const STORAGE_KEY = 'dawan_newyear_2026_seen'

export function NewYearCelebration() {
  const [isVisible, setIsVisible] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiInstance = useRef<confetti.CreateTypes | null>(null)

  // Check if user has already seen the celebration
  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY)
    if (!hasSeen) {
      setIsVisible(true)
    }
  }, [])

  // Initialize confetti and fire when visible
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return

    // Create confetti instance
    confettiInstance.current = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: false,
    })

    const fire = confettiInstance.current

    // Show content after a brief delay
    setTimeout(() => setShowContent(true), 200)

    // Initial burst - using brand color #b01c14 and complementary colors
    setTimeout(() => {
      fire({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.2, y: 0.6 },
        colors: ['#FFD700', '#b01c14', '#FF6B6B', '#4ECDC4', '#F472B6', '#22C55E'],
      })
      fire({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.8, y: 0.6 },
        colors: ['#FFD700', '#b01c14', '#FF6B6B', '#4ECDC4', '#F472B6', '#22C55E'],
      })
      fire({
        particleCount: 80,
        spread: 140,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#FFD700', '#b01c14', '#FF6B6B', '#4ECDC4', '#F472B6'],
      })
    }, 500)

    // Periodic bursts
    const interval = setInterval(() => {
      fire({
        particleCount: 40,
        spread: 70,
        origin: { x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.3 + 0.2 },
        colors: ['#FFD700', '#b01c14', '#FF6B6B', '#4ECDC4', '#F472B6', '#22C55E'],
      })
    }, 2500)

    return () => {
      clearInterval(interval)
      if (confettiInstance.current) {
        confettiInstance.current.reset()
      }
    }
  }, [isVisible])

  const handleClose = () => {
    // Mark as seen so it doesn't show again
    localStorage.setItem(STORAGE_KEY, 'true')

    if (confettiInstance.current) {
      confettiInstance.current({
        particleCount: 150,
        spread: 160,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#FFD700', '#b01c14', '#FF6B6B', '#4ECDC4', '#F472B6'],
      })
    }
    setTimeout(() => setIsVisible(false), 400)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const yearVariants = {
    hidden: { opacity: 0, scale: 0.3, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.6,
      },
    },
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  const floatVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 w-screen h-screen max-h-[100dvh] z-[9999] overflow-hidden bg-[#0f0f23]"
        >
          {/* Canvas for confetti */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-[10002]"
            style={{ width: '100%', height: '100%' }}
          />

          {/* Close button */}
          <motion.button
            onClick={handleClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white text-lg cursor-pointer z-[10003] flex items-center justify-center"
            aria-label="Xir"
          >
            ✕
          </motion.button>

          {/* Main content */}
          <div className="relative z-[10000] h-full flex flex-col items-center justify-center p-6 text-center">
            {showContent && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="mb-6"
                >
                  <Image
                    src="/logo.png"
                    alt="Dawan TV"
                    width={80}
                    height={80}
                    className="mx-auto"
                  />
                </motion.div>

                {/* Sanad Cusub - Somali for "New Year" */}
                <motion.div
                  variants={wordVariants}
                  className={`${frijole.className} text-xl sm:text-2xl md:text-3xl mb-4`}
                  style={{ color: '#FFD700' }}
                >
                  Sanad Cusub
                </motion.div>

                {/* Wacan - Somali for "Happy/Good" */}
                <motion.div
                  variants={wordVariants}
                  className={`${frijole.className} text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white`}
                >
                  <motion.span variants={floatVariants} animate="float" className="inline-block">
                    Oo Fiican
                  </motion.span>
                </motion.div>

                {/* 2026 */}
                <motion.div variants={yearVariants} className="mt-4">
                  <motion.span
                    variants={pulseVariants}
                    animate="pulse"
                    className={`${frijole.className} text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] inline-block`}
                    style={{ color: '#b01c14' }}
                  >
                    2026
                  </motion.span>
                </motion.div>

                {/* Wishes message in Somali */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="mt-8 text-base sm:text-lg text-white/80 max-w-md text-center mx-auto"
                >
                  Waxaan kuu rajeynayaa farxad, barwaaqo, iyo sheekooyiin wanaagsan!
                </motion.p>

                {/* Continue button */}
                <motion.button
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.5, type: 'spring' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(176, 28, 20, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="mt-8 px-8 py-3 text-base font-medium rounded-full text-white cursor-pointer"
                  style={{ backgroundColor: '#b01c14' }}
                >
                  Sii Wad Dawan TV
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
