"use client"

import { Sparkles, Shield, FileText, Mail, Phone, MapPin, Info, Settings, Users, MessageSquare, HelpCircle, ShieldCheck, Users2, AlertTriangle, Cookie, Gavel } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ProzLabLogo } from "@/components/prozlab-logo"

export function Footer() {
  const router = useRouter()

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about", icon: Info },
      { name: "Features", href: "#features", icon: Settings },
      { name: "Professionals", href: "#professionals", icon: Users },
      { name: "Testimonials", href: "#testimonials", icon: MessageSquare }
    ],
    support: [
      { name: "Help Center", href: "#help", icon: HelpCircle },
      { name: "Safety", href: "#safety", icon: ShieldCheck },
      { name: "Community Guidelines", href: "#guidelines", icon: Users2 },
      { name: "Report Issue", href: "#report", icon: AlertTriangle }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy", icon: Shield },
      { name: "Terms of Service", href: "/terms", icon: FileText },
      { name: "Cookie Policy", href: "#cookies", icon: Cookie },
      { name: "GDPR", href: "#gdpr", icon: Gavel }
    ]
  }

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => router.push('/')} className="flex items-center">
                <ProzLabLogo size="md" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
              Connecting professionals with opportunities. Building the future of work through trusted relationships and quality service.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>Available Worldwide</span>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => {
                      if (link.href.startsWith('#')) {
                        const element = document.getElementById(link.href.slice(1))
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' })
                        }
                      } else {
                        router.push(link.href)
                      }
                    }}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                  >
                    <link.icon className="w-3 h-3" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => {
                      if (link.href.startsWith('#')) {
                        const element = document.getElementById(link.href.slice(1))
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' })
                        }
                      } else {
                        router.push(link.href)
                      }
                    }}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                  >
                    <link.icon className="w-3 h-3" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
                  >
                    <link.icon className="w-3 h-3" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>support@prozlab.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+1(432)3086130</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/privacy')}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Privacy Policy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/terms')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Terms of Service
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-500">
              © 2024 ProzLab. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-500">
              <span>Made with ❤️ for professionals</span>
              <span>•</span>
              <span>GDPR Compliant</span>
              <span>•</span>
              <span>SSL Secured</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
