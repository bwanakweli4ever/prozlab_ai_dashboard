"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ProzLabLogo } from "@/components/prozlab-logo"

export function SplashScreen() {
  const router = useRouter()
  const logoSoundRef = useRef<HTMLAudioElement | null>(null)
  const textSoundRef = useRef<HTMLAudioElement | null>(null)
  const transitionSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio elements
    logoSoundRef.current = new Audio("/sounds/logo-appear.mp3")
    textSoundRef.current = new Audio("/sounds/text-appear.mp3")
    transitionSoundRef.current = new Audio("/sounds/transition.mp3")

    // Set volume for subtle effects
    if (logoSoundRef.current) logoSoundRef.current.volume = 0.3
    if (textSoundRef.current) textSoundRef.current.volume = 0.2
    if (transitionSoundRef.current) transitionSoundRef.current.volume = 0.4

    // Play logo sound immediately
    logoSoundRef.current?.play().catch((e) => console.log("Audio play prevented:", e))

    // Play text sound after delay
    const textTimer = setTimeout(() => {
      textSoundRef.current?.play().catch((e) => console.log("Audio play prevented:", e))
    }, 500)

    // Play transition sound and navigate to home after animation completes
    const transitionTimer = setTimeout(() => {
      transitionSoundRef.current?.play().catch((e) => console.log("Audio play prevented:", e))

      // Give the sound a moment to start playing before navigation
      setTimeout(() => {
        router.push("/")
      }, 500)
    }, 3500)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(transitionTimer)
    }
  }, [router])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-prozlab-blue to-prozlab-950 z-50">
      <div className="flex flex-col items-center justify-center gap-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-prozlab-red rounded-full blur-xl opacity-20 scale-150"></div>
          <ProzLabLogo size="lg" className="relative z-10" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="text-3xl md:text-4xl font-bold text-white text-center"
        >
          Welcome to Proz Heaven
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.3, duration: 1.5, ease: "easeInOut" }}
          className="h-1 bg-white/30 rounded-full w-48 mt-2 overflow-hidden"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              delay: 1.3,
              duration: 2,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
            className="h-full bg-white rounded-full w-24"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 text-white/60 text-sm"
      >
        Professional Network
      </motion.div>
    </div>
  )
}
