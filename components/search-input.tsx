"use client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, BarChart2, MessageSquare, Video } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"

interface SearchInputProps {
  onSearch: (prompt: string, mode: 'answer' | 'visualizer' | 'clipper') => void;
  onModeChange?: (mode: 'answer' | 'visualizer' | 'clipper') => void;
  initialMode?: 'answer' | 'visualizer' | 'clipper';
}

export default function SearchInput({ 
  onSearch, 
  onModeChange,
  initialMode = 'answer'
}: SearchInputProps) {
  const [value, setValue] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState<'answer' | 'visualizer' | 'clipper'>(initialMode)

  const { toast } = useToast()

  // ✨ MODE-SPECIFIC PLACEHOLDERS ✨
  const answerPlaceholders = [
    "Who led the league in scoring last season?",
    "What is the average height of the starting lineup for the Bulls this season?",
    "Have there ever been a 30/20/20 triple-double in NBA history?",
    "What is the most points scored in a game this season?",
    "Who is the franchise leader of the Lakers in points?",
    "When did the Bucks last win a championship?",
  ]
  
  const visualizerPlaceholders = [
    "Show me LeBron James shot chart when playing against the Suns",
    "Visualize Steph Curry's 3-point percentage by season",
    "Create a shot chart for Giannis in the 2021 Finals",
    "Show me the Celtics team shooting percentages by zone",
    "Compare Jokic and Embiid's scoring efficiency this season",
    "Visualize Lakers vs Warriors scoring trends by quarter",
  ]
  
  const clipperPlaceholders = [
    "2016 Steph Curry threes",
    "LeBron clutch blocks",
    "Wembanyama floating threes",
    "Kobe Bryant fadeaway jumpers",
    "Jordan game winners",
    "Magic Johnson no-look passes",
  ]

  // 🎯 GET CURRENT MODE'S PLACEHOLDERS
  const getActivePlaceholders = () => {
    switch(mode) {
      case 'visualizer': return visualizerPlaceholders;
      case 'clipper': return clipperPlaceholders;
      default: return answerPlaceholders;
    }
  }

  const handleSearch = () => {
    if (!value.trim()) {
      toast({
        title: "Hmm...",
        description: "We don't teach that here.",
      })
      return
    }
    onSearch(value, mode)
    console.log(`Searching in ${mode} mode:`, value)
  }

  const toggleMode = (newMode: 'answer' | 'visualizer' | 'clipper') => {
    setMode(newMode)
    // NOTIFY PARENT COMPONENT ABOUT MODE CHANGE 🔄
    if (onModeChange) {
      onModeChange(newMode);
    }
    // RESET PLACEHOLDER ANIMATION WHEN MODE CHANGES 🔄
    setIsTyping(false)
    setDisplayedPlaceholder('')
    setPlaceholderIndex(Math.floor(Math.random() * getActivePlaceholders().length))
  }

  // SYNC WITH INITIAL MODE FROM PROPS
  useEffect(() => {
    if (initialMode !== mode) {
      setMode(initialMode)
      setIsTyping(false)
      setDisplayedPlaceholder('')
      setPlaceholderIndex(Math.floor(Math.random() * getActivePlaceholders().length))
    }
  }, [initialMode])

  useEffect(() => {
    if (isTyping) {
      setDisplayedPlaceholder('')
      return
    }

    let currentText = ''
    let direction = 'typing'
    let currentIndex = placeholderIndex
    const activePlaceholders = getActivePlaceholders()

    const interval = setInterval(() => {
      if (direction === 'typing') {
        if (currentText.length < activePlaceholders[currentIndex].length) {
          currentText = activePlaceholders[currentIndex].slice(0, currentText.length + 1)
          setDisplayedPlaceholder(currentText)
        } else {
          setTimeout(() => {
            direction = 'deleting'
          }, 2000)
        }
      } else {
        if (currentText.length > 0) {
          currentText = currentText.slice(0, -1)
          setDisplayedPlaceholder(currentText)
        } else {
          direction = 'typing'
          const randomIndex = Math.floor(Math.random() * activePlaceholders.length)
          setPlaceholderIndex(randomIndex)
          currentIndex = randomIndex
        }
      }
    }, 50)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholderIndex, isTyping, mode])

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* MODE TOGGLE BADGES - BOTH VISIBLE AT ONCE 🔄 */}
      <div className="flex justify-end mb-2 gap-2">
        <button
          onClick={() => toggleMode('answer')}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            mode === 'answer' 
              ? 'bg-primary/10 text-primary border border-primary/30' 
              : 'bg-muted/30 text-muted-foreground hover:bg-primary/5 hover:text-primary/70'
          }`}
        >
          <MessageSquare className="h-3 w-3" />
          <span>Answer Mode</span>
        </button>
        
        <button
          onClick={() => toggleMode('visualizer')}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            mode === 'visualizer' 
              ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/30' 
              : 'bg-muted/30 text-muted-foreground hover:bg-indigo-500/5 hover:text-indigo-500/70'
          }`}
        >
          <BarChart2 className="h-3 w-3" />
          <span>Visualizer</span>
        </button>

        <button
          onClick={() => toggleMode('clipper')}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
            mode === 'clipper' 
              ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
              : 'bg-muted/30 text-muted-foreground hover:bg-green-500/5 hover:text-green-500/70'
          }`}
        >
          {/* video icon */}
          <Video className="h-3 w-3" />
          <span>Clipper</span>
        </button>
      </div>
      
      <div className="relative">
        <Textarea
          placeholder={displayedPlaceholder}
          className="pr-14 py-4 text-lg min-h-[100px] max-h-[300px] rounded-xl bg-background text-foreground placeholder-muted-foreground/50 border-2 border-border focus:border-primary/50 focus:ring-0 resize-none overflow-hidden transition-all duration-200 ease-in-out"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsTyping(true)}
          onBlur={() => {
            if (!value) setIsTyping(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSearch()
            }
          }}
          style={{ height: Math.max(100, Math.min(value.split('\n').length * 24 + 40, 300)) }}
        />
        <Button
          size="icon"
          onClick={handleSearch}
          className={`absolute right-3 bottom-3 rounded-full bg-transparent hover:bg-accent/50 border transition-colors ${
            mode === 'answer'
              ? 'text-primary border-primary/30 hover:border-primary'
              : mode === 'visualizer'
                ? 'text-indigo-500 border-indigo-500/30 hover:border-indigo-500'
                : 'text-green-500 border-green-500/30 hover:border-green-500'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </div>
  )
}
