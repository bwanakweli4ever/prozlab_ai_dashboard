"use client"

import { ArrowLeft, Shield, Lock, Eye, Database, Users, Globe, CheckCircle, Mail, Phone, Cookie } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ProzLabLogo } from "@/components/prozlab-logo"

export default function PrivacyPolicyPage() {
  const router = useRouter()

  const privacySections = [
    {
      title: "Information We Collect",
      icon: Database,
      color: "bg-blue-500",
      content: [
        "Personal Details: Name, email, phone number, address",
        "Account Information: Username, password, and login details",
        "Order Details: Payment confirmation, billing/shipping addresses",
        "Usage Data: Device info, browser type, IP address, pages visited",
        "Cookies: Used to improve functionality and personalize your experience",
        "We may also receive information from third parties such as Shopify, payment processors, or analytics providers"
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Users,
      color: "bg-green-500",
      content: [
        "Process orders and deliver products",
        "Manage your account and provide customer support",
        "Send updates, offers, or marketing materials (only with consent)",
        "Prevent fraud and ensure website security",
        "Improve user experience and site performance"
      ]
    },
    {
      title: "Sharing of Information",
      icon: Globe,
      color: "bg-purple-500",
      content: [
        "Service Providers (Shopify, payment gateways, delivery partners)",
        "Marketing Partners to improve promotions",
        "Legal Authorities when required by law",
        "We do not sell personal data for profit"
      ]
    },
    {
      title: "Cookies",
      icon: Cookie,
      color: "bg-orange-500",
      content: [
        "We use cookies to remember user preferences and analyze traffic",
        "You may disable cookies in your browser, but this may affect some site features",
        "Cookies help improve functionality and personalize your experience"
      ]
    },
    {
      title: "Security",
      icon: Shield,
      color: "bg-red-500",
      content: [
        "We take reasonable steps to protect your personal data but cannot guarantee absolute security",
        "Please keep your login credentials confidential"
      ]
    },
    {
      title: "User Content & Third Parties",
      icon: Users,
      color: "bg-indigo-500",
      content: [
        "Content you post publicly (e.g., reviews) may be visible to others",
        "Our site may link to third-party websites — we are not responsible for their privacy practices",
        "Always review third-party policies before sharing information"
      ]
    }
  ]

  const rights = [
    "Access your personal data",
    "Correct inaccurate information",
    "Delete your account and data",
    "Export your data",
    "Opt-out of marketing communications",
    "Withdraw consent for data processing"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/')} className="flex items-center">
                <ProzLabLogo size="md" />
              </button>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-32 h-16 mx-auto flex items-center justify-center shadow-none mb-6">
              <ProzLabLogo size="lg" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your personal information.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge variant="secondary" className="px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Last Updated: December 2024
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Eye className="w-4 h-4 mr-2" />
                GDPR Compliant
              </Badge>
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {privacySections.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Your Rights Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You have the following rights regarding your personal data:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {rights.map((right, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{right}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="text-center">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Questions About Your Privacy?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                If you have any questions about this Privacy Policy or how we handle your data, please contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  info@prozlab.com
                </Button>
                <Button variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  +1 (555) 123-4567
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
