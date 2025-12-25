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

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // This will prevent any image from being rendered in the preview.
          img: () => null,
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
