"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  DollarSign, 
  Star, 
  FileText, 
  Tag, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  Save,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  ArrowRight,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

// Types
interface ServiceFormData {
  type: string
  title: string
  description: string
  location: string
  price: number
  rating: number
  features: Record<string, any>
  is_available: boolean
}

interface FeatureItem {
  id: string
  key: string
  value: string
  type: 'text' | 'number' | 'boolean'
}

export default function CreateServicePage() {
  const router = useRouter()
  const { user } = useAuth() // ✅ NEW: Use auth context
  const { post, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const totalSteps = 4

  // Form data
  const [formData, setFormData] = useState<ServiceFormData>({
    type: '',
    title: '',
    description: '',
    location: '',
    price: 0,
    rating: 0,
    features: {},
    is_available: true
  })

  // Features management
  const [features, setFeatures] = useState<FeatureItem[]>([])
  const [showJsonPreview, setShowJsonPreview] = useState(false)

  // ✅ REMOVED: BASE_URL and fetchWithRetry

  // Add new feature
  const addFeature = () => {
    const newFeature: FeatureItem = {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text'
    }
    setFeatures([...features, newFeature])
  }

  // Update feature
  const updateFeature = (id: string, field: keyof FeatureItem, value: any) => {
    setFeatures(features.map(feature => 
      feature.id === id ? { ...feature, [field]: value } : feature
    ))
  }

  // Remove feature
  const removeFeature = (id: string) => {
    setFeatures(features.filter(feature => feature.id !== id))
  }

  // Convert features array to object
  const getFeaturesObject = () => {
    const featuresObj: Record<string, any> = {}
    features.forEach(feature => {
      if (feature.key.trim()) {
        let value = feature.value
        if (feature.type === 'number') value = Number(value)
        if (feature.type === 'boolean') value = value === 'true'
        featuresObj[feature.key] = value
      }
    })
    return featuresObj
  }

  // ✅ UPDATED: Handle form submission using new API system
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      console.log('[CREATE-SERVICE] Creating service:', formData)

      const submitData = {
        ...formData,
        features: getFeaturesObject()
      }

      await post('/me/services', submitData)
      
      // Show success state
      setShowSuccess(true)
      toast.success('Service created successfully! 🎉')
      
      // Navigate after showing success
      setTimeout(() => {
        router.push('/provider/services')
      }, 2000)
    } catch (err) {
      console.error('[CREATE-SERVICE] Error creating service:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create service'
      setError(errorMessage)
      toast.error('Failed to create service')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation for each step
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.type.trim() && formData.title.trim()
      case 2:
        return formData.description.trim() && formData.location.trim()
      case 3:
        return formData.price >= 0 && formData.rating >= 0 && formData.rating <= 5
      case 4:
        return true // Features are optional
      default:
        return false
    }
  }

  // Step navigation
  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Success Modal
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-gray-900 dark:to-emerald-950 p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-green-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <Card className="relative w-full max-w-xs sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl p-6 sm:p-8 text-center rounded-xl sm:rounded-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
            Service Created!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
            Your service has been created successfully. Redirecting to your services...
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-xs sm:max-w-4xl mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-4 sm:p-8 mb-6 sm:mb-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Button
                    onClick={() => router.push('/provider/services')}
                    variant="outline"
                    className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 w-10 h-10 sm:w-12 sm:h-12"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2 tracking-tight flex items-center">
                      <Package className="mr-2 sm:mr-3 w-6 h-6 sm:w-8 sm:h-8" />
                      Create Service
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-lg opacity-90">
                      Step {currentStep} of {totalSteps} - Build your perfect service
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNum = index + 1
                const isCompleted = stepNum < currentStep
                const isCurrent = stepNum === currentStep
                const isValid = isStepValid(stepNum)
                
                return (
                  <div key={stepNum} className="flex items-center">
                    <div className={`
                      w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : isValid
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }
                    `}>
                      {isCompleted ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : stepNum}
                    </div>
                    {index < totalSteps - 1 && (
                      <div className={`
                        w-12 sm:w-20 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-300
                        ${isCompleted ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}
                      `}></div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-4 gap-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">
              <span>Basic</span>
              <span>Details</span>
              <span>Pricing</span>
              <span>Features</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg sm:rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-800 dark:text-red-400 text-sm sm:text-base">Error creating service</p>
                <p className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</p>
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

          {/* Form Content */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-0 overflow-hidden">
            <div className="p-4 sm:p-8">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Basic Information</h2>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Let's start with the fundamentals of your service</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
                        Service Type *
                      </label>
                      <Input
                        type="text"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="e.g., Tour Guide, Transportation"
                        className="h-10 sm:h-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
                        Service Title *
                      </label>
                      <Input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Give your service a catchy name"
                        className="h-10 sm:h-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Service Details</h2>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Describe what makes your service special</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
                      Description *
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Provide a detailed description of your service..."
                      rows={6}
                      className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base resize-none"
                      required
                    />
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">{formData.description.length}/500 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      <Input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Where is this service available?"
                        className="h-10 sm:h-12 pl-10 sm:pl-12 pr-3 sm:pr-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Rating */}
              {currentStep === 3 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Pricing & Rating</h2>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Set your pricing and initial rating</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
                        Price *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="h-10 sm:h-12 pl-10 sm:pl-12 pr-3 sm:pr-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
                        Initial Rating *
                      </label>
                      <div className="relative">
                        <Star className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <Input
                          type="number"
                          value={formData.rating}
                          onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                          placeholder="0.0"
                          min="0"
                          max="5"
                          step="0.1"
                          className="h-10 sm:h-12 pl-10 sm:pl-12 pr-3 sm:pr-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                          required
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mt-2">Rating must be between 0 and 5</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg sm:rounded-xl">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="is_available" className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
                      Service is available for booking
                    </label>
                  </div>
                </div>
              )}

              {/* Step 4: Features */}
              {currentStep === 4 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Service Features</h2>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Add special features and amenities (optional)</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <Button
                      type="button"
                      onClick={addFeature}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 px-4 sm:px-6"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setShowJsonPreview(!showJsonPreview)}
                      variant="outline"
                      className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 h-10 sm:h-12 px-4 sm:px-6"
                    >
                      {showJsonPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      JSON Preview
                    </Button>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                    {features.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 bg-slate-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl">
                        <Info className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">No features added yet. Click "Add Feature" to get started.</p>
                      </div>
                    ) : (
                      features.map((feature) => (
                        <div key={feature.id} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700 rounded-lg sm:rounded-xl">
                          <Input
                            type="text"
                            value={feature.key}
                            onChange={(e) => updateFeature(feature.id, 'key', e.target.value)}
                            placeholder="Feature name"
                            className="flex-1 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                          />
                          
                          <select
                            value={feature.type}
                            onChange={(e) => updateFeature(feature.id, 'type', e.target.value)}
                            className="w-full sm:w-auto px-3 py-2 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="boolean">Yes/No</option>
                          </select>

                          {feature.type === 'boolean' ? (
                            <select
                              value={feature.value}
                              onChange={(e) => updateFeature(feature.id, 'value', e.target.value)}
                              className="flex-1 px-3 py-2 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            >
                              <option value="">Select...</option>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <Input
                              type={feature.type === 'number' ? 'number' : 'text'}
                              value={feature.value}
                              onChange={(e) => updateFeature(feature.id, 'value', e.target.value)}
                              placeholder="Value"
                              className="flex-1 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            />
                          )}

                          <Button
                            type="button"
                            onClick={() => removeFeature(feature.id)}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-700 h-10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* JSON Preview */}
                  {showJsonPreview && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-900 rounded-lg sm:rounded-xl">
                      <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">JSON Preview:</h3>
                      <pre className="text-green-400 text-xs sm:text-sm overflow-x-auto">
                        {JSON.stringify(getFeaturesObject(), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-700/50">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
                <div>
                  {currentStep > 1 && (
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="w-full sm:w-auto bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 h-10 sm:h-12 px-4 sm:px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4">
                  {currentStep < totalSteps ? (
                    <Button
                      onClick={nextStep}
                      disabled={!isStepValid(currentStep)}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:transform-none h-10 sm:h-12 px-6 sm:px-8"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isStepValid(currentStep)}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:transform-none h-10 sm:h-12 px-6 sm:px-8"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Create Service
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
