"use client"
import PricingContent from "@/components/pricing-content"
import { useRef } from "react"

export default function PricingPage() {
  const resetFunctionRef = useRef<(() => void) | null>(null);

  // Handle subscription (this would connect to payment in a real app)
  const handleSubscribe = (plan: string) => {
    // This is just a placeholder - in a real app, this would initiate payment
    console.log(`Subscribing to ${plan} plan`)
    // Show a toast or redirect to payment page
  }

  return (
    <PricingContent 
      onSubscribe={handleSubscribe} 
      onResetRef={resetFunctionRef}
    />
  )
} 