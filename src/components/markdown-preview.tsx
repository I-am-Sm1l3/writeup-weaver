
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

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
            const imageInfo = PlaceHolderImages.find((p) => props.src?.includes(p.id));

            if (imageInfo) {
              const url = new URL(imageInfo.imageUrl);
              let width = 600;
              let height = 400;

              const urlWidth = url.searchParams.get('w');
              if (urlWidth && !isNaN(parseInt(urlWidth))) {
                width = parseInt(urlWidth);
              } else {
                const pathParts = url.pathname.split('/');
                if (pathParts.length > 2 && !isNaN(parseInt(pathParts[2]))) {
                  width = parseInt(pathParts[2]);
                }
              }
              
              const urlHeight = url.searchParams.get('h');
              if (urlHeight && !isNaN(parseInt(urlHeight))) {
                height = parseInt(urlHeight);
              } else {
                 const pathParts = url.pathname.split('/');
                 if (pathParts.length > 3 && !isNaN(parseInt(pathParts[3]))) {
                  height = parseInt(pathParts[3]);
                }
              }
              
              return (
                <Image
                  src={imageInfo.imageUrl}
                  alt={props.alt || imageInfo.description}
                  width={width}
                  height={height}
                  className="rounded-lg shadow-md my-4 mx-auto"
                  data-ai-hint={imageInfo.imageHint}
                />
              );
            }
            
            // Handle dropped images (data URIs) and external URLs
            if (props.src) {
              // eslint-disable-next-line @next/next/no-img-element
              return <img {...props} src={props.src} alt={props.alt || ''} className="rounded-lg shadow-md my-4 mx-auto" />;
            }
            return null;
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
