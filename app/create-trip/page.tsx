"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, MapPin, IndianRupee, Sparkles, CheckCircle } from "lucide-react"

const questions = [
  {
    id: "title",
    question: "What would you like to call your adventure?",
    placeholder: "e.g., Summer Beach Getaway, Mountain Hiking Trip",
    type: "text",
    icon: Sparkles,
  },
  {
    id: "location",
    question: "Where are you dreaming of going?",
    placeholder: "e.g., Bali, Indonesia or Paris, France",
    type: "text",
    icon: MapPin,
  },
  {
    id: "start_date",
    question: "When does your journey begin?",
    placeholder: "",
    type: "date",
    icon: Calendar,
  },
  {
    id: "end_date",
    question: "When will you return from this adventure?",
    placeholder: "",
    type: "date",
    icon: Calendar,
  },
  {
    id: "budget",
    question: "What's your budget for this trip?",
    placeholder: "e.g., 1500",
    type: "number",
    icon: IndianRupee,
  },
  {
    id: "trip_type",
    question: "What kind of experience are you looking for?",
    placeholder: "",
    type: "select",
    options: [
      { value: "leisure", label: "Leisure & Relaxation" },
      { value: "adventure", label: "Adventure & Exploration" },
      { value: "workation", label: "Workation & Remote Work" },
      { value: "pilgrimage", label: "Pilgrimage & Spiritual" },
      { value: "cultural", label: "Cultural & Educational" },
      { value: "other", label: "Other" },
    ],
    icon: Sparkles,
  },
]

export default function CreateTrip() {
  const router = useRouter()
  const { user } = useAuth()
  const { post, loading: apiLoading, error: apiError } = useApi()

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    start_date: "",
    end_date: "",
    budget: "",
    trip_type: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [tripResponse, setTripResponse] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const canProceed = formData[currentQuestion.id] !== ""

  const handleInputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  const nextStep = () => {
    if (canProceed && !isLastStep) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!canProceed || !user) return

    setIsSubmitting(true)
    try {
      console.log("[CREATE-TRIP] Submitting trip data:", formData)

      const tripData = {
        ...formData,
        budget: Number.parseInt(formData.budget) || 0,
      }

      const result = await post("/trips/create-trip", tripData)
      
      console.log("[CREATE-TRIP] Trip created successfully:", result)
      setTripResponse(result)
      setShowSuccess(true)

    } catch (error) {
      console.error("[CREATE-TRIP] Error creating trip:", error)
      alert("Failed to create trip. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed) {
      if (isLastStep) {
        handleSubmit()
      } else {
        nextStep()
      }
    }
  }

  const resetForm = () => {
    setShowSuccess(false)
    setCurrentStep(0)
    setFormData({
      title: "",
      location: "",
      start_date: "",
      end_date: "",
      budget: "",
      trip_type: "",
    })
    setTripResponse(null)
  }

  if (showSuccess && tripResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center p-4">
        <Card className="max-w-sm sm:max-w-md w-full p-6 sm:p-8 text-center bg-background/80 backdrop-blur-sm border border-border/50 shadow-xl rounded-2xl sm:rounded-3xl">
          <div className="mb-4 sm:mb-6">
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
              Trip Successfully Created!
            </h2>
          </div>

          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trip:</span>
              <span className="font-semibold truncate ml-2">{tripResponse.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-semibold capitalize">{tripResponse.trip_type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-semibold truncate ml-2">{tripResponse.location}</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Link href="/dashboard">
              <Button className="w-full h-10 sm:h-12 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 text-white rounded-lg sm:rounded-xl">
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full h-10 sm:h-12 bg-transparent rounded-lg sm:rounded-xl"
              onClick={resetForm}
            >
              Create Another Trip
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-1 h-1 sm:w-2 sm:h-2 bg-[#1e40af]/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-[#06b6d4]/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-60 left-1/4 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#3b82f6]/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 sm:w-2 sm:h-2 bg-[#1e40af]/20 rounded-full animate-pulse delay-3000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex h-14 sm:h-16 items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-[#1e40af]/10 h-8 sm:h-10 px-2 sm:px-4">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Back</span>
            </Button>
          </Link>
          <Link href="/">
            <span className="font-sans text-xl sm:text-2xl font-black bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent tracking-tight">
              TripMate
            </span>
          </Link>
          <div className="w-16 sm:w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-12 max-w-xl sm:max-w-2xl">
        {/* Progress bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Step {currentStep + 1} of {questions.length}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
            <div
              className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-4 sm:p-8 bg-background/80 backdrop-blur-sm border border-border/50 shadow-xl rounded-2xl sm:rounded-3xl">
          <div className="text-center mb-6 sm:mb-8">
            <currentQuestion.icon className="h-8 w-8 sm:h-12 sm:w-12 text-[#1e40af] mx-auto mb-3 sm:mb-4" />
            <h1 className="text-lg sm:text-2xl font-bold mb-2 px-2">{currentQuestion.question}</h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2">Let's make your trip planning effortless</p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {currentQuestion.type === "text" && (
              <div>
                <Input
                  placeholder={currentQuestion.placeholder}
                  value={formData[currentQuestion.id]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-base sm:text-lg p-3 sm:p-4 h-12 sm:h-14 border-2 focus:border-[#1e40af] transition-colors rounded-lg sm:rounded-xl"
                  autoFocus
                />
              </div>
            )}

            {currentQuestion.type === "number" && (
              <div>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder={currentQuestion.placeholder}
                    value={formData[currentQuestion.id]}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-base sm:text-lg p-3 sm:p-4 pl-10 sm:pl-12 h-12 sm:h-14 border-2 focus:border-[#1e40af] transition-colors rounded-lg sm:rounded-xl"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {currentQuestion.type === "date" && (
              <div>
                <Input
                  type="date"
                  value={formData[currentQuestion.id]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="text-base sm:text-lg p-3 sm:p-4 h-12 sm:h-14 border-2 focus:border-[#1e40af] transition-colors rounded-lg sm:rounded-xl"
                  autoFocus
                />
              </div>
            )}

            {currentQuestion.type === "select" && (
              <div>
                <Select value={formData[currentQuestion.id]} onValueChange={handleInputChange}>
                  <SelectTrigger className="text-base sm:text-lg p-3 sm:p-4 h-12 sm:h-14 border-2 focus:border-[#1e40af] transition-colors rounded-lg sm:rounded-xl">
                    <SelectValue placeholder="Choose your trip type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-sm sm:text-base">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 sm:pt-6 gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="hover:bg-[#1e40af]/10 bg-transparent h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Previous
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 text-white h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Trip
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 text-white h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base"
                >
                  Next
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground px-4">💡 Tip: Press Enter to quickly move to the next question</p>
        </div>
      </div>
    </div>
  )
}
