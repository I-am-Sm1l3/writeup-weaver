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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { replaceEmojiShortcuts } from '@/lib/emoji';

const initialContent = `## Welcome to Sm1l3's Writeup Weaver`;

export default function Sm1l3Page() {
  const [title, setTitle] = useState('');
  //const [author, setAuthor] = useState('Sm1l3');
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState(initialContent);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<ElementRef<'textarea'>>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = replaceEmojiShortcuts(e.target.value);
    setContent(newText);
  };

  return (
    <div className="flex h-screen max-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4">
        <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className="border-b-0">
                <Card>
                    <AccordionTrigger className="p-6 hover:no-underline">
                        <div className="flex flex-col items-start">
                            <h3 className="text-lg font-semibold">Post Details</h3>
                            <p className="text-sm text-muted-foreground">Provide metadata for your post and use tools to help you finish.</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
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
                    </AccordionContent>
                </Card>
            </AccordionItem>
        </Accordion>

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
                onChange={handleContentChange}
                className="h-full w-full resize-none border-0 rounded-t-none focus-visible:ring-0 bg-card text-card-foreground font-code"
                placeholder="Start writing your masterpiece..."
              />
            </CardContent>
          </Card>
          <Card className="hidden lg:flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                  <MarkdownPreview content={content} />
              </ScrollArea>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
