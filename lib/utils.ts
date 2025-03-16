import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// UTILITY FUNCTION TO MERGE TAILWIND CLASSES 🎨
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 