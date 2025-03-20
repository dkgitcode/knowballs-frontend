"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Calendar, Star } from 'lucide-react'

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

export default function BasketballClipper({ data }: ClipperProps) {
  // State for video display
  const [visibleCount, setVisibleCount] = useState(10)  // Number of videos to display
  
  // Refs
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const videoContainersRef = useRef<(HTMLDivElement | null)[]>([])
  
  // Load more videos when user scrolls to the bottom
  const loadMore = useCallback(() => {
    if (data?.results && visibleCount < data.results.length) {
      setVisibleCount(prev => Math.min(prev + 10, data.results.length))
    }
  }, [data?.results, visibleCount])
  
  // Setup IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (!data?.results) return
    
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
  }, [data?.results, visibleCount, loadMore])
  
  // Initialize video references for all videos
  useEffect(() => {
    if (data?.results) {
      videoRefs.current = videoRefs.current.slice(0, data.results.length)
      videoContainersRef.current = videoContainersRef.current.slice(0, data.results.length)
    }
  }, [data?.results])
  
  // No results state
  if (!data?.results || data.results.length === 0) {
    return (
      <div className="w-full animate-fade-in opacity-0">
        <div className="p-8 text-center border border-border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">No Plays Found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search parameters or query to find basketball plays.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full max-w-full animate-fade-in opacity-0" ref={containerRef}>
      {/* HEADER WITH RESULTS SUMMARY 🏀 */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          {data.results.length} {data.results.length === 1 ? 'Play' : 'Plays'} Found
        </h2>
        <p className="text-xl text-muted-foreground mb-4">
          Showing results for <span className="font-medium text-primary">{data.query}</span>
        </p>
      </div>
      
      {/* VERTICAL STACK OF VIDEOS - EACH FULL WIDTH 📱 */}
      <div className="space-y-16">
        {data.results.slice(0, visibleCount).map((play, index) => {
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
                  className="w-full h-full object-contain bg-black"
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
                    
                    return (
                      <div 
                        key={`${tagKey}-${tagIndex}`} 
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border
                          ${getTagBadgeColor(tagKey, tagValue)} flex items-center shadow-sm`}
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
                <div className="bg-gradient-to-r from-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-lg p-5 border border-white/10 shadow-sm">
                  {/* HORIZONTAL LAYOUT WITH DATE AND DESCRIPTION */}
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    {/* GAME INFO WITH CALENDAR ICON */}
                    <div className="flex items-center gap-4 md:min-w-[220px]">
                      <div className="text-primary/90 shrink-0 bg-primary/10 p-2 rounded-full">
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
      
      {/* LOAD MORE INDICATOR - AUTOMATICALLY LOADS WHEN SCROLLED TO */}
      {visibleCount < data.results.length && (
        <div className="py-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
          <p className="mt-2 text-muted-foreground">Loading more plays...</p>
        </div>
      )}
    </div>
  )
} 