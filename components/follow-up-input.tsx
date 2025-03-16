"use client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

export default function FollowUpInput({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value)
      setValue('')
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <Textarea
          placeholder="Ask a follow-up question..."
          className="pr-14 py-4 text-lg min-h-[100px] max-h-[300px] rounded-xl bg-background text-foreground placeholder-muted-foreground/50 border-2 border-border focus:border-primary/50 focus:ring-0 resize-none overflow-hidden transition-all duration-200 ease-in-out"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          style={{ height: Math.max(100, Math.min(value.split('\n').length * 24 + 40, 300)) }}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          className="absolute right-3 bottom-3 rounded-full bg-transparent hover:bg-accent/50 text-primary border border-primary/30 hover:border-primary transition-colors"
        >
          <MessageCircle className="h-3 w-3" />
          <span className="sr-only">Send follow-up</span>
        </Button>
      </div>
    </div>
  )
}