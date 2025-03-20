"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Calendar, Star, ArrowUpDown, SortDesc, Filter, Search, X } from 'lucide-react'

// Import Shadcn components
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Define types for the basketball play data
interface VideoSizes {
  url: string
  thumbnail: string
  duration: number
}

interface Videos {
  small: VideoSizes
  medium: VideoSizes
  large: VideoSizes
  captions: {
    vtt: string
    scc: string
    srt: string
  }
}

// Tag types for basketball plays
interface PlayTag {
  clutch?: boolean
  distance?: string
  score_type?: string
}

interface BasketballPlay {
  game_id: string
  event_id: number
  date: string
  game_code: string
  period: number
  description: string
  home_team: string
  home_team_id: number
  visiting_team: string
  visiting_team_id: number
  home_score_before: number
  home_score_after: number
  visitor_score_before: number
  visitor_score_after: number
  point_differential_after: number
  videos: Videos
  tags: PlayTag[] // Added tags array
}

interface ClipperProps {
  data: {
    query: string
    parameters: Record<string, any>
    results: BasketballPlay[]
    message: string
  }
}

// OUTSIDE COMPONENT - MEMOIZE PURE UTILITY FUNCTIONS 🧠
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// REMOVES THE FIRST WORD FROM A STRING NO MATTER WHAT! 🔥
const removeFirstWord = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Trim any leading whitespace first
  const trimmed = text.trim();
  
  // Find the position of the first space
  const firstSpaceIndex = trimmed.indexOf(' ');
  
  // If no space is found, it means there's only one word or empty string
  if (firstSpaceIndex === -1) return '';
  
  // Return everything after the first space
  return trimmed.substring(firstSpaceIndex + 1);
}

const extractTeams = (gameCode: string) => {
  if (!gameCode) return { home: '', away: '' }
  
  const parts = gameCode.split('/')
  if (parts.length < 2) return { home: '', away: '' }
  
  const teamCodes = parts[1]
  if (teamCodes.length < 6) return { home: '', away: '' }
  
  const away = teamCodes.substring(0, 3)
  const home = teamCodes.substring(3)
  
  return { home, away }
}

// Badge utilities for tags
const getTagBadgeColor = (tagKey: string, tagValue: any): string => {
  switch(tagKey) {
    case 'clutch':
      return 'bg-blue-500/20 border-blue-400/40 text-blue-200'
    case 'distance':
      if (tagValue === 'Mid range') return 'bg-indigo-500/20 border-indigo-400/40 text-indigo-200'
      if (tagValue === 'Logo') return 'bg-orange-600/20 border-orange-500/40 text-orange-200'
      if (tagValue === 'Downtown') return 'bg-red-600/20 border-red-500/40 text-red-200'
      if (tagValue === 'Half court') return 'bg-purple-600/20 border-purple-500/40 text-purple-200'
      return 'bg-blue-500/20 border-blue-400/40 text-blue-200'
    case 'score_type':
      return 'bg-green-600/20 border-green-500/40 text-green-200'
    default:
      return 'bg-gray-700/40 border-gray-500/40 text-gray-200'
  }
}

const getTagIcon = (tagKey: string, tagValue: any): string => {
  switch(tagKey) {
    case 'clutch':
      return '🧊'
    case 'distance':
      if (tagValue === 'Mid range') return '🎯'
      if (tagValue === 'Logo') return '💫'
      if (tagValue === 'Downtown') return '🌆'
      if (tagValue === 'Half court') return '🛰️'
      return '📏'
    case 'score_type':
      if (tagValue === 'Lead taking') return '🔄'
      if (tagValue === 'Game tying') return '🪢'
      return '🔄'
    default:
      return '🏷️'
  }
}

const getTagDisplayValue = (tagKey: string, tagValue: any): string => {
  if (tagKey === 'clutch' && tagValue === true) return 'Clutch'
  if (tagKey === 'score_type' && tagValue === 'Lead taking') return 'Lead Change'
  if (tagKey === 'score_type' && tagValue === 'Game tying') return 'Game Tying'
  
  return tagValue.toString()
}

// Sort options type
type SortOption = 'default' | 'date-desc' | 'date-asc';

// AVAILABLE TAG FILTERS - HARDCODED FOR NOW 🏷️
const availableTagFilters = [
  { key: 'clutch', value: true, label: 'Clutch', icon: '🧊' },
  { key: 'score_type', value: 'Lead taking', label: 'Lead Change', icon: '🔄' },
  { key: 'score_type', value: 'Game tying', label: 'Game Tying', icon: '🪢' },
  { key: 'distance', value: 'Mid range', label: 'Mid Range', icon: '🎯' },
  { key: 'distance', value: 'Logo', label: 'Logo', icon: '💫' },
  { key: 'distance', value: 'Downtown', label: 'Downtown', icon: '🌆' },
  { key: 'distance', value: 'Half court', label: 'Half Court', icon: '🛰️' },
];

// HELPER FOR CHECKING IF A PLAY HAS A SPECIFIC TAG 🔍
const hasTag = (play: BasketballPlay, tagKey: string, tagValue: any): boolean => {
  if (!play.tags || !Array.isArray(play.tags)) return false;
  
  return play.tags.some(tag => {
    const entries = Object.entries(tag);
    if (entries.length === 0) return false;
    
    const [key, value] = entries[0];
    return key === tagKey && value === tagValue;
  });
};

export default function BasketballClipper({ data }: ClipperProps) {
  // State for video display and filtering
  const [visibleCount, setVisibleCount] = useState(10)  // Number of videos to display
  const [sortOption, setSortOption] = useState<SortOption>('default') // Sort state
  const [activeTagFilters, setActiveTagFilters] = useState<{key: string, value: any}[]>([]) // Tag filters
  const [searchQuery, setSearchQuery] = useState('') // Description search
  const [showFilters, setShowFilters] = useState(false) // Toggle filter panel
  
  // Refs
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const videoContainersRef = useRef<(HTMLDivElement | null)[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // FILTER & SORT THE RESULTS BASED ON SELECTED OPTIONS ✨
  const filteredAndSortedResults = useMemo(() => {
    if (!data?.results) return [];
    
    // First filter by tag filters and search query
    let filtered = [...data.results];
    
    // Apply tag filters if any are active
    if (activeTagFilters.length > 0) {
      filtered = filtered.filter(play => {
        // Must match ALL active tag filters
        return activeTagFilters.every(filter => 
          hasTag(play, filter.key, filter.value)
        );
      });
    }
    
    // Apply search query filter if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(play => 
        play.description.toLowerCase().includes(query)
      );
    }
    
    // Then apply sorting
    if (sortOption === 'default') return filtered;
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      // Sort by date (newest to oldest)
      if (sortOption === 'date-desc') {
        return dateB - dateA;
      }
      
      // Sort by date (oldest to newest)
      if (sortOption === 'date-asc') {
        return dateA - dateB;
      }
      
      return 0; // Fallback
    });
  }, [data?.results, sortOption, activeTagFilters, searchQuery]);
  
  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [activeTagFilters, searchQuery, sortOption]);
  
  // Toggle a tag filter
  const toggleTagFilter = useCallback((tagKey: string, tagValue: any) => {
    setActiveTagFilters(prev => {
      // Check if this filter is already active
      const isActive = prev.some(filter => 
        filter.key === tagKey && filter.value === tagValue
      );
      
      if (isActive) {
        // Remove the filter
        return prev.filter(
          filter => !(filter.key === tagKey && filter.value === tagValue)
        );
      } else {
        // Add the filter
        return [...prev, { key: tagKey, value: tagValue }];
      }
    });
  }, []);
  
  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveTagFilters([]);
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  }, []);
  
  // Load more videos when user scrolls to the bottom
  const loadMore = useCallback(() => {
    if (filteredAndSortedResults.length && visibleCount < filteredAndSortedResults.length) {
      setVisibleCount(prev => Math.min(prev + 10, filteredAndSortedResults.length))
    }
  }, [filteredAndSortedResults, visibleCount])
  
  // Setup IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (!filteredAndSortedResults.length) return
    
    // Setup the scroll observer for infinite loading
    const scrollObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )
    
    // Observe the last element to trigger loading more
    const lastElement = videoContainersRef.current[Math.min(visibleCount - 1, videoContainersRef.current.length - 1)]
    if (lastElement) {
      scrollObserver.observe(lastElement)
    }
    
    return () => {
      scrollObserver.disconnect()
    }
  }, [filteredAndSortedResults, visibleCount, loadMore])
  
  // Initialize video references for all videos
  useEffect(() => {
    if (filteredAndSortedResults.length) {
      videoRefs.current = videoRefs.current.slice(0, filteredAndSortedResults.length)
      videoContainersRef.current = videoContainersRef.current.slice(0, filteredAndSortedResults.length)
    }
  }, [filteredAndSortedResults])
  
  // No results state
  if (!data?.results || data.results.length === 0) {
    // Extract key context from parameters if available
    const season = data.parameters?.season || null;
    const player = data.parameters?.player_name || null;
    const measure = data.parameters?.context_measure || null;
    const season_type = data.parameters?.season_type || null;
    {console.log(data.parameters)}
    return (
      <div className="w-full animate-fade-in opacity-0">
        <div className="p-8 border border-border rounded-lg bg-accent/5">
          {/* SIMPLIFIED NO RESULTS UI 🔍 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h2 className="text-2xl font-bold">No Plays Found</h2>
            <p className="text-muted-foreground mt-2">
              We couldn't find any basketball plays matching your search.
            </p>
          </div>
          
          {/* SIMPLE QUERY DISPLAY WITH KEY CONTEXT */}
          <div className="mb-6 max-w-md mx-auto">
            <div className="bg-accent/10 p-4 rounded-md border border-accent/20">
              <div className="">
                {/* CONTEXT DETAILS - ONLY SHOW IF AVAILABLE */}
                {(player || season || measure) && (
                  <div className=" pt-2 border-t border-accent/20 ">
                    {player && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-[80px]">Player:</span>
                        <span className="font-medium">{player}</span>
                      </div>
                    )}
                    
                    {season && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-[80px]">Season:</span>
                        <span className="font-medium">{season}</span>
                      </div>
                    )}
                    
                    {measure && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-[80px]">Measure:</span>
                        <span className="font-medium">{measure}</span>
                      </div>
                    )}
                    {season_type && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-[80px]">Season Type:</span>
                        <span className="font-medium">{season_type}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
            </div>
            {/* add a note that says we only have playoff data from 2022 and on, and regular season data from 2015 and on*/}
            <div className="text-muted-foreground">
              <p>Note: We only have playoff data from 2022 and on, and regular season data from 2015 and on.</p>
            </div>
          </div>
          
          {/* SIMPLE ACTION BUTTON */}
          <div className="text-center">
            <button
              onClick={() => {
                window.dispatchEvent(new Event('resetMainContent'))
              }}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium"
            >
              Try Another Search
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // No filtered results state
  const noFilteredResults = filteredAndSortedResults.length === 0 && (activeTagFilters.length > 0 || searchQuery.trim() !== '');
  
  return (
    <div className="w-full max-w-full animate-fade-in opacity-0" ref={containerRef}>
      {/* HEADER WITH RESULTS SUMMARY 🏀 */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">
          {filteredAndSortedResults.length} {filteredAndSortedResults.length === 1 ? 'Play' : 'Plays'} Found
          {filteredAndSortedResults.length !== data.results.length && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              (filtered from {data.results.length})
            </span>
          )}
        </h2>
        <p className="text-xl text-muted-foreground">
          Showing results for <span className="font-medium text-primary">{data.query}</span>
        </p>
      </div>
      
      {/* SHADCN-POWERED FILTER BAR - FULL WIDTH 🎮 */}
      <div className="mb-8">
        {/* MAIN FILTER BAR - ALWAYS VISIBLE */}
        <div className="rounded-md shadow-md backdrop-blur-sm border border-white/5">
          {/* TOP ROW - SEARCH, SORT, FILTER TOGGLE ALL IN ONE LINE 🔍 */}
          <div className="p-3 flex flex-wrap gap-2 items-center">
            {/* SEARCH INPUT - GROWS TO FILL AVAILABLE SPACE */}
            <div className="flex-grow min-w-[200px] max-w-[500px] bg-accent/30 border border-white/10 rounded-sm flex items-center overflow-hidden">
              <Search className="w-4 h-4 text-gray-400 ml-3 mr-2 flex-shrink-0" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search descriptions..."
                className="bg-transparent text-sm h-9 border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-full rounded-none text-gray-400 hover:text-white hover:bg-accent/40"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* SORT DROPDOWN - FIXED WIDTH */}
            <Select 
              defaultValue={sortOption} 
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger 
                className="w-[140px] bg-accent/30 border border-white/10 rounded-sm h-9 focus:ring-0"
                style={{ boxShadow: 'none' }}
              >
                <div className="flex items-center gap-2">
                  <SortDesc className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <SelectValue placeholder="Sort by..." />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-sm border-white/10">
                <SelectItem value="default">KB Score</SelectItem>
                <SelectItem value="date-desc">Recent</SelectItem>
                <SelectItem value="date-asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
            
            {/* FILTER TOGGLE BUTTON - SAME WIDTH AS SORT */}
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`w-[140px] h-9 rounded-sm ${showFilters 
                ? 'bg-primary/20 text-primary border-primary/30' 
                : 'bg-accent/30 border border-white/10 hover:bg-accent/40 hover:text-white hover:border-white/20'}`}
            >
              <Filter className={`w-4 h-4 mr-2 ${showFilters ? 'text-primary' : 'text-gray-400'}`} />
              Filters {activeTagFilters.length > 0 && `(${activeTagFilters.length})`}
            </Button>
            
            {/* CLEAR ALL BUTTON - ONLY SHOW IF FILTERS ARE ACTIVE */}
            {(activeTagFilters.length > 0 || searchQuery) && (
              <Button 
                onClick={clearAllFilters}
                variant="destructive"
                className="h-9 rounded-sm bg-red-900/20 text-red-300 border border-red-900/30 hover:bg-red-900/30 hover:text-red-200"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
          
          {/* FILTER TAGS PANEL - EXPANDS WHEN FILTER IS TOGGLED */}
          {showFilters && (
            <div className="px-3 pb-3 border-t  pt-3">
              <div className="flex flex-wrap gap-2">
                {availableTagFilters.map((tagFilter, index) => {
                  const isActive = activeTagFilters.some(
                    filter => filter.key === tagFilter.key && filter.value === tagFilter.value
                  );
                  
                  return (
                    <Button
                      key={`${tagFilter.key}-${index}`}
                      onClick={() => toggleTagFilter(tagFilter.key, tagFilter.value)}
                      variant="outline"
                      size="sm"
                      className={`rounded-sm text-sm font-medium transition-colors px-3 py-1.5 h-auto
                        ${isActive 
                          ? getTagBadgeColor(tagFilter.key, tagFilter.value) 
                          : 'bg-accent/30 border border-white/10 hover:bg-accent/40 text-gray-300'
                        }`}
                    >
                      <span className="mr-1.5">{tagFilter.icon}</span>
                      <span>{tagFilter.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* ACTIVE FILTERS DISPLAY */}
          {activeTagFilters.length > 0 && (
            <div className="px-3 py-2 border-t  flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase text-gray-400">Active:</span>
              {activeTagFilters.map((filter, index) => {
                const tagFilter = availableTagFilters.find(
                  t => t.key === filter.key && t.value === filter.value
                );
                
                return (
                  <Badge 
                    key={`active-${filter.key}-${index}`}
                    variant="outline"
                    className={`px-2 py-1 gap-1.5 font-medium rounded-sm flex items-center ${getTagBadgeColor(filter.key, filter.value)}`}
                  >
                    <span>{tagFilter?.icon || getTagIcon(filter.key, filter.value)}</span>
                    <span>{tagFilter?.label || getTagDisplayValue(filter.key, filter.value)}</span>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1 rounded-full hover:bg-white/10"
                      onClick={() => toggleTagFilter(filter.key, filter.value)}
                    >
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* NO FILTERED RESULTS STATE */}
      {noFilteredResults && (
        <div className="p-8 text-center border rounded-md mb-10 bg-accent/20">
          <h2 className="text-2xl font-bold mb-4">No Plays Match Your Filters</h2>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filter criteria or search query to find more plays.
          </p>
          <Button 
            onClick={clearAllFilters}
            variant="default"
            className="px-4 py-2 bg-primary/90 hover:bg-primary rounded-sm"
          >
            Clear All Filters
          </Button>
        </div>
      )}
      
      {/* VERTICAL STACK OF VIDEOS - EACH FULL WIDTH 📱 */}
      {!noFilteredResults && (
        <div className="space-y-16">
          {filteredAndSortedResults.slice(0, visibleCount).map((play, index) => {
            const { home, away } = extractTeams(play.game_code)
            const matchupText = `${play.visiting_team} @ ${play.home_team}`;
            
            return (
              <div 
                key={`${play.game_id}-${play.event_id}`} 
                ref={el => { videoContainersRef.current[index] = el }}
                data-index={index}
                className="w-full border-b border-border pb-10 last:border-0"
              >
                {/* VIDEO PLAYER WITH NATIVE CONTROLS 🎬 */}
                <div className="relative aspect-video w-full mb-3">
                  {/* VIDEO ELEMENT WITH NATIVE CONTROLS */}
                  <video
                    ref={el => { videoRefs.current[index] = el }}
                    src={play.videos.medium.url}
                    poster={play.videos.large.thumbnail}
                    className="w-full h-full object-contain bg-black rounded-md"
                    preload="metadata"
                    muted={true} // Start muted by default
                    playsInline
                    controls // USING NATIVE HTML5 CONTROLS ✅
                  />
                </div>
                
                {/* TAGS DIRECTLY UNDER VIDEO 🏷️ */}
                {Array.isArray(play.tags) && play.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 px-1">
                    {play.tags.map((tag, tagIndex) => {
                      // Get the key-value pair from the tag object
                      const [tagKey, tagValue] = Object.entries(tag)[0];
                      
                      // Highlight tag if it's an active filter
                      const isActiveFilter = activeTagFilters.some(
                        filter => filter.key === tagKey && filter.value === tagValue
                      );
                      
                      return (
                        <div 
                          key={`${tagKey}-${tagIndex}`} 
                          className={`px-3 py-1.5 rounded-sm text-sm font-medium border
                            ${getTagBadgeColor(tagKey, tagValue)} flex items-center shadow-sm
                            ${isActiveFilter ? 'ring-1 ring-white/30' : ''}`}
                          onClick={() => toggleTagFilter(tagKey, tagValue)}
                          role="button"
                          title={isActiveFilter ? "Remove this filter" : "Add this as a filter"}
                        >
                          <span className="mr-1.5">{getTagIcon(tagKey, tagValue)}</span>
                          <span>{getTagDisplayValue(tagKey, tagValue)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* ELEGANT PLAY DETAILS BELOW TAGS 📝 */}
                <div className="max-w-3xl mx-auto">
                  <div className="bg-accent/30 from-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-md p-5 border border-gray-700/50 shadow-sm">
                    {/* HORIZONTAL LAYOUT WITH DATE AND DESCRIPTION */}
                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                      {/* GAME INFO WITH CALENDAR ICON */}
                      <div className="flex items-center gap-4 md:min-w-[220px]">
                        <div className="text-primary/90 shrink-0 bg-primary/10 p-2 rounded-md">
                          <Calendar className="w-4 h-4" />
                        </div>
                        
                        <div>
                          <div className="text-sm text-white/70">{formatDate(play.date)}</div>
                          <div className="font-medium mt-1">{matchupText}</div>
                        </div>
                      </div>
                      
                      {/* PLAY DESCRIPTION, VERTICALLY CENTERED IN ITS CONTAINER */}
                      <div className="md:border-l md:border-white/10 md:pl-5 flex-1 flex items-center">
                        <h3 className="text-xl font-medium leading-snug">{removeFirstWord(play.description)}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {/* LOAD MORE INDICATOR - AUTOMATICALLY LOADS WHEN SCROLLED TO */}
      {!noFilteredResults && visibleCount < filteredAndSortedResults.length && (
        <div className="py-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
          <p className="mt-2 text-muted-foreground">Loading more plays...</p>
        </div>
      )}
    </div>
  )
} 