"use client"

import { Clock, MessageSquare, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

// DEFINE TYPES FOR HISTORY ITEM 📋
interface HistoryItemProps {
  id: string
  prompt: string
  mode: 'answer' | 'visualizer'
  created_at: string
  onClick: () => void
  isActive?: boolean
  isLast?: boolean // Add prop to know if this is the last item
}

export default function HistoryItem({
  prompt,
  mode,
  created_at,
  onClick,
  isActive = false,
  isLast = false // Default to false
}: HistoryItemProps) {
  // FORMAT DATE FOR DISPLAY 📅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric'
      }).format(date)
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date)
    }
    
    // Otherwise show full date
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }
  
  // GET ICON BASED ON MODE 🔍
  const getIcon = () => {
    if (mode === 'visualizer') {
      return <Zap size={14} className="text-blue-500" />
    }
    return <MessageSquare size={14} className="text-green-500" />
  }
  
  // GET DOT COLOR BASED ON MODE AND ACTIVE STATE 🎨
  const getDotColor = () => {
    if (isActive) return "bg-white"
    if (mode === 'visualizer') return "bg-blue-500"
    return "bg-green-500"
  }
  
  return (
    <div className="relative pl-5 group"> 
      {/* TIMELINE LINE - VERTICAL LINE DOWN THE LEFT SIDE ⏱️ */}
      <div 
        className={cn(
          "absolute left-2 top-0 w-0.5 bg-border group-hover:bg-muted-foreground/50 transition-colors",
          isActive && "bg-muted-foreground/70",
          isLast ? "h-1/2" : "h-full" // Only extend halfway if it's the last item
        )}
      />
      
      {/* TIMELINE DOT - CIRCLE AT THE CURRENT ITEM'S POSITION 🔵 */}
      <div 
        className={cn(
          "absolute left-[0.33rem] top-0 bottom-0 my-auto w-[0.45rem] h-[0.45rem] rounded-full border-2 border-background z-10 transition-all flex items-center justify-center",
          getDotColor(),
          isActive && "w-3 h-3 absolute left-[0.20rem] top-0 bottom-0 my-auto" // Make dot larger when active but don't change position
        )}
        style={{ top: "20%", transform: "translateY(-50%)" }} // VERTICALLY CENTER THE DOT ⚡️
      />
      
      <button
        className={cn(
          "w-full text-left py-1 px-2 text-xs hover:bg-accent/30 rounded-sm transition-colors",
          isActive && "bg-accent/30"
        )}
        onClick={onClick}
      >
        <div className="font-medium truncate">{prompt}</div>
        <div className="text-xs text-muted-foreground flex justify-between items-center mt-0.5">
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{formatDate(created_at)}</span>
          </div>
          <div className="flex items-center gap-1 mr-1">
            {getIcon()}
            <span className="capitalize">{mode}</span>
          </div>
        </div>
      </button>
    </div>
  )
} 