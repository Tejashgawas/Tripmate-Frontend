'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Info
} from 'lucide-react';
import { BASE_URL, fetchWithRetry } from '@/lib/auth';

// Types
interface ServiceFormData {
  type: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  features: Record<string, any>;
  is_available: boolean;
}

interface FeatureItem {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'number' | 'boolean';
}

export default function CreateServicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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
  });

  // Features management
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // Add new feature
  const addFeature = () => {
    const newFeature: FeatureItem = {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text'
    };
    setFeatures([...features, newFeature]);
  };

  // Update feature
  const updateFeature = (id: string, field: keyof FeatureItem, value: any) => {
    setFeatures(features.map(feature => 
      feature.id === id ? { ...feature, [field]: value } : feature
    ));
  };

  // Remove feature
  const removeFeature = (id: string) => {
    setFeatures(features.filter(feature => feature.id !== id));
  };

  // Convert features array to object
  const getFeaturesObject = () => {
    const featuresObj: Record<string, any> = {};
    features.forEach(feature => {
      if (feature.key.trim()) {
        let value = feature.value;
        if (feature.type === 'number') value = Number(value);
        if (feature.type === 'boolean') value = value === 'true';
        featuresObj[feature.key] = value;
      }
    });
    return featuresObj;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const submitData = {
        ...formData,
        features: getFeaturesObject()
      };

      const response = await fetchWithRetry(`${BASE_URL}me/services`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create service: ${response.status}`);
      }

      // Success - redirect to services page
      router.push('/provider/services');
    } catch (err) {
      console.error('Error creating service:', err);
      setError(err instanceof Error ? err.message : 'Failed to create service');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation for each step
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.type.trim() && formData.title.trim();
      case 2:
        return formData.description.trim() && formData.location.trim();
      case 3:
        return formData.price >= 0 && formData.rating >= 0 && formData.rating <= 5;
      case 4:
        return true; // Features are optional
      default:
        return false;
    }
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/provider/services')}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center">
                  <Package className="mr-3 w-8 h-8" />
                  Create New Service
                </h1>
                <p className="text-blue-100 text-lg opacity-90">
                  Step {currentStep} of {totalSteps} - Build your perfect service offering
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const isValid = isStepValid(stepNum);
            
            return (
              <div key={stepNum} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : isValid
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }
                `}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`
                    w-20 h-1 mx-2 rounded-full transition-all duration-300
                    ${isCompleted ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}
                  `}></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>Basic Info</span>
          <span>Details</span>
          <span>Pricing</span>
          <span>Features</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-400">Error creating service</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Basic Information</h2>
                <p className="text-slate-600 dark:text-slate-400">Let's start with the fundamentals of your service</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Service Type *
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Tour Guide, Transportation, Accommodation"
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Give your service a catchy name"
                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Service Details</h2>
                <p className="text-slate-600 dark:text-slate-400">Describe what makes your service special</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed description of your service..."
                  rows={6}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg resize-none"
                  required
                />
                <p className="text-sm text-slate-500 mt-2">{formData.description.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Where is this service available?"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Rating */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pricing & Rating</h2>
                <p className="text-slate-600 dark:text-slate-400">Set your pricing and initial rating</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Initial Rating *
                  </label>
                  <div className="relative">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      placeholder="0.0"
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                      required
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Rating must be between 0 and 5</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="is_available" className="text-lg font-medium text-slate-700 dark:text-slate-300">
                  Service is available for booking
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Features */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Service Features</h2>
                <p className="text-slate-600 dark:text-slate-400">Add special features and amenities (optional)</p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Feature</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJsonPreview(!showJsonPreview)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  {showJsonPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>JSON Preview</span>
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {features.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">No features added yet. Click "Add Feature" to get started.</p>
                  </div>
                ) : (
                  features.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <input
                        type="text"
                        value={feature.key}
                        onChange={(e) => updateFeature(feature.id, 'key', e.target.value)}
                        placeholder="Feature name"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      
                      <select
                        value={feature.type}
                        onChange={(e) => updateFeature(feature.id, 'type', e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Yes/No</option>
                      </select>

                      {feature.type === 'boolean' ? (
                        <select
                          value={feature.value}
                          onChange={(e) => updateFeature(feature.id, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select...</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : (
                        <input
                          type={feature.type === 'number' ? 'number' : 'text'}
                          value={feature.value}
                          onChange={(e) => updateFeature(feature.id, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => removeFeature(feature.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* JSON Preview */}
              {showJsonPreview && (
                <div className="mt-6 p-4 bg-slate-900 rounded-xl">
                  <h3 className="text-white font-medium mb-3">JSON Preview:</h3>
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    {JSON.stringify(getFeaturesObject(), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-700/50">
          <div className="flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>Continue</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStepValid(currentStep)}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Service</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}