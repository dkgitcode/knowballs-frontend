import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import HistoryList from "@/components/history-list"

// IMPORT ICONS FOR SIDEBAR NAVIGATION 🧭
import { 
  LogIn,
  UserPlus,
  ChevronLeft,
  Menu,
  User,
  LogOut,
  History,
  Sparkles,
  Loader2
} from "lucide-react" 

// CREATE A GLOBAL STATE FOR SIDEBAR VISIBILITY 🌐
import { create } from 'zustand'

interface SidebarStore {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

// CREATE A ZUSTAND STORE FOR SIDEBAR STATE MANAGEMENT 🏪
export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),
}))

interface SidebarProps {
  onReset: () => void
}

// DEFINE KEYFRAMES FOR PULSING EFFECT ✨
const pulseAnimation = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(var(--primary), 0.4);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(var(--primary), 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(var(--primary), 0);
    }
  }
`;

export default function Sidebar({ onReset }: SidebarProps) {
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  
  // GET SIDEBAR STATE FROM ZUSTAND STORE 🔄
  const { isOpen, toggle, close, open } = useSidebarStore()
  
  // GET AUTH STATE FROM HOOK 🔒
  const { user, isLoading, signOut, checkAuth } = useAuth()

  // DETERMINE ACTIVE ITEM BASED ON PATHNAME 🧭
  const getActiveItem = useCallback(() => {
    if (pathname === '/') return 'Home';
    if (pathname === '/pricing') return 'Pricing';
    if (pathname === '/profile') return 'Profile';
    if (pathname === '/login') return 'Login';
    if (pathname === '/signup') return 'Signup';
    if (pathname === '/history') return 'History';
    return '';
  }, [pathname]);

  // SET ACTIVE ITEM BASED ON PATHNAME
  const [activeItem, setActiveItem] = useState(getActiveItem());

  // UPDATE ACTIVE ITEM WHEN PATHNAME CHANGES
  useEffect(() => {
    setActiveItem(getActiveItem());
  }, [pathname, getActiveItem]);

  // CHECK IF VIEWPORT IS MOBILE SIZE 📱
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // AUTO-CLOSE SIDEBAR ON MOBILE 📱
      if (mobile) {
        close()
      } else {
        open()
      }
    }
    
    // Initial check
    checkIfMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [close, open])

  // SIMPLE AUTH CHECK ON MOUNT - NO FORCE REFRESHES OR COMPLEX LOGIC 🔒
  useEffect(() => {
    // INITIAL AUTH CHECK - ONLY ONCE ON MOUNT 🔍
    checkAuth();
    
    // LISTEN FOR LOGIN SUCCESS REFRESH EVENT 🔄
    const handleLoginSuccess = () => {
      checkAuth();
    };
    
    // ADD EVENT LISTENER FOR SPECIFIC LOGIN SUCCESS EVENT 📡
    window.addEventListener('loginSuccessRefresh', handleLoginSuccess);
    
    // CLEANUP EVENT LISTENER ON UNMOUNT 🧹
    return () => {
      window.removeEventListener('loginSuccessRefresh', handleLoginSuccess);
    };
  }, [checkAuth]);

  // HANDLE SIGN OUT 👋
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const handleSignOut = async () => {
    // PREVENT MULTIPLE SIGN OUT ATTEMPTS 🛑
    if (isSigningOut) {
      return;
    }
    
    try {
      // SET SIGNING OUT FLAG TO PREVENT MULTIPLE ATTEMPTS 🚩
      setIsSigningOut(true);
      
      // Show loading toast ONLY ONCE ⚠️
      toast({
        title: "Signing out...",
        description: "Please wait while we sign you out.",
      });
      
      // Call the sign out function from the auth hook
      const result = await signOut();
      
      if (result.success) {
        // Show success toast
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      } else {
        // Show error toast
        toast({
          title: "Error signing out",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        });
        
        // Simple redirect if needed
        if (!window.location.pathname.includes('/login')) {
          router.push('/login');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Error signing out",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Simple redirect if needed
      if (!window.location.pathname.includes('/login')) {
        router.push('/login');
      }
    } finally {
      // RESET SIGNING OUT FLAG AFTER COMPLETION OR ERROR 🔄
      setIsSigningOut(false);
    }
  };

  // HANDLE HISTORY ITEM SELECTION 📚
  const handleSelectQuestion = (item: {
    prompt: string;
    answer: string;
    mode: 'answer' | 'visualizer';
  }) => {
    // Close sidebar on mobile
    if (isMobile) {
      close()
    }
    
    // Navigate to home and pass the selected question
    router.push('/')
    
    // Wait for navigation to complete before triggering the search
    setTimeout(() => {
      // Create a custom event to trigger the search with the selected question
      const event = new CustomEvent('loadHistoryQuestion', { 
        detail: { 
          prompt: item.prompt,
          answer: item.answer,
          mode: item.mode
        } 
      })
      window.dispatchEvent(event)
    }, 100)
  }

  // HANDLE NEW QUESTION BUTTON CLICK 🆕
  const handleNewQuestion = () => {
    // Close sidebar on mobile
    if (isMobile) {
      close()
    }
    
    // Navigate to home
    router.push('/')
    
    // Reset the main content
    if (onReset) {
      onReset()
    }
    
    // DISPATCH RESET EVENT TO CLEAR MAIN CONTENT 🧹
    const resetEvent = new CustomEvent('resetMainContent')
    window.dispatchEvent(resetEvent)
  }

  // NAVIGATION ITEMS WITH UPDATED PATHS 
  const navItems = [
    // REMOVE HOME BUTTON FROM REGULAR NAV ITEMS
    // { 
    //   icon: <Home size={20} />,
    //   label: 'Home',
    //   action: () => {
    //     router.push('/');
    //     if (onReset) onReset();
    //   }
    // },
    // { icon: <Compass size={20} />, label: "Discover", action: showDemoToast },
    // {
    //   icon: <DollarSign size={20} />,
    //   label: 'Pricing',
    //   action: () => {
    //     router.push('/pricing');
    //   }
    // },
    // { icon: <BookOpen size={20} />, label: "Library", action: showDemoToast },
    // ADD HISTORY ITEM FOR AUTHENTICATED USERS 📚
    ...(user ? [{
      icon: <History size={20} />,
      label: 'History',
      action: () => {
        // router.push('/history');
      }
    }] : []),
  ]

  // HANDLE NAV ITEM CLICK 🖱️
  const handleNavClick = (label: string, action: () => void) => {
    action()
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      close()
    }
  }

  // HANDLE PROFILE NAVIGATION 👤
  const goToProfile = () => {
    if (user) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  }

  // RENDER MOBILE BOTTOM NAV BAR ON SMALL SCREENS 📱
  if (isMobile) {
    return (
      <>
        {/* TOGGLE BUTTON - ALWAYS VISIBLE */}
        <button 
          onClick={toggle}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-accent/30 text-primary hover:bg-accent/50 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        
        {/* BACKDROP OVERLAY - ANIMATED FADE IN/OUT */}
        <div 
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={close}
        ></div>
        
        {/* MOBILE SIDEBAR - SLIDES IN/OUT FROM LEFT 📲 */}
        <aside 
          className={`fixed left-0 top-0 bottom-0 w-60 bg-background border-r border-border flex flex-col z-50 transition-all duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button 
              onClick={() => {
                if (onReset) onReset();
                // DISPATCH RESET EVENT TO CLEAR MAIN CONTENT 🧹
                const resetEvent = new CustomEvent('resetMainContent');
                window.dispatchEvent(resetEvent);
                // RESET ACTIVE ITEM TO HOME 🏠
                setActiveItem('Home');
                router.push('/');
              }}
              className="text-2xl text-primary hover:opacity-80 transition-opacity"
            >
              <strong>know</strong> <span className="text-muted-foreground ml-[-5px]">balls</span>
            </button>
            <button 
              onClick={close}
              className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/30 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          {/* NAVIGATION LINKS */}
          <nav className="flex-1 overflow-y-auto py-4">
            {/* NEW QUESTION BUTTON - PROMINENT STYLING 🆕 */}
            <div className="px-2 mb-4">
              <style jsx>{pulseAnimation}</style>
              <Button 
                onClick={handleNewQuestion}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 py-5 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                style={{ animation: 'pulse 2s infinite' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <Sparkles size={18} />
                <span className="font-medium">New Question</span>
              </Button>
            </div>
            
            <ul className="space-y-1 px-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavClick(item.label, item.action)}
                    className={activeItem === item.label ? 'sidebar-nav-item-active' : 'sidebar-nav-item'}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            
            {/* QUESTION HISTORY LIST - ONLY SHOWN WHEN USER IS AUTHENTICATED 📚 */}
            {user && (
              <div className="mt-2 pl-8">
               
                <HistoryList 
                  onSelectQuestion={handleSelectQuestion} 
                />

              </div>
            )}
          </nav>
          
          {/* BOTTOM AUTHENTICATION BUTTONS OR USER PROFILE */}
          {!isLoading && (
            user ? (
              <div className="p-4 border-t border-border">
                <div 
                  className="flex items-center space-x-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => router.push('/profile')}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground truncate">Free Account</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </Button>
              </div>
            ) : (
              <div className="p-4 border-t border-border mt-auto">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={() => router.push('/login')}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Log in
                  </Button>
                  <Button 
                    className="w-full justify-center"
                    onClick={() => router.push('/signup')}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </div>
              </div>
            )
          )}
        </aside>
        
        {/* BOTTOM NAVIGATION BAR */}
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-30">
          <div className="flex items-center justify-around h-16">
            {/* NEW QUESTION BUTTON IN MOBILE NAV BAR 🆕 */}
            <button
              onClick={handleNewQuestion}
              className="flex flex-col items-center justify-center w-full h-full text-primary relative"
            >
              <div className="absolute top-1 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                <Sparkles size={20} className="text-primary" />
              </div>
              <span className="text-xs mt-8 font-medium">New</span>
            </button>
            
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavClick(item.label, item.action)}
                className={activeItem === item.label ? 'mobile-nav-item-active' : 'mobile-nav-item'}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ))}
            <button
              onClick={goToProfile}
              className={activeItem === 'Profile' || activeItem === 'Login' ? 'mobile-nav-item-active' : 'mobile-nav-item'}
            >
              {user ? (
                <>
                  <User size={20} />
                  <span className="text-xs mt-1">Profile</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span className="text-xs mt-1">Login</span>
                </>
              )}
            </button>
          </div>
        </nav>
      </>
    )
  }

  // RENDER DESKTOP SIDEBAR 🖥️
  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 w-60 bg-background flex flex-col z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } hidden md:flex`}
      >
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => {
              if (onReset) onReset();
              // DISPATCH RESET EVENT TO CLEAR MAIN CONTENT 🧹
              const resetEvent = new CustomEvent('resetMainContent');
              window.dispatchEvent(resetEvent);
              // RESET ACTIVE ITEM TO HOME 🏠
              setActiveItem('Home');
              router.push('/');
            }}
            className="text-2xl text-primary hover:opacity-80 transition-opacity"
          >
            <strong>know</strong> <span className="text-muted-foreground ml-[-5px]">balls</span>
          </button>
          <button 
            onClick={toggle}
            className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/30 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        
        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* NEW QUESTION BUTTON - PROMINENT STYLING 🆕 */}
          <div className="px-2 mb-4">
            <style jsx>{pulseAnimation}</style>
            <Button 
              onClick={handleNewQuestion}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 py-5 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
              style={{ animation: 'pulse 2s infinite' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <Sparkles size={18} />
              <span className="font-medium">New Question</span>
            </Button>
          </div>
          
          <ul className="space-y-1 pl-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavClick(item.label, item.action)}
                  className={activeItem === item.label ? 'sidebar-nav-item-active' : 'sidebar-nav-item'}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          
          {/* QUESTION HISTORY LIST - ONLY SHOWN WHEN USER IS AUTHENTICATED 📚 */}
          {user && (
            <div className="mt-2 pl-8">
              <HistoryList 
                onSelectQuestion={handleSelectQuestion} 
              />
            </div>
          )}
        </nav>
        
        {/* BOTTOM AUTHENTICATION BUTTONS OR USER PROFILE */}
        {!isLoading && (
          user ? (
            <div className="p-4 ">
              <div 
                className="flex items-center space-x-3 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push('/profile')}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground truncate">Free Account</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                {isSigningOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          ) : (
            <div className="p-4 border-t border-border mt-auto">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => router.push('/login')}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Button>
                <Button 
                  className="w-full justify-center"
                  onClick={() => router.push('/signup')}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </div>
            </div>
          )
        )}
      </aside>

      {/* TOGGLE BUTTON - ONLY VISIBLE WHEN SIDEBAR IS CLOSED ON DESKTOP 🔄 */}
      <button 
        onClick={toggle}
        className={`fixed top-4 left-4 z-40 p-2 rounded-md bg-accent/30 text-primary hover:bg-accent/50 transition-colors md:flex items-center justify-center ${
          isOpen ? 'hidden' : 'hidden md:flex'
        }`}
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
    </>
  )
} 