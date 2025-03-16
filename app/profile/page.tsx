"use client"
import { useRef } from "react"
import ProfileContent from "@/components/profile-content"

// CLIENT COMPONENT FOR PROFILE PAGE 👤
export default function ProfilePage() {
  const resetFunctionRef = useRef<(() => void) | null>(null);

  return (
    <ProfileContent 
      onResetRef={resetFunctionRef}
    />
  )
} 