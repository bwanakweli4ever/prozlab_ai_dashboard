"use client"

import { ArrowLeft, Users, Rocket, Shield, Globe, CheckCircle, Quote, ArrowRight, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProzLabLogo } from "@/components/prozlab-logo"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, useMotionValue, animate } from "framer-motion"
import { useEffect } from "react"

export default function AboutPage() {
  const router = useRouter()

  const pillars = [
    {
      title: "Purpose-Driven Innovation",
      icon: Rocket,
      color: "bg-blue-500",
      points: [
        "Design, build, develop, and deliver solutions with impact",
        "Turn bold ideas into products that help real people",
        "Relentless focus on usability and outcomes",
      ],
    },
    {
      title: "Community Impact",
      icon: Users,
      color: "bg-emerald-500",
      points: [
        "Strengthen communities through access and opportunity",
        "Bridge professionals with meaningful work",
        "Create pathways for sustainable growth",
      ],
    },
    {
      title: "Quality & Trust",
      icon: Shield,
      color: "bg-amber-500",
      points: [
        "Excellence and transparency in every engagement",
        "Reliable delivery with measurable standards",
        "Long-term relationships built on trust",
      ],
    },
  ]

  function AnimatedCounter({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
    const count = useMotionValue(0)
    useEffect(() => {
      const controls = animate(count, to, { duration: 1.2, ease: "easeOut" })
      return controls.stop
    }, [to, count])
    return (
      <motion.span>
        {count.get().toFixed(decimals)}{suffix}
      </motion.span>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>
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
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
            {/* Image on left for desktop */}
            <motion.div
              className="relative h-full min-h-[260px] lg:min-h-[300px] mt-1 lg:mt-0 order-1"
              initial={{opacity:0, y:16}}
              animate={{opacity:1, y:0}}
              whileHover={{scale:1.02, rotate:-1}}
              transition={{duration:0.5, delay:0.15}}
            >
              <div className="relative h-full overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-800">
                <Image
                  src="/images/about.png"
                  alt="ProzLab team at work"
                  width={1200}
                  height={900}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-3 -right-3 hidden lg:block">
                <div className="px-4 py-2 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow-md text-sm text-gray-700 dark:text-gray-300">
                  Building together
                </div>
              </div>
            </motion.div>

            {/* Content on right for desktop */}
            <motion.div className="order-2" initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{duration:0.5}}>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="px-3 py-1">Our Story</Badge>
                <Badge variant="outline" className="px-3 py-1">Future of Work</Badge>
              </div>
              <motion.h1
                className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3 leading-tight"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5 }}
              >
                About Us
              </motion.h1>
              <div className="mt-1 max-w-2xl">
                <div className="relative pl-5">
                  <motion.span
                    className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-blue-600 to-purple-600"
                    initial={{ scaleY: 0, transformOrigin: "top" }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="space-y-5">
                <motion.p
                  className="text-base text-gray-800 dark:text-gray-200 leading-relaxed"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.45, delay: 0.05 }}
                >
                  Prozlab is a dynamic <em>lab of professionals</em> driven by a shared passion for <strong>innovation, excellence, and transformative technology</strong>.
                  We specialize in delivering high-quality professional services with a focus on technology, networking, and IT solutions designed to empower organizations and individuals alike.
                </motion.p>
                <motion.p
                  className="text-base text-gray-800 dark:text-gray-200 leading-relaxed"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                >
                  At Prozlab, we believe <em>technology is more than just a tool</em> — it's the foundation for growth, efficiency, and progress.
                  Our expert team works tirelessly to design, build, and implement solutions that enhance <strong>performance, strengthen connectivity</strong>, and enable businesses to achieve their full potential.
                </motion.p>
                <motion.p
                  className="text-base text-gray-800 dark:text-gray-200 leading-relaxed"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.45, delay: 0.25 }}
                >
                  Through a commitment to <em>precision, performance, and progress</em>, we ensure that every project we undertake meets the highest standards of quality and reliability.
                  Whether it's optimizing IT infrastructure, enhancing network systems, or crafting innovative digital solutions, <strong>Prozlab stands as a trusted partner</strong> dedicated to driving success in an ever-evolving digital landscape.
                </motion.p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid sm:grid-cols-3 gap-3 max-w-xl">
                <motion.div whileHover={{ y: -4, scale: 1.02 }} className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Innovation</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Ideas to impact, fast.</div>
                  </div>
                </motion.div>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Community</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Opportunity for all.</div>
                  </div>
                </motion.div>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Excellence</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Quality you can trust.</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Pillars */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {pillars.map((section, index) => {
              const Icon = section.icon
              return (
                <motion.div key={index} initial={{opacity:0, y:16}} whileInView={{opacity:1, y:0}} viewport={{once:true, amount:0.2}} transition={{duration:0.45, delay:index*0.08}} whileHover={{y:-6, scale:1.02}}>
                  <Card className="hover:shadow-xl transition-all duration-300">
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
                      {section.points.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Value Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            <motion.div whileHover={{scale:1.04, y:-2}} className="rounded-xl border border-gray-100 dark:border-gray-800 p-5 bg-white dark:bg-gray-800 text-center" initial={{opacity:0, y:10}} whileInView={{opacity:1, y:0}} viewport={{once:true, amount:0.2}} transition={{duration:0.4}}>
              <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                <AnimatedCounter to={500} suffix="+" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Verified Professionals</div>
            </motion.div>
            <motion.div whileHover={{scale:1.04, y:-2}} className="rounded-xl border border-gray-100 dark:border-gray-800 p-5 bg-white dark:bg-gray-800 text-center" initial={{opacity:0, y:10}} whileInView={{opacity:1, y:0}} viewport={{once:true, amount:0.2}} transition={{duration:0.4, delay:0.06}}>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                <AnimatedCounter to={50} suffix="+" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cities Served</div>
            </motion.div>
            <motion.div whileHover={{scale:1.04, y:-2}} className="rounded-xl border border-gray-100 dark:border-gray-800 p-5 bg-white dark:bg-gray-800 text-center" initial={{opacity:0, y:10}} whileInView={{opacity:1, y:0}} viewport={{once:true, amount:0.2}} transition={{duration:0.4, delay:0.12}}>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                <AnimatedCounter to={4.9} decimals={1} />/5
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </motion.div>
          </div>

          {/* Quote */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Quote className="w-5 h-5 text-white" />
                </div>
                Our Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed">
                "We envision a world where technology bridges gaps, expands access, and brings people closer to meaningful opportunities.
                Every build, feature, and release moves us closer to that vision — with integrity and care."
              </blockquote>
            </CardContent>
          </Card>

          {/* Global vision */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                A Connected, Better World
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                We build with a global mindset and local empathy — ensuring our work is inclusive, accessible, and sustainable.
              </p>
            </CardContent>
          </Card>

          {/* Testimonials */}
          <div className="mb-12">
            <motion.h2
              className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5 }}
            >
              What Our Clients Say
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* David Almenderiz Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        DA
                      </div>
                      <div>
                        <CardTitle className="text-lg">David Almenderiz</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 italic">
                      "Working with Prozlab has been an exceptional experience. Their expertise in technology and IT solutions has significantly improved my operational efficiency. The team's commitment to excellence is evident in every project."
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stephen Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                        S
                      </div>
                      <div>
                        <CardTitle className="text-lg">Stephen</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 italic">
                      "Prozlab's innovative approach and attention to detail make them stand out. They not only delivered outstanding networking solutions but also provided strategic insights that transformed my business processes."
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* CTA */}
          <motion.div initial={{opacity:0, y:12}} whileInView={{opacity:1, y:0}} viewport={{once:true, amount:0.2}} transition={{duration:0.5}}>
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Build the future of work with us</h3>
                  <p className="text-white/90">Join our network of professionals or request trusted tech help today.</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/onboarding-wizard"><Button className="bg-white text-blue-700 hover:bg-white/90">Join as Pro<ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                  <Link href="/request-service"><Button variant="outline" className="border-white/60 text-white hover:bg-white/10">Request Service</Button></Link>
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}


