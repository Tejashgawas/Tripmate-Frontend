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
  User, Mail, Phone, MapPin, FileText, 
  Loader2, CheckCircle, AlertTriangle, 
  Sparkles, Crown, ArrowLeft, Save,
  Building, Globe, Star
} from 'lucide-react'
import { toast } from 'sonner'

const FIELDS = [
  { 
    id: 'name', 
    label: 'Business / Service Name', 
    placeholder: 'Enter your business or service name',
    icon: Building,
    required: true,
    maxLength: 100
  },
  { 
    id: 'contact_email', 
    label: 'Contact Email', 
    placeholder: 'business@example.com',
    type: 'email',
    icon: Mail,
    required: true,
    maxLength: 150
  },
  { 
    id: 'contact_phone', 
    label: 'Contact Phone', 
    placeholder: '+91 12345 67890',
    type: 'tel',
    icon: Phone,
    required: true,
    maxLength: 20
  },
  { 
    id: 'location', 
    label: 'Service Location', 
    placeholder: 'City, State, Country',
    icon: MapPin,
    required: true,
    maxLength: 200
  },
  { 
    id: 'website', 
    label: 'Website (Optional)', 
    placeholder: 'https://yourwebsite.com',
    type: 'url',
    icon: Globe,
    required: false,
    maxLength: 200
  },
  { 
    id: 'description', 
    label: 'Business Description', 
    placeholder: 'Describe your services, specialties, and what makes your business unique...',
    textarea: true, 
    icon: FileText,
    required: true,
    maxLength: 1000,
    minLength: 50
  }
] as const

interface FormData {
  name: string
  contact_email: string
  contact_phone: string
  location: string
  website?: string
  description: string
}

interface FormErrors {
  [key: string]: string
}

export default function ProviderProfileSetup() {
  const router = useRouter()
  const { user, refreshUser } = useAuth() // ✅ NEW: Use auth context
  const { post, loading: apiLoading } = useApi() // ✅ NEW: Use API client
  
  const [form, setForm] = useState<FormData>({
    name: '',
    contact_email: user?.email || '',
    contact_phone: '',
    location: '',
    website: '',
    description: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // ✅ REMOVED: Manual fetch logic

  // Pre-fill email from user context
  useEffect(() => {
    if (user?.email && !form.contact_email) {
      setForm(prev => ({ ...prev, contact_email: user.email }))
    }
  }, [user])

  const validateField = (id: string, value: string): string => {
    const field = FIELDS.find(f => f.id === id)
    if (!field) return ''

    if (field.required && !value.trim()) {
      return `${field.label} is required`
    }

    if (value && field.maxLength && value.length > field.maxLength) {
      return `${field.label} must be less than ${field.maxLength} characters`
    }

    if (value && field.minLength && value.length < field.minLength) {
      return `${field.label} must be at least ${field.minLength} characters`
    }

    if (field.type === 'email' && value && !isValidEmail(value)) {
      return 'Please enter a valid email address'
    }

    if (field.type === 'url' && value && !isValidUrl(value)) {
      return 'Please enter a valid website URL'
    }

    if (field.type === 'tel' && value && !isValidPhone(value)) {
      return 'Please enter a valid phone number'
    }

    return ''
  }

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isValidPhone = (phone: string): boolean => {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    FIELDS.forEach(field => {
      const error = validateField(field.id, form[field.id as keyof FormData] || '')
      if (error) {
        newErrors[field.id] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors below')
      return
    }

    setLoading(true)

    try {
      console.log('[PROVIDER-SETUP] Submitting profile:', form)
      
      // Clean form data
      const submitData = {
        ...form,
        website: form.website?.trim() || undefined
      }

      await post('/me/provider-profile', submitData)
      
      // Refresh user context to get updated profile
      if (refreshUser) {
        await refreshUser()
      }

      setShowSuccess(true)
      toast.success('Profile saved successfully! 🎉')
      
      // Wait for success animation, then navigate
      setTimeout(() => {
        router.replace('/provider')
      }, 2000)
      
    } catch (error) {
      console.error('[PROVIDER-SETUP] Error saving profile:', error)
      toast.error('Could not save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-gray-900 dark:to-emerald-950 p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-green-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <Card className="relative w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl p-8 text-center rounded-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
            Profile Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your provider profile has been saved successfully. Redirecting to your dashboard...
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="mx-auto max-w-xs sm:max-w-2xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8 p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 w-10 h-10 sm:w-12 sm:h-12 p-2 sm:p-3"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              
              <div className="flex items-center gap-4 sm:gap-6 flex-1">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Complete Your Profile
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                    Set up your provider profile to start offering services
                  </p>
                </div>
              </div>

              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-md">
                <Star className="w-3 h-3 mr-1" />
                Provider
              </Badge>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-2xl rounded-xl sm:rounded-2xl">
            <form className="p-6 sm:p-8 space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
              {FIELDS.map((field) => {
                const Icon = field.icon
                const hasError = !!errors[field.id]
                const value = form[field.id as keyof FormData] || ''

                return (
                  <div key={field.id} className="space-y-2 sm:space-y-3">
                    <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {field.textarea ? (
                      <Textarea
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        maxLength={field.maxLength}
                        className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 transition-all duration-300 h-32 sm:h-40 text-sm sm:text-base ${
                          hasError 
                            ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400' 
                            : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                        }`}
                      />
                    ) : (
                      <Input
                        type={field.type || 'text'}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base ${
                          hasError 
                            ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400' 
                            : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                        }`}
                      />
                    )}

                    {/* Character count for description */}
                    {field.textarea && field.maxLength && (
                      <div className="flex justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span></span>
                        <span className={value.length > field.maxLength * 0.9 ? 'text-orange-500' : ''}>
                          {value.length}/{field.maxLength}
                        </span>
                      </div>
                    )}

                    {/* Error message */}
                    {hasError && (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs sm:text-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {errors[field.id]}
                      </div>
                    )}

                    {/* Help text for specific fields */}
                    {field.id === 'description' && !hasError && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Describe your services, specialties, and what makes your business unique. This helps travelers find and choose your services.
                      </p>
                    )}
                  </div>
                )
              })}

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-12 sm:h-14 text-base sm:text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-3" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                      Complete Profile Setup
                    </>
                  )}
                </Button>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-3 sm:mt-4">
                  Your profile information helps travelers find and connect with your services
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
