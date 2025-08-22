"use client";
import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const BASE_URL = "https://tripmate-39hm.onrender.com/"

/* ───────── interfaces ───────── */
interface CurrentUser {
  id: number
  email: string
  username: string
  role: string
}

/* ───────── mock data (delete when you fetch real data) ───────── */
const mockDestinations = [
  { id: 1, name: "Goa, India",            image: "/goa-beach-palm-trees.png",  rating: 4.8, price: "₹8,500",  duration: "5 days", description: "Beautiful beaches, vibrant nightlife, and Portuguese heritage" },
  { id: 2, name: "Kerala, India",         image: "/kerala-houseboat-serenity.png", rating: 4.9, price: "₹12,000", duration: "7 days", description: "God's own country with backwaters and hill stations" },
  { id: 3, name: "Rajasthan, India",      image: "/rajasthan-palace-desert.png",   rating: 4.7, price: "₹15,000", duration: "8 days", description: "Royal palaces, desert safaris, and rich cultural heritage" },
  { id: 4, name: "Himachal Pradesh, India", image: "/himachal-mountains-snow.png", rating: 4.8, price: "₹10,000", duration: "6 days", description: "Snow-capped mountains, adventure sports, and scenic valleys" },
  { id: 5, name: "Uttarakhand, India",    image: "/uttarakhand-rishikesh-ganges.png", rating: 4.6, price: "₹9,000",  duration: "5 days", description: "Spiritual destinations, yoga retreats, and Himalayan views" },
]

const mockHotels = [
  { id: 1, name: "Taj Lake Palace, Udaipur", image: "/taj-lake-udaipur.png", rating: 4.9, price: "₹25,000/night", location: "Udaipur, Rajasthan", amenities: ["Lake View", "Spa", "Heritage"] },
  { id: 2, name: "Backwater Resort, Alleppey", image: "/kerala-houseboat-serenity.png", rating: 4.7, price: "₹8,000/night",  location: "Alleppey, Kerala", amenities: ["Houseboat", "Ayurveda", "Backwater View"] },
  { id: 3, name: "Beach Resort, Goa",         image: "/goa-beach-palm-trees.png",    rating: 4.6, price: "₹6,000/night",  location: "Calangute, Goa", amenities: ["Beach Access", "Pool", "Water Sports"] },
  { id: 4, name: "Mountain Lodge, Manali",    image: "/himachal-mountains-snow.png", rating: 4.8, price: "₹4,500/night", location: "Manali, Himachal Pradesh", amenities: ["Mountain View", "Fireplace", "Adventure Tours"] },
]

const mockActivities = [
  { id: 1, name: "River Rafting in Rishikesh",  image: "/uttarakhand-rishikesh-ganges.png", rating: 4.8, price: "₹1,500", duration: "4 hours", category: "Adventure" },
  { id: 2, name: "Cooking Class in Kerala",     image: "/kerala-houseboat-serenity.png",    rating: 4.7, price: "₹800",  duration: "3 hours", category: "Culture" },
  { id: 3, name: "Heritage Walk in Jaipur",     image: "/rajasthan-palace-desert.png",      rating: 4.6, price: "₹500",  duration: "3 hours", category: "Sightseeing" },
  { id: 4, name: "Tea Plantation Tour, Darjeeling", image: "/himachal-mountains-snow.png", rating: 4.9, price: "₹1,200", duration: "5 hours", category: "Nature" },
  { id: 5, name: "Desert Safari in Jaisalmer",  image: "/rajasthan-palace-desert.png",      rating: 4.8, price: "₹2,000", duration: "6 hours", category: "Adventure" },
]

/* ───────── ✅ User Greeting Component ───────── */
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
      <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-xl border border-blue-200/50 shadow-2xl shadow-blue-500/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse"></div>
          <div className="flex-1">
            <div className="h-8 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 bg-gradient-to-r from-blue-200 to-indigo-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-red-50/80 via-orange-50/80 to-red-50/80 backdrop-blur-xl border border-red-200/50 shadow-2xl shadow-red-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-800">Server Connection Issue</h2>
              <p className="text-red-600">Unable to load your profile. Please check your connection.</p>
            </div>
          </div>
          <Button 
            onClick={onRetry}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-xl border border-blue-200/50 shadow-2xl shadow-blue-500/10 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 bg-gradient-to-br ${greeting.color} rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300`}>
            <GreetingIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-1">
              {greeting.text}, {user?.username || 'Traveler'}! 👋
            </h2>
            <p className="text-lg text-blue-600/80 font-medium">
              Ready to plan your next adventure?
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-blue-600/70 font-medium">Welcome back</div>
            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 font-medium">
              <User className="w-3 h-3 mr-1" />
              {user?.role || 'Member'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────── ✅ UPDATED: Dashboard Status Cards Component ───────── */
const DashboardStatusCards = () => {
  return (
    <Card className="mb-10 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-xl border border-blue-200/50 shadow-2xl shadow-blue-500/10 rounded-3xl overflow-hidden">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              🚀 Platform Status
            </h3>
            <p className="text-blue-600/70 font-medium">Real-time feature availability</p>
          </div>
        </div>
        
        {/* ✅ UPDATED: Status Cards with corrected statuses */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 mb-6">
          {/* Live Features */}
          <div className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-sm font-bold text-green-800">Trip Management</span>
              <div className="text-xs text-green-600 font-medium">Live & Ready</div>
            </div>
          </div>
          
          <div className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-sm font-bold text-green-800">Expense Tracking</span>
              <div className="text-xs text-green-600 font-medium">Live & Ready</div>
            </div>
          </div>
          
          <div className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-sm font-bold text-green-800">Smart Checklists</span>
              <div className="text-xs text-green-600 font-medium">Live & Ready</div>
            </div>
          </div>

          <div className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-sm font-bold text-green-800">AI Itinerary</span>
              <div className="text-xs text-green-600 font-medium">Live & Ready</div>
            </div>
          </div>

          {/* ✅ UPDATED: Demo Features */}
          <div className="group p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Beaker className="w-5 h-5 text-amber-600" />
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-sm font-bold text-amber-800">Marketplace</span>
              <div className="text-xs text-amber-600 font-medium">Demo Data</div>
            </div>
          </div>
          
          <div className="group p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-amber-600" />
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-sm font-bold text-amber-800">Smart Engine</span>
              <div className="text-xs text-amber-600 font-medium">Demo Mode</div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-sm font-bold text-blue-800">Group Chat</span>
              <div className="text-xs text-blue-600 font-medium">Coming Soon</div>
            </div>
          </div>

          {/* ✅ NEW: AI Trip Recommendations */}
          <div className="group p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-sm font-bold text-purple-800">AI Trip Recs</span>
              <div className="text-xs text-purple-600 font-medium">Coming Soon</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-blue-200/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">Production Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium text-amber-700">Demo Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">Coming Soon</span>
            </div>
          </div>
          <Link href="/feedback">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <MessageCircle className="w-4 h-4 mr-2" />
              Share Feedback
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

/* ───────── ✅ UPDATED: Progressive Disclosure for Features Component ───────── */
const ProgressiveFeatureDisclosure = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Production Ready Features */}
      <Card className="border-green-200/50 bg-gradient-to-br from-green-50/90 via-emerald-50/90 to-green-50/90 backdrop-blur-xl shadow-2xl shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden group">
        <div className="p-8 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-600/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-2xl">🎯 Production Ready</h3>
                <p className="text-green-600 font-medium">Full functionality with real data</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-green-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-green-800">Trip Creation & Management</div>
                  <div className="text-sm text-green-600">Create, invite members, manage roles</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-green-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-green-800">Smart Expense Splitting</div>
                  <div className="text-sm text-green-600">Auto-calculations, settlements, payments</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-green-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-lime-600 rounded-xl flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-green-800">Collaborative Checklists</div>
                  <div className="text-sm text-green-600">Real-time updates, priority management</div>
                </div>
              </div>

              {/* ✅ AI Itinerary Planner */}
              <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-green-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-green-800">AI Itinerary Planner</div>
                  <div className="text-sm text-green-600">Personalized day-by-day planning</div>
                </div>
              </div>
            </div>
            
            <Link href="/trips">
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 h-14 text-lg font-semibold rounded-2xl">
                <Sparkles className="w-5 h-5 mr-3" />
                Explore Live Features
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* ✅ UPDATED: Preview & Upcoming Features */}
      <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50/90 via-orange-50/90 to-amber-50/90 backdrop-blur-xl shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden group">
        <div className="p-8 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-600/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-2xl">🚀 Coming Soon</h3>
                <p className="text-amber-600 font-medium">Preview features & roadmap</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              {/* ✅ UPDATED: Vendor Marketplace - Demo Status */}
              <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-amber-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-cyan-800">Vendor Marketplace</div>
                  <div className="text-sm text-cyan-600">Browse services with demo data</div>
                </div>
                <Badge className="bg-cyan-200 text-cyan-800 font-semibold px-3 py-1 rounded-full">Demo</Badge>
              </div>

              {/* ✅ UPDATED: Smart Engine */}
              <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-amber-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-amber-800">Smart Engine</div>
                  <div className="text-sm text-amber-600">Recommendations based on preferences</div>
                </div>
                <Badge className="bg-amber-200 text-amber-800 font-semibold px-3 py-1 rounded-full">Demo</Badge>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-amber-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-blue-800">Group Communication</div>
                  <div className="text-sm text-blue-600">WhatsApp-style chat integration</div>
                </div>
                <Badge className="bg-blue-200 text-blue-800 font-semibold px-3 py-1 rounded-full">Next Month</Badge>
              </div>

              {/* ✅ NEW: AI Trip Recommendations */}
              <div className="flex items-center gap-4 p-4 bg-white/70 rounded-2xl border border-amber-200/50 hover:bg-white/90 transition-all duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-purple-800">AI Trip Recommendations</div>
                  <div className="text-sm text-purple-600">Advanced AI-powered trip suggestions</div>
                </div>
                <Badge className="bg-purple-200 text-purple-800 font-semibold px-3 py-1 rounded-full">Coming Soon</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <Link href="/recommendations">
                <Button variant="outline" className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 h-12 text-base font-semibold rounded-2xl">
                  <Beaker className="w-5 h-5 mr-3" />
                  Try Demo Features
                </Button>
              </Link>
              <Link href="/feedback">
                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xl h-12 text-base font-semibold rounded-2xl">
                  <Gift className="w-5 h-5 mr-3" />
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

/* ───────── ✅ UPDATED: Feature Roadmap Component ───────── */
const FeatureRoadmap = () => {
  const roadmapItems = [
    {
      feature: 'Group Communication',
      status: 'coming-soon',
      description: 'WhatsApp-style chat for seamless trip coordination',
      icon: MessageSquare,
      eta: 'Next Month',
      color: 'from-green-500 to-emerald-600',
      progress: 80
    },
    {
      feature: 'AI Trip Recommendations',
      status: 'research', 
      description: 'Advanced AI-powered destination and activity suggestions',
      icon: Brain,
      eta: 'Coming Soon',
      color: 'from-purple-500 to-pink-600',
      progress: 30
    },
    {
      feature: 'Enhanced Marketplace',
      status: 'in-development',
      description: 'Real vendor data and booking integration',
      icon: Store,
      eta: 'Based on Your Feedback',
      color: 'from-blue-500 to-indigo-600',
      progress: 45
    }
  ]

  return (
    <Card className="mb-12 bg-gradient-to-br from-indigo-50/90 via-purple-50/90 to-pink-50/90 backdrop-blur-xl border border-indigo-200/50 shadow-2xl shadow-indigo-500/10 rounded-3xl overflow-hidden">
      <div className="p-8 border-b border-indigo-200/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🗺️ Development Roadmap
            </h3>
            <p className="text-indigo-600 font-medium">Help us prioritize with your feedback</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="grid gap-6">
          {roadmapItems.map((item, index) => (
            <div key={index} className="group p-6 bg-white/70 rounded-2xl border border-indigo-200/50 hover:bg-white/90 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900 text-lg">{item.feature}</h4>
                    <Badge className={
                      item.status === 'coming-soon' ? 'bg-green-100 text-green-800 border-green-300' :
                      item.status === 'in-development' ? 'bg-blue-100 text-blue-800 border-blue-300' : 
                      'bg-purple-100 text-purple-800 border-purple-300'
                    }>
                      {item.eta}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{item.progress}%</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-2 hover:scale-105 transition-transform duration-200">
                  <Zap className="w-4 h-4 mr-2" />
                  Vote
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-indigo-200/50">
          <div className="flex items-center justify-between">
            <p className="text-indigo-700 font-medium">
              🎯 Your feedback drives our roadmap. Tell us what matters most to you!
            </p>
            <Link href="/feedback">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                <MessageCircle className="w-4 h-4 mr-2" />
                Influence Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ───────── lightweight carousel ───────── */
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
  const perView = 3
  const last = Math.max(1, items.length - perView + 1)

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">{title}</h2>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIndex((i)=>(i-1+last)%last)}
            className="w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform duration-200"
          >
            <ChevronLeft className="h-4 w-4"/>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIndex((i)=>(i+1)%last)}
            className="w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform duration-200"
          >
            <ChevronRight className="h-4 w-4"/>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
        >
          {items.map((item, i) => (
            <div key={i} className="w-1/3 px-3 flex-shrink-0">
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───────── ✅ MAIN: dashboard page ───────── */
export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState(false)

  /* ───── ✅ Token refresh ───── */
  const refreshToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST", 
        credentials: "include"
      })
      return response.ok
    } catch {
      return false
    }
  }

  /* ───── ✅ Get current user with retry logic ───── */
  const getCurrentUser = async (retry = false) => {
    try {
      setUserLoading(true)
      setUserError(false)
      
      console.log("[DASHBOARD] Fetching current user from /me endpoint...")
      const response = await fetch(`${BASE_URL}me/`, {
        credentials: "include"
      })

      // Handle 401/403 errors with token refresh
      if (!response.ok && (response.status === 401 || response.status === 403) && !retry) {
        console.log("[DASHBOARD] Auth error, attempting token refresh...")
        if (await refreshToken()) {
          console.log("[DASHBOARD] Token refreshed, retrying getCurrentUser...")
          return getCurrentUser(true)
        } else {
          console.error("[DASHBOARD] Token refresh failed")
          setUserError(true)
          return
        }
      }

      if (response.ok) {
        const userData = await response.json()
        console.log("[DASHBOARD] Current user data:", userData)
        setCurrentUser(userData)
        setUserError(false)
      } else {
        console.error("[DASHBOARD] Failed to fetch current user:", {
          status: response.status,
          statusText: response.statusText,
          retry: retry
        })
        setUserError(true)
      }
    } catch (error) {
      console.error("[DASHBOARD] Error fetching current user:", {
        error: error.message,
        retry: retry
      })
      setUserError(true)
    } finally {
      setUserLoading(false)
    }
  }

  const retryGetUser = () => {
    getCurrentUser()
  }

  useEffect(() => {
    getCurrentUser()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50">
      <DashboardShell>
        {/* ✅ User Greeting */}
        <div className="container mx-auto px-6 pt-8">
          <UserGreeting 
            user={currentUser} 
            loading={userLoading} 
            error={userError} 
            onRetry={retryGetUser} 
          />
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-8 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Your Travel Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
            Discover amazing destinations, plan your perfect trip, and create unforgettable memories with friends.
          </p>
          <Link href="/create-trip">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-10 py-8 text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 rounded-2xl">
              <Plus className="h-6 w-6 mr-3"/> Create Your Dream Trip
            </Button>
          </Link>
        </div>

        <div className="container mx-auto px-6 pb-20">
          {/* ✅ Enhanced Components */}
          <DashboardStatusCards />
          <ProgressiveFeatureDisclosure />
          <FeatureRoadmap />

          {/* Enhanced Carousels */}
          <Carousel
            items={mockDestinations}
            title={<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">🌟 Popular Destinations</span>}
            renderItem={(d) => (
              <Card className="group relative overflow-hidden
                             bg-white/90 backdrop-blur-sm border border-gray-200/50
                             shadow-xl shadow-blue-500/5
                             transition-all duration-500 ease-out
                             hover:shadow-2xl hover:shadow-blue-500/15
                             hover:border-blue-300/50
                             hover:-translate-y-3 hover:scale-105
                             rounded-2xl
                             before:absolute before:inset-0 before:bg-gradient-to-r 
                             before:from-blue-600/0 before:via-indigo-600/0 before:to-purple-600/0
                             before:opacity-0 before:transition-opacity before:duration-500
                             hover:before:opacity-10
                             after:absolute after:inset-0 after:bg-gradient-to-br
                             after:from-transparent after:via-white/5 after:to-transparent
                             after:opacity-0 after:transition-opacity after:duration-500
                             hover:after:opacity-100">
                <div className="relative z-10">
                  <img src={d.image} alt={d.name} className="w-full h-48 object-cover rounded-t-2xl"/>
                  <div className="p-5">
                    <div className="flex justify-between mb-3">
                      <h3 className="font-bold text-lg">{d.name}</h3>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500 fill-current"/>
                        <span className="ml-1 text-sm font-semibold">{d.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{d.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Clock className="h-4 w-4"/>
                        <span className="text-sm font-medium">{d.duration}</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 font-bold px-3 py-1">{d.price}</Badge>
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
                             shadow-xl shadow-emerald-500/5
                             transition-all duration-500 ease-out
                             hover:shadow-2xl hover:shadow-emerald-500/15
                             hover:border-emerald-300/50
                             hover:-translate-y-3 hover:scale-105
                             rounded-2xl
                             before:absolute before:inset-0 before:bg-gradient-to-r 
                             before:from-emerald-600/0 before:via-teal-600/0 before:to-green-600/0
                             before:opacity-0 before:transition-opacity before:duration-500
                             hover:before:opacity-10">
                <div className="relative z-10">
                  <img src={h.image} alt={h.name} className="w-full h-48 object-cover rounded-t-2xl"/>
                  <div className="p-5">
                    <div className="flex justify-between mb-3">
                      <h3 className="font-bold text-lg">{h.name}</h3>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500 fill-current"/>
                        <span className="ml-1 text-sm font-semibold">{h.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center mb-4 text-gray-600">
                      <MapPin className="h-4 w-4 text-emerald-600 mr-2"/>
                      <span className="text-sm font-medium">{h.location}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {h.amenities.slice(0,2).map(a=>
                          <Badge key={a} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">{a}</Badge>
                        )}
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 font-bold px-3 py-1">{h.price}</Badge>
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
                             shadow-xl shadow-purple-500/5
                             transition-all duration-500 ease-out
                             hover:shadow-2xl hover:shadow-purple-500/15
                             hover:border-purple-300/50
                             hover:-translate-y-3 hover:scale-105
                             rounded-2xl
                             before:absolute before:inset-0 before:bg-gradient-to-r 
                             before:from-purple-600/0 before:via-pink-600/0 before:to-purple-600/0
                             before:opacity-0 before:transition-opacity before:duration-500
                             hover:before:opacity-10">
                <div className="relative z-10">
                  <img src={a.image} alt={a.name} className="w-full h-48 object-cover rounded-t-2xl"/>
                  <div className="p-5">
                    <div className="flex justify-between mb-3">
                      <h3 className="font-bold text-lg">{a.name}</h3>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500 fill-current"/>
                        <span className="ml-1 text-sm font-semibold">{a.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between mb-4">
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">{a.category}</Badge>
                      <div className="flex items-center text-purple-600">
                        <Clock className="h-4 w-4 mr-1"/>
                        <span className="text-sm font-medium">{a.duration}</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 font-bold px-3 py-1">{a.price}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          />
        </div>
        
        {/* ✅ Enhanced Floating Feedback Button */}
        <Link href="/feedback">
          <Button className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-110 transition-all duration-300 rounded-full w-16 h-16 border-4 border-white/20">
            <MessageCircle className="w-7 h-7" />
          </Button>
        </Link>
      </DashboardShell>
    </div>
  )
}
