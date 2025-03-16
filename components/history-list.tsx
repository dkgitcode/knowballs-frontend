"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import HistoryItem from "@/components/history-item"
import { usePathname } from "next/navigation"

// DEFINE TYPES FOR HISTORY ITEMS 📋
interface HistoryItem {
  id: string
  prompt: string
  answer: string
  mode: 'answer' | 'visualizer'
  created_at: string
}

interface HistoryResponse {
  success: boolean
  data: HistoryItem[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

interface HistoryListProps {
  onSelectQuestion: (item: HistoryItem) => void
  limit?: number
  searchQuery?: string
}

export default function HistoryList({ onSelectQuestion, limit = 5, searchQuery = "" }: HistoryListProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const { toast } = useToast()
  const pathname = usePathname()
  const isHistoryPage = pathname === '/history'

  // FETCH HISTORY DATA FROM API 🔄
  const fetchHistory = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      // Add search query parameter if provided
      const queryParam = searchQuery ? `&query=${encodeURIComponent(searchQuery)}` : ""
      const response = await fetch(`/api/history?page=${pageNum}&limit=${limit}${queryParam}`)
      
      if (!response.ok) {
        // If unauthorized, don't show error toast - this is normal for logged out users
        if (response.status === 401) {
          setHistory([])
          setHasMore(false)
          return
        }
        
        throw new Error(`Failed to fetch history: ${response.statusText}`)
      }
      
      const data: HistoryResponse = await response.json()
      
      if (!data.success) {
        throw new Error("Failed to load history data")
      }
      
      // If first page, replace history, otherwise append
      if (pageNum === 1) {
        setHistory(data.data)
      } else {
        setHistory(prev => [...prev, ...data.data])
      }
      
      // Check if there are more pages
      setHasMore(data.pagination.page < data.pagination.pages)
      setPage(data.pagination.page)
      
    } catch (err) {
      console.error("❌ ERROR FETCHING HISTORY:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      
      // Only show toast on the history page
      if (isHistoryPage) {
        toast({
          title: "Error Loading History",
          description: err instanceof Error ? err.message : "Failed to load your question history",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }, [searchQuery, limit, isHistoryPage, toast])
  
  // LOAD MORE HISTORY ITEMS 📚
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchHistory(page + 1)
    }
  }
  
  // HANDLE SELECTING A QUESTION FROM HISTORY 🔍
  const handleSelectQuestion = (item: HistoryItem) => {
    setActiveItemId(item.id)
    onSelectQuestion(item)
  }
  
  // FETCH HISTORY ON COMPONENT MOUNT AND WHEN SEARCH QUERY CHANGES 🚀
  useEffect(() => {
    fetchHistory()
    
    // REFRESH HISTORY EVERY 5 MINUTES 🔄
    const intervalId = setInterval(() => {
      fetchHistory()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(intervalId)
  }, [searchQuery, fetchHistory])
  
  // LISTEN FOR RESET MAIN CONTENT EVENT TO CLEAR ACTIVE ITEM 🧹
  useEffect(() => {
    const handleResetMainContent = () => {
      console.log("🔄 RESETTING ACTIVE HISTORY ITEM");
      setActiveItemId(null);
    }
    
    // Add event listener
    window.addEventListener('resetMainContent', handleResetMainContent)
    
    // Cleanup
    return () => {
      window.removeEventListener('resetMainContent', handleResetMainContent)
    }
  }, [])
  
  // RENDER LOADING SKELETONS 💀
  if (loading && history.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="py-1">
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-2 w-2/3" />
          </div>
        ))}
      </div>
    )
  }
  
  // RENDER EMPTY STATE 📭
  if (!loading && history.length === 0) {
    return (
      <div className="py-1 text-center">
        <p className="text-xs text-muted-foreground">
          {searchQuery ? `No results for "${searchQuery}"` : "No history yet"}
        </p>
      </div>
    )
  }
  
  // RENDER HISTORY LIST 📋
  return (
    <div>
      {error && (
        <div className="py-1 text-xs text-red-500">
          {error}
        </div>
      )}
      
      <div className="space-y-1 relative">
        {/* TIMELINE HEADER - STARTING POINT ⭐ */}
        {/* {history.length > 0 && (
          <div className="relative pl-5 pb-1">
            <div className="absolute left-2 top-0 w-0.5 h-full bg-border" />
            <div className="absolute left-[0.31rem] top-0 w-[0.45rem] h-[0.45rem] rounded-full bg-primary/80 border-2 border-background" />
            <div className="text-xs text-muted-foreground pl-2">History</div>
          </div>
        )} */}
        
        {/* TIMELINE CONTAINER WITH STYLING 📜 */}
        {history.map((item, index) => (
          <HistoryItem
            key={item.id}
            id={item.id}
            prompt={item.prompt}
            mode={item.mode}
            created_at={item.created_at}
            onClick={() => handleSelectQuestion(item)}
            isActive={activeItemId === item.id}
            isLast={index === history.length - 1} // Pass isLast=true for the last item
          />
        ))}
      </div>
      
      {hasMore && !isHistoryPage && (
        <div className="py-1 mt-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs h-6"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  )
} 