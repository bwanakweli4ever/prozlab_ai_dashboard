'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/** The professional dashboard and the admin area are designed light-only. */
const LIGHT_ONLY = [/^\/dashboard(\/|$)/, /^\/admin(\/|$)/]

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname() || ''
  // next-themes ignores nested providers, so the light-only areas are forced here. That also makes
  // dialogs, menus and toasts (rendered outside the page container) light on those pages.
  const forcedTheme = LIGHT_ONLY.some((re) => re.test(pathname)) ? 'light' : props.forcedTheme
  return (
    <NextThemesProvider {...props} forcedTheme={forcedTheme}>
      {children}
    </NextThemesProvider>
  )
}
