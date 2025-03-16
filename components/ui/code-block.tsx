import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Define proper types for the CodeBlock component
interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any; // For any other props that might be passed
}

// REUSABLE CODE BLOCK COMPONENT FOR MARKDOWN RENDERING 🎨
export const CodeBlock = ({ className, children, ...props }: CodeBlockProps) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const isInline = !match;
  
  return !isInline && language ? (
    <div className="my-6 rounded-md overflow-hidden">
      <div className="bg-slate-800 text-slate-200 text-xs px-4 py-1 flex items-center justify-between">
        <span>{language.toUpperCase()}</span>
        <span className="text-slate-400 text-xs">// CODE EXAMPLE 💻</span>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, borderRadius: '0 0 0.375rem 0.375rem' }}
        showLineNumbers={true}
        wrapLongLines={false}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-accent/10 text-primary px-1 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  );
}; 