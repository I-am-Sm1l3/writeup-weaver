'use client';

import type { RefObject, Dispatch, SetStateAction } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  Code2,
  Image,
  FileCode,
  Wand2,
  Strikethrough,
  Quote,
  Minus,
  Link,
  ListOrdered,
  ListTodo,
  Table,
  Terminal,
  SpellCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { formatTextWithAI } from '@/ai/flows/format-text-with-ai';
import { proofreadText } from '@/ai/flows/proofread-text';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface EditorToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement>;
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
}

type FormatType =
  | 'h1' | 'h2' | 'h3'
  | 'bold' | 'italic' | 'strikethrough'
  | 'blockquote' | 'link' | 'hr'
  | 'ul' | 'ol' | 'task'
  | 'codeBlock' | 'fileBlock' | 'inlineCode'
  | 'image' | 'table';

export function EditorToolbar({
  textareaRef,
  content,
  setContent,
  isGenerating,
  setIsGenerating,
}: EditorToolbarProps) {
  const { toast } = useToast();
  const [imageCount, setImageCount] = useState(0);

  const applyFormat = (format: FormatType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    let replacement = '';
    let cursorOffset = 0;
    let selectionLength = 0;

    const applyLinePrefix = (prefix: string) => {
      const lines = selectedText.split('\n');
      if (lines.length > 1 && selectedText.trim() !== '') {
        return lines.map(line => `${prefix}${line}`).join('\n');
      }
      return `${prefix}${selectedText}`;
    }

    switch (format) {
      case 'h1':
        replacement = `# ${selectedText}`;
        cursorOffset = 2;
        break;
      case 'h2':
        replacement = `## ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'h3':
        replacement = `### ${selectedText}`;
        cursorOffset = 4;
        break;
      case 'bold':
        replacement = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'strikethrough':
        replacement = `~~${selectedText}~~`;
        cursorOffset = 2;
        break;
      case 'blockquote':
        replacement = applyLinePrefix('> ');
        cursorOffset = 2;
        selectionLength = replacement.length;
        break;
      case 'ul':
        replacement = applyLinePrefix('- ');
        cursorOffset = 2;
        selectionLength = replacement.length;
        break;
      case 'ol':
        const lines = selectedText.split('\n');
        if (lines.length > 1 && selectedText.trim() !== '') {
          replacement = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
        } else {
          replacement = `1. ${selectedText}`;
        }
        cursorOffset = 3;
        selectionLength = replacement.length;
        break;
      case 'task':
        replacement = applyLinePrefix('- [ ] ');
        cursorOffset = 6;
        selectionLength = replacement.length;
        break;
      case 'link':
        if (selectedText) {
          replacement = `[${selectedText}]()`;
          cursorOffset = replacement.length - 1;
        } else {
          replacement = `[link text](url)`;
          cursorOffset = replacement.indexOf('(') + 1;
          selectionLength = 'url'.length;
        }
        break;
      case 'hr':
        replacement = `\n---\n`;
        cursorOffset = 5;
        break;
      case 'inlineCode':
        replacement = `\`${selectedText}\``;
        cursorOffset = 1;
        break;
      case 'codeBlock':
        replacement = `\`\`\`console\n${selectedText}\n\`\`\``;
        cursorOffset = 11;
        break;
      case 'fileBlock':
        replacement = `\`\`\`file:path/to/file\n${selectedText}\n\`\`\``;
        cursorOffset = 8;
        break;
      case 'image':
        const newImageCount = imageCount + 1;
        setImageCount(newImageCount);
        replacement = `![alt text](image-${newImageCount}.webp)`;
        cursorOffset = 2;
        selectionLength = 'alt text'.length;
        break;
      case 'table':
        replacement = `| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n`;
        cursorOffset = 2;
        selectionLength = 'Header 1'.length;
        break;
    }
    
    let finalContent = `${beforeText}${replacement}${afterText}`;
    
    if (['h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'task', 'hr', 'codeBlock', 'fileBlock', 'table'].includes(format) && start > 0 && content[start-1] !== '\n') {
        finalContent = `${beforeText}\n${replacement}${afterText}`;
        cursorOffset += 1;
    }

    setContent(finalContent);

    setTimeout(() => {
      textarea.focus();
      const finalCursorStart = start + cursorOffset;
      const finalCursorEnd = selectionLength > 0 ? (finalCursorStart + selectionLength) : finalCursorStart + selectedText.length;
      textarea.setSelectionRange(finalCursorStart, finalCursorEnd);
    }, 0);
  };

  const handleAiAction = async (action: 'format' | 'proofread') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      toast({
        title: 'No text selected',
        description: 'Please select the text you want to process.',
        variant: 'destructive',
      });
      return;
    }

    const selectedText = content.substring(start, end);
    setIsGenerating(true);

    try {
      let resultText = '';
      let toastTitle = '';

      if (action === 'format') {
        const result = await formatTextWithAI({ text: selectedText });
        resultText = result.formattedText;
        toastTitle = 'AI Formatting Complete';
      } else {
        const result = await proofreadText({ text: selectedText });
        resultText = result.proofreadText;
        toastTitle = 'AI Proofreading Complete';
      }

      const newContent = `${content.substring(0, start)}${resultText}${content.substring(end)}`;
      setContent(newContent);
      toast({
        title: toastTitle,
        description: 'Your selected text has been updated.',
      });
    } catch (error) {
      console.error(`AI ${action} failed:`, error);
      toast({
        title: `AI ${action.charAt(0).toUpperCase() + action.slice(1)} Failed`,
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toolbarButtons = [
    { icon: Heading1, format: 'h1', tooltip: 'Heading 1' },
    { icon: Heading2, format: 'h2', tooltip: 'Heading 2' },
    { icon: Heading3, format: 'h3', tooltip: 'Heading 3' },
    { type: 'separator' },
    { icon: Bold, format: 'bold', tooltip: 'Bold' },
    { icon: Italic, format: 'italic', tooltip: 'Italic' },
    { icon: Strikethrough, format: 'strikethrough', tooltip: 'Strikethrough' },
    { icon: Terminal, format: 'inlineCode', tooltip: 'Inline Code'},
    { type: 'separator' },
    { icon: List, format: 'ul', tooltip: 'Bulleted List' },
    { icon: ListOrdered, format: 'ol', tooltip: 'Numbered List' },
    { icon: ListTodo, format: 'task', tooltip: 'Task List' },
    { type: 'separator' },
    { icon: Quote, format: 'blockquote', tooltip: 'Blockquote' },
    { icon: Link, format: 'link', tooltip: 'Insert Link' },
    { icon: Minus, format: 'hr', tooltip: 'Horizontal Rule' },
    { icon: Image, format: 'image', tooltip: 'Image' },
    { type: 'separator' },
    { icon: Code2, format: 'codeBlock', tooltip: 'Code Block' },
    { icon: FileCode, format: 'fileBlock', tooltip: 'File Block' },
    { icon: Table, format: 'table', tooltip: 'Insert Table' },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 border-b p-2 flex-wrap">
        {toolbarButtons.map((btn, index) => {
          if (btn.type === 'separator') {
            return <Separator key={`sep-${index}`} orientation="vertical" className="h-6 mx-1" />;
          }
          return (
            <Tooltip key={btn.format}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => applyFormat(btn.format as FormatType)}
                  disabled={isGenerating}
                >
                  <btn.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{btn.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => handleAiAction('format')} disabled={isGenerating}>
              <Wand2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Format with AI</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => handleAiAction('proofread')} disabled={isGenerating}>
              <SpellCheck className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Proofread with AI</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
