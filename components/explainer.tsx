"use client"
import React, { useState, useRef, useEffect } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/utils/utils"

interface ExplainerProps {
  term: string
  definition: string
  explanation: string
  className?: string
  children?: React.ReactNode
}

export function Explainer({ term, definition, explanation, className, children }: ExplainerProps) {
  const isDesktop = useMediaQuery("(min-width: 10024px)")
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0, left: 0 })
  const termRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isOpen && termRef.current) {
      const rect = termRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const contentWidth = 320 // w-80 = 20rem = 320px

      // Calculate if we need to adjust position to prevent overflow
      const rightSpace = windowWidth - rect.right
      const shouldFlipToLeft = rightSpace < (contentWidth + 32) // 32px for margin

      setPosition({
        top: rect.top + rect.height / 2,
        right: shouldFlipToLeft ? windowWidth - rect.left + 32 : undefined,
        left: shouldFlipToLeft ? undefined : rect.right + 32,
      })
    }
  }, [isOpen])

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="font-medium">{definition}</p>
        <p className="text-sm text-muted-foreground">{explanation}</p>
      </div>
      {children && (
        <div className="pt-2 border-t border-border">
          {children}
        </div>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <span className="relative inline-block">
        <span
          ref={termRef}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "bg-purple-100 dark:bg-purple-900/30 px-1 rounded-[4px] cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors",
            className
          )}
        >
          {term}
        </span>
        <div 
          style={{
            position: 'fixed',
            top: position.top,
            right: 0,
            transform: 'translateY(-150%)',
            zIndex: 9999,
          }}
          className={cn(
            "w-80 p-4 rounded-lg border shadow-lg backdrop-blur-sm bg-zinc-900 transition-all duration-200",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          {content}
        </div>
      </span>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          className={cn(
            "bg-purple-100 dark:bg-purple-900/30 px-1 rounded-[4px] cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors",
            className
          )}
        >
          {term}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 z-[9999]">
        {content}
      </PopoverContent>
    </Popover>
  )
}