"use client"

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Users, 
  Target, 
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Crown,
  Zap,
  MessageSquare,
  Shield,
  Calendar,
  BarChart3,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Package,
  MapPin
} from 'lucide-react'
import ProviderProfileBanner from '@/components/ProviderProfileBanner'
import { Button } from '@/components/ui/button'

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

/* ── Response shapes ───────────────────────────────── */
interface CountRes { total_services: number }
interface RecItem { service_type: string; recommendation_count: number }
interface SelectedItem { service_type: string; selected_count: number; most_common_rank: number }
interface CountByTypeItem { service_type: string; count: number }

type Stats = {
  total: number
  rec: RecItem[]
  selected: SelectedItem[]
  typeCount: CountByTypeItem[]
}

/* ── Main Component ─────────────────────────────────────── */
export default function ProviderHome() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth() // ✅ NEW: Use auth context
  const { get, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client
  
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // ✅ REMOVED: BASE_URL, fetchWithRetry, fetchMe imports and functions

  /* Check auth and fetch analytics using new system */
  const fetchAnalytics = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'provider') {
      router.push('/dashboard')
      return
    }

    try {
      setIsLoading(true)
      console.log('[PROVIDER] Fetching analytics data')

      // Use Promise.all with the new API system
      const [totalRes, recRes, selRes, countRes] = await Promise.all([
        get<CountRes>('/providers/services/count'),
        get<RecItem[]>('/providers/recommended-services'),
        get<SelectedItem[]>('/providers/selected-services/by-type'),
        get<CountByTypeItem[]>('/providers/services/count-by-type'),
      ])

      const data: Stats = {
        total: totalRes.total_services,
        rec: recRes,
        selected: selRes,
        typeCount: countRes,
      }

      setStats(data)
      setError(false)
    } catch (err) {
      console.error('[PROVIDER] Error fetching analytics:', err)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  useEffect(() => {
    if (user && !authLoading) {
      fetchAnalytics()
    }
  }, [user, authLoading])

  // Show loading while auth is loading
  if (authLoading) {
    return <LoadingSkeleton />
  }

  // Redirect if not provider
  if (user && user.role !== 'provider') {
    router.push('/dashboard')
    return null
  }

  if (error) return <ErrorState onRetry={handleRefresh} />
  if (!stats) return <LoadingSkeleton />

  const totalRecommendations = stats.rec.reduce((sum, item) => sum + item.recommendation_count, 0)
  const totalSelections = stats.selected.reduce((sum, item) => sum + item.selected_count, 0)
  const conversionRate = totalRecommendations > 0 ? (totalSelections / totalRecommendations * 100) : 0

  // Enhanced chart configurations
  const pieData = {
    labels: stats.typeCount.map((i: CountByTypeItem) => i.service_type),
    datasets: [{
      data: stats.typeCount.map((i: CountByTypeItem) => i.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)', 
        'rgba(245, 101, 101, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 101, 101)',
        'rgb(251, 191, 36)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)'
      ],
      borderWidth: 2,
      hoverOffset: 8
    }]
  }

  const barData = {
    labels: stats.rec.map((i: RecItem) => i.service_type),
    datasets: [{
      label: 'Recommendations',
      data: stats.rec.map((i: RecItem) => i.recommendation_count),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: { size: 11, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 mb-6 sm:mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                  Provider Dashboard
                  <Sparkles className="inline-block ml-2 w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                </h1>
                <p className="text-blue-100 text-sm sm:text-lg opacity-90">
                  Transform your business with data-driven insights
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-10 sm:h-12 px-4 sm:px-6"
                >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <div className="hidden sm:flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                    <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProviderProfileBanner />

        {/* Enhanced Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <MetricCard 
            title="Total Services" 
            value={stats.total} 
            icon={Target}
            gradient="from-blue-500 to-cyan-500"
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard 
            title="Recommendations" 
            value={totalRecommendations} 
            icon={Star}
            gradient="from-emerald-500 to-teal-500"
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard 
            title="Selections" 
            value={totalSelections} 
            icon={Users}
            gradient="from-purple-500 to-pink-500"
            trend={{ value: 15, isPositive: true }}
          />
          <MetricCard 
            title="Conversion Rate" 
            value={Math.round(conversionRate)}
            suffix="%"
            icon={Award}
            gradient="from-orange-500 to-red-500"
            trend={{ value: 3, isPositive: false }}
          />
        </section>

        {/* Enhanced Charts Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12">
          <ChartCard 
            title="Services Distribution" 
            subtitle="Breakdown by service categories"
            icon={BarChart3}
          >
            <div className="h-64 sm:h-80">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </ChartCard>
          
          <ChartCard 
            title="Recommendation Performance" 
            subtitle="Most recommended service types"
            icon={TrendingUp}
          >
            <div className="h-64 sm:h-80">
              <Bar data={barData} options={{
                ...chartOptions,
                plugins: { ...chartOptions.plugins, legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#64748b', font: { size: 10 } }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 10 } }
                  }
                }
              }} />
            </div>
          </ChartCard>
        </section>

        {/* Performance Insights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <InsightCard
            title="Top Performer"
            value={stats.rec.length > 0 ? stats.rec[0].service_type : "N/A"}
            subtitle="Most recommended service"
            icon={Crown}
            color="text-yellow-500"
            bgColor="bg-yellow-50 dark:bg-yellow-950/20"
          />
          <InsightCard
            title="Growth Opportunity"
            value={stats.typeCount.length > 1 ? stats.typeCount[1].service_type : "N/A"}
            subtitle="Potential for expansion"
            icon={Zap}
            color="text-green-500"
            bgColor="bg-green-50 dark:bg-green-950/20"
          />
          <InsightCard
            title="Market Position"
            value="Premium"
            subtitle="Based on selection ratio"
            icon={Shield}
            color="text-blue-500"
            bgColor="bg-blue-50 dark:bg-blue-950/20"
          />
        </section>

        {/* Enhanced Roadmap */}
        <section className="relative">
          <div className="bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-700/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center mb-4 sm:mb-6">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-3" />
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Exciting Features Coming Soon
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: MessageSquare, title: "In-app messaging with travellers", status: "In Development" },
                { icon: Shield, title: "Verification badge for trusted providers", status: "Beta Testing" },
                { icon: BarChart3, title: "Integrated bookings & revenue analytics", status: "Planning" },
                { icon: Sparkles, title: "Advanced feedback centre for new-service ideas", status: "Research" }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/30 dark:border-slate-600/30 hover:shadow-lg transition-all duration-300">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex-shrink-0">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">{item.title}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ── Enhanced Components ─────────────────────────────────────── */
function MetricCard({ 
  title, 
  value, 
  suffix = '', 
  icon: Icon, 
  gradient, 
  trend 
}: { 
  title: string
  value: number
  suffix?: string
  icon: any
  gradient: string
  trend?: { value: number; isPositive: boolean }
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}></div>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="text-xs sm:text-sm font-medium">{trend.value}%</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {value.toLocaleString()}{suffix}
          </p>
        </div>
      </div>
    </div>
  )
}

function ChartCard({ 
  title, 
  subtitle, 
  children, 
  icon: Icon 
}: { 
  title: string
  subtitle: string
  children: ReactNode
  icon: any
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function InsightCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  bgColor 
}: { 
  title: string
  value: string
  subtitle: string
  icon: any
  color: string
  bgColor: string
}) {
  return (
    <div className={`${bgColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/30 dark:border-slate-600/30`}>
      <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{title}</h3>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-indigo-950/20 p-4 sm:p-6">
      <div className="animate-pulse space-y-6 sm:space-y-8">
        <div className="h-24 sm:h-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl sm:rounded-2xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 sm:h-32 bg-slate-200 dark:bg-slate-700 rounded-xl sm:rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 sm:h-96 bg-slate-200 dark:bg-slate-700 rounded-xl sm:rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50/30 p-4">
      <div className="text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-red-200/50 max-w-md w-full">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Unable to Load Analytics</h2>
        <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">Please check your connection and try again.</p>
        <Button 
          onClick={onRetry} 
          className="w-full bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  )
}
