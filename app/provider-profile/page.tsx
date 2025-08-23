"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, Mail, Phone, MapPin, FileText, Edit3, Save, 
  X, Loader2, CheckCircle, AlertTriangle, ArrowLeft,
  Sparkles, Crown, Building, Globe, Calendar, Plus, 
  Package, Menu, Shield
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import AvatarMenu from '@/components/avatar-menu'

// Types
interface ProviderProfile {
  id: number
  name: string
  contact_email: string
  contact_phone: string
  location: string
  description: string
}

interface FormErrors {
  [key: string]: string
}

type Role = 'general' | 'provider' | 'admin'

// Provider Header Component
function ProviderHeader() {
  const { user, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const role = user?.role as Role || 'general'

  if (loading) {
    return (
      <header className="sticky top-0 z-50 h-14 sm:h-16 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="w-24 h-6 sm:w-28 sm:h-7 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded animate-pulse"></div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-16 h-8 sm:w-20 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  const home = role === 'provider' ? '/provider' : role === 'admin' ? '/admin' : '/dashboard'

  const getRoleIcon = (userRole: string) => {
    switch (userRole) {
      case 'admin': return <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
      case 'provider': return <Package className="w-3 h-3 sm:w-4 sm:h-4" />
      default: return <User className="w-3 h-3 sm:w-4 sm:h-4" />
    }
  }

  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'admin': return 'from-yellow-500 to-orange-600'
      case 'provider': return 'from-purple-500 to-indigo-600'
      default: return 'from-blue-500 to-cyan-600'
    }
  }

  const getActionButton = () => {
    switch (role) {
      case 'provider':
        return (
          <Link href="/provider/create-service">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 px-3 sm:px-4 py-2 h-8 sm:h-10"
            >
              <Package className="h-3 h-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-sm">Create Service</span>
              <span className="sm:hidden text-xs">Service</span>
            </Button>
          </Link>
        )
      case 'general':
        return (
          <Link href="/create-trip">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 px-3 sm:px-4 py-2 h-8 sm:h-10"
            >
              <MapPin className="h-3 h-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-sm">Create Trip</span>
              <span className="sm:hidden text-xs">Trip</span>
            </Button>
          </Link>
        )
      case 'admin':
        return (
          <Link href="/admin/overview">
            <Button 
              size="sm" 
              variant="outline"
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 flex items-center gap-2 px-3 sm:px-4 py-2 h-8 sm:h-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
            >
              <Shield className="h-3 h-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-sm">Admin Panel</span>
              <span className="sm:hidden text-xs">Admin</span>
            </Button>
          </Link>
        )
      default:
        return null
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 h-14 sm:h-16 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href={home} className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                  TripMate
                </span>
                {user && (
                  <div className="hidden sm:flex items-center gap-1">
                    <Badge className={`bg-gradient-to-r ${getRoleColor(role)} text-white border-0 text-xs px-1.5 py-0.5 shadow-sm`}>
                      {getRoleIcon(role)}
                      <span className="ml-1 capitalize">{role}</span>
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {getActionButton()}
            <AvatarMenu />
          </div>

          <div className="md:hidden flex items-center gap-2">
            {user && (
              <Badge className={`bg-gradient-to-r ${getRoleColor(role)} text-white border-0 text-xs px-2 py-1 shadow-sm`}>
                {getRoleIcon(role)}
                <span className="ml-1 capitalize">{role}</span>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-14 right-0 w-64 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="p-4 space-y-4">
              {user && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-white">
                        {user.username?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {user.username || 'User'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {getActionButton()}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href={home}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {role === 'admin' ? 'Admin Dashboard' : role === 'provider' ? 'Provider Dashboard' : 'Dashboard'}
                  </span>
                </Link>
                <Link 
                  href="/provider-profile" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function ProviderProfilePage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { get, put, loading: apiLoading, error: apiError } = useApi()

  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ProviderProfile | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  // Fetch provider profile using new API system
  const fetchProfile = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'provider') {
      router.push('/dashboard')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('[PROVIDER-PROFILE] Fetching provider profile')
      
      const data = await get<ProviderProfile>('/me/get-provider')
      setProfile(data)
      setForm(data)
    } catch (error) {
      console.error('[PROVIDER-PROFILE] Error fetching profile:', error)
      setError('Failed to load provider profile')
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // Validate form fields
  const validateForm = (): boolean => {
    if (!form) return false
    
    const newErrors: FormErrors = {}

    if (!form.name?.trim()) {
      newErrors.name = 'Name is required'
    } else if (form.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (form.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters'
    }

    if (!form.contact_phone?.trim()) {
      newErrors.contact_phone = 'Phone number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(form.contact_phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.contact_phone = 'Please enter a valid phone number'
    }

    if (!form.location?.trim()) {
      newErrors.location = 'Location is required'
    } else if (form.location.length < 2) {
      newErrors.location = 'Location must be at least 2 characters'
    }

    if (!form.description?.trim()) {
      newErrors.description = 'Description is required'
    } else if (form.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    } else if (form.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form field changes
  const handleChange = (field: keyof ProviderProfile, value: string) => {
    if (!form) return
    
    setForm({ ...form, [field]: value })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Save provider profile using new API system
  const handleSave = async () => {
    if (!form || !validateForm()) {
      toast.error('Please fix the errors below')
      return
    }

    try {
      setSaving(true)
      console.log('[PROVIDER-PROFILE] Updating profile:', form)
      
      await put('/me/provider-profile', form)
      
      if (refreshUser) {
        await refreshUser()
      }

      setProfile(form)
      setEditing(false)
      toast.success('Profile updated successfully! 🎉')
    } catch (error) {
      console.error('[PROVIDER-PROFILE] Error updating profile:', error)
      toast.error('Failed to update profile')
      setError('Failed to save profile changes')
    } finally {
      setSaving(false)
    }
  }

  // Cancel editing
  const handleCancel = () => {
    setForm(profile)
    setEditing(false)
    setErrors({})
    setError(null)
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  // Loading state
  if (loading) {
    return (
      <>
        <ProviderHeader />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Loading Profile</h2>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your information...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* ✅ ADDED: Provider Header */}
      <ProviderHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 p-4 sm:p-6">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 max-w-xs sm:max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-4 sm:mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <Link href="/provider" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Provider
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">Profile</span>
          </nav>

          {/* Header */}
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Provider Profile
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                    Manage your provider information and details
                  </p>
                </div>
              </div>
              
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-md">
                <Crown className="w-3 h-3 mr-1" />
                Provider
              </Badge>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg sm:rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-800 dark:text-red-400 text-sm sm:text-base">{error}</p>
              </div>
              <Button
                onClick={() => setError(null)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Profile Form */}
          {profile && form ? (
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-2xl rounded-xl sm:rounded-2xl">
              <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                      <Building className="w-4 h-4 inline mr-2" />
                      Business / Service Name *
                    </label>
                    <Input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter your business or service name"
                      disabled={!editing}
                      className={`h-10 sm:h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 transition-all duration-300 text-sm sm:text-base ${
                        errors.name 
                          ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400' 
                          : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                      }`}
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field (Read-only) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Contact Email
                    </label>
                    <Input
                      type="email"
                      value={form.contact_email}
                      disabled
                      className="h-10 sm:h-12 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed text-sm sm:text-base"
                    />
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Email cannot be changed from this page
                    </p>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Contact Phone *
                    </label>
                    <Input
                      type="tel"
                      value={form.contact_phone}
                      onChange={(e) => handleChange('contact_phone', e.target.value)}
                      placeholder="+91 12345 67890"
                      disabled={!editing}
                      className={`h-10 sm:h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 transition-all duration-300 text-sm sm:text-base ${
                        errors.contact_phone 
                          ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400' 
                          : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                      }`}
                      required
                    />
                    {errors.contact_phone && (
                      <p className="mt-1 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.contact_phone}
                      </p>
                    )}
                  </div>

                  {/* Location Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Service Location *
                    </label>
                    <Input
                      type="text"
                      value={form.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="City, State, Country"
                      disabled={!editing}
                      className={`h-10 sm:h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 transition-all duration-300 text-sm sm:text-base ${
                        errors.location 
                          ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400' 
                          : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                      }`}
                      required
                    />
                    {errors.location && (
                      <p className="mt-1 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Business Description *
                    </label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Describe your services, specialties, and what makes your business unique..."
                      rows={6}
                      disabled={!editing}
                      className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 transition-all duration-300 resize-none text-sm sm:text-base ${
                        errors.description 
                          ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400' 
                          : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                      }`}
                      required
                    />
                    <div className="flex justify-between mt-1">
                      <div>
                        {errors.description && (
                          <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {errors.description}
                          </p>
                        )}
                      </div>
                      <p className={`text-xs sm:text-sm ${
                        form.description.length > 900 ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {form.description.length}/1000
                      </p>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Profile Status</span>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                      Your provider profile is active. This information helps travelers find and connect with your services.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {editing ? (
                      <>
                        <Button
                          type="button"
                          onClick={handleCancel}
                          disabled={saving}
                          variant="outline"
                          className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 h-10 sm:h-12 disabled:opacity-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={saving || Object.keys(errors).length > 0}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 px-6 sm:px-8"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-2xl rounded-xl sm:rounded-2xl">
              <div className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                  Profile Not Found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  We couldn't find your provider profile. You may need to set up your provider information first.
                </p>
                <Button
                  onClick={() => router.push('/provider/profile-setup')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 px-6 sm:px-8"
                >
                  <User className="w-4 h-4 mr-2" />
                  Set Up Profile
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
