"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Users,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle,
  Zap,
  Heart,
  ArrowRight,
  Camera,
  Coffee,
  Sparkles,
  Shield,
  Clock,
  Target,
  CheckSquare,
  Calculator,
  Gift,
  Store,
  Brain,
  Plus
} from "lucide-react"

const TYPING_WORDS = ["Adventures", "Memories", "Friendships", "Experiences", "Journeys", "Dreams"]

function GlowingParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Glowing particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse glow-effect"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
          }}
        />
      ))}
      
      {/* Larger glowing orbs */}
      {[...Array(4)].map((_, i) => (
        <div
          key={`large-${i}`}
          className="absolute w-4 h-4 bg-indigo-300 rounded-full blur-sm animate-bounce opacity-40 glow-effect"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 6}s`,
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.2)',
          }}
        />
      ))}
      
      {/* Gradient glow orbs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse glow-effect" 
           style={{boxShadow: '0 0 100px rgba(59, 130, 246, 0.3)'}} />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-pulse glow-effect" 
           style={{animationDelay: '2s', boxShadow: '0 0 120px rgba(99, 102, 241, 0.2)'}} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200 rounded-full blur-2xl opacity-25 animate-pulse glow-effect" 
           style={{animationDelay: '4s', boxShadow: '0 0 80px rgba(147, 51, 234, 0.25)'}} />
    </div>
  )
}

function TypingAnimation() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isTyping) {
      const targetWord = TYPING_WORDS[currentWordIndex]
      if (currentText.length < targetWord.length) {
        timeout = setTimeout(() => {
          setCurrentText(targetWord.slice(0, currentText.length + 1))
        }, 100)
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, 50)
      } else {
        setCurrentWordIndex((prev) => (prev + 1) % TYPING_WORDS.length)
        setIsTyping(true)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentText, isTyping, currentWordIndex])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 400)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <span className="inline-block">
      <span className="text-blue-600 font-extrabold">
        {currentText}
        <span className={`${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100 text-blue-600`}>
          |
        </span>
      </span>
    </span>
  )
}

// ✅ Feature Status Badge
function FeatureStatusBadge({ status }: { status: 'live' | 'demo' | 'coming-soon' }) {
  const configs = {
    live: { color: 'bg-green-100 text-green-800 border-green-300', text: '✅ Ready', pulse: true },
    demo: { color: 'bg-amber-100 text-amber-800 border-amber-300', text: '🧪 Demo', pulse: false },
    'coming-soon': { color: 'bg-blue-100 text-blue-800 border-blue-300', text: '🚀 Soon', pulse: false }
  }
  
  const config = configs[status]
  
  return (
    <Badge className={`${config.color} text-xs font-medium ${config.pulse ? 'animate-pulse' : ''} hover:scale-105 transition-transform duration-200`}>
      {config.text}
    </Badge>
  )
}

export default function TripMateLanding() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 overflow-x-hidden relative">
      {/* ✅ Enhanced Header with glow effect */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-xl shadow-lg glow-border">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <span className="font-sans text-2xl font-black text-blue-600 tracking-tight hover:scale-105 transition-transform duration-300 glow-text">
              TripMate
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-all duration-300 hover:scale-110 relative group"
            >
              Features
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </button>
            <button
              onClick={() => scrollToSection("benefits")}
              className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-all duration-300 hover:scale-110 relative group"
            >
              Benefits
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-all duration-300 hover:scale-110 relative group"
            >
              Get Started
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300 glow-button"
              >
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ✅ Hero Section - Enhanced Glow, No Scroll Animations */}
      <section className="relative py-24 px-4 min-h-[90vh] flex items-center bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 glow-section">
        <GlowingParticleBackground />

        <div className="container mx-auto text-center relative z-20">
          <div className="opacity-100 transform-none">
            <Badge className="mb-8 bg-blue-100 text-blue-800 border-blue-200 px-6 py-2 text-base font-bold hover:scale-110 transition-all duration-300 glow-badge">
              <Sparkles className="w-5 h-5 mr-2" />
              Built by Travelers, for Travelers ✈️
            </Badge>

            <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight text-gray-900 hover:scale-105 transition-transform duration-500">
              <span className="text-blue-600 glow-text-large">
                Plan Amazing Group
              </span>
            </h1>
            <div className="font-sans text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight text-gray-900">
              <TypingAnimation />
            </div>

            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-semibold hover:text-gray-900 transition-colors duration-300">
              Transform group travel planning from chaos to seamless coordination. Create unforgettable journeys with
              friends, powered by intelligent planning tools that actually work.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-8 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 rounded-2xl glow-button-large"
                >
                  Start Planning Now
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="px-10 py-8 text-xl font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:scale-105 hover:shadow-xl transition-all duration-300 rounded-2xl glow-button-outline"
              >
                Watch Demo
              </Button>
            </div>

            {/* Quick Stats with hover effects */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-base font-bold text-gray-700">
              <div className="flex items-center gap-2 hover:scale-110 transition-all duration-300 cursor-pointer">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2 hover:scale-110 transition-all duration-300 cursor-pointer">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-2 hover:scale-110 transition-all duration-300 cursor-pointer">
                <Clock className="w-5 h-5 text-purple-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Problem Section - Subtle Animations with Red Shadows */}
      <section className="py-24 px-4 bg-gradient-to-br from-red-50/80 via-orange-50/60 to-red-50/80 glow-section-subtle">
        <div className="container mx-auto">
          <div className="text-center mb-20 opacity-100 transform-none">
            <h2 className="font-sans text-4xl md:text-6xl font-black mb-8 text-red-600 glow-text-red">
              Group Travel Shouldn't Be This Hard
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto font-semibold leading-relaxed">
              We've all been there—endless group chats, conflicting preferences, and the impossible task of making
              everyone happy. Sound familiar?
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Messy Communication",
                desc: "Scattered conversations across multiple platforms, important details lost in chat history",
                color: "from-red-500 to-pink-500"
              },
              {
                icon: Users,
                title: "Conflicting Preferences",
                desc: "Everyone wants something different, leading to endless debates and compromises",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Calendar,
                title: "Scheduling Nightmare",
                desc: "Finding dates that work for everyone feels impossible, delaying trip planning",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Target,
                title: "Decision Paralysis",
                desc: "Too many options, no clear consensus, resulting in delayed or cancelled trips",
                color: "from-red-600 to-rose-600"
              },
            ].map((problem, index) => (
              <Card
                key={index}
                className="p-8 text-center group bg-white/90 backdrop-blur-sm border-2 border-red-200 shadow-lg shadow-red-500/10 hover:shadow-xl hover:shadow-red-500/20 hover:border-red-300 transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-102 rounded-2xl glow-card-red opacity-100 transform-none"
              >
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${problem.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-400 ease-out glow-icon`}>
                  <problem.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-black text-xl mb-4 text-gray-900 group-hover:text-red-600 transition-colors duration-400">{problem.title}</h3>
                <p className="text-gray-700 leading-relaxed font-semibold group-hover:text-gray-900 transition-colors duration-400">{problem.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Features Section - Subtle Animations with Color-Matched Shadows */}
      <section id="features" className="py-24 px-4 bg-white glow-section">
        <div className="container mx-auto">
          <div className="text-center mb-20 opacity-100 transform-none">
            <h2 className="font-sans text-4xl md:text-6xl font-black mb-8 text-blue-600 glow-text-blue">
              Smart Solutions for Group Travel
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto font-semibold leading-relaxed">
              Powered by intelligent algorithms and designed for seamless collaboration, our platform makes group planning effortless.
            </p>
          </div>

          {/* Main Features */}
          <div className="grid lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-16">
            {[
              {
                icon: Users,
                title: "Trip Creation & Management",
                desc: "Create trips, invite members, assign roles, and manage everything from one beautiful dashboard.",
                status: 'live' as const,
                gradient: "from-blue-500 to-indigo-600",
                bgColor: "bg-blue-50/80",
                shadowColor: "shadow-blue-500/10 hover:shadow-blue-500/20"
              },
              {
                icon: Calculator,
                title: "Smart Expense Splitting",
                desc: "Automatically split costs, track payments, and settle up with intelligent algorithms that save time.",
                status: 'live' as const,
                gradient: "from-green-500 to-emerald-600",
                bgColor: "bg-green-50/80",
                shadowColor: "shadow-green-500/10 hover:shadow-green-500/20"
              },
              {
                icon: CheckSquare,
                title: "Collaborative Checklists",
                desc: "Assign tasks, track progress, and ensure nothing is forgotten with smart collaborative checklists.",
                status: 'live' as const,
                gradient: "from-purple-500 to-pink-600",
                bgColor: "bg-purple-50/80",
                shadowColor: "shadow-purple-500/10 hover:shadow-purple-500/20"
              },
              {
                icon: MapPin,
                title: "AI Itinerary Planner",
                desc: "Generate personalized day-by-day itineraries that balance everyone's interests and preferences perfectly.",
                status: 'live' as const,
                gradient: "from-orange-500 to-red-600",
                bgColor: "bg-orange-50/80",
                shadowColor: "shadow-orange-500/10 hover:shadow-orange-500/20"
              },
              {
                icon: Store,
                title: "Vendor Marketplace",
                desc: "Connect with service providers and browse travel services. Currently showcasing demo listings.",
                status: 'demo' as const,
                gradient: "from-cyan-500 to-blue-600",
                bgColor: "bg-cyan-50/80",
                shadowColor: "shadow-cyan-500/10 hover:shadow-cyan-500/20"
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`p-8 group ${feature.bgColor} backdrop-blur-sm border-2 border-gray-200 shadow-lg ${feature.shadowColor} hover:shadow-xl hover:border-blue-300 transition-all duration-500 ease-out hover:-translate-y-3 hover:scale-103 hover:rotate-1 rounded-3xl relative glow-card opacity-100 transform-none`}
              >
                <div className="absolute top-4 right-4 transition-all duration-400 group-hover:scale-105 group-hover:rotate-6">
                  <FeatureStatusBadge status={feature.status} />
                </div>
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-115 group-hover:rotate-6 transition-all duration-400 ease-out glow-icon`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-black text-lg mb-4 text-gray-900 group-hover:text-blue-600 transition-colors duration-400">
                  {feature.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed font-semibold group-hover:text-gray-900 transition-colors duration-400">{feature.desc}</p>
              </Card>
            ))}
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 group bg-amber-50/80 backdrop-blur-sm border-2 border-amber-200 shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/20 hover:border-amber-300 hover:-translate-y-2 hover:scale-102 transition-all duration-500 ease-out rounded-2xl glow-card-amber opacity-100 transform-none">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-400 ease-out glow-icon">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-black text-xl text-gray-900 group-hover:text-amber-600 transition-colors duration-400">Smart Recommendations</h3>
                    <div className="transition-all duration-400 group-hover:scale-105">
                      <FeatureStatusBadge status="demo" />
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed font-semibold group-hover:text-gray-900 transition-colors duration-400">
                    Smart engine recommends services based on group preferences. Currently using demo data - help us improve with your feedback!
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 group bg-blue-50/80 backdrop-blur-sm border-2 border-blue-200 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-300 hover:-translate-y-2 hover:scale-102 transition-all duration-500 ease-out rounded-2xl glow-card opacity-100 transform-none">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-400 ease-out glow-icon">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-black text-xl text-gray-900 group-hover:text-blue-600 transition-colors duration-400">AI Trip Recommendations</h3>
                    <div className="transition-all duration-400 group-hover:scale-105">
                      <FeatureStatusBadge status="coming-soon" />
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed font-semibold group-hover:text-gray-900 transition-colors duration-400">
                    Advanced AI-powered trip suggestions and personalized destination recommendations coming soon!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ✅ Benefits Section - Subtle Animations with Blue Shadows */}
      <section id="benefits" className="py-24 px-4 bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 glow-section">
        <div className="container mx-auto">
          <div className="text-center mb-20 opacity-100 transform-none">
            <h2 className="font-sans text-4xl md:text-6xl font-black mb-8 text-blue-600 glow-text-blue">
              Why Choose TripMate?
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto font-semibold leading-relaxed">
              Experience the future of group travel planning with our intelligent platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Stress-Free Planning",
                desc: "No more endless debates or decision fatigue. Smart algorithms find the perfect balance for everyone.",
                color: "from-red-500 to-pink-500"
              },
              {
                icon: Users,
                title: "Everyone's Voice Matters",
                desc: "Democratic voting and fair decision-making ensures happy travelers from start to finish.",
                color: "from-blue-500 to-indigo-600"
              },
              {
                icon: Zap,
                title: "Save Time & Energy",
                desc: "Automated planning and smart suggestions mean more excitement, less logistics headaches.",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Coffee,
                title: "Better Group Dynamics",
                desc: "Clear communication and transparent processes strengthen friendships and reduce conflicts.",
                color: "from-amber-500 to-yellow-600"
              },
              {
                icon: Camera,
                title: "Memorable Experiences",
                desc: "Well-planned trips create lasting memories and stories you'll share for years to come.",
                color: "from-cyan-500 to-blue-600"
              },
              {
                icon: MapPin,
                title: "Discover Hidden Gems",
                desc: "Our system finds unique experiences and local favorites that match your group's interests.",
                color: "from-green-500 to-emerald-600"
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                className="p-8 text-center group bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-300 transition-all duration-500 ease-out hover:-translate-y-3 hover:scale-103 hover:rotate-1 rounded-3xl glow-card opacity-100 transform-none"
              >
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-115 group-hover:rotate-6 transition-all duration-400 ease-out glow-icon`}>
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-black text-xl mb-4 text-gray-900 group-hover:text-blue-600 transition-colors duration-400">{benefit.title}</h3>
                <p className="text-gray-700 leading-relaxed font-semibold group-hover:text-gray-900 transition-colors duration-400">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ FIXED CTA Section - Proper Background and Visibility */}
      <section id="pricing" className="py-24 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-8 bg-white/20 text-white border-white/30 px-6 py-2 text-base font-bold hover:scale-110 transition-all duration-300 shadow-lg">
              <Gift className="w-5 h-5 mr-2" />
              Free to Start • No Credit Card Required
            </Badge>
            
            <h2 className="font-sans text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed font-semibold">
              Start planning your perfect group trip today. Join the future of collaborative travel planning!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-800 px-10 py-8 text-xl font-black shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 rounded-2xl"
                >
                  Start Your Journey Free
                  <ArrowRight className="ml-3 h-6 w-6 text-blue-600" />
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white hover:bg-white hover:text-blue-600 px-10 py-8 text-xl font-bold hover:scale-105 transition-all duration-300 rounded-2xl text-blue-600"
                >
                  Already have an account?
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white font-semibold">
              <div className="flex items-center gap-2 hover:scale-110 transition-all duration-300 cursor-pointer">
                <CheckCircle className="w-5 h-5" />
                <span>Setup in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2 hover:scale-110 transition-all duration-300 cursor-pointer">
                <Shield className="w-5 h-5" />
                <span>100% secure</span>
              </div>
              <div className="flex items-center gap-2 hover:scale-110 transition-all duration-300 cursor-pointer">
                <Plus className="w-5 h-5" />
                <span>Instant access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50/30 glow-section-subtle">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <span className="font-sans text-3xl font-black text-blue-600 tracking-tight hover:scale-105 transition-transform duration-300 glow-text">
                  TripMate
                </span>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed font-semibold">
                Making group adventures effortless, one journey at a time. Built by travelers who understand the challenges of group planning.
              </p>
            </div>

            {[
              { 
                title: "Product", 
                links: [
                  { name: "Features", href: "#features" },
                  { name: "How it works", href: "#benefits" },
                  { name: "Pricing", href: "#pricing" },
                  { name: "Roadmap", href: "#features" }
                ]
              },
              { 
                title: "Company", 
                links: [
                  { name: "About", href: "/about" },
                  { name: "Blog", href: "/blog" },
                  { name: "Careers", href: "/careers" },
                  { name: "Contact", href: "/contact" }
                ]
              },
              { 
                title: "Support", 
                links: [
                  { name: "Help Center", href: "/help" },
                  { name: "Getting Started", href: "/help" },
                  { name: "Privacy", href: "/privacy" },
                  { name: "Terms", href: "/terms" }
                ]
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-black mb-6 text-gray-900 text-lg">{section.title}</h4>
                <ul className="space-y-3 text-gray-700">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        className="hover:text-blue-600 transition-all duration-300 hover:underline font-semibold hover:scale-105 inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-300 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-gray-700 mb-4 sm:mb-0 font-semibold">
              © 2025 TripMate. All rights reserved. Made with ❤️ for travelers.
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-600 font-semibold">Building the future of group travel</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ✅ Enhanced Floating Action Button */}
      <Link href="/signup">
        <Button className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-110 transition-all duration-300 rounded-full w-16 h-16 border-4 border-white/20">
          <Plus className="w-7 h-7" />
        </Button>
      </Link>

      {/* ✅ Updated Custom CSS for subtle animations */}
      <style jsx>{`
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .hover\\:scale-103:hover {
          transform: scale(1.03);
        }
        
        .hover\\:scale-115:hover {
          transform: scale(1.15);
        }
        
        .glow-effect {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
        }
        
        .glow-text {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        .glow-text-large {
          text-shadow: 0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2);
        }
        
        .glow-text-blue {
          text-shadow: 0 0 25px rgba(59, 130, 246, 0.4);
        }
        
        .glow-text-red {
          text-shadow: 0 0 25px rgba(239, 68, 68, 0.4);
        }
        
        .glow-button {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        .glow-button-large {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2);
        }
        
        .glow-button-outline {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
        }
        
        .glow-badge {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
        }
        
        .glow-card {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glow-card-red {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glow-card-amber {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glow-icon {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glow-section {
          background-image: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
        }
        
        .glow-section-subtle {
          background-image: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.02) 0%, transparent 50%);
        }
        
        .glow-border {
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 1px 10px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  )
}
