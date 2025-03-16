import React, { useState, useRef } from 'react'
import { VideoComponent } from '@/components/ui/video-component'
import { Explainer } from './explainer'
import ReactMarkdown from 'react-markdown'
import { CodeBlock } from '@/components/ui/code-block'
// Import additional packages for enhanced markdown rendering
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

// Define the types for our lesson data
interface LessonData {
  content: ContentItem[];
  combined_markdown?: string; // Add the new markdown field
}

// Define types for different content items
interface ContentItem {
  type: string;
  content: string;
  link?: string | null;
  definition?: string | null;
}

// Define a type for our table of contents items
interface TocItem {
  id: string;
  text: string;
  level: number;
}

// TABLE OF CONTENTS COMPONENT 📑
function TableOfContents({ items }: { items: TocItem[] }) {
  return (
    <div className="bg-accent/5 p-4 rounded-lg mb-8">
      <h2 className="text-lg font-semibold mb-3">Table of Contents</h2>
      <nav>
        <ul className="space-y-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="transition-colors hover:text-primary"
              style={{ paddingLeft: `${(item.level - 1) * 1}rem` }}
            >
              <a
                href={`#${item.id}`}
                className="block py-1 border-l-2 border-transparent hover:border-primary pl-2"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

// BACK TO TOP BUTTON COMPONENT ⬆️
function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up scroll event listener
  React.useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 bg-primary text-primary-foreground p-3 rounded-full shadow-lg transition-opacity duration-300 z-50 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      aria-label="Back to top"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}

interface DynamicLessonProps {
  data: LessonData;
  prompt: string;
  answer: string;
}

export default function DynamicLesson({ data, prompt, answer }: DynamicLessonProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const markdownRef = useRef<HTMLDivElement>(null);

  // SAFETY CHECK - If no answer, provide a fallback
  if (!answer || answer.trim() === '') {
    console.warn("⚠️ NO ANSWER PROVIDED TO DYNAMIC LESSON");
    return (
      <div className="w-full max-w-3xl mx-auto py-2 animate-fade-in">
        <div className="mb-8 p-4 bg-accent/10 rounded-lg">
          <h3 className="text-xl font-medium mb-2">Processing your request...</h3>
          <p>We're preparing your answer. If this message persists, please try your query again.</p>
        </div>
      </div>
    );
  }

  // DEFINE CUSTOM MARKDOWN COMPONENTS FOR STYLING 🎨
  const markdownComponents = {
    // Headings with proper styling and anchor links
    h1: ({ node, ...props }: any) => (
      <h1 className="text-3xl font-bold mt-8 mb-4 text-primary" id={props.id || ''} {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-2xl font-semibold mt-6 mb-3 text-primary" id={props.id || ''} {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-xl font-medium mt-5 mb-2" id={props.id || ''} {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-lg font-medium mt-4 mb-2" id={props.id || ''} {...props} />
    ),
    
    // Paragraphs with proper spacing
    p: ({ node, ...props }: any) => <p className="my-3 leading-relaxed" {...props} />,
    
    // Lists with proper styling
    ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />,
    li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
    
    // Links with proper styling
    a: ({ node, ...props }: any) => (
      <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
    ),
    
    // Blockquotes with proper styling
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 bg-accent/5 italic" {...props} />
    ),
    
    // Horizontal rule
    hr: ({ node, ...props }: any) => <hr className="my-6 border-accent" {...props} />,
    
    // Tables with proper styling
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-accent/20" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => <thead className="bg-accent/10" {...props} />,
    tbody: ({ node, ...props }: any) => <tbody {...props} />,
    tr: ({ node, ...props }: any) => <tr className="border-b border-accent/20" {...props} />,
    th: ({ node, ...props }: any) => (
      <th className="px-4 py-2 text-left font-medium border-r last:border-r-0 border-accent/20" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="px-4 py-2 border-r last:border-r-0 border-accent/20" {...props} />
    ),
    
    // Code blocks using our custom CodeBlock component
    code: CodeBlock,
    
    // Inline elements
    em: ({ node, ...props }: any) => <em className="italic" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold" {...props} />,
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-2 rounded-lg ">
      <div ref={markdownRef} className="markdown-content">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
          // className="prose prose-slate dark:prose-invert max-w-none"
        >
          {answer}
        </ReactMarkdown>
      </div>

      {/* Add Back to Top button */}
      {/* <BackToTopButton /> */}
    </div>
  );
} 