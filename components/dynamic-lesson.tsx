import React, { useRef } from 'react'
// Import additional packages for enhanced markdown rendering
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import ReactMarkdown from 'react-markdown'
import { CodeBlock } from '@/components/ui/code-block'

interface DynamicLessonProps {
  answer: string;
}

export default function DynamicLesson({ answer }: DynamicLessonProps) {
  const markdownRef = useRef<HTMLDivElement>(null);

  // SAFETY CHECK - If no answer, provide a fallback
  if (!answer || answer.trim() === '') {
    console.warn("⚠️ NO ANSWER PROVIDED TO DYNAMIC LESSON");
    return (
      <div className="w-full max-w-3xl mx-auto py-2 animate-fade-in">
        <div className="mb-8 p-4 bg-accent/10 rounded-lg">
          <h3 className="text-xl font-medium mb-2">Processing your request...</h3>
          <p>We&apos;re preparing your answer. If this message persists, please try your query again.</p>
        </div>
      </div>
    );
  }

  // DEFINE CUSTOM MARKDOWN COMPONENTS FOR STYLING 🎨
  const markdownComponents = {
    // Headings with proper styling and anchor links
    h1: ({ ...props }: React.ComponentPropsWithoutRef<'h1'>) => (
      <h1 className="text-3xl font-bold mt-8 mb-4 text-primary" id={props.id || ''} {...props} />
    ),
    h2: ({ ...props }: React.ComponentPropsWithoutRef<'h2'>) => (
      <h2 className="text-2xl font-semibold mt-6 mb-3 text-primary" id={props.id || ''} {...props} />
    ),
    h3: ({ ...props }: React.ComponentPropsWithoutRef<'h3'>) => (
      <h3 className="text-xl font-medium mt-5 mb-2" id={props.id || ''} {...props} />
    ),
    h4: ({ ...props }: React.ComponentPropsWithoutRef<'h4'>) => (
      <h4 className="text-lg font-medium mt-4 mb-2" id={props.id || ''} {...props} />
    ),
    
    // Paragraphs with proper spacing
    p: ({ ...props }: React.ComponentPropsWithoutRef<'p'>) => <p className="my-3 leading-relaxed" {...props} />,
    
    // Lists with proper styling
    ul: ({ ...props }: React.ComponentPropsWithoutRef<'ul'>) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
    ol: ({ ...props }: React.ComponentPropsWithoutRef<'ol'>) => <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />,
    li: ({ ...props }: React.ComponentPropsWithoutRef<'li'>) => <li className="pl-1" {...props} />,
    
    // Links with proper styling
    a: ({ ...props }: React.ComponentPropsWithoutRef<'a'>) => (
      <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
    ),
    
    // Blockquotes with proper styling
    blockquote: ({ ...props }: React.ComponentPropsWithoutRef<'blockquote'>) => (
      <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 bg-accent/5 italic" {...props} />
    ),
    
    // Horizontal rule
    hr: ({ ...props }: React.ComponentPropsWithoutRef<'hr'>) => <hr className="my-6 border-accent" {...props} />,
    
    // Tables with proper styling
    table: ({ ...props }: React.ComponentPropsWithoutRef<'table'>) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-accent/20" {...props} />
      </div>
    ),
    thead: ({ ...props }: React.ComponentPropsWithoutRef<'thead'>) => <thead className="bg-accent/10" {...props} />,
    tbody: ({ ...props }: React.ComponentPropsWithoutRef<'tbody'>) => <tbody {...props} />,
    tr: ({ ...props }: React.ComponentPropsWithoutRef<'tr'>) => <tr className="border-b border-accent/20" {...props} />,
    th: ({ ...props }: React.ComponentPropsWithoutRef<'th'>) => (
      <th className="px-4 py-2 text-left font-medium border-r last:border-r-0 border-accent/20" {...props} />
    ),
    td: ({ ...props }: React.ComponentPropsWithoutRef<'td'>) => (
      <td className="px-4 py-2 border-r last:border-r-0 border-accent/20" {...props} />
    ),
    
    // Code blocks using our custom CodeBlock component
    code: CodeBlock,
    
    // Inline elements
    em: ({ ...props }: React.ComponentPropsWithoutRef<'em'>) => <em className="italic" {...props} />,
    strong: ({ ...props }: React.ComponentPropsWithoutRef<'strong'>) => <strong className="font-bold" {...props} />,
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-2 rounded-lg ">
      <div ref={markdownRef} className="markdown-content">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </div>
  );
} 