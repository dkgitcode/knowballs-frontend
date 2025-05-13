"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Calendar, Star, ArrowUpDown, SortDesc, Filter, Search, X, Download, CheckSquare, Square } from 'lucide-react'
import JSZip from 'jszip'

// Import Shadcn components
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

// Import auth hook
import { useAuth } from "@/hooks/use-auth"

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

// FORMATS BASKETBALL CONTEXT MEASURES INTO HUMAN-READABLE TEXT 🏀
const formatContextMeasure = (measure: string): string => {
  const measureMap: Record<string, string> = {
    "FGM": "field goals made",
    "FGA": "field goal attempts",
    "FG3M": "3-pointers",
    "FG3A": "3-point field goal attempts",
    "FTM": "free throws",
    "FTA": "free throw attempts",
    "OREB": "offensive rebounds",
    "DREB": "defensive rebounds",
    "AST": "assists",
    "FGM_AST": "assisted field goals made",
    "FG3_AST": "assisted 3-pointers",
    "STL": "steals",
    "BLK": "blocks",
    "TOV": "turnovers",
    "POSS_END_FT": "possessions ending with free throws",
    "PTS_PAINT": "points in the paint",
    "REB": "rebounds",
    "TM_FGM": "team field goals made",
    "TM_FGA": "team field goal attempts",
    "TM_FG3M": "team 3-point field goals made",
    "TM_FG3A": "team 3-point field goal attempts",
    "TM_FTM": "team free throws made",
    "TM_FTA": "team free throw attempts",
    "TM_OREB": "team offensive rebounds",
    "TM_DREB": "team defensive rebounds",
    "TM_REB": "team rebounds",
    "TM_TEAM_REB": "team team rebounds",
    "TM_AST": "team assists",
    "TM_STL": "team steals",
    "TM_BLK": "team blocks",
    "TM_BLKA": "team blocked shots",
    "TM_TOV": "team turnovers",
    "TM_TEAM_TOV": "team team turnovers",
    "TM_PF": "team personal fouls",
    "TM_PFD": "team personal fouls drawn",
    "TM_PTS": "team points",
    "TM_PTS_PAINT": "team points in the paint",
    "TM_PTS_FB": "team fast break points",
    "TM_PTS_OFF_TOV": "team points off turnovers",
    "TM_PTS_2ND_CHANCE": "team second chance points",
    "TM_FGM_AST": "team assisted field goals made",
    "TM_FG3_AST": "team assisted 3-point field goals",
    "TM_POSS_END_FT": "team possessions ending with free throws",
    "OPP_FTM": "opponent free throws made",
    "OPP_FTA": "opponent free throw attempts",
    "OPP_OREB": "opponent offensive rebounds",
    "OPP_DREB": "opponent defensive rebounds",
    "OPP_REB": "opponent rebounds",
    "OPP_TEAM_REB": "opponent team rebounds",
    "OPP_AST": "opponent assists",
    "OPP_STL": "opponent steals",
    "OPP_BLK": "opponent blocks",
    "OPP_BLKA": "opponent blocked shots",
    "OPP_TOV": "opponent turnovers",
    "OPP_TEAM_TOV": "opponent team turnovers",
    "OPP_PF": "opponent personal fouls",
    "OPP_PFD": "opponent personal fouls drawn",
    "OPP_PTS": "opponent points",
    "OPP_PTS_PAINT": "opponent points in the paint",
    "OPP_PTS_FB": "opponent fast break points",
    "OPP_PTS_OFF_TOV": "opponent points off turnovers",
    "OPP_PTS_2ND_CHANCE": "opponent second chance points",
    "OPP_FGM_AST": "opponent assisted field goals made",
    "OPP_FG3_AST": "opponent assisted 3-point field goals",
    "OPP_POSS_END_FT": "opponent possessions ending with free throws"
  };

  return measureMap[measure] || measure.toLowerCase();
}

// CAPITALIZES THE FIRST LETTER OF EACH WORD IN A NAME ✨
const capitalizePlayerName = (name: string): string => {
  if (!name) return '';
  
  // Split the name into words and capitalize the first letter of each word
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// CREATES A HUMAN-READABLE INTERPRETATION OF THE SEARCH PARAMETERS 🔍
const createInterpretationMessage = (params: Record<string, any>): string => {
  if (!params) return "Unknown search";
  
  const parts: string[] = [];
  
  // Add player name if available (CAPITALIZED! ✨)
  if (params.player_name) {
    parts.push(capitalizePlayerName(params.player_name));
  }
  
  // Add shot type if available
  if (params.shot_type) {
    parts.push(params.shot_type);
  }
  
  // Add context measure (formatted) if available
  if (params.context_measure) {
    parts.push(formatContextMeasure(params.context_measure));
  }
  
  // Add season if available
  if (params.season) {
    parts.push(`in the ${params.season}`);
  }
  
  // Add season type if available
  if (params.season_type) {
    parts.push(params.season_type.toLowerCase());
  }
  
  // Add clutch indicator if available
  if (params.clutch_time) {
    parts.push("in the clutch");
  }
  
  // Join all parts with spaces
  return parts.length > 0 ? parts.join(" ") : "basketball plays";
}

// REMOVES FIRST WORD IF IT MATCHES PLAYER'S LAST NAME 🔥
const removeFirstWord = (text: string, playerName?: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Trim any leading whitespace first
  const trimmed = text.trim();
  
  // If no player name provided, return the original text
  if (!playerName) return trimmed;
  
  // Get the last name (last word) from player_name
  const playerWords = playerName.split(' ');
  const lastName = playerWords[playerWords.length - 1].toLowerCase();
  
  // Get the first word of the description
  const firstSpaceIndex = trimmed.indexOf(' ');
  
  // If no space is found, it means there's only one word
  if (firstSpaceIndex === -1) return trimmed;
  
  const firstWord = trimmed.substring(0, firstSpaceIndex).toLowerCase();
  
  // Only remove first word if it matches the player's last name
  if (firstWord === lastName) {
    return trimmed.substring(firstSpaceIndex + 1);
  }
  
  // Otherwise, return the full description
  return trimmed;
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

// Utility function to retry a fetch with backoff
const fetchWithRetry = async (url: string, maxRetries = 3): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Instead of fetching directly, use our own API as a proxy
      // This avoids CORS issues with the NBA servers
      const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error as Error;
      // Wait longer between each retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retries reached');
};

export default function BasketballClipper({ data }: ClipperProps) {
  // Get current user from auth hook
  const { user } = useAuth()
  const isAuthorizedForDownload = user && user.email === 'danjkim11@gmail.com'
  
  // State for video display and filtering
  const [visibleCount, setVisibleCount] = useState(10)  // Number of videos to display
  const [sortOption, setSortOption] = useState<SortOption>('default') // Sort state
  const [activeTagFilters, setActiveTagFilters] = useState<{key: string, value: any}[]>([]) // Tag filters
  const [searchQuery, setSearchQuery] = useState('') // Description search
  const [showFilters, setShowFilters] = useState(false) // Toggle filter panel
  
  // Download modal state
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [selectedPlaysForDownload, setSelectedPlaysForDownload] = useState<Set<string>>(new Set())
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadCount, setDownloadCount] = useState(10) // Default to 10 plays
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    status: string;
    errors: Array<{playId: string, message: string}>;
    successfulPlays: Set<string>; // Track which plays were successfully downloaded
  }>({ 
    current: 0, 
    total: 0, 
    percent: 0, 
    status: 'Preparing download...', 
    errors: [],
    successfulPlays: new Set()
  })
  
  console.log(data.parameters)
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
  
  // Initialize selected plays for download - default to first 10 in KB score sort
  useEffect(() => {
    if (data?.results && data.results.length > 0) {
      const initialPlaysToSelect = Math.min(10, data.results.length);
      const initialSelectedPlays = new Set<string>();
      
      for (let i = 0; i < initialPlaysToSelect; i++) {
        initialSelectedPlays.add(`${data.results[i].game_id}-${data.results[i].event_id}`);
      }
      
      setSelectedPlaysForDownload(initialSelectedPlays);
    }
  }, [data?.results]);
  
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
  
  // Toggle play selection for download
  const togglePlaySelection = useCallback((play: BasketballPlay) => {
    const playId = `${play.game_id}-${play.event_id}`;
    
    setSelectedPlaysForDownload(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(playId)) {
        newSet.delete(playId);
      } else {
        newSet.add(playId);
      }
      
      return newSet;
    });
  }, []);
  
  // Toggle all plays - select or deselect all
  const toggleAllPlays = useCallback(() => {
    if (!data?.results) return;
    
    if (selectedPlaysForDownload.size === data.results.length) {
      // Deselect all
      setSelectedPlaysForDownload(new Set());
    } else {
      // Select all
      const allPlays = new Set<string>();
      data.results.forEach(play => {
        allPlays.add(`${play.game_id}-${play.event_id}`);
      });
      setSelectedPlaysForDownload(allPlays);
    }
  }, [data?.results, selectedPlaysForDownload]);
  
  // Handle download action
  const handleDownload = useCallback(async (onlyFailedPlays = false) => {
    // Ensure the user is authorized to download
    if (!isAuthorizedForDownload) {
      console.error("Unauthorized download attempt");
      return;
    }
    
    if (!data?.results || selectedPlaysForDownload.size === 0) return;
    
    setIsDownloading(true);
    
    // If retrying failed downloads, keep track of previously successful downloads
    const successfulPlays = onlyFailedPlays 
      ? downloadProgress.successfulPlays 
      : new Set<string>();
    
    // Determine which plays to download
    const playsToDownload = onlyFailedPlays
      ? Array.from(selectedPlaysForDownload).filter(id => !successfulPlays.has(id))
      : Array.from(selectedPlaysForDownload);
    
    setDownloadProgress({
      current: successfulPlays.size,
      total: selectedPlaysForDownload.size,
      percent: Math.round((successfulPlays.size / selectedPlaysForDownload.size) * 100),
      status: onlyFailedPlays ? 'Retrying failed downloads...' : 'Preparing download...',
      errors: [],
      successfulPlays
    });
    
    // If all plays are already downloaded, just create the ZIP
    if (playsToDownload.length === 0 && successfulPlays.size > 0) {
      setDownloadProgress(prev => ({
        ...prev,
        status: 'All videos already downloaded. Creating ZIP...',
        percent: 100
      }));
      
      // Continue to ZIP creation
    } else if (playsToDownload.length === 0) {
      setIsDownloading(false);
      return;
    }
    
    try {
      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Create a folder for the videos
      const videosFolder = zip.folder("basketball-plays");
      
      // Also create a metadata file with info about these plays
      const metadataContent = {
        downloadDate: new Date().toISOString(),
        query: data.query,
        parameters: data.parameters,
        plays: [] as any[]
      };
      
      // Keep track of downloaded files for progress
      let downloadedCount = successfulPlays.size;
      let errorCount = 0;
      const totalCount = selectedPlaysForDownload.size;
      const errors: Array<{playId: string, message: string}> = [];
      
      // Create an object to store video blobs for successful downloads
      const videoBlobs: Record<string, Blob> = {};
      
      // Process each selected play
      const downloadPromises = playsToDownload.map(async (id) => {
        const [gameId, eventId] = id.split('-');
        const play = data.results.find(p => p.game_id === gameId && p.event_id === Number(eventId));
        
        if (!play) return;
        
        // Add to metadata
        metadataContent.plays.push({
          gameId: play.game_id,
          eventId: play.event_id,
          date: play.date,
          teams: `${play.visiting_team} @ ${play.home_team}`,
          description: play.description,
          period: play.period,
          score: `${play.visitor_score_after}-${play.home_score_after}`
        });
        
        // Get video URL
        const videoUrl = play.videos.medium.url;
        
        try {
          // Update status for this specific video
          setDownloadProgress(prev => ({
            ...prev,
            status: `Downloading: ${play.visiting_team} @ ${play.home_team}`
          }));
          
          // Fetch the video file with retry logic
          const response = await fetchWithRetry(videoUrl);
          
          // Check if the response is JSON (error from our proxy)
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            // This is an error response from our proxy
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown proxy error');
          }
          
          // Get the video as blob
          const videoBlob = await response.blob();
          
          // Verify we got actual video data and not an empty or tiny response
          if (videoBlob.size < 10000) { // Less than 10KB is probably not a video
            throw new Error(`Invalid video data received (${videoBlob.size} bytes)`);
          }
          
          // Create a safe filename from play description
          const safeDescription = play.description
            .replace(/[^a-z0-9]/gi, '_')
            .replace(/_+/g, '_')
            .substring(0, 30);
          
          // Add to zip with a descriptive filename
          const fileName = `${play.date.split('T')[0]}_${play.visiting_team}_at_${play.home_team}_${safeDescription}.mp4`;
          videoBlobs[fileName] = videoBlob;
          
          // Mark as successful
          successfulPlays.add(id);
          
          // Update progress
          downloadedCount++;
          setDownloadProgress(prev => ({
            ...prev,
            current: downloadedCount,
            percent: Math.round(((downloadedCount + errorCount) / totalCount) * 100),
            successfulPlays: new Set(successfulPlays)
          }));
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error downloading video for ${play.description}:`, error);
          
          // Add to errors list
          errors.push({
            playId: id,
            message: `${play.visiting_team} @ ${play.home_team}: ${errorMessage}` 
          });
          
          // Update progress including this error
          setDownloadProgress(prev => ({
            ...prev,
            errors: [...prev.errors, { 
              playId: id, 
              message: `${play.visiting_team} @ ${play.home_team}: ${errorMessage}` 
            }],
            percent: Math.round(((downloadedCount + errorCount) / totalCount) * 100),
            successfulPlays: new Set(successfulPlays)
          }));
        }
      });
      
      // Wait for all downloads to complete
      await Promise.all(downloadPromises);
      
      // Check if we have any successful downloads
      if (downloadedCount === 0) {
        throw new Error('No videos could be downloaded. Please try again later.');
      }
      
      // Add all video blobs to the zip
      Object.entries(videoBlobs).forEach(([fileName, blob]) => {
        videosFolder?.file(fileName, blob);
      });
      
      // Add metadata file
      videosFolder?.file('metadata.json', JSON.stringify(metadataContent, null, 2));
      
      // Add a README file with instructions
      const readmeContent = `# Basketball Plays Collection
Downloaded on: ${new Date().toLocaleDateString()}

This collection contains ${downloadedCount} basketball plays ${data.parameters.player_name ? `featuring ${data.parameters.player_name}` : ''}.
${errors.length > 0 ? `\n⚠️ Note: ${errors.length} videos failed to download.\n` : ''}

## Contents
- MP4 video files of each play
- metadata.json with details about each play

## Search Parameters
${Object.entries(data.parameters).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Troubleshooting
If some videos failed to download, this is likely due to CORS restrictions or temporary server issues.
Try downloading again later or use a different browser.

Enjoy your basketball highlights!
`;
      videosFolder?.file('README.md', readmeContent);
      
      // Update status for zip generation
      setDownloadProgress(prev => ({
        ...prev,
        status: 'Creating ZIP file...',
      }));
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 5 // Balance between speed and compression
        }
      }, (metadata) => {
        // Update zip creation progress
        setDownloadProgress(prev => ({
          ...prev,
          percent: Math.round(metadata.percent),
          status: `Creating ZIP: ${Math.round(metadata.percent)}% complete`
        }));
      });
      
      // Update status for download
      setDownloadProgress(prev => ({
        ...prev,
        status: errors.length > 0 
          ? `Download ready! (${downloadedCount} of ${totalCount} successful)` 
          : 'Download ready!',
        percent: 100
      }));
      
      // Create a download link for the zip
      const zipUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = zipUrl;
      downloadLink.download = `basketball-plays-${new Date().toISOString().split('T')[0]}.zip`;
      
      // Trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      URL.revokeObjectURL(zipUrl);
      
      // Close the modal after a short delay to let user see completion
      setTimeout(() => {
        setIsDownloadModalOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadProgress(prev => ({
        ...prev,
        status: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [...prev.errors, { playId: 'global', message: 'Failed to create ZIP file' }]
      }));
      // In a real app, show an error toast here
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 3000); // Give user time to see the completion status
    }
  }, [data, selectedPlaysForDownload, fetchWithRetry, downloadProgress.successfulPlays]);
  
  // No results state
  if (!data?.results || data.results.length === 0) {
    // Extract key context from parameters if available
    const season = data.parameters?.season || null;
    const player = data.parameters?.player_name || null;
    const measure = data.parameters?.context_measure || null;
    const season_type = data.parameters?.season_type || null;
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
                        <span className="font-medium">{
                          formatContextMeasure(measure)
                          }</span>
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
          Interpreted as <span className="font-medium text-primary">{createInterpretationMessage(data.parameters)}</span>
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
            
            {/* DOWNLOAD BUTTON */}
            {isAuthorizedForDownload && (
              <Button 
                onClick={() => setIsDownloadModalOpen(true)}
                variant="outline"
                className="w-[140px] h-9 rounded-sm bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/30 hover:text-blue-200"
              >
                <Download className="w-4 h-4 mr-2 text-blue-300" />
                Download
              </Button>
            )}
            
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
      
      {/* DOWNLOAD MODAL DIALOG */}
      {isAuthorizedForDownload && (
        <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Download Basketball Plays</DialogTitle>
              <DialogDescription>
                Select the plays you want to download as a ZIP file. We'll bundle the videos together for you.
              </DialogDescription>
            </DialogHeader>
            
            {/* INFO ABOUT DOWNLOAD PROCESS */}
            <div className="p-3 bg-blue-950/50 border border-blue-900 rounded-md mb-4">
              <h4 className="text-sm font-medium text-blue-300 flex items-center mb-1">
                <span className="mr-2">ℹ️</span>
                <span>Download Information</span>
              </h4>
              <p className="text-xs text-blue-200/80">
                Videos are downloaded through our secure proxy to bypass CORS restrictions.
                Some videos may fail to download due to server limitations. If that happens,
                you can try the "Retry Failed Downloads" option.
              </p>
            </div>
            
            {/* SELECT ALL & COUNTER */}
            <div className="flex items-center justify-between py-2 border-b border-gray-700 mb-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  className="p-2 h-auto text-sm flex items-center gap-2"
                  onClick={toggleAllPlays}
                >
                  {selectedPlaysForDownload.size === data?.results?.length ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span>{selectedPlaysForDownload.size === data?.results?.length ? 'Deselect All' : 'Select All'}</span>
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedPlaysForDownload.size} of {data?.results?.length} selected
              </div>
            </div>
            
            {/* PLAY SELECTION LIST */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {data?.results?.map((play, index) => {
                const playId = `${play.game_id}-${play.event_id}`;
                const isSelected = selectedPlaysForDownload.has(playId);
                const { home, away } = extractTeams(play.game_code);
                const matchupText = `${play.visiting_team} @ ${play.home_team}`;
                
                return (
                  <div 
                    key={playId}
                    className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-accent/10 border-accent/20 hover:border-accent/30'
                    }`}
                    onClick={() => togglePlaySelection(play)}
                    role="button"
                  >
                    {/* CHECKBOX */}
                    <div className="pt-1">
                      <Checkbox 
                        className="h-5 w-5 rounded-sm"
                        checked={isSelected}
                        onCheckedChange={() => togglePlaySelection(play)}
                      />
                    </div>
                    
                    {/* PLAY DETAILS */}
                    <div className="flex-1">
                      <div className="flex flex-col gap-1">
                        {/* DESCRIPTION */}
                        <p className="text-sm font-medium">
                          {removeFirstWord(play.description, data.parameters?.player_name)}
                        </p>
                        
                        {/* GAME & DATE INFO */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-400">{formatDate(play.date)}</div>
                          <div className="text-xs text-gray-400">{matchupText}</div>
                        </div>
                        
                        {/* TAGS */}
                        {Array.isArray(play.tags) && play.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {play.tags.map((tag, tagIndex) => {
                              // Get the key-value pair from the tag object
                              const [tagKey, tagValue] = Object.entries(tag)[0];
                              
                              return (
                                <div 
                                  key={`${tagKey}-${tagIndex}`} 
                                  className={`px-2 py-0.5 text-xs rounded-sm border
                                    ${getTagBadgeColor(tagKey, tagValue)}`}
                                >
                                  <span className="mr-1">{getTagIcon(tagKey, tagValue)}</span>
                                  <span>{getTagDisplayValue(tagKey, tagValue)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <DialogFooter className="mt-4 pt-2 border-t border-gray-700">
              <div className="w-full flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  File size estimate: ~{(selectedPlaysForDownload.size * 5).toFixed(1)}MB
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDownloadModalOpen(false)}
                    disabled={isDownloading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleDownload(false)}
                    disabled={selectedPlaysForDownload.size === 0 || isDownloading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isDownloading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-r-transparent rounded-full animate-spin mr-2"></div>
                        <span>Preparing...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        <span>Download ZIP</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* DOWNLOAD PROGRESS INDICATOR */}
              {isDownloading && (
                <div className="w-full mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{downloadProgress.status}</span>
                    <span className="text-sm text-muted-foreground">
                      {downloadProgress.current}/{downloadProgress.total} files
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-3">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${
                        downloadProgress.errors.length > 0 ? 'bg-amber-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${downloadProgress.percent}%` }}
                    ></div>
                  </div>
                  
                  {/* ERRORS DISPLAY */}
                  {downloadProgress.errors.length > 0 && (
                    <div className="mt-3 text-sm text-red-400 max-h-24 overflow-y-auto">
                      <p className="font-medium text-red-300 mb-1">
                        ⚠️ {downloadProgress.errors.length} errors encountered:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        {downloadProgress.errors.slice(0, 3).map((error, index) => (
                          <li key={index}>
                            Failed to download a video: {error.message.substring(0, 50)}
                            {error.message.length > 50 ? '...' : ''}
                          </li>
                        ))}
                        {downloadProgress.errors.length > 3 && (
                          <li>...and {downloadProgress.errors.length - 3} more errors</li>
                        )}
                      </ul>
                      <p className="mt-1 text-xs text-gray-400">
                        Don't worry, we'll still download the successful files!
                      </p>
                    </div>
                  )}
                  
                  {/* RETRY BUTTON - SHOWN WHEN DOWNLOAD HAS ERRORS */}
                  {downloadProgress.errors.length > 0 && downloadProgress.percent === 100 && (
                    <div className="mt-3">
                      <Button
                        onClick={() => handleDownload(true)}
                        disabled={isDownloading}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
                      >
                        <span className="mr-2">🔄</span>
                        Retry Failed Downloads
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
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
                        <h3 className="text-xl font-medium leading-snug">{removeFirstWord(play.description, data.parameters?.player_name)}</h3>
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