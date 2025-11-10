"use client"

import { ArrowLeft, FileText, Scale, Users, Shield, AlertTriangle, CheckCircle, Clock, DollarSign, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ProzLabLogo } from "@/components/prozlab-logo"

export default function TermsOfServicePage() {
  const router = useRouter()

  const termsSections = [
    {
      title: "Use of the Site",
      icon: FileText,
      color: "bg-blue-500",
      content: [
        "Use the Site only for lawful purposes",
        "Not misuse the Services or interfere with other users",
        "Provide accurate and up-to-date account information",
        "Be responsible for maintaining the confidentiality of your account credentials"
      ]
    },
    {
      title: "Products and Services",
      icon: Users,
      color: "bg-green-500",
      content: [
        "We strive to ensure product descriptions, pricing, and availability are accurate, but errors may occur",
        "We reserve the right to change products, prices, or features at any time without prior notice",
        "All purchases are subject to availability and confirmation of payment"
      ]
    },
    {
      title: "Payment and Billing",
      icon: DollarSign,
      color: "bg-purple-500",
      content: [
        "You agree to provide valid payment details",
        "Transactions are processed through secure third-party providers (e.g., Shopify, payment gateways)",
        "Any unauthorized use of your account or payment method should be reported immediately"
      ]
    },
    {
      title: "Intellectual Property",
      icon: Shield,
      color: "bg-amber-500",
      content: [
        "All website content, including logos, text, images, and designs, are the property of Prozlab",
        "You may not copy, modify, or distribute our materials without permission"
      ]
    },
    {
      title: "Limitation of Liability",
      icon: AlertTriangle,
      color: "bg-red-500",
      content: [
        "Prozlab is not liable for any indirect or incidental damages from using our Services",
        "We are not liable for website downtime, data loss, or unauthorized access caused by external factors",
        "Your use of our website is at your own risk"
      ]
    },
    {
      title: "Termination",
      icon: Shield,
      color: "bg-indigo-500",
      content: [
        "We may suspend or terminate your access if you violate these Terms or misuse our Services"
      ]
    }
  ]

  const prohibitedActivities = [
    "Using the site for fraudulent or illegal purposes",
    "Attempting to gain unauthorized access to our systems",
    "Harassing, threatening, or harming others",
    "Posting false, misleading, or defamatory content",
    "Violating intellectual property rights",
    "Spam or unsolicited communications",
    "Interfering with site operations or security",
    "Circumventing payment systems or fees"
  ]

  const userResponsibilities = [
    "Provide accurate and truthful information",
    "Use the Services only for lawful purposes",
    "Protect your account credentials and personal information",
    "Follow all applicable laws and regulations",
    "Report any unauthorized account activity immediately",
    "Respect the rights of other users and third parties"
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
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using our platform. By using ProzLab, you agree to be bound by these terms.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge variant="secondary" className="px-4 py-2">
                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                Last Updated: December 2024
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Legally Binding
              </Badge>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {termsSections.map((section, index) => {
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

          {/* Prohibited Activities */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The following activities are strictly prohibited on our platform:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {prohibitedActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-300">{activity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                As a user of our platform, you are responsible for:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {userResponsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">{responsibility}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="text-center">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Questions About These Terms?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                If you have any questions about these Terms of Service, please contact our legal team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
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

