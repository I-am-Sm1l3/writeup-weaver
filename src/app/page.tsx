'use client';

import { useState, useRef } from 'react';
import type { ElementRef } from 'react';
import { Header } from '@/components/header';
import { MetadataSidebar } from '@/components/metadata-sidebar';
import { EditorToolbar } from '@/components/editor-toolbar';
import { MarkdownPreview } from '@/components/markdown-preview';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialContent = `## Welcome to Sm1l3's Writeup Weaver

Start crafting your next technical masterpiece! Use the toolbar above to format your text and the sidebar to add metadata.

Happy writing!
`;

export default function Sm1l3Page() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState(initialContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<ElementRef<'textarea'>>(null);

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
          <Card className="flex flex-col">
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
