"use client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, BarChart2, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"


export default function SearchInput({ onSearch }: { onSearch: (prompt: string, mode: 'answer' | 'visualizer') => void }) {
  const [value, setValue] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState<'answer' | 'visualizer'>('answer')

  const { toast } = useToast()

  const placeholders = [
    "Who led the league in scoring last season?",
    "What is the average height of the starting lineup for the Bulls this season?",
    "Have there ever been a 30/20/20 triple-double in NBA history?",
    "What is the most points scored in a game this season?",
    "Who is the franchise leader of the Lakers in points?",
    "When did the Bucks last win a championship?",
  ]

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

  const toggleMode = (newMode: 'answer' | 'visualizer') => {
    setMode(newMode)
  }

  useEffect(() => {
    if (isTyping) {
      setDisplayedPlaceholder('')
      return
    }

    let currentText = ''
    let direction = 'typing'
    let currentIndex = placeholderIndex

    const interval = setInterval(() => {
      if (direction === 'typing') {
        if (currentText.length < placeholders[currentIndex].length) {
          currentText = placeholders[currentIndex].slice(0, currentText.length + 1)
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
          const randomIndex = Math.floor(Math.random() * placeholders.length)
          setPlaceholderIndex(randomIndex)
          currentIndex = randomIndex
        }
      }
    }, 50)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholderIndex, isTyping,])

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
              : 'text-indigo-500 border-indigo-500/30 hover:border-indigo-500'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </div>
  )
}
