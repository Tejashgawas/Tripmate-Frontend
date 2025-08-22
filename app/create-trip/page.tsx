"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, MapPin, IndianRupee, Sparkles, CheckCircle } from "lucide-react"
import AvatarMenu from "@/components/avatar-menu"
const BASE_URL = "https://tripmate-39hm.onrender.com/"

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

  const handleInputChange = (value) => {
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

  const refreshToken = async () => {
    try {
      console.log("[v0] Attempting to refresh token...")
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        console.log("[v0] Token refreshed successfully")
        return true
      } else {
        console.error("[v0] Token refresh failed:", response.status)
        return false
      }
    } catch (error) {
      console.error("[v0] Token refresh error:", error)
      return false
    }
  }

  const handleSubmit = async () => {
    if (!canProceed) return

    setIsSubmitting(true)
    try {
      console.log("[v0] Submitting trip data:", formData)

      const response = await fetch(`${BASE_URL}trips/create-trip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          budget: Number.parseInt(formData.budget) || 0,
        }),
      })

      console.log("[v0] Create trip response status:", response.status)
      console.log("[v0] Create trip response ok:", response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Trip created successfully")
        setTripResponse(result)
        setShowSuccess(true)
      } else if (response.status === 401 || response.status === 403) {
        console.log("[v0] Authorization failed, attempting token refresh...")
        const refreshSuccess = await refreshToken()

        if (refreshSuccess) {
          console.log("[v0] Retrying trip creation after token refresh...")
          // Retry the original request
          const retryResponse = await fetch(`${BASE_URL}trips/create-trip`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              ...formData,
              budget: Number.parseInt(formData.budget) || 0,
            }),
          })

          console.log("[v0] Retry response status:", retryResponse.status)

          if (retryResponse.ok) {
            const result = await retryResponse.json()
            console.log("[v0] Trip created successfully after token refresh")
            setTripResponse(result)
            setShowSuccess(true)
          } else {
            console.error("[v0] Trip creation failed even after token refresh:", retryResponse.status)
            alert("Failed to create trip. Please try logging in again.")
          }
        } else {
          console.error("[v0] Token refresh failed, redirecting to login")
          alert("Session expired. Please log in again.")
          window.location.href = "/login"
        }
      } else {
        console.error("[v0] Failed to create trip:", response.status)
        alert("Failed to create trip. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error creating trip:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && canProceed) {
      if (isLastStep) {
        handleSubmit()
      } else {
        nextStep()
      }
    }
  }

  if (showSuccess && tripResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center bg-background/80 backdrop-blur-sm border border-border/50 shadow-xl">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
              Trip Successfully Created!
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trip:</span>
              <span className="font-semibold">{tripResponse.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-semibold capitalize">{tripResponse.trip_type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-semibold">{tripResponse.location}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard">
              <Button className="w-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 text-white">
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
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
              }}
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
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#1e40af]/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-[#06b6d4]/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-[#3b82f6]/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-[#1e40af]/20 rounded-full animate-pulse delay-3000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-[#1e40af]/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <span className="font-sans text-2xl font-black bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent tracking-tight">
              TripMate
            </span>
          </Link>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 bg-background/80 backdrop-blur-sm border border-border/50 shadow-xl">
          <div className="text-center mb-8">
            <currentQuestion.icon className="h-12 w-12 text-[#1e40af] mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{currentQuestion.question}</h1>
            <p className="text-muted-foreground">Let's make your trip planning effortless</p>
          </div>

          <div className="space-y-6">
            {currentQuestion.type === "text" && (
              <div>
                <Input
                  placeholder={currentQuestion.placeholder}
                  value={formData[currentQuestion.id]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg p-4 border-2 focus:border-[#1e40af] transition-colors"
                  autoFocus
                />
              </div>
            )}

            {currentQuestion.type === "number" && (
              <div>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder={currentQuestion.placeholder}
                    value={formData[currentQuestion.id]}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-lg p-4 pl-10 border-2 focus:border-[#1e40af] transition-colors"
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
                  className="text-lg p-4 border-2 focus:border-[#1e40af] transition-colors"
                  autoFocus
                />
              </div>
            )}

            {currentQuestion.type === "select" && (
              <div>
                <Select value={formData[currentQuestion.id]} onValueChange={handleInputChange}>
                  <SelectTrigger className="text-lg p-4 border-2 focus:border-[#1e40af] transition-colors">
                    <SelectValue placeholder="Choose your trip type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="hover:bg-[#1e40af]/10 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 text-white"
                >
                  {isSubmitting ? "Creating Trip..." : "Create Trip"}
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed}
                  className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 text-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">💡 Tip: Press Enter to quickly move to the next question</p>
        </div>
      </div>
    </div>
  )
}
