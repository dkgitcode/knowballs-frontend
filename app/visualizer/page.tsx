"use client"
import MainContent from "@/components/main-content"
import { useRef } from "react"

export default function VisualizerPage() {
  // CREATE A REF TO HOLD THE RESET FUNCTION FROM MAIN CONTENT 🔄
  const resetFunctionRef = useRef<(() => void) | null>(null);

  return (
    <MainContent 
      title="Visualize anything..."
      apiBaseUrl="http://localhost:8000"
      initialMode="visualizer"
      onResetRef={resetFunctionRef}
    />
  )
} 