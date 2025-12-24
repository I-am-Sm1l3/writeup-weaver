'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';

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
          img: ({node, ...props}) => {
            const src = props.src || '';
            // Only render images that are full URLs (external or data URIs).
            // This prevents broken image icons for local placeholders.
            if (src.startsWith('http') || src.startsWith('data:')) {
              // Using a standard img tag for external or data URLs
              // eslint-disable-next-line @next/next/no-img-element
              return <img {...props} alt={props.alt || ''} style={{maxWidth: '100%', display: 'inline-block'}} />;
            }
            // For local paths like 'image-1.webp', render nothing in the preview.
            return null;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
