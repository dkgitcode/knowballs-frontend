import React from 'react'

interface VideoComponentProps {
  title: string
  description?: string
  src?: string
}

export function VideoComponent({ title, description, src }: VideoComponentProps) {
  return (
    <div className="relative w-full aspect-video bg-accent/20 rounded-lg overflow-hidden border border-border/50">
      {src ? (
        <video
          src={src}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <h3 className="text-lg font-medium text-primary mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </div>
  )
}