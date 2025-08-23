"use client";
import { useState } from "react"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Rocket,
  MessageSquare,
  Store,
  Brain,
  Gift,
  Users,
  Calculator,
  CheckSquare,
  Target,
  Zap,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Beaker,
  Shield,
  Sun,
  Moon,
  Coffee,
  User,
  AlertCircle,
  RefreshCw,
  Loader2
} from "lucide-react"

/* ───────── interfaces ───────── */
interface CurrentUser {
  id: number
  email: string
  username: string
  role: string
}

/* ───────── mock data (same as before) ───────── */
const mockDestinations = [
  { id: 1, name: "Goa, India", image: "/goa-beach-palm-trees.png", rating: 4.8, price: "₹8,500", duration: "5 days", description: "Beautiful beaches, vibrant nightlife, and Portuguese heritage" },
  { id: 2, name: "Kerala, India", image: "/kerala-houseboat-serenity.png", rating: 4.9, price: "₹12,000", duration: "7 days", description: "God's own country with backwaters and hill stations" },
  { id: 3, name: "Rajasthan, India", image: "/rajasthan-palace-desert.png", rating: 4.7, price: "₹15,000", duration: "8 days", description: "Royal palaces, desert safaris, and rich cultural heritage" },
  { id: 4, name: "Himachal Pradesh, India", image: "/himachal-mountains-snow.png", rating: 4.8, price: "₹10,000", duration: "6 days", description: "Snow-capped mountains, adventure sports, and scenic valleys" },
  { id: 5, name: "Uttarakhand, India", image: "/uttarakhand-rishikesh-ganges.png", rating: 4.6, price: "₹9,000", duration: "5 days", description: "Spiritual destinations, yoga retreats, and Himalayan views" },
]

const mockHotels = [
  { id: 1, name: "Taj Lake Palace, Udaipur", image: "/taj-lake-udaipur.png", rating: 4.9, price: "₹25,000/night", location: "Udaipur, Rajasthan", amenities: ["Lake View", "Spa", "Heritage"] },
  { id: 2, name: "Backwater Resort, Alleppey", image: "/kerala-houseboat-serenity.png", rating: 4.7, price: "₹8,000/night", location: "Alleppey, Kerala", amenities: ["Houseboat", "Ayurveda", "Backwater View"] },
  { id: 3, name: "Beach Resort, Goa", image: "/goa-beach-palm-trees.png", rating: 4.6, price: "₹6,000/night", location: "Calangute, Goa", amenities: ["Beach Access", "Pool", "Water Sports"] },
  { id: 4, name: "Mountain Lodge, Manali", image: "/himachal-mountains-snow.png", rating: 4.8, price: "₹4,500/night", location: "Manali, Himachal Pradesh", amenities: ["Mountain View", "Fireplace", "Adventure Tours"] },
]

const mockActivities = [
  { id: 1, name: "River Rafting in Rishikesh", image: "/uttarakhand-rishikesh-ganges.png", rating: 4.8, price: "₹1,500", duration: "4 hours", category: "Adventure" },
  { id: 2, name: "Cooking Class in Kerala", image: "/kerala-houseboat-serenity.png", rating: 4.7, price: "₹800", duration: "3 hours", category: "Culture" },
  { id: 3, name: "Heritage Walk in Jaipur", image: "/rajasthan-palace-desert.png", rating: 4.6, price: "₹500", duration: "3 hours", category: "Sightseeing" },
  { id: 4, name: "Tea Plantation Tour, Darjeeling", image: "/himachal-mountains-snow.png", rating: 4.9, price: "₹1,200", duration: "5 hours", category: "Nature" },
  { id: 5, name: "Desert Safari in Jaisalmer", image: "/rajasthan-palace-desert.png", rating: 4.8, price: "₹2,000", duration: "6 hours", category: "Adventure" },
]

/* ✅ FIXED: Enhanced Mobile-Responsive User Greeting Component */
const UserGreeting = ({ user, loading, error, onRetry }: {
  user: CurrentUser | null
  loading: boolean
  error: boolean
  onRetry: () => void
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: "Good Morning", icon: Sun, color: "from-yellow-400 to-orange-500" }
    if (hour < 17) return { text: "Good Afternoon", icon: Sun, color: "from-orange-400 to-red-500" }
    if (hour < 21) return { text: "Good Evening", icon: Sun, color: "from-purple-400 to-pink-500" }
    return { text: "Good Night", icon: Moon, color: "from-indigo-400 to-purple-500" }
  }

  const greeting = getGreeting()
  const GreetingIcon = greeting.icon

  if (loading) {
    return (
      <div className="mb-3 sm:mb-6 md:mb-8 p-2 sm:p-4 md:p-6 rounded-lg sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-xl border border-blue-200/50 shadow-lg sm:shadow-xl md:shadow-2xl shadow-blue-500/10">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl md:rounded-2xl animate-pulse"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 sm:h-6 md:h-8 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-lg animate-pulse mb-1 sm:mb-2"></div>
            <div className="h-2 sm:h-3 md:h-4 bg-gradient-to-r from-blue-200 to-indigo-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-3 sm:mb-6 md:mb-8 p-2 sm:p-4 md:p-8 rounded-lg sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-xl border border-blue-200/50 shadow-lg sm:shadow-xl md:shadow-2xl shadow-blue-500/10 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 sm:-top-10 sm:-right-10 w-12 h-12 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 sm:-bottom-10 sm:-left-10 w-16 h-16 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-tr from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* ✅ FIXED: Better narrow mobile layout */}
      <div className="relative z-10 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <div className={`w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br ${greeting.color} rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
            <GreetingIcon className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-1 leading-tight">
              {greeting.text}, {user?.username || 'Traveler'}! 👋
            </h2>
            <p className="text-xs sm:text-base md:text-lg text-blue-600/80 font-medium">
              Ready to plan your next adventure?
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
          <div className="text-left sm:text-right">
            <div className="text-xs text-blue-600/70 font-medium">Welcome back</div>
            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 font-medium text-xs">
              <User className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
              {user?.role || 'Member'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ✅ FIXED: Platform Status Cards with Vertical Split Layout */
const DashboardStatusCards = () => {
  // ✅ NEW: Split status items into two groups for narrow mobile
  const liveFeatures = [
    { name: "Trip Management", status: "Live & Ready", icon: CheckCircle, color: "green" },
    { name: "Expense Tracking", status: "Live & Ready", icon: CheckCircle, color: "green" },
    { name: "Smart Checklists", status: "Live & Ready", icon: CheckCircle, color: "green" },
    { name: "AI Itinerary", status: "Live & Ready", icon: CheckCircle, color: "green" },
  ]

  const demoFeatures = [
    { name: "Marketplace", status: "Demo Data", icon: Beaker, color: "amber" },
    { name: "Smart Engine", status: "Demo Mode", icon: Target, color: "amber" },
    { name: "Group Chat", status: "Coming Soon", icon: Clock, color: "blue" },
    { name: "AI Trip Recs", status: "Coming Soon", icon: Brain, color: "purple" },
  ]

  const renderFeatureCard = (feature: any, index: number) => {
    const colorClasses = {
      green: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 text-green-800",
      amber: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 text-amber-800", 
      blue: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 text-blue-800",
      purple: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 text-purple-800"
    }

    const iconColorClasses = {
      green: "text-green-600",
      amber: "text-amber-600",
      blue: "text-blue-600", 
      purple: "text-purple-600"
    }

    const dotColorClasses = {
      green: "bg-green-500",
      amber: "bg-amber-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500"
    }

    return (
      <div key={index} className={`group p-2 rounded-lg border hover:shadow-lg hover:scale-105 transition-all duration-300 ${colorClasses[feature.color]}`}>
        <div className="flex items-center gap-1 mb-1">
          <feature.icon className={`w-3 h-3 ${iconColorClasses[feature.color]}`} />
          <div className={`w-1 h-1 ${dotColorClasses[feature.color]} rounded-full animate-pulse`}></div>
        </div>
        <div>
          <span className="text-xs font-bold block leading-tight">{feature.name}</span>
          <div className="text-xs font-medium opacity-80">{feature.status}</div>
        </div>
      </div>
    )
  }

  return (
    <Card className="mb-4 sm:mb-8 md:mb-10 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-xl border border-blue-200/50 shadow-lg sm:shadow-xl md:shadow-2xl shadow-blue-500/10 rounded-lg sm:rounded-2xl md:rounded-3xl overflow-hidden">
      <div className="p-3 sm:p-4 md:p-8">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-6 md:mb-8">
          <div className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              🚀 Platform Status
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-blue-600/70 font-medium">Real-time feature availability</p>
          </div>
        </div>
        
        {/* ✅ FIXED: Two-column layout for narrow mobile, responsive for larger screens */}
        <div className="space-y-3 sm:space-y-0">
          {/* Production Features Section */}
          <div className="mb-3 sm:mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-2">
              {liveFeatures.map(renderFeatureCard)}
            </div>
          </div>
          
          {/* Demo & Coming Soon Features Section */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {demoFeatures.map(renderFeatureCard)}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 md:pt-6 border-t border-blue-200/50 mt-3 sm:mt-4 md:mt-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-green-700">Production Ready</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-amber-700">Demo Preview</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-blue-700">Coming Soon</span>
            </div>
          </div>
          <Link href="/feedback">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-xs sm:text-sm h-8 sm:h-10">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Share Feedback
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
/* ✅ FIXED: Mobile-Responsive Progressive Feature Disclosure */
/* ✅ FIXED: Progressive Feature Disclosure - Vertical Stack on Mobile */
const ProgressiveFeatureDisclosure = () => {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 mb-6 sm:mb-10 md:mb-12">
      {/* Production Ready Features */}
      <Card className="border-green-200/50 bg-gradient-to-br from-green-50/90 via-emerald-50/90 to-green-50/90 backdrop-blur-xl shadow-lg sm:shadow-xl md:shadow-2xl shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 rounded-lg sm:rounded-2xl md:rounded-3xl overflow-hidden group">
        <div className="p-3 sm:p-6 md:p-8 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 sm:-top-10 sm:-right-10 w-12 h-12 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-green-400/10 to-emerald-600/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
              <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-sm sm:text-lg md:text-2xl">🎯 Production Ready</h3>
                <p className="text-xs sm:text-sm md:text-base text-green-600 font-medium">Full functionality with real data</p>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-3 sm:mb-6 md:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white/70 rounded-lg sm:rounded-xl md:rounded-2xl border border-green-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-green-800 text-xs sm:text-sm md:text-base">Trip Creation & Management</div>
                  <div className="text-xs sm:text-sm text-green-600">Create, invite members, manage roles</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white/70 rounded-lg sm:rounded-xl md:rounded-2xl border border-green-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-green-800 text-xs sm:text-sm md:text-base">Smart Expense Splitting</div>
                  <div className="text-xs sm:text-sm text-green-600">Auto-calculations, settlements, payments</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white/70 rounded-lg sm:rounded-xl md:rounded-2xl border border-green-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-lime-600 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-green-800 text-xs sm:text-sm md:text-base">Collaborative Checklists</div>
                  <div className="text-xs sm:text-sm text-green-600">Real-time updates, priority management</div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white/70 rounded-lg sm:rounded-xl md:rounded-2xl border border-green-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-green-800 text-xs sm:text-sm md:text-base">AI Itinerary Planner</div>
                  <div className="text-xs sm:text-sm text-green-600">Personalized day-by-day planning</div>
                </div>
              </div>
            </div>
            
             <Link href="/trips">
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 h-9 sm:h-12 md:h-14 text-xs sm:text-base md:text-lg font-semibold rounded-lg sm:rounded-xl md:rounded-2xl">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                Explore Live Features
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-2 md:ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>


      {/* Preview & Upcoming Features */}
      <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50/90 via-orange-50/90 to-amber-50/90 backdrop-blur-xl shadow-lg sm:shadow-xl md:shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 rounded-lg sm:rounded-2xl md:rounded-3xl overflow-hidden group">
        <div className="p-3 sm:p-6 md:p-8 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 sm:-top-10 sm:-right-10 w-12 h-12 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-amber-400/10 to-orange-600/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
              <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
                <Rocket className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-sm sm:text-lg md:text-2xl">🚀 Coming Soon</h3>
                <p className="text-xs sm:text-sm md:text-base text-amber-600 font-medium">Preview features & roadmap</p>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-3 sm:mb-6 md:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white/70 rounded-lg sm:rounded-xl md:rounded-2xl border border-amber-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Store className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-cyan-800 text-xs sm:text-sm md:text-base">Vendor Marketplace</div>
                  <div className="text-xs sm:text-sm text-cyan-600">Browse services with demo data</div>
                </div>
                <Badge className="bg-cyan-200 text-cyan-800 font-semibold px-2 py-1 rounded-full text-xs flex-shrink-0">Demo</Badge>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white/70 rounded-lg sm:rounded-xl md:rounded-2xl border border-amber-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-amber-800 text-xs sm:text-sm md:text-base">Smart Engine</div>
                  <div className="text-xs sm:text-sm text-amber-600">Recommendations based on preferences</div>
                </div>
                <Badge className="bg-amber-200 text-amber-800 font-semibold px-2 py-1 rounded-full text-xs flex-shrink-0">Demo</Badge>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white/70 rounded-lg sm:rounded-xl md:rounded-2xl border border-amber-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-blue-800 text-xs sm:text-sm md:text-base">Group Communication</div>
                  <div className="text-xs sm:text-sm text-blue-600">WhatsApp-style chat integration</div>
                </div>
                <Badge className="bg-blue-200 text-blue-800 font-semibold px-2 py-1 rounded-full text-xs flex-shrink-0">Next Month</Badge>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white/70 rounded-lg sm:rounded-xl md:rounded-2xl border border-amber-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-purple-800 text-xs sm:text-sm md:text-base">AI Trip Recommendations</div>
                  <div className="text-xs sm:text-sm text-purple-600">Advanced AI-powered trip suggestions</div>
                </div>
                <Badge className="bg-purple-200 text-purple-800 font-semibold px-2 py-1 rounded-full text-xs flex-shrink-0">Coming Soon</Badge>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <Link href="/recommendations">
                <Button variant="outline" className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 h-9 sm:h-10 md:h-12 text-xs sm:text-sm md:text-base font-semibold rounded-lg sm:rounded-xl md:rounded-2xl">
                  <Beaker className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                  Try Demo Features
                </Button>
              </Link>
              <Link href="/feedback">
                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xl h-9 sm:h-10 md:h-12 text-xs sm:text-sm md:text-base font-semibold rounded-lg sm:rounded-xl md:rounded-2xl">
                  <Gift className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                  Share Feedback & Get Rewards
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ✅ FIXED: Enhanced Mobile-Responsive Carousel Component */
function Carousel<T>({
  items,
  title,
  renderItem,
}: {
  items: T[]
  title: React.ReactNode
  renderItem: (item: T, i: number) => React.ReactNode
}) {
  const [index, setIndex] = useState(0)
  
  // More granular responsive items per view
  const getPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1   // Mobile: 1 item
      if (window.innerWidth < 1024) return 2  // Tablet: 2 items  
      return 3 // Desktop: 3 items
    }
    return 3
  }
  
  const [perView, setPerView] = useState(getPerView())
  const last = Math.max(1, items.length - perView + 1)

  // Update perView on window resize
  useState(() => {
    const handleResize = () => setPerView(getPerView())
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  })

  return (
    <div className="mb-8 sm:mb-12 md:mb-16">
      <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold">{title}</h2>
        <div className="flex gap-2 md:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIndex((i)=>(i-1+last)%last)}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border-2 hover:scale-110 transition-transform duration-200"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4"/>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIndex((i)=>(i+1)%last)}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border-2 hover:scale-110 transition-transform duration-200"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4"/>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
        >
          {items.map((item, i) => (
            <div key={i} className={`${perView === 1 ? 'w-full' : perView === 2 ? 'w-1/2' : 'w-1/3'} px-1 sm:px-2 md:px-3 flex-shrink-0`}>
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ✅ FIXED: Main Dashboard Page with Enhanced Mobile Responsiveness */
/* ✅ FIXED: Main Dashboard Page with Enhanced Container Management */
export default function DashboardPage() {
  const { user, loading } = useAuth()

  const retryGetUser = () => {
    window.location.reload()
  }
return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50">
      <DashboardShell>
        {/* ✅ User Greeting - Optimized Container */}
        <div className="w-full max-w-none sm:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pt-2 sm:pt-4 md:pt-8">
          <UserGreeting 
            user={user as CurrentUser | null} 
            loading={loading} 
            error={false}
            onRetry={retryGetUser} 
          />
        </div>

          {/* ✅ FIXED: Hero Section - Better Mobile Layout */}
        <div className="w-full max-w-none sm:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6 md:py-8 text-center">
          <h1 className="text-xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-4 md:mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Welcome to Your Travel Dashboard
          </h1>
          <p className="text-xs sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-8 md:mb-10 max-w-3xl mx-auto font-medium leading-relaxed px-1 sm:px-2">
            Discover amazing destinations, plan your perfect trip, and create unforgettable memories with friends.
          </p>
          <Link href="/create-trip">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 md:px-10 py-3 sm:py-6 md:py-8 text-sm sm:text-base md:text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 rounded-lg sm:rounded-xl md:rounded-2xl w-full sm:w-auto max-w-sm sm:max-w-none">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-2 md:mr-3"/>
              Create Your Dream Trip
            </Button>
          </Link>
        </div>

         <div className="w-full max-w-none sm:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pb-8 sm:pb-16 md:pb-20">
          {/* Enhanced Components */}
          <DashboardStatusCards />
          <ProgressiveFeatureDisclosure />

          {/* ✅ FIXED: Enhanced Mobile-Responsive Carousels */}
          <Carousel
            items={mockDestinations}
            title={<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">🌟 Popular Destinations</span>}
            renderItem={(d) => (
              <Card className="group relative overflow-hidden
                             bg-white/90 backdrop-blur-sm border border-gray-200/50
                             shadow-lg sm:shadow-xl shadow-blue-500/5
                             transition-all duration-500 ease-out
                             hover:shadow-xl sm:hover:shadow-2xl hover:shadow-blue-500/15
                             hover:border-blue-300/50
                             hover:-translate-y-1 sm:hover:-translate-y-3 hover:scale-105
                             rounded-lg sm:rounded-xl md:rounded-2xl">
                <div className="relative z-10">
                  <img 
                    src={d.image} 
                    alt={d.name} 
                    className="w-full h-32 sm:h-36 md:h-48 object-cover rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl"
                  />
                  <div className="p-3 sm:p-4 md:p-5">
                    <div className="flex justify-between items-start mb-2 md:mb-3">
                      <h3 className="font-bold text-sm sm:text-base md:text-lg leading-tight">{d.name}</h3>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full ml-2">
                        <Star className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 text-yellow-500 fill-current"/>
                        <span className="ml-1 text-xs sm:text-xs md:text-sm font-semibold">{d.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4 leading-relaxed line-clamp-2">{d.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1 sm:space-x-2 text-blue-600">
                        <Clock className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4"/>
                        <span className="text-xs sm:text-xs md:text-sm font-medium">{d.duration}</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 font-bold px-2 sm:px-2 md:px-3 py-1 text-xs">{d.price}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          />

          <Carousel
            items={mockHotels}
            title={<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">🏨 Featured Hotels</span>}
            renderItem={(h) => (
              <Card className="group relative overflow-hidden
                             bg-white/90 backdrop-blur-sm border border-gray-200/50
                             shadow-lg sm:shadow-xl shadow-emerald-500/5
                             transition-all duration-500 ease-out
                             hover:shadow-xl sm:hover:shadow-2xl hover:shadow-emerald-500/15
                             hover:border-emerald-300/50
                             hover:-translate-y-1 sm:hover:-translate-y-3 hover:scale-105
                             rounded-lg sm:rounded-xl md:rounded-2xl">
                <div className="relative z-10">
                  <img 
                    src={h.image} 
                    alt={h.name} 
                    className="w-full h-32 sm:h-36 md:h-48 object-cover rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl"
                  />
                  <div className="p-3 sm:p-4 md:p-5">
                    <div className="flex justify-between items-start mb-2 md:mb-3">
                      <h3 className="font-bold text-sm sm:text-base md:text-lg leading-tight">{h.name}</h3>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full ml-2">
                        <Star className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 text-yellow-500 fill-current"/>
                        <span className="ml-1 text-xs sm:text-xs md:text-sm font-semibold">{h.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center mb-2 sm:mb-3 md:mb-4 text-gray-600">
                      <MapPin className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 text-emerald-600 mr-1 sm:mr-2 flex-shrink-0"/>
                      <span className="text-xs sm:text-xs md:text-sm font-medium truncate">{h.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {h.amenities.slice(0,2).map(a=>
                          <Badge key={a} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5">{a}</Badge>
                        )}
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 font-bold px-2 sm:px-2 md:px-3 py-1 text-xs ml-2">{h.price}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          />

          <Carousel
            items={mockActivities}
            title={<span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">🎯 Exciting Activities</span>}
            renderItem={(a) => (
              <Card className="group relative overflow-hidden
                             bg-white/90 backdrop-blur-sm border border-gray-200/50
                             shadow-lg sm:shadow-xl shadow-purple-500/5
                             transition-all duration-500 ease-out
                             hover:shadow-xl sm:hover:shadow-2xl hover:shadow-purple-500/15
                             hover:border-purple-300/50
                             hover:-translate-y-1 sm:hover:-translate-y-3 hover:scale-105
                             rounded-lg sm:rounded-xl md:rounded-2xl">
                <div className="relative z-10">
                  <img 
                    src={a.image} 
                    alt={a.name} 
                    className="w-full h-32 sm:h-36 md:h-48 object-cover rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl"
                  />
                  <div className="p-3 sm:p-4 md:p-5">
                    <div className="flex justify-between items-start mb-2 md:mb-3">
                      <h3 className="font-bold text-sm sm:text-base md:text-lg leading-tight">{a.name}</h3>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full ml-2">
                        <Star className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 text-yellow-500 fill-current"/>
                        <span className="ml-1 text-xs sm:text-xs md:text-sm font-semibold">{a.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between mb-2 sm:mb-3 md:mb-4">
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">{a.category}</Badge>
                      <div className="flex items-center text-purple-600">
                        <Clock className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1"/>
                        <span className="text-xs sm:text-xs md:text-sm font-medium">{a.duration}</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 font-bold px-2 sm:px-2 md:px-3 py-1 text-xs">{a.price}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          />
        </div>
        
       {/* ✅ Floating Feedback Button - Smaller on narrow mobile */}
        <Link href="/feedback">
          <Button className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-110 transition-all duration-300 rounded-full w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 sm:border-3 md:border-4 border-white/20">
            <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </Button>
        </Link>
      </DashboardShell>
    </div>
  )
}
