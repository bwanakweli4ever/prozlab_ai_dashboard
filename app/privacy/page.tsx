import type { Metadata } from "next"

import { LegalPage, type LegalSection } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy — Prozlab Consulting",
  description: "How Prozlab Consulting collects, uses and protects your personal information.",
}

const sections: LegalSection[] = [
  {
    id: "collect",
    title: "Information we collect",
    items: [
      "Personal details: name, email, phone number, address",
      "Account information: username, password and login details",
      "Order details: payment confirmation, billing and shipping addresses",
      "Usage data: device information, browser type, IP address, pages visited",
      "Cookies, used to improve functionality and personalize your experience",
      "We may also receive information from third parties such as payment processors or analytics providers",
    ],
  },
  {
    id: "use",
    title: "How we use your information",
    items: [
      "Process orders and deliver products",
      "Manage your account and provide customer support",
      "Send updates, offers or marketing materials (only with consent)",
      "Prevent fraud and ensure website security",
      "Improve user experience and site performance",
    ],
  },
  {
    id: "sharing",
    title: "Sharing of information",
    items: [
      "Service providers (payment gateways, delivery partners)",
      "Marketing partners to improve promotions",
      "Legal authorities when required by law",
      "We do not sell personal data for profit",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    items: [
      "We use cookies to remember your preferences and analyze traffic",
      "You may disable cookies in your browser, but this may affect some site features",
      "Cookies help improve functionality and personalize your experience",
    ],
  },
  {
    id: "security",
    title: "Security",
    items: [
      "We take reasonable steps to protect your personal data but cannot guarantee absolute security",
      "Please keep your login credentials confidential",
    ],
  },
  {
    id: "third-parties",
    title: "Your content and third parties",
    items: [
      "Content you post publicly (for example, reviews) may be visible to others",
      "Our site may link to third-party websites; we are not responsible for their privacy practices",
    ],
  },
  {
    id: "rights",
    title: "Your privacy rights",
    intro: "You have the right to:",
    items: [
      "Access your personal data",
      "Correct inaccurate information",
      "Delete your account and data",
      "Export your data",
      "Opt out of marketing communications",
      "Withdraw consent for data processing",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="December 2024"
      intro="Your privacy matters to us. This policy explains what information we collect, how we use it and how we protect it."
      sections={sections}
    />
  )
}
