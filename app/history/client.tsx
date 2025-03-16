"use client"

import HistoryContent from '@/components/history-content'
import { useRef } from 'react'

interface HistoryPageClientProps {
  onResetRef?: React.MutableRefObject<(() => void) | null>
}

export default function HistoryPageClient({ onResetRef }: HistoryPageClientProps) {
  return (
    <HistoryContent onResetRef={onResetRef} />
  )
} 