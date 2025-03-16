"use client"

import { useState, useEffect, useCallback } from "react"
import { useSidebarStore } from "@/components/sidebar"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { History, MessageSquare, Zap, Clock, Search, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import DynamicLesson from "./dynamic-lesson"

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

// CUSTOM HOOK FOR DEBOUNCING INPUT VALUES ⏱️
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    // Clean up the timer if the value changes before the delay has passed
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  
  return debouncedValue
}

export default function HistoryContent() {
  const { isOpen } = useSidebarStore()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  // DEBOUNCE SEARCH QUERY WITH 500MS DELAY ⏱️
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // FETCH HISTORY DATA FROM API 🔄
  const fetchHistory = useCallback(async (pageNum = 1, query = "") => {
    try {
      setLoading(true)
      
      // Add search query parameter if provided
      const queryParam = query ? `&query=${encodeURIComponent(query)}` : ""
      const response = await fetch(`/api/history?page=${pageNum}&limit=20${queryParam}`)
      
      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          router.push('/login?next=/history')
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
        // Reset selected item when search changes
        setSelectedItem(null)
      } else {
        setHistory(prev => [...prev, ...data.data])
      }
      
      // Check if there are more pages
      setHasMore(data.pagination.page < data.pagination.pages)
      setPage(data.pagination.page)
      
    } catch (err) {
      console.error("❌ ERROR FETCHING HISTORY:", err)
      
      toast({
        title: "Error Loading History",
        description: err instanceof Error ? err.message : "Failed to load your question history",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [router, toast])
  
  // LOAD MORE HISTORY ITEMS 📚
  const loadMore = () => {
    if (hasMore && !loading) {
      fetchHistory(page + 1, searchQuery)
    }
  }
  
  // HANDLE SELECTING A QUESTION FROM HISTORY 🔍
  const handleSelectQuestion = (item: HistoryItem) => {
    setSelectedItem(item)
  }
  
  // OPEN SELECTED QUESTION IN MAIN CHAT 💬
  const openInChat = (item: HistoryItem) => {
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
  
  // HANDLE SEARCH INPUT CHANGE 🔍
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  // CLEAR SEARCH QUERY 🧹
  const clearSearch = () => {
    setSearchQuery("")
    fetchHistory(1, "")
  }
  
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
  const getModeIcon = (mode: 'answer' | 'visualizer') => {
    if (mode === 'visualizer') {
      return <Zap size={16} className="text-blue-500" />
    }
    return <MessageSquare size={16} className="text-green-500" />
  }
  
  // DELETE HISTORY ITEM 🗑️
  const deleteHistoryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      return
    }
    
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/history/delete?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.statusText}`)
      }
      
      // Remove the item from the list
      setHistory(prev => prev.filter(item => item.id !== id))
      
      // If the deleted item was selected, clear the selection
      if (selectedItem?.id === id) {
        setSelectedItem(null)
      }
      
      toast({
        title: "Deleted",
        description: "Conversation has been deleted successfully",
      })
      
    } catch (err) {
      console.error("❌ ERROR DELETING HISTORY ITEM:", err)
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete conversation",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }
  
  // FETCH HISTORY ON COMPONENT MOUNT AND WHEN DEBOUNCED SEARCH QUERY CHANGES 🚀
  useEffect(() => {
    fetchHistory(1, debouncedSearchQuery)
  }, [debouncedSearchQuery, fetchHistory])
  
  // INITIAL FETCH ON MOUNT (REMOVE THE OLD ONE)
  useEffect(() => {
    // This is intentionally left empty as the above effect will handle the initial fetch
  }, [])
  
  return (
    <div 
      className={`transition-all duration-300 ${
        isOpen ? 'md:ml-60' : 'ml-0'
      } min-h-screen justify-center bg-[hsl(var(--background))] p-2 pl-2 pr-2`}
    >
      {/* CONTENT CONTAINER WITH ROUNDED CORNERS AND BORDER ✨ */}
      <div className="w-full h-[calc(100vh-1.25rem)] flex flex-col relative overflow-hidden content-container border border-border">
        {/* SCROLLABLE CONTENT AREA 📜 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8">
          <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Your History</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                View and search through your past questions
              </p>
            </div>
            
            {/* Search Bar - Modified to use debounced search */}
            <div className="mb-8">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search your history..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pr-10"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
                {loading && debouncedSearchQuery !== searchQuery ? (
                  <Button disabled>
                    <span className="animate-spin mr-2">⟳</span>
                    Searching...
                  </Button>
                ) : (
                  <Button type="button" onClick={() => fetchHistory(1, searchQuery)}>
                    <Search size={18} className="mr-2" />
                    Search
                  </Button>
                )}
              </div>
              {/* {debouncedSearchQuery !== searchQuery && (
                <p className="text-xs text-muted-foreground mt-1">Typing will automatically search after a brief pause...</p>
              )} */}
            </div>
            
            {/* Main Content Area - Split View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - History List */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-accent/30 p-4 border-b border-border flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center">
                    <History size={20} className="mr-2" />
                    Questions
                  </h2>
                  {searchQuery && !loading && (
                    <div className="text-sm text-muted-foreground">
                      {history.length} result{history.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
                
                {/* RENDER LOADING SKELETONS 💀 */}
                {loading && history.length === 0 ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="py-2">
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : null}
                
                {/* RENDER EMPTY STATE 📭 */}
                {!loading && history.length === 0 ? (
                  <div className="p-8 text-center">
                    <History size={40} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">No history yet</p>
                    <p className="text-muted-foreground mb-4">
                      Your questions will appear here
                    </p>
                    <Button onClick={() => router.push('/')}>
                      Ask a question
                    </Button>
                  </div>
                ) : null}
                
                {/* RENDER HISTORY LIST 📋 */}
                {history.length > 0 ? (
                  <div className="divide-y divide-border max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        className={`w-full text-left p-4 hover:bg-accent/30 transition-colors ${
                          selectedItem?.id === item.id ? 'bg-accent/30' : ''
                        }`}
                        onClick={() => handleSelectQuestion(item)}
                      >
                        <div className="font-medium truncate">{item.prompt}</div>
                        <div className="text-sm text-muted-foreground flex justify-between items-center mt-1">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getModeIcon(item.mode)}
                            <span className="capitalize">{item.mode}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="p-4 border-t border-border">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Right Column - Selected Item Detail */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-accent/30 p-4 border-b border-border">
                  <h2 className="text-xl font-semibold flex items-center">
                    <MessageSquare size={20} className="mr-2" />
                    Question Details
                  </h2>
                </div>
                
                {selectedItem ? (
                  <div className="p-4 max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Question</h3>
                      <div className="p-3 bg-accent/20 rounded-lg">
                        {selectedItem.prompt}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Answer</h3>
                      <div className="p-3 bg-accent/20 rounded-lg prose-sm max-w-none">
                        <DynamicLesson 
                          answer={selectedItem.answer}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Details</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <span className="text-muted-foreground">Date:</span>
                          <div>{new Date(selectedItem.created_at).toLocaleString()}</div>
                        </div>
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <span className="text-muted-foreground">Mode:</span>
                          <div className="flex items-center gap-1">
                            {getModeIcon(selectedItem.mode)}
                            <span className="capitalize">{selectedItem.mode}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => openInChat(selectedItem)}
                      >
                        <MessageSquare size={16} className="mr-2" />
                        Open in Chat
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => deleteHistoryItem(selectedItem.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 size={16} className="mr-2" />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center h-[calc(100%-61px)] flex items-center justify-center">
                    <div>
                      <MessageSquare size={40} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium">No conversation selected</p>
                      <p className="text-muted-foreground">
                        Select a conversation from the list to view details
                      </p>
                    </div>
                  </div>
                )}
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