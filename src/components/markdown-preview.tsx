'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({node, ...props}) => {
            const src = props.src || '';
            // Basic check for external vs. internal images
            if (src.startsWith('http') || src.startsWith('data:')) {
              // Using a standard img tag for external or data URLs
              // eslint-disable-next-line @next/next/no-img-element
              return <img {...props} alt={props.alt || ''} style={{maxWidth: '100%'}} />;
            }
            // For local/placeholder images, can still use Next/Image if desired
            // Assuming they are placed in /public or handled by a loader
            return <Image 
                      alt={props.alt || ''} 
                      src={src} 
                      width={600} // example default width
                      height={400} // example default height
                      style={{maxWidth: '100%', height: 'auto'}} 
                    />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
