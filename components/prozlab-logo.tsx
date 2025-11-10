"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import type * as React from "react"

interface ProzLabLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function ProzLabLogo({ size = "md", showText = true, className }: ProzLabLogoProps) {
  let height = 40
  let width = 140

  if (size === "sm") {
    height = 30
    width = 105
  } else if (size === "lg") {
    height = 50
    width = 175
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/images/prozlab-logo.png"
        alt="ProzLab Logo"
        height={height}
        width={width}
        className="object-contain"
        priority
      />
    </div>
  )
}
