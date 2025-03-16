"use client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { useSidebarStore } from "@/components/sidebar"

// DEFINE PROPS FOR OUR COMPONENT 🔄
interface PricingContentProps {
  onSubscribe?: (plan: string) => void;
  onResetRef?: React.MutableRefObject<(() => void) | null>; // Reference to reset function
}

export default function PricingContent({ 
  onSubscribe,
  onResetRef
}: PricingContentProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  
  // GET SIDEBAR STATE FROM ZUSTAND STORE 🔄
  const { isOpen } = useSidebarStore()

  // Handle subscription (this would connect to payment in a real app)
  const handleSubscribe = (plan: string) => {
    // This is just a placeholder - in a real app, this would initiate payment
    console.log(`Subscribing to ${plan} plan`)
    // Call the onSubscribe prop if provided
    if (onSubscribe) {
      onSubscribe(plan);
    }
  }

  // RESET FUNCTION FOR SIDEBAR INTEGRATION 🔄
  const resetPricing = () => {
    // Reset to default state
    setBillingPeriod("monthly");
    // Add any other state resets here
  }

  // EXPOSE RESET FUNCTION VIA REF FOR EXTERNAL COMPONENTS 🔄
  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = resetPricing;
    }
    
    // CLEANUP FUNCTION TO REMOVE REFERENCE WHEN COMPONENT UNMOUNTS 🧹
    return () => {
      if (onResetRef) {
        onResetRef.current = null;
      }
    };
  }, [onResetRef]);

  return (
    <div 
      className={`transition-all duration-300 ${
        isOpen ? 'md:ml-60' : 'ml-0'
      } min-h-screen justify-center bg-[hsl(var(--background))] p-2 pl-2 pr-2`}
    >
      {/* CONTENT CONTAINER WITH ROUNDED CORNERS AND BORDER INSTEAD OF TRIM ✨ */}
      <div className="w-full h-[calc(100vh-1.25rem)] flex flex-col relative overflow-hidden content-container border border-border">
        {/* SCROLLABLE CONTENT AREA 📜 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8">
          <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Get unlimited access to NBA insights, stats, and analysis with our AI-powered chatbot.
              </p>
              
              {/* Billing Toggle */}
              <div className="mt-8 inline-flex items-center p-1 bg-accent/30 rounded-lg">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-4 py-2 rounded-md transition-all ${
                    billingPeriod === "monthly" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-4 py-2 rounded-md transition-all ${
                    billingPeriod === "yearly" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly <span className="text-xs opacity-80">Save 20%</span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pro Plan */}
              <div className="border border-border rounded-xl p-8 bg-card hover:border-primary/50 transition-all">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Pro</h2>
                  <p className="text-muted-foreground">Perfect for casual NBA fans</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-end">
                    <span className="text-4xl font-bold">${billingPeriod === "monthly" ? "8" : "77"}</span>
                    <span className="text-muted-foreground ml-2">/ {billingPeriod === "monthly" ? "month" : "year"}</span>
                  </div>
                  {billingPeriod === "yearly" && (
                    <p className="text-sm text-muted-foreground mt-1">Equivalent to $6.40/month</p>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Unlimited NBA stats and data queries</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Real-time game updates and scores</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Player performance insights</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Basic team analytics</span>
                  </li>
                </ul>
                
                <Button 
                  className="w-full"
                  onClick={() => handleSubscribe("pro")}
                >
                  Get Started
                </Button>
              </div>
              
              {/* Premium Plan */}
              <div className="border border-primary rounded-xl p-8 bg-card relative shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <div className="absolute -top-3 right-8 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
                  RECOMMENDED
                </div>
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Premium</h2>
                  <p className="text-muted-foreground">For the serious NBA enthusiast</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-end">
                    <span className="text-4xl font-bold">${billingPeriod === "monthly" ? "20" : "192"}</span>
                    <span className="text-muted-foreground ml-2">/ {billingPeriod === "monthly" ? "month" : "year"}</span>
                  </div>
                  {billingPeriod === "yearly" && (
                    <p className="text-sm text-muted-foreground mt-1">Equivalent to $16/month</p>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Everything in Pro plan</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Advanced statistical analysis</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Personalized insights and recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Historical data comparisons</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Fantasy basketball predictions</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
                
                <Button 
                  variant="default"
                  className="w-full"
                  onClick={() => handleSubscribe("premium")}
                >
                  Get Premium
                </Button>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="mt-20">
              <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
              <div className="space-y-6 max-w-3xl mx-auto">
                <div>
                  <h3 className="text-lg font-medium mb-2">What data sources does NBA Genie use?</h3>
                  <p className="text-muted-foreground">NBA Genie uses official NBA data sources to provide accurate, up-to-date information about games, players, and teams.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Can I cancel my subscription anytime?</h3>
                  <p className="text-muted-foreground">Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">How often is the data updated?</h3>
                  <p className="text-muted-foreground">Our data is updated in real-time during games and multiple times daily for other statistics and information.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Is there a free trial available?</h3>
                  <p className="text-muted-foreground">We offer limited free queries to try out the service before subscribing to a paid plan.</p>
                </div>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="mt-20 text-center mb-10">
              <h2 className="text-2xl font-bold mb-4">Ready to elevate your NBA knowledge?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of NBA fans who use NBA Genie to stay informed and gain deeper insights into the game they love.
              </p>
              <Button 
                size="lg" 
                onClick={() => handleSubscribe("trial")}
              >
                Try NBA Genie Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PADDING FOR MOBILE NAV BAR 📱 */}
      <div className="h-16 md:h-0 block md:hidden"></div>
    </div>
  )
} 