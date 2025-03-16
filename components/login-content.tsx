"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useSidebarStore } from "@/components/sidebar"
import { login, signup } from "@/app/login/actions" // IMPORT SERVER ACTIONS DIRECTLY ✨
import { useAuth } from "@/hooks/use-auth" // IMPORT AUTH HOOK FOR REFRESHING 🔄
import { useRouter } from "next/navigation" // IMPORT ROUTER FOR NAVIGATION 🧭

// DEFINE PROPS FOR OUR COMPONENT 🔄
interface LoginContentProps {
  error?: string;
  onResetRef?: React.MutableRefObject<(() => void) | null>; // Reference to reset function
}

export default function LoginContent({ 
  error,
  onResetRef
}: LoginContentProps) {
  
  // GET SIDEBAR STATE FROM ZUSTAND STORE 🔄
  const { isOpen } = useSidebarStore()
  
  // GET AUTH FUNCTIONS FOR REFRESHING 🔄
  const { forceRefresh, user } = useAuth()
  
  // GET ROUTER FOR NAVIGATION 🧭
  const router = useRouter()
  
  // TRACK IF FORM WAS SUBMITTED 📝
  const formSubmittedRef = useRef(false)
  
  // TRACK IF WE'VE ALREADY REFRESHED TO PREVENT LOOPS ⚠️
  const [hasRefreshed, setHasRefreshed] = useState(false)

  // RESET FUNCTION FOR SIDEBAR INTEGRATION 🔄
  const resetLogin = () => {
    // Reset to default state if needed
  }

  // EXPOSE RESET FUNCTION VIA REF FOR EXTERNAL COMPONENTS 🔄
  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = resetLogin;
    }
    
    // CLEANUP FUNCTION TO REMOVE REFERENCE WHEN COMPONENT UNMOUNTS 🧹
    return () => {
      if (onResetRef) {
        onResetRef.current = null;
      }
    };
  }, [onResetRef]);
  
  // REDIRECT TO HOME IF USER IS ALREADY LOGGED IN 🏠
  useEffect(() => {
    if (user) {
      console.log("🔐 User already logged in, redirecting to home...");
      router.push('/');
    }
  }, [user, router]);
  
  // CUSTOM FORM SUBMISSION HANDLERS WITH TRACKING 📝
  const handleLogin = async (formData: FormData) => {
    // Mark form as submitted
    formSubmittedRef.current = true;
    setHasRefreshed(false); // Reset refresh flag when submitting
    
    try {
      // Call the server action
      await login(formData);
      
      // Force a hard refresh of the page to ensure everything reloads properly
      // This is a more reliable approach than trying to update state
      window.location.href = '/';
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  const handleSignup = async (formData: FormData) => {
    // Mark form as submitted
    formSubmittedRef.current = true;
    setHasRefreshed(false); // Reset refresh flag when submitting
    
    try {
      // Call the server action
      await signup(formData);
    } catch (error) {
      console.error("Signup error:", error);
    }
  };
  
  // REFRESH AUTH STATE AFTER REDIRECT BACK FROM SERVER ACTION ♻️
  useEffect(() => {
    // Check if we just came back from a form submission (URL has no error)
    const params = new URLSearchParams(window.location.search);
    const hasError = params.has('error');
    
    // ONLY REFRESH IF WE HAVEN'T ALREADY AND THERE'S NO ERROR ✅
    if (!hasRefreshed && !hasError && window.location.pathname === '/login') {
      // Set flag to prevent multiple refreshes
      setHasRefreshed(true);
      
      // FORCE REFRESH AUTH STATE - BYPASS DEBOUNCING ⚡
      forceRefresh().then((userData) => {
        if (userData) {
          // USER IS LOGGED IN - REDIRECT TO HOME 🏠
          console.log("⚡ Auth state FORCE refreshed after login - REDIRECTING TO HOME");
          router.push('/');
        } else {
          console.log("🔄 Auth check complete - No user found");
        }
      });
    }
  }, [forceRefresh, hasRefreshed, router]);

  return (
    <div 
      className={`transition-all duration-300 ${
        isOpen ? 'md:ml-60' : 'ml-0'
      } min-h-screen justify-center bg-[hsl(var(--background))] p-2 pl-2 pr-2`}
    >
      {/* CONTENT CONTAINER WITH ROUNDED CORNERS AND BORDER INSTEAD OF TRIM ✨ */}
      <div className="w-full h-[calc(100vh-1.25rem)] flex flex-col relative overflow-hidden content-container border border-border">
        {/* SCROLLABLE CONTENT AREA 📜 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Enter your credentials to sign in to your account
              </p>
            </div>

            {/* LOGIN FORM WITH SERVER ACTIONS 📝 */}
            <div className="border border-border rounded-xl p-8 bg-card">
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium leading-none">
                      Password
                    </label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                {error && (
                  <div className="text-destructive text-sm">
                    {error}
                  </div>
                )}
                
                <div className="flex flex-col space-y-2 pt-2">
                  <Button type="submit" formAction={handleLogin} className="w-full">
                    Sign In
                  </Button>
                  <Button type="submit" formAction={handleSignup} variant="outline" className="w-full">
                    Create Account
                  </Button>
                </div>
              </form>
              
              <div className="text-center text-sm mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PADDING FOR MOBILE NAV BAR 📱 */}
      <div className="h-16 md:h-0 block md:hidden"></div>
    </div>
  )
} 