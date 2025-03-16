"use client"
import SearchInput from "@/components/search-input"
import FollowUpInput from "@/components/follow-up-input"
import { useSidebarStore } from "@/components/sidebar"
import { useState, useRef, useEffect } from "react"
import SampleInput from "@/components/sample-input"
import DynamicLesson from "@/components/dynamic-lesson"
import { useToast } from "@/hooks/use-toast"
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

// DEFINE PROPS FOR OUR COMPONENT 🔄
interface MainContentProps {
  title?: string; // Optional title override
  apiBaseUrl?: string; // Allow customizing the API URL
  initialMode?: 'answer' | 'visualizer'; // Initial mode
  onResetRef?: React.MutableRefObject<(() => void) | null>; // Reference to reset function
}

export default function MainContent({
  title = "Ask me anything...",
  apiBaseUrl = "http://localhost:8000",
  initialMode = 'answer',
  onResetRef
}: MainContentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)
  const [showData, setShowData] = useState(false)
  const [answer, setAnswer] = useState("")
  const [userPrompt, setUserPrompt] = useState("")
  const [data, setData] = useState<LessonData | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Add state for current mode
  const [currentMode, setCurrentMode] = useState<'answer' | 'visualizer'>(initialMode)
  const { toast } = useToast()
  // GET SIDEBAR STATE FROM ZUSTAND STORE 🔄
  const { isOpen } = useSidebarStore()

  // Create a ref to store the fetch controller for cancellation
  const controllerRef = useRef<AbortController | null>(null);

  // HANDLE USER SEARCH INPUT 🔍
  const handleSearch = async (prompt: string, mode: 'answer' | 'visualizer' = 'answer') => {
    if (!prompt.trim()) return;

    // FIRST CHECK AUTHENTICATION BEFORE STARTING ANY ANIMATIONS OR LOADING STATES ✅
    try {
      // Quick authentication check before proceeding
      const isAuthenticated = await checkAuthentication();
      if (!isAuthenticated) {
        // Show toast but don't start any animations or loading states
        toast({
          title: "Authentication Required",
          description: "You must be logged in to use this feature.",
          variant: "destructive"
        });
        return; // Exit early - don't proceed with search
      }
      
      // Only set loading states AFTER confirming authentication
      setUserPrompt(prompt);
      setIsLoading(true);
      setIsRemoved(true);
      setError(null);
      setCurrentMode(mode);
      
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

      // MAKE API CALL TO FETCH LESSON DATA 🚀
      console.log(`🚀 FETCHING ${mode.toUpperCase()} DATA with prompt:`, prompt);

      // USE SECURE INTERNAL API PROXY INSTEAD OF DIRECT EXTERNAL API CALL 🔒
      // This ensures authentication is validated before the request reaches the external API
      const response = await fetch(`/api/proxy?mode=${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: prompt }),
        signal: controllerRef.current.signal
      });

      if (!response.ok) {
        // Handle other non-auth errors (since auth is already checked)
        throw new Error(`API request failed with status ${response.status}`);
      }

      // PARSE THE RESPONSE CAREFULLY 🧐
      const json_data = await response.json();
      console.log(`🔍 FULL ${mode.toUpperCase()} API RESPONSE:`, json_data);
      
      // Extract data with safety checks
      const tool_used = json_data.tool_used || 'unknown';
      console.log(`Used tool: ${tool_used}`);
      
      // SAFELY EXTRACT DATA WITH DETAILED LOGGING 📊
      let extractedData = null;
      let extractedAnswer = "";
      
      if (json_data.tool_result && json_data.tool_result.data) {
        extractedData = json_data.tool_result.data;
        console.log("✅ EXTRACTED DATA:", extractedData);
      } else {
        console.warn("⚠️ NO DATA FOUND IN TOOL RESULT");
        // Create a minimal valid data structure
        extractedData = { content: [] };
      }
      
      // ENSURE DATA HAS THE CORRECT STRUCTURE 🧩
      if (!extractedData.content) {
        console.warn("⚠️ DATA MISSING CONTENT ARRAY, ADDING EMPTY CONTENT ARRAY");
        extractedData.content = [];
      }
      
      if (json_data.answer) {
        extractedAnswer = json_data.answer;
        console.log("✅ EXTRACTED ANSWER:", extractedAnswer.substring(0, 100) + "...");
      } else {
        console.warn("⚠️ NO ANSWER FOUND IN RESPONSE");
        extractedAnswer = "Sorry, I couldn't generate an answer for your query.";
      }
      
      // DEBUG LOGS TO CHECK DATA BEFORE SETTING STATE 🔍
      console.log("📊 DATA BEFORE STATE UPDATE:", {
        mode,
        data: extractedData,
        answer: extractedAnswer,
        isDataValid: !!extractedData,
        answerLength: extractedAnswer ? extractedAnswer.length : 0
      });
      
      // Update state with extracted data
      setAnswer(extractedAnswer);
      setData(extractedData);
      
      // IMPORTANT: Set showData to true AFTER setting the data and answer
      setTimeout(() => {
        setShowData(true);
        console.log("🔄 STATE AFTER UPDATE WITH TIMEOUT:", {
          mode,
          showData: true,
          dataExists: !!extractedData,
          errorExists: !!error
        });
      }, 100);
      
      // SAVE QUESTION AND ANSWER TO DATABASE 💾
      if (extractedAnswer) {
        try {
          console.log("📝 SAVING QUESTION AND ANSWER TO DATABASE...");
          const saveResponse = await fetch('/api/history/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: prompt,
              answer: extractedAnswer,
              mode: mode
            })
          });
          
          if (!saveResponse.ok) {
            console.warn("⚠️ FAILED TO SAVE QUESTION HISTORY:", await saveResponse.text());
          } else {
            console.log("✅ QUESTION HISTORY SAVED SUCCESSFULLY");
          }
        } catch (saveError) {
          // Don't let saving errors affect the main functionality
          console.error("❌ ERROR SAVING QUESTION HISTORY:", saveError);
        }
      }
      
    } catch (err) {
      // Only log errors that aren't from aborting the request
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error(`❌ ERROR FETCHING ${mode.toUpperCase()} DATA:`, err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // CHECK AUTHENTICATION STATUS BEFORE PROCEEDING WITH SEARCH 🔐
  const checkAuthentication = async (): Promise<boolean> => {
    try {
      // Make a lightweight request to check auth status
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // If we get a 401, user is not authenticated
      if (response.status === 401) {
        return false;
      }
      
      // Any other non-200 response is treated as an error but not necessarily auth-related
      if (!response.ok) {
        console.error(`Auth check failed with status ${response.status}`);
        // We'll assume auth is OK and let the main request handle any other errors
        return true;
      }
      
      return true;
    } catch (err) {
      console.error("❌ ERROR CHECKING AUTHENTICATION:", err);
      // On error, we'll assume auth is OK and let the main request handle any issues
      return true;
    }
  }

  // LOAD QUESTION FROM HISTORY 📚
  const loadQuestionFromHistory = (prompt: string, answer: string, mode: 'answer' | 'visualizer' = 'answer') => {
    // Set the user prompt
    setUserPrompt(prompt)
    
    // Set the mode
    setCurrentMode(mode)
    
    // Reset previous data
    setData(null)
    setError(null)
    
    // Show the question at the top
    setIsRemoved(true)
    
    // Set the answer
    setAnswer(answer)
    
    // Create a minimal valid data structure if we don't have content
    const extractedData: LessonData = { 
      content: [],
      combined_markdown: answer
    }
    
    // Set the data
    setData(extractedData)
    
    // Show the data
    setTimeout(() => {
      setShowData(true)
    }, 100)
    
    // Log that we loaded from history
    console.log("📚 LOADED QUESTION FROM HISTORY:", { prompt, mode })
  }

  // DEFINE RESET CHAT FUNCTION BEFORE USING IT IN USEEFFECT 🧹
  const resetChat = () => {
    setIsLoading(false)
    setIsRemoved(false)
    setShowData(false)
    setUserPrompt("")
    setData(null)
    setError(null)
    setCurrentMode(initialMode)

    // Cancel any in-progress fetches
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  }

  // LISTEN FOR HISTORY QUESTION EVENTS 👂
  useEffect(() => {
    const handleHistoryQuestion = (event: any) => {
      const { prompt, answer, mode } = event.detail
      loadQuestionFromHistory(prompt, answer, mode)
    }
    
    // LISTEN FOR RESET MAIN CONTENT EVENT 🧹
    const handleResetMainContent = () => {
      console.log("🔄 RESETTING MAIN CONTENT STATE");
      resetChat();
    }
    
    // Add event listeners
    window.addEventListener('loadHistoryQuestion', handleHistoryQuestion)
    window.addEventListener('resetMainContent', handleResetMainContent)
    
    // Cleanup
    return () => {
      window.removeEventListener('loadHistoryQuestion', handleHistoryQuestion)
      window.removeEventListener('resetMainContent', handleResetMainContent)
    }
  }, [resetChat]) // NOW resetChat IS DEFINED BEFORE BEING USED HERE ✅

  const LoadingSkeleton = ({ delay }: { delay: number }) => (
    <div
      className="animate-slide-up-in opacity-0"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="h-24 bg-accent/20 rounded-lg animate-pulse" />
    </div>
  )

  // ADD A TRANSITION EFFECT BETWEEN LOADING AND CONTENT 🔄
  const transitionToContent = () => {
    // This function helps create a smooth transition between loading and content
    if (isLoading && data) {
      return "animate-slide-up-out";
    }
    return "";
  }

  // EXPOSE RESET FUNCTION VIA REF FOR EXTERNAL COMPONENTS 🔄
  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = resetChat;
    }
    
    // CLEANUP FUNCTION TO REMOVE REFERENCE WHEN COMPONENT UNMOUNTS 🧹
    return () => {
      if (onResetRef) {
        onResetRef.current = null;
      }
    };
  }, [onResetRef, initialMode]); // Include initialMode in dependencies

  return (
    <div 
      className={`transition-all duration-300 ${
        isOpen ? 'md:ml-60' : 'ml-0'
      } min-h-screen justify-center bg-[hsl(var(--background))] p-2 pl-2 pr-2`}
    >
      {/* CONTENT CONTAINER WITH ROUNDED CORNERS AND BORDER INSTEAD OF TRIM ✨ */}
      <div className="w-full h-[calc(100vh-1.25rem)] flex flex-col relative overflow-hidden content-container border border-border">
        {/* SCROLLABLE CONTENT AREA 📜 */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar px-8 py-8 flex ${
          isRemoved ? 'items-start' : 'items-center'
        } transition-all duration-500 ease-in-out`}>
          <div className={`w-full max-w-3xl mx-auto flex-1 flex flex-col ${
            isRemoved ? 'justify-start pt-4' : 'justify-center'
          } transition-all duration-500 ease-in-out ${isRemoved ? 'animate-slide-to-top' : ''}`}>
            {/* INITIAL SEARCH SECTION 🔎 */}
            {!isRemoved && (
              <div className={`space-y-8 w-full ${isLoading ? 'opacity-0 transition-opacity duration-300' : ''}`}>
                <h1 className="text-4xl text-left mx-auto">
                  {title}
                </h1>
                <SearchInput onSearch={handleSearch} />
                <SampleInput onSelect={(question) => {
                  // Handle the selected sample question
                  console.log(question);
                  handleSearch(question, 'answer');
                }} />
              </div>
            )}

            {/* Display prompt at top when loading or showing data */}
            {isRemoved && userPrompt && (
              <div className="w-full animate-slide-up-in opacity-0 mb-4" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-semibold">{userPrompt}</h2>
                </div>
              </div>
            )}
            
            {/* 100px of space */}
            <div className="h-2"></div>

            {/* Loading Skeletons */}
            {isLoading && !showData && (
              <div className={`space-y-6 w-full ${transitionToContent()}`}>
                {/* Content Skeletons */}
                <div className="space-y-4">
                  <LoadingSkeleton delay={0.3} />
                  <LoadingSkeleton delay={0.4} />
                  <LoadingSkeleton delay={0.5} />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="w-full max-w-3xl mx-auto space-y-4 content-area">
                <h2 className="text-2xl font-bold text-red-500">Error Loading Lesson</h2>
                <p className="text-muted-foreground">{error}</p>
                <p className="text-sm">Please check that your local API is running at {apiBaseUrl}</p>
                <button
                  onClick={() => handleSearch(userPrompt, currentMode)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* DYNAMIC LESSON SECTION - FADES IN WHEN DATA IS LOADED ✨ */}
            {/* SHOULD RENDER WHEN: showData && data && !error */}
            {showData && data && !error && (
              <div className="flex-1 flex items-start justify-start w-full animate-fade-in opacity-0">
                <div className="w-full content-area">
                  <DynamicLesson data={data} prompt={userPrompt} answer={answer} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM PADDING FOR MOBILE NAV BAR 📱 */}
      <div className="h-16 md:h-0 block md:hidden"></div>
    </div>
  )
} 