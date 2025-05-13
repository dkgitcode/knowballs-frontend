"use client"
import SearchInput from "@/components/search-input"
import { useSidebarStore } from "@/components/sidebar"
import { useState, useRef, useEffect, useCallback } from "react"
import SampleInput from "@/components/sample-input"
import DynamicLesson from "@/components/dynamic-lesson"
import { useToast } from "@/hooks/use-toast"
import BasketballClipper from "@/components/basketball-clipper"

// Define the types for our lesson data
interface ContentItem {
  type: string;
  content: string;
  link?: string | null;
  definition?: string | null;
}

interface LessonData {
  content: ContentItem[];
  combined_markdown?: string;
}

// Define interface for basketball clipper data to match BasketballClipper props
// NOTE: This is used for the 'film' mode, but keeps the ClipperData name for compatibility
interface ClipperData {
  query: string;
  parameters: Record<string, any>;
  results: any[]; // Array of BasketballPlay objects
  message: string;
}

// Define valid mode types to use throughout component
type AppMode = 'answer' | 'visualizer' | 'film';

// LOCAL STORAGE KEY FOR MODE CACHING 🔑
const MODE_STORAGE_KEY = 'knowballs_last_mode';

interface MainContentProps {
  title?: string;
  apiBaseUrl?: string;
  initialMode?: AppMode;
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}

// Placeholder components for Visualizer and Film modes
const VisualizerPlaceholder = ({ data }: { data: any }) => (
  <div className="w-full animate-fade-in opacity-0">
    <div className="p-4 border border-yellow-400 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Visualizer Component</h2>
      <p>This component will be built later. Data available:</p>
      <pre className="bg-accent/10 p-2 rounded mt-2 overflow-auto max-h-[300px]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  </div>
);

export default function MainContent({
  title = "Ask me anything...",
  apiBaseUrl = "http://localhost:8000",
  initialMode = 'film',
  onResetRef
}: MainContentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)
  const [showData, setShowData] = useState(false)
  const [answer, setAnswer] = useState("")
  const [userPrompt, setUserPrompt] = useState("")
  const [data, setData] = useState<LessonData | ClipperData | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Get mode from localStorage if available, otherwise use initialMode
  const [currentMode, setCurrentMode] = useState<AppMode>(() => {
    // RETRIEVE CACHED MODE FROM LOCALSTORAGE IF AVAILABLE 💾
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as AppMode | null;
      return savedMode || initialMode;
    }
    return initialMode;
  })
  const { toast } = useToast()
  const { isOpen } = useSidebarStore()

  // const isProduction = process.env.NODE_ENV === 'production'
  const isProduction = true
  
  // UPDATE API URLs WITH PRODUCTION ENDPOINTS 🌐
  const FILM_API_URL = isProduction 
    ? "https://knowballs-4cs5au5qsa-uc.a.run.app"
    : apiBaseUrl

  const QUESTIONS_API_URL = isProduction 
    ? "https://knowballs-backend-4808b557c795.herokuapp.com" 
    : apiBaseUrl

  // Create a ref to store the fetch controller for cancellation
  const controllerRef = useRef<AbortController | null>(null);

  const handleSearch = async (prompt: string, mode: AppMode = 'film') => {
    if (!prompt.trim()) return;

    try {
      // Authentication check - ONLY FOR NON-FILM MODES 🔐
      if (mode !== 'film') {
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) {
          toast({
            title: "Authentication Required",
            description: "You must be logged in to use this feature.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Setup states
      setUserPrompt(prompt);
      setIsLoading(true);
      setIsRemoved(true);
      setError(null);
      setCurrentMode(mode);
      
      // SAVE MODE TO LOCALSTORAGE WHEN SEARCHING 💾
      if (typeof window !== 'undefined') {
        localStorage.setItem(MODE_STORAGE_KEY, mode);
        console.log("Mode saved to localStorage during search:", mode);
      }
      
      // Reset previous data
      setData(null);
      setAnswer("");
      setShowData(false);

      // Cancel any in-progress fetches
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      // Create a new controller for this fetch
      controllerRef.current = new AbortController();

      console.log(`Fetching ${mode.toUpperCase()} data with prompt:`, prompt);

      let response;
      // Different API endpoints based on mode
      if (mode === 'film') {
        response = await fetch(`${FILM_API_URL}/find-plays`, {
          method: 'POST',
          body: JSON.stringify({ query: prompt }),
          signal: controllerRef.current.signal
        });
      } else {
        // Both 'answer' and 'visualizer' modes use the same endpoint
        response = await fetch(`${QUESTIONS_API_URL}/api/query?mode=${mode}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: prompt }),
          signal: controllerRef.current.signal
        });
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const json_data = await response.json();
      console.log(`Response from ${mode.toUpperCase()} API:`, json_data);
      
      let extractedData = null;
      let extractedAnswer = "";

      // Process the response based on mode
      if (mode === 'film') {
        // For film mode, use the raw data and ensure it has the correct structure
        // IMPORTANT: Film mode expects specific data format 🏀
        extractedData = {
          query: prompt,
          parameters: json_data.parameters || {},
          results: json_data.results || [],
          message: json_data.message || ""
        };
      } else {
        // For answer and visualizer modes
        if (json_data.tool_result && json_data.tool_result.data) {
          extractedData = json_data.tool_result.data;
        } else {
          extractedData = { content: [] };
        }
        
        if (!extractedData.content) {
          extractedData.content = [];
        }
        
        if (json_data.answer) {
          extractedAnswer = json_data.answer;
        } else {
          extractedAnswer = "Sorry, I couldn't generate an answer for your query.";
        }
      }
      
      // Update state with extracted data
      setAnswer(extractedAnswer);
      setData(extractedData);
      
      // Show data after a short delay
      setTimeout(() => {
        setShowData(true);
      }, 100);
      
      // Save to history
      try {
        // For film mode, store the JSON stringified data for later restoration
        const historyData = mode === 'film' 
          ? JSON.stringify(extractedData)
          : extractedAnswer;
        
        const saveResponse = await fetch('/api/history/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            answer: historyData,
            mode: mode
          })
        });
        
        if (!saveResponse.ok) {
          console.warn("Failed to save question history:", await saveResponse.text());
        }
      } catch (saveError) {
        console.error("Error saving question history:", saveError);
      }
      
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error(`Error fetching ${mode.toUpperCase()} data:`, err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const checkAuthentication = async (): Promise<boolean> => {
    try {
      // Simple caching for auth checks
      const AUTH_CACHE_KEY = 'auth_check_result';
      const AUTH_CACHE_EXPIRY_KEY = 'auth_check_expiry';
      
      const cachedResult = sessionStorage.getItem(AUTH_CACHE_KEY);
      const cacheExpiry = sessionStorage.getItem(AUTH_CACHE_EXPIRY_KEY);
      
      if (cachedResult && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
        return cachedResult === 'true';
      }
      
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const isAuthenticated = response.status !== 401;
      
      try {
        sessionStorage.setItem(AUTH_CACHE_KEY, isAuthenticated.toString());
        sessionStorage.setItem(AUTH_CACHE_EXPIRY_KEY, (Date.now() + 30000).toString());
      } catch (cacheError) {
        console.warn("Could not cache auth result:", cacheError);
      }
      
      if (!response.ok && response.status !== 401) {
        console.error(`Auth check failed with status ${response.status}`);
        return true;
      }
      
      return isAuthenticated;
    } catch (err) {
      console.error("Error checking authentication:", err);
      return true;
    }
  }

  const loadQuestionFromHistory = (prompt: string, answer: string, mode: AppMode = 'answer') => {
    setUserPrompt(prompt)
    setCurrentMode(mode)
    setData(null)
    setError(null)
    setIsRemoved(true)
    setAnswer(answer)
    
    // SAVE MODE TO LOCALSTORAGE WHEN LOADING HISTORY 📚
    if (typeof window !== 'undefined') {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
      console.log("Mode saved to localStorage from history:", mode);
    }
    
    if (mode === 'film') {
      // For film mode, try to parse the answer as JSON
      try {
        // IMPORTANT: For film history, we should store the JSON data 📊
        const clipperData = JSON.parse(answer);
        setData(clipperData);
      } catch (e) {
        // Fallback if answer is not valid JSON
        setData({
          query: prompt,
          parameters: {},
          results: [],
          message: "Could not load history data correctly"
        });
      }
    } else {
      // For other modes, use the answer as markdown
      const extractedData: LessonData = { 
        content: [],
        combined_markdown: answer
      }
      
      setData(extractedData)
    }
    
    setTimeout(() => {
      setShowData(true)
    }, 100)
    
    console.log("Loaded question from history:", { prompt, mode })
  }

  const resetChat = useCallback(() => {
    setIsLoading(false)
    setIsRemoved(false)
    setShowData(false)
    setUserPrompt("")
    setData(null)
    setError(null)
    // KEEP CURRENT MODE WHEN RESETTING - DON'T REVERT TO INITIAL MODE 🔄
    // We no longer reset to initialMode here

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  }, []); // Remove initialMode from dependency array since we don't use it anymore

  useEffect(() => {
    const handleHistoryQuestion = (event: CustomEvent<{prompt: string; answer: string; mode: AppMode}>) => {
      const { prompt, answer, mode } = event.detail
      loadQuestionFromHistory(prompt, answer, mode)
    }
    
    const handleResetMainContent = () => {
      console.log("Resetting main content state");
      resetChat();
    }
    
    window.addEventListener('loadHistoryQuestion', handleHistoryQuestion as EventListener)
    window.addEventListener('resetMainContent', handleResetMainContent)
    
    return () => {
      window.removeEventListener('loadHistoryQuestion', handleHistoryQuestion as EventListener)
      window.removeEventListener('resetMainContent', handleResetMainContent)
    }
  }, [resetChat])

  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = resetChat;
    }
    
    return () => {
      if (onResetRef) {
        onResetRef.current = null;
      }
    };
  }, [onResetRef, resetChat]);

  // SPECIALIZED MODE-SPECIFIC LOADING SKELETONS 💀
  const FilmLoadingSkeleton = ({ noResults = false }: { noResults?: boolean }) => {
    // For no results we'll show a different skeleton that matches the "No Plays Found" UI
    if (noResults) {
      return (
        <div className="w-full animate-fade-in opacity-0">
          <div className="p-8 border border-border rounded-lg bg-accent/5">
            {/* SIMPLIFIED NO RESULTS SKELETON */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4 animate-pulse" />
              <div className="h-8 w-48 bg-accent/20 rounded-lg animate-pulse mx-auto mb-3" />
              <div className="h-4 w-64 bg-accent/20 rounded animate-pulse mx-auto" />
            </div>
            
            {/* SIMPLE QUERY SKELETON WITH KEY CONTEXT */}
            <div className="mb-6 max-w-md mx-auto">
              <div className="bg-accent/10 p-4 rounded-md border border-accent/20">
                <div className="space-y-3">
                  {/* QUERY SKELETON */}
                  <div>
                    <div className="h-5 w-32 bg-accent/20 rounded animate-pulse mb-1" />
                    <div className="h-9 bg-accent/20 rounded animate-pulse w-full" />
                  </div>
                  
                  {/* CONTEXT DETAILS SKELETON */}
                  <div className="space-y-2 pt-2 border-t border-accent/20 mt-2">
                    {/* PLAYER SKELETON */}
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-20 bg-accent/30 rounded animate-pulse" />
                      <div className="h-4 w-40 bg-accent/20 rounded animate-pulse" />
                    </div>
                    
                    {/* SEASON SKELETON */}
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-20 bg-accent/30 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-accent/20 rounded animate-pulse" />
                    </div>
                    
                    {/* MEASURE SKELETON */}
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-20 bg-accent/30 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-accent/20 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* BUTTON SKELETON */}
            <div className="text-center">
              <div className="h-9 w-40 bg-primary/40 rounded-md animate-pulse mx-auto" />
            </div>
          </div>
        </div>
      );
    }
    
    // Regular film loading skeleton (existing code)
    return (
      <div className="w-full max-w-full space-y-8 animate-fade-in opacity-0">
        {/* HEADER SKELETON WITH RESULTS SUMMARY */}
        <div className="mb-6">
          <div className="h-10 w-72 bg-accent/20 rounded-lg animate-pulse mb-2" />
          <div className="h-6 w-96 bg-accent/20 rounded-lg animate-pulse" />
        </div>
        
        {/* FILTER BAR SKELETON */}
        <div className="mb-8">
          <div className="rounded-md shadow-md backdrop-blur-sm border border-white/5 p-3">
            <div className="flex flex-wrap gap-2 items-center">
              {/* SEARCH INPUT SKELETON */}
              <div className="flex-grow min-w-[200px] max-w-[500px] h-9 bg-accent/20 rounded-sm animate-pulse" />
              
              {/* SORT DROPDOWN SKELETON */}
              <div className="w-[140px] h-9 bg-accent/20 rounded-sm animate-pulse" />
              
              {/* FILTER TOGGLE BUTTON SKELETON */}
              <div className="w-[140px] h-9 bg-accent/20 rounded-sm animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* VIDEO CARDS SKELETON - MULTIPLE ITEMS */}
        <div className="space-y-16">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="w-full border-b border-border pb-10">
              {/* VIDEO PLAYER SKELETON */}
              <div className="relative aspect-video w-full mb-3 bg-black/40 rounded animate-pulse" />
              
              {/* TAGS SKELETON */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="w-20 h-8 bg-accent/20 rounded-sm animate-pulse" />
                <div className="w-24 h-8 bg-accent/20 rounded-sm animate-pulse" />
                <div className="w-16 h-8 bg-accent/20 rounded-sm animate-pulse" />
              </div>
              
              {/* PLAY DETAILS SKELETON */}
              <div className="max-w-3xl mx-auto">
                <div className="bg-gradient-to-r from-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-md p-5 border border-gray-700/50">
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    {/* GAME INFO SKELETON */}
                    <div className="flex items-center gap-4 md:min-w-[220px]">
                      <div className="shrink-0 bg-accent/20 p-2 rounded-md w-8 h-8 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-accent/20 rounded animate-pulse" />
                        <div className="h-5 w-40 bg-accent/20 rounded animate-pulse" />
                      </div>
                    </div>
                    
                    {/* DESCRIPTION SKELETON */}
                    <div className="md:border-l md:border-white/10 md:pl-5 flex-1">
                      <div className="h-6 bg-accent/20 rounded animate-pulse w-full" />
                      <div className="h-6 bg-accent/20 rounded animate-pulse w-3/4 mt-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const AnswerLoadingSkeleton = ({ delay = 0 }: { delay?: number }) => (
    <div
      className="animate-slide-up-in opacity-0 w-full max-w-3xl"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* ARTICLE/MARKDOWN-LIKE SKELETON */}
      <div className="space-y-6">
        {/* HEADING SKELETON */}
        <div className="h-10 bg-accent/20 rounded-lg animate-pulse w-3/4" />
        
        {/* PARAGRAPH SKELETONS */}
        <div className="space-y-3">
          <div className="h-5 bg-accent/20 rounded animate-pulse" />
          <div className="h-5 bg-accent/20 rounded animate-pulse" />
          <div className="h-5 bg-accent/20 rounded animate-pulse w-4/5" />
        </div>
        
        {/* LIST/BULLET POINT SKELETON */}
        <div className="space-y-3 pl-5">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-accent/40 rounded-full mr-3" />
            <div className="h-5 bg-accent/20 rounded animate-pulse flex-1" />
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-accent/40 rounded-full mr-3" />
            <div className="h-5 bg-accent/20 rounded animate-pulse flex-1" />
          </div>
        </div>
        
        {/* CODE BLOCK SKELETON */}
        <div className="h-32 bg-accent/30 rounded-md animate-pulse w-full border border-accent/20" />
        
        {/* MORE PARAGRAPHS */}
        <div className="space-y-3 mt-4">
          <div className="h-5 bg-accent/20 rounded animate-pulse" />
          <div className="h-5 bg-accent/20 rounded animate-pulse" />
          <div className="h-5 bg-accent/20 rounded animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  );
  
  const VisualizerLoadingSkeleton = ({ delay = 0 }: { delay?: number }) => (
    <div
      className="animate-slide-up-in opacity-0 w-full"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* VISUALIZER SKELETON - CHART/DIAGRAM-LIKE STRUCTURE */}
      <div className="p-4 border border-accent/30 rounded-lg">
        <div className="h-8 bg-accent/20 rounded animate-pulse w-64 mb-4" />
        
        {/* CONTROLS/LEGEND AREA */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="h-8 bg-accent/20 rounded animate-pulse w-24" />
          <div className="h-8 bg-accent/20 rounded animate-pulse w-28" />
          <div className="h-8 bg-accent/20 rounded animate-pulse w-20" />
        </div>
        
        {/* VISUALIZATION AREA */}
        <div className="relative w-full aspect-[16/9] bg-accent/10 rounded-md border border-accent/20 animate-pulse flex items-center justify-center">
          <div className="h-32 w-32 rounded-full bg-accent/20 animate-pulse absolute" style={{ left: '30%', top: '30%' }} />
          <div className="h-20 w-20 rounded-full bg-accent/20 animate-pulse absolute" style={{ right: '25%', bottom: '20%' }} />
          <div className="h-40 w-40 rounded-full bg-accent/20 animate-pulse opacity-50 absolute" style={{ right: '40%', top: '40%' }} />
          <div className="h-3 w-40 bg-accent/30 animate-pulse absolute" style={{ left: '25%', top: '60%', transform: 'rotate(45deg)' }} />
          <div className="h-3 w-60 bg-accent/30 animate-pulse absolute" style={{ right: '20%', bottom: '30%', transform: 'rotate(-25deg)' }} />
        </div>
        
        {/* DATA POINTS AREA */}
        <div className="mt-6 space-y-3">
          <div className="h-5 bg-accent/20 rounded animate-pulse w-full" />
          <div className="h-5 bg-accent/20 rounded animate-pulse w-full" />
          <div className="h-5 bg-accent/20 rounded animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  );

  const renderLoadingSkeleton = () => {
    // CHOOSE THE APPROPRIATE SKELETON BASED ON CURRENT MODE 🔀
    switch(currentMode) {
      case 'film':
        // For film mode, we sometimes want to show the "No Results" skeleton
        // We'll check if we have an error response that indicates no results
        // This is a heuristic - we're guessing based on the error message or lack of results
        const showNoResultsSkeleton = error?.toLowerCase().includes('no plays') 
          || error?.toLowerCase().includes('no results')
          || (data && 'results' in data && Array.isArray((data as any).results) && (data as any).results.length === 0);
          
        return <FilmLoadingSkeleton noResults={showNoResultsSkeleton} />;
      case 'visualizer':
        return (
          <div className="space-y-6 w-full">
            <VisualizerLoadingSkeleton delay={0.3} />
          </div>
        );
      case 'answer':
      default:
        return (
          <div className="space-y-6 w-full">
            <AnswerLoadingSkeleton delay={0.3} />
            <AnswerLoadingSkeleton delay={0.5} />
          </div>
        );
    }
  };

  const transitionToContent = () => {
    if (isLoading && data) {
      return "animate-slide-up-out";
    }
    return "";
  }

  // Render the appropriate component based on the current mode
  const renderContent = () => {
    if (!showData || !data) return null;
    
    switch(currentMode) {
      case 'answer':
        return (
          <div className="flex-1 flex items-start justify-start w-full animate-fade-in opacity-0">
            <div className="w-full content-area">
              <DynamicLesson answer={answer} />
            </div>
          </div>
        );
      case 'visualizer':
        return <VisualizerPlaceholder data={data} />;
      case 'film':
        // Check if data has the clipper data structure
        if ('query' in data && 'results' in data) {
          return <BasketballClipper data={data as ClipperData} />;
        }
        return <div className="p-4 border border-red-500 rounded-lg">Invalid data format for Film mode</div>;
      default:
        return null;
    }
  };

  // Handle mode change from search input
  const handleModeChange = (newMode: AppMode) => {
    setCurrentMode(newMode);
    // SAVE MODE TO LOCALSTORAGE WHEN CHANGED 💾
    if (typeof window !== 'undefined') {
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
      console.log("Mode changed and saved to localStorage:", newMode);
    }
  }

  return (
    <div 
      className={`transition-all duration-300 ${
        isOpen ? 'md:ml-60' : 'ml-0'
      } min-h-screen justify-center bg-[hsl(var(--background))] p-2 pl-2 pr-2`}
    >
      <div className="w-full h-[calc(100vh-1.25rem)] flex flex-col relative overflow-hidden content-container border border-border">
        <div className={`flex-1 overflow-y-auto custom-scrollbar px-8 py-8 flex ${
          isRemoved ? 'items-start' : 'items-center'
        } transition-all duration-500 ease-in-out`}>
          <div className={`w-full max-w-3xl mx-auto flex-1 flex flex-col ${
            isRemoved ? 'justify-start pt-4' : 'justify-center'
          } transition-all duration-500 ease-in-out ${isRemoved ? 'animate-slide-to-top' : ''}`}>
            {!isRemoved && (
              <div className={`space-y-8 w-full ${isLoading ? 'opacity-0 transition-opacity duration-300' : ''}`}>
                <h1 className="text-4xl text-left mx-auto">
                  {title}
                </h1>

                <SearchInput 
                  onSearch={handleSearch} 
                  onModeChange={handleModeChange} 
                  initialMode={currentMode}
                />
                <SampleInput 
                  onSelect={(question) => {
                    handleSearch(question, currentMode);
                  }} 
                  mode={currentMode}
                />
              </div>
            )}

            {isRemoved && userPrompt && (
              <div className="w-full animate-slide-up-in opacity-0 mb-4" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-semibold">{userPrompt}</h2>
                </div>
              </div>
            )}
            
            <div className="h-2"></div>

            {isLoading && !showData && (
              <div className={`w-full ${transitionToContent()}`}>
                {/* Use the new renderLoadingSkeleton function to show the appropriate skeleton */}
                {renderLoadingSkeleton()}
              </div>
            )}

            {error && (
              <div className="w-full max-w-3xl mx-auto space-y-4 content-area">
                <h2 className="text-2xl font-bold text-red-500">Error Loading Data</h2>
                <p className="text-muted-foreground">{error}</p>
                <p className="text-sm">Please check that your API is running at {currentMode === 'film' ? FILM_API_URL : QUESTIONS_API_URL}</p>
                <button
                  onClick={() => handleSearch(userPrompt, currentMode)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Use the renderContent function to display the appropriate component */}
            {renderContent()}
          </div>
        </div>
      </div>

      <div className="h-16 md:h-0 block md:hidden"></div>
    </div>
  )
} 