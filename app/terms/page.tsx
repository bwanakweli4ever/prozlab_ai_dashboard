import type { Metadata } from "next"

import { LegalPage, type LegalSection } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service — Prozlab Consulting",
  description: "The terms that apply when you use Prozlab Consulting's website and services.",
}

const sections: LegalSection[] = [
  {
    id: "use",
    title: "Use of the site",
    intro: "When you use the site, you agree to:",
    items: [
      "Use the site only for lawful purposes",
      "Not misuse the services or interfere with other users",
      "Provide accurate and up-to-date account information",
      "Keep your account credentials confidential",
    ],
  },
  {
    id: "services",
    title: "Products and services",
    items: [
      "We strive to keep descriptions, pricing and availability accurate, but errors may occur",
      "We may change services, prices or features at any time without prior notice",
      "All purchases are subject to availability and confirmation of payment",
    ],
  },
  {
    id: "payment",
    title: "Payment and billing",
    items: [
      "You agree to provide valid payment details",
      "Transactions are processed through secure third-party payment providers",
      "Report any unauthorized use of your account or payment method immediately",
    ],
  },
  {
    id: "ip",
    title: "Intellectual property",
    items: [
      "All website content, including logos, text, images and designs, is the property of Prozlab",
      "You may not copy, modify or distribute our materials without permission",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    items: [
      "Prozlab is not liable for any indirect or incidental damages from using our services",
      "We are not liable for website downtime, data loss or unauthorized access caused by external factors",
      "Your use of our website is at your own risk",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    body: "We may suspend or terminate your access if you violate these terms or misuse our services.",
  },
  {
    id: "prohibited",
    title: "Prohibited activities",
    intro: "The following are not allowed:",
    items: [
      "Using the site for fraudulent or illegal purposes",
      "Attempting to gain unauthorized access to our systems",
      "Harassing, threatening or harming others",
      "Posting false, misleading or defamatory content",
      "Violating intellectual property rights",
      "Spam or unsolicited communications",
      "Interfering with site operations or security",
      "Circumventing payment systems or fees",
    ],
  },
  {
    id: "responsibilities",
    title: "Your responsibilities",
    intro: "As a user of our platform, you are responsible for:",
    items: [
      "Providing accurate and truthful information",
      "Using the services only for lawful purposes",
      "Protecting your account credentials and personal information",
      "Following all applicable laws and regulations",
      "Reporting any unauthorized account activity immediately",
      "Respecting the rights of other users and third parties",
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="December 2024"
      intro="Please read these terms carefully before using Prozlab. By using our website and services, you agree to be bound by them."
      sections={sections}
    />
  )
}
