import type React from "react"
import type { Metadata } from "next"
import { Inter, Raleway } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { ProfileProvider } from "@/contexts/profile-context"
import { AppRecovery } from "@/components/app-recovery"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as HotToaster } from "react-hot-toast"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway"
})

export const metadata: Metadata = {
  title: "Prozlab — Skills Proven by Real Work, Not Interviews",
  description:
    "Prozlab predicts hiring success using verified skills, real-world assessments, and performance data—helping employers hire proven professionals who actually succeed on the job.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/images/prozlab-logo.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${raleway.className} ${inter.variable}`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppRecovery />
          <AuthProvider>
            <ProfileProvider>
              {children}
              <Toaster />
              <HotToaster position="top-right" />
              <ToastContainer position="top-right" theme="colored" />
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
