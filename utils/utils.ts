import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// UTILITY FUNCTION FOR MERGING TAILWIND CLASSES 🎨
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 