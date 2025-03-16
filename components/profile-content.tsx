"use client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useSidebarStore } from "@/components/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Calendar, Shield, LogOut, Edit } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// DEFINE PROPS FOR OUR COMPONENT 🔄
interface ProfileContentProps {
  onResetRef?: React.MutableRefObject<(() => void) | null>; // Reference to reset function
}

export default function ProfileContent({ 
  onResetRef
}: ProfileContentProps) {
  // GET SIDEBAR STATE FROM ZUSTAND STORE 🔄
  const { isOpen } = useSidebarStore()
  
  // GET AUTH STATE FROM HOOK 🔒
  const { user, signOut, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // HANDLE SIGN OUT 👋
  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // RESET FUNCTION FOR EXTERNAL COMPONENTS 🔄
  const resetProfile = () => {
    // Reset any state if needed
  }

  // EXPOSE RESET FUNCTION VIA REF FOR EXTERNAL COMPONENTS 🔄
  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = resetProfile;
    }
    
    // CLEANUP FUNCTION TO REMOVE REFERENCE WHEN COMPONENT UNMOUNTS 🧹
    return () => {
      if (onResetRef) {
        onResetRef.current = null;
      }
    };
  }, [onResetRef]);

  // PLACEHOLDER FUNCTIONS FOR DEMO ACTIONS 🎮
  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "This is just a demo feature!",
    })
  }

  const handleUpgradeAccount = () => {
    toast({
      title: "Upgrade Account",
      description: "This is just a demo feature!",
    })
  }

  // GET USER EMAIL OR FALLBACK TO ANONYMOUS 📧
  const userEmail = user?.email || 'anonymous@example.com'
  const userName = userEmail.split('@')[0]
  const userRole = 'Free Member'
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'

  // GENERATE UNIQUE GRADIENT BASED ON EMAIL 🎨
  const generateGradientFromEmail = (email: string) => {
    // HASH THE EMAIL TO ENSURE CONSISTENT RESULTS FOR THE SAME EMAIL 🔒
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = ((hash << 5) - hash) + email.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // GENERATE THREE DISTINCT COLORS FOR A NICE GRADIENT 🌈
    const hue1 = Math.abs(hash % 360);
    const hue2 = Math.abs((hash * 13) % 360);
    const hue3 = Math.abs((hash * 29) % 360);
    
    // ENSURE GOOD SATURATION AND LIGHTNESS FOR VIBRANT COLORS ✨
    const saturation = 70 + Math.abs((hash * 37) % 30); // 70-100%
    const lightness = 45 + Math.abs((hash * 41) % 20); // 45-65%
    
    const color1 = `hsl(${hue1}, ${saturation}%, ${lightness}%)`;
    const color2 = `hsl(${hue2}, ${saturation}%, ${lightness}%)`;
    const color3 = `hsl(${hue3}, ${saturation}%, ${lightness}%)`;
    
    // CREATE A BEAUTIFUL GRADIENT ANGLE BASED ON EMAIL HASH 📐
    const angle = Math.abs(hash % 360);
    
    return `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3})`;
  }
  
  // GET GRADIENT FOR CURRENT USER 🎭
  const userGradient = generateGradientFromEmail(userEmail);

  // SKELETON COMPONENTS FOR LOADING STATE 💀
  const ProfileSkeleton = () => (
    <>
      {/* Profile Card Skeleton */}
      <div className="border border-border rounded-xl p-8 bg-card mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar Skeleton */}
          <Skeleton className="w-32 h-32 rounded-full flex-shrink-0" />
          
          {/* User Info Skeleton */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <Skeleton className="h-8 w-48 mb-2 md:mb-0" />
              <Skeleton className="h-9 w-32" />
            </div>
            
            <div className="space-y-3">
              <Skeleton className="h-5 w-full max-w-xs mx-auto md:mx-0" />
              <Skeleton className="h-5 w-full max-w-xs mx-auto md:mx-0" />
              <Skeleton className="h-7 w-32 mx-auto md:mx-0 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Subscription Section Skeleton */}
      <div className="border border-border rounded-xl p-8 bg-card mb-8">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-2 w-full rounded-full mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        
        <Skeleton className="h-10 w-full md:w-40" />
      </div>
      
      {/* Account Settings Skeleton */}
      <div className="border border-border rounded-xl p-8 bg-card mb-8">
        <Skeleton className="h-8 w-48 mb-6" />
        
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-10 w-full md:w-40" />
          </div>
          
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </>
  );

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
              <h1 className="text-4xl font-bold mb-4">Your Profile</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Manage your account settings and subscription preferences
              </p>
            </div>

            {/* SHOW SKELETON WHILE LOADING, REAL CONTENT WHEN LOADED ⚡ */}
            {authLoading ? (
              <ProfileSkeleton />
            ) : (
              <>
                {/* Profile Card */}
                <div className="border border-border rounded-xl p-8 bg-card mb-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* UNIQUE EMAIL-BASED GRADIENT AVATAR 🌈 */}
                    <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 shadow-md" 
                        style={{ background: userGradient }}>
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                          {userName.substring(0, 1).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <h2 className="text-2xl font-bold mb-2 md:mb-0">{userName}</h2>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleEditProfile}
                          className="flex items-center"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-center md:justify-start text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{userEmail}</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Joined {joinDate}</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start">
                          <Shield className="h-4 w-4 mr-2 text-primary" />
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                            {userRole}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subscription Section */}
                <div className="border border-border rounded-xl p-8 bg-card mb-8">
                  <h2 className="text-2xl font-bold mb-4">Subscription</h2>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Current Plan</span>
                      <span className="font-medium">Free Plan</span>
                    </div>
                    <div className="w-full bg-accent/30 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      3 of 20 queries used this month
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full md:w-auto"
                    onClick={handleUpgradeAccount}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
                
                {/* Account Settings */}
                <div className="border border-border rounded-xl p-8 bg-card mb-8">
                  <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Email Notifications</h3>
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Marketing emails</p>
                          <p className="text-sm text-muted-foreground">Receive emails about new features and offers</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent/30 transition-colors focus:outline-none cursor-pointer">
                          <span className="inline-block h-5 w-5 transform rounded-full bg-background transition-transform ml-0.5"></span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Password</h3>
                      <Button variant="outline" className="w-full md:w-auto">
                        Change Password
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
                      <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                        <p className="text-sm mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleSignOut}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Signing out...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <LogOut className="mr-2 h-4 w-4" />
                              Sign out
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM PADDING FOR MOBILE NAV BAR 📱 */}
      <div className="h-16 md:h-0 block md:hidden"></div>
    </div>
  )
} 