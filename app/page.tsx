"use client"

import { ArrowRight, Zap, Users, Star, Wrench, Shield, TrendingUp, CheckCircle, Menu, X, Settings, UserCheck, MessageSquare, Rocket, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import { ProfessionalRadar } from "@/components/professional-radar"
import { motion } from "framer-motion"
import { ProfessionalCarousel } from "@/components/professional-carousel"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
        router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const stats = {
    verified_profiles: 500,
    locations_count: 50,
    average_rating: 4.9,
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false) // Close mobile menu after clicking
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 landing-override">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/images/prozlab-logo.png" alt="ProzLab Consulting" width={180} height={60} className="h-10 w-auto" priority />
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/about"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                <Info className="w-4 h-4" />
                About Us
              </Link>
              <button 
                onClick={() => scrollToSection('features')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                <Settings className="w-4 h-4" />
                Features
              </button>
              <button 
                onClick={() => scrollToSection('professionals')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                <UserCheck className="w-4 h-4" />
                Professionals
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection('cta')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                <Rocket className="w-4 h-4" />
                Get Started
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Sign In</Button>
                </Link>
                <Link href="/onboarding-wizard">
                  <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all">Join as Pro</Button>
                </Link>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg">
            <div className="container mx-auto px-6 py-4">
              <nav className="flex flex-col space-y-4">
                <Link 
                  href="/about"
                  className="flex items-center gap-3 text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                >
                  <Info className="w-4 h-4" />
                  About Us
                </Link>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="flex items-center gap-3 text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                >
                  <Settings className="w-4 h-4" />
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('professionals')}
                  className="flex items-center gap-3 text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Professionals
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials')}
                  className="flex items-center gap-3 text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Testimonials
                </button>
                <button 
                  onClick={() => scrollToSection('cta')}
                  className="flex items-center gap-3 text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                >
                  <Rocket className="w-4 h-4" />
                  Get Started
                </button>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
                  <div className="flex flex-col space-y-3">
                    <Link href="/login">
                      <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Sign In</Button>
                    </Link>
                    <Link href="/onboarding-wizard">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full">Join as Pro</Button>
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      <section id="hero" className="pt-24 pb-20 lg:pt-32 lg:pb-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            <div className="flex flex-col justify-between gap-8 lg:gap-10">
              <div className="space-y-6">
                <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-4 py-2 rounded-full font-medium">Tech Support Platform</Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">Connect. Fix. Earn.</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">Join the future of tech support. Get matched with customers who need your expertise.</p>
              </div>

              {/* Move the cards to the bottom so they align with the radar on the right */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Link href="/request-service">
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 cursor-pointer">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Need Tech Support?</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Find verified professionals</p>
                      <Button variant="outline" className="w-full rounded-full text-sm border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">Find a Pro</Button>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/onboarding-wizard">
                  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 cursor-pointer">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                        <Wrench className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tech Professional?</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Start earning with your skills</p>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-full text-sm shadow-lg hover:shadow-xl transition-all">Get Started<ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            <div className="relative flex items-end">
              <div className="w-full">
                <ProfessionalRadar />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose ProzLab</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">The smartest way to connect tech professionals with customers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="group hover:shadow-lg transition-all duration-300 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-600">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors"><Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Instant Matching</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">AI-powered system connects you with perfect opportunities in seconds</p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-200 dark:hover:border-orange-600">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors"><Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" /></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Secure Payments</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Guaranteed payments with escrow protection and automated invoicing</p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-600">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors"><TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grow Your Business</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Build your reputation and increase earnings with our platform</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="stats" className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.12 } },
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <div className="group relative">
                <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"></div>
                <Card className="relative bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1 hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-700 transition-all duration-300 ease-out transform">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">{stats.verified_profiles}+ </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Verified Pros</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <div className="group relative">
                <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"></div>
                <Card className="relative bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1 hover:ring-2 hover:ring-orange-200 dark:hover:ring-orange-600 transition-all duration-300 ease-out transform">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-extrabold tracking-tight text-orange-500 dark:text-orange-400">{stats.locations_count}+ </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Cities</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <div className="group relative">
                <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"></div>
                <Card className="relative bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1 hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-700 transition-all duration-300 ease-out transform">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">15K+ </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Jobs Done</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <div className="group relative">
                <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"></div>
                <Card className="relative bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1 hover:ring-2 hover:ring-orange-200 dark:hover:ring-orange-600 transition-all duration-300 ease-out transform">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-extrabold tracking-tight text-orange-500 dark:text-orange-400">{Math.round((stats.average_rating || 4.9) * 20)}% </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Success Rate</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      

      <section id="professionals" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Verified Badges Professionals</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Browse profiles of experienced tech professionals ready to help with your technology needs</p>
          </div>

          <ProfessionalCarousel />

          <div className="text-center mt-12">
            <Link href="/proz">
              <Button variant="outline" size="lg" className="rounded-full px-8 py-3 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600">Browse All Professionals<ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Real testimonials from our valued clients about their experience with ProzLab</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto justify-center">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="flex">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />))}</div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"Working with Prozlab has been an exceptional experience. Their expertise in technology and IT solutions has significantly improved my operational efficiency. The team's commitment to excellence is evident in every project."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">DA</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">David Almenderiz</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-700">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="flex">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />))}</div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"Prozlab's innovative approach and attention to detail make them stand out. They not only delivered outstanding networking solutions but also provided strategic insights that transformed my business processes."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4">S</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Stephen</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="business-features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Businesses Choose ProzLab</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Powerful features that make tech support simple, reliable, and cost-effective</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Instant Matching</h3>
                <p className="text-gray-600 dark:text-gray-300">Our AI matches you with the perfect professional in under 2 minutes, based on skills, location, and availability.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Verified Professionals</h3>
                <p className="text-gray-600 dark:text-gray-300">Every professional is background-checked, skill-verified, and rated by real customers. Quality guaranteed.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Real-time Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">Track job progress, communicate with professionals, and get updates in real-time through our platform.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                  <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">24/7 Support</h3>
                <p className="text-gray-600 dark:text-gray-300">Round-the-clock customer support ensures your tech issues are resolved quickly, no matter when they occur.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                  <Wrench className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Wide Range of Services</h3>
                <p className="text-gray-600 dark:text-gray-300">From basic computer repair to complex network setup, we cover all your tech support needs.</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <Star className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Satisfaction Guarantee</h3>
                <p className="text-gray-600 dark:text-gray-300">100% satisfaction guarantee. If you're not happy, we'll make it right or refund your money.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      <section id="cta" className="py-20 bg-gradient-to-r from-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 shadow-2xl">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Ready to start earning?</h2>
              <p className="text-xl text-gray-700 dark:text-white/90">Join hundreds of tech professionals already making money on ProzLab</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding-wizard"><Button size="lg" className="bg-prozlab-red text-white hover:bg-prozlab-red/90 dark:bg-white dark:text-prozlab-red dark:hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all font-semibold">Start Onboarding<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
              <Link href="/request-service"><Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-white/30 dark:text-white dark:hover:bg-white/10 px-8 py-4 text-lg rounded-full backdrop-blur-sm">Request Service</Button></Link>
            </div>

            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <div className="flex">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />))}</div>
                <span className="text-gray-600 dark:text-white/80 text-sm">{stats.average_rating}/5 rating</span>
              </div>
              <div className="text-gray-400 dark:text-white/60">•</div>
              <div className="text-gray-600 dark:text-white/80 text-sm">Join in under 5 minutes</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* HubSpot Chat Widget */}
      <Script
        id="hs-script-loader"
        strategy="afterInteractive"
        src="//js-eu1.hs-scripts.com/146869089.js"
      />
    </div>
  )
}
