'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-clike';
import { Image as ImageIcon } from 'lucide-react';
import type { Components } from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
}

const customComponents: Components = {
    img: ({ alt, src }) => (
        <div className="image-placeholder">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span className="font-semibold">{alt || 'Image'}</span>
          </div>
          <span className="text-xs text-muted-foreground truncate">({src})</span>
        </div>
      ),
      code({ node, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        
        // React-markdown provides an `inline` prop to differentiate.
        // It's false for fenced code blocks (```) and true for inline code (`).
        if (!props.inline && match) {
          const lang = match[1];
          const code = String(children).replace(/\n$/, '');
          const highlighted = Prism.highlight(
            code,
            Prism.languages[lang] || Prism.languages.clike,
            lang
          );
          return (
            <pre className={`language-${lang}`}>
              <code
                className={`language-${lang}`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </pre>
          );
        }
        
        // For inline code or code blocks without a language, render it simply.
        // The CSS in globals.css will style inline code appropriately.
        return <code className={className} {...props}>{children}</code>;
      },
      p: ({ node, ...props }) => {
        // Check if the paragraph's only child is an image.
        // The custom 'img' component renders a div with a specific class.
        if (node.children[0].type === 'element' && node.children[0].tagName === 'img') {
          // If so, render the children directly without a <p> wrapper
          return <>{props.children}</>;
        }
        // Otherwise, render a normal paragraph
        return <p {...props} />;
      },
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
