'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="markdown-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ node, ...props }) => {
            const src = props.src || '';
            // Handle dropped images (data URIs)
            if (src.startsWith('data:')) {
              // eslint-disable-next-line @next/next/no-img-element
              return <img {...props} src={src} alt={props.alt || ''} className="rounded-lg shadow-md my-4 mx-auto" />;
            }
            
            // Handle placeholder images like "image-1.webp"
            const placeholder = PlaceHolderImages.find(p => src.endsWith(p.id));
            if (placeholder) {
              return (
                <Image
                  src={placeholder.imageUrl}
                  alt={placeholder.description}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-md my-4 mx-auto"
                />
              )
            }

            // Handle external URLs
            try {
              new URL(src);
              return (
                <Image
                  src={src}
                  alt={props.alt || 'image'}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-md my-4 mx-auto"
                />
              );
            } catch (e) {
               // Fallback to regular img tag for other relative paths
               // eslint-disable-next-line @next/next/no-img-element
               return <img {...props} src={src} alt={props.alt || ''} className="rounded-lg shadow-md my-4 mx-auto" />;
            }
          },
          h1: ({ node, ...props }) => <h1 className="font-headline text-4xl font-bold mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="font-headline text-3xl font-semibold mt-8 mb-4 border-b pb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="font-headline text-2xl font-semibold mt-6 mb-3" {...props} />,
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\S+)/.exec(className || '');
            let lang = match ? match[1] : '';

            if (lang.startsWith('file:')) {
              const filePath = lang.split(':')[1];
              return (
                <Card className="my-4 bg-muted/50">
                  <CardHeader className="flex flex-row items-center gap-2 p-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium font-code">{filePath}</CardTitle>
                  </CardHeader>
                  <pre className="mt-0 p-0 rounded-t-none border-t bg-card">
                    <code className={`language-console !p-4`} {...props}>
                      {children}
                    </code>
                  </pre>
                </Card>
              );
            }

            return !inline && match ? (
              <pre className="bg-card border rounded-md my-4">
                <code className={`${className} font-code text-sm p-4 block overflow-x-auto`} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="font-code bg-muted text-muted-foreground rounded px-1.5 py-1 text-sm" {...props}>
                {children}
              </code>
            );
          },
          li: ({ node, children, ...props }) => {
            // Check if this is a task list item
            if (props.className?.includes('task-list-item')) {
              const [checkbox, ...label] = children;
              return (
                <li {...props} className="flex items-start gap-2 my-2">
                  {checkbox}
                  <div>{label}</div>
                </li>
              );
            }
            return <li {...props}>{children}</li>;
          },
          input: ({ node, ...props }) => {
            if (props.type === 'checkbox') {
              return <Checkbox checked={props.checked} disabled={props.disabled} className="mt-1" />;
            }
            return <input {...props} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
