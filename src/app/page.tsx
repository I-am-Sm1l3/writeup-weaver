'use client';

import { useState, useRef } from 'react';
import type { ElementRef, DragEvent } from 'react';
import { Header } from '@/components/header';
import { MetadataSidebar } from '@/components/metadata-sidebar';
import { EditorToolbar } from '@/components/editor-toolbar';
import { MarkdownPreview } from '@/components/markdown-preview';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const initialContent = `## Welcome to Sm1l3's Writeup Weaver

Start crafting your next technical masterpiece! Use the toolbar above to format your text and the sidebar to add metadata.

Happy writing!
`;

export default function Sm1l3Page() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Sm1l3');
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState(initialContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<ElementRef<'textarea'>>(null);
  const { toast } = useToast();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (readEvent) => {
          const dataUrl = readEvent.target?.result as string;
          // Use a generic name, export will handle renaming
          const markdownImage = `![${file.name}](${dataUrl})`;

          setContent(prev => {
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              return `${prev.substring(0, start)}${markdownImage}${prev.substring(end)}`;
            }
            return `${prev}\n${markdownImage}`;
          });
        };
        reader.onerror = () => {
          toast({
            title: 'Error reading file',
            description: `Could not read the file ${file.name}.`,
            variant: 'destructive',
          });
        };
        reader.readAsDataURL(file);
      });

      toast({
        title: 'Image(s) added',
        description: `Successfully added ${imageFiles.length} image(s) to your post.`,
      });
    }
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };


  return (
    <div className="flex h-screen max-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 gap-4 px-4 pb-4 overflow-hidden">
        <div className="w-full max-w-xs">
          <MetadataSidebar
            {...{
              title,
              setTitle,
              author,
              setAuthor,
              categories,
              setCategories,
              tags,
              setTags,
              content,
              isGenerating,
              setIsGenerating,
            }}
          />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
          <Card 
            className={cn("flex flex-col relative", isDragging && "border-primary ring-2 ring-primary")}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none z-10 rounded-lg">
                <p className="text-primary-foreground font-bold text-lg bg-primary px-4 py-2 rounded-md">Drop image to add</p>
              </div>
            )}
            <EditorToolbar
              textareaRef={textareaRef}
              content={content}
              setContent={setContent}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
            <CardContent className="flex-1 p-0">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="h-full w-full resize-none border-0 rounded-t-none focus-visible:ring-0"
                placeholder="Start writing your masterpiece..."
              />
            </CardContent>
          </Card>
          <div className="hidden lg:block overflow-hidden">
            <Card className="h-full">
              <ScrollArea className="h-full">
                <MarkdownPreview content={content} />
              </ScrollArea>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
