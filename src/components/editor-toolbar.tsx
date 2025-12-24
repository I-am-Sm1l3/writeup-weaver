'use client';

import type { Dispatch, SetStateAction, RefObject } from 'react';
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
  Smile,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatTextWithAI } from '@/ai/flows/format-text-with-ai';
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
  
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
  '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
  '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
  '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞',
  '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
  '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
  '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣',
  '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄',
  '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
  '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️',
  '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎',
  '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️',
  '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮',
  '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎',
  '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯',
];

export function EditorToolbar({
  textareaRef,
  content,
  setContent,
  isGenerating,
  setIsGenerating,
}: EditorToolbarProps) {
  const { toast } = useToast();
  const [imageCount, setImageCount] = useState(0);

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newContent = `${content.substring(0, start)}${text}${content.substring(end)}`;
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + text.length;
      textarea.selectionEnd = start + text.length;
    }, 0);
  };

  const applyFormat = (format: FormatType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let replacement = '';
    let selectionOffsetStart = 0;
    let selectionOffsetEnd = 0;

    const applyLinePrefix = (prefix: string) => {
      const lines = selectedText.split('\n');
      if (lines.length > 1 && selectedText.trim() !== '') {
        return {
          text: lines.map(line => `${prefix}${line}`).join('\n'),
          isBlock: true,
        };
      }
      return { text: `${prefix}${selectedText}`, isBlock: false };
    }

    switch (format) {
      case 'h1':
        replacement = `# ${selectedText}`;
        selectionOffsetStart = 2;
        break;
      case 'h2':
        replacement = `## ${selectedText}`;
        selectionOffsetStart = 3;
        break;
      case 'h3':
        replacement = `### ${selectedText}`;
        selectionOffsetStart = 4;
        break;
      case 'bold':
        replacement = `**${selectedText}**`;
        selectionOffsetStart = 2;
        selectionOffsetEnd = 2;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        selectionOffsetStart = 1;
        selectionOffsetEnd = 1;
        break;
      case 'strikethrough':
        replacement = `~~${selectedText}~~`;
        selectionOffsetStart = 2;
        selectionOffsetEnd = 2;
        break;
      case 'blockquote':
        const bqResult = applyLinePrefix('> ');
        replacement = bqResult.text;
        if (bqResult.isBlock) {
          selectionOffsetStart = 0;
          selectionOffsetEnd = -replacement.length;
        } else {
          selectionOffsetStart = 2;
        }
        break;
      case 'ul':
        const ulResult = applyLinePrefix('- ');
        replacement = ulResult.text;
        if (ulResult.isBlock) {
          selectionOffsetStart = 0;
          selectionOffsetEnd = -replacement.length;
        } else {
          selectionOffsetStart = 2;
        }
        break;
      case 'ol':
        const lines = selectedText.split('\n');
        if (lines.length > 1 && selectedText.trim() !== '') {
          replacement = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
          selectionOffsetStart = 0;
          selectionOffsetEnd = -replacement.length;
        } else {
          replacement = `1. ${selectedText}`;
          selectionOffsetStart = 3;
        }
        break;
       case 'task':
        const taskResult = applyLinePrefix('- [ ] ');
        replacement = taskResult.text;
        if (taskResult.isBlock) {
          selectionOffsetStart = 0;
          selectionOffsetEnd = -replacement.length;
        } else {
          selectionOffsetStart = 6;
        }
        break;
      case 'link':
        if (selectedText) {
          replacement = `[${selectedText}]()`;
          selectionOffsetStart = replacement.length - 1;
          selectionOffsetEnd = 0;
        } else {
          replacement = `[link text](url)`;
          selectionOffsetStart = 1;
          selectionOffsetEnd = -(replacement.length-9);
        }
        break;
      case 'hr':
        replacement = `\n---\n`;
        selectionOffsetStart = 5;
        break;
      case 'inlineCode':
        replacement = `\`${selectedText}\``;
        selectionOffsetStart = 1;
        selectionOffsetEnd = 1;
        break;
      case 'codeBlock':
        replacement = `\`\`\`console\n${selectedText}\n\`\`\``;
        selectionOffsetStart = 11;
        break;
      case 'fileBlock':
        replacement = `\`\`\`file:path/to/file\n${selectedText}\n\`\`\``;
        selectionOffsetStart = 8;
        break;
      case 'image':
        const newImageCount = imageCount + 1;
        setImageCount(newImageCount);
        replacement = `![alt text](image-${newImageCount}.webp)`;
        selectionOffsetStart = 2;
        selectionOffsetEnd = -(replacement.length - 10);
        break;
      case 'table':
        replacement = `| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n`;
        selectionOffsetStart = 2;
        selectionOffsetEnd = -replacement.length + 10;
        break;
    }

    let prefix = "";
    if (['h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'task', 'hr', 'codeBlock', 'fileBlock', 'table'].includes(format)) {
        const lineStart = content.lastIndexOf('\n', start - 1) + 1;
        if (lineStart > 0 && content.substring(lineStart-1, lineStart) !== '\n') {
            prefix = "\n";
        }
    }
    
    const newContent = `${content.substring(0, start)}${prefix}${replacement}${content.substring(end)}`;
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length + selectionOffsetStart;
      textarea.selectionEnd = start + prefix.length + replacement.length - Math.abs(selectionOffsetEnd);
    }, 0);
  };
  
  const handleAiFormat = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      toast({
        title: 'No text selected',
        description: 'Please select the text you want to format with AI.',
        variant: 'destructive',
      });
      return;
    }

    const selectedText = content.substring(start, end);
    setIsGenerating(true);

    try {
      const result = await formatTextWithAI({ text: selectedText });
      const newContent = `${content.substring(0, start)}${result.formattedText}${content.substring(end)}`;
      setContent(newContent);

      toast({
        title: 'AI Formatting Complete',
        description: 'Your selected text has been formatted.',
      });
    } catch (error) {
      console.error('AI formatting failed:', error);
      toast({
        title: 'AI Formatting Failed',
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
                  aria-label={btn.tooltip}
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
        <Popover>
          <Tooltip>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isGenerating} aria-label="Insert Emoji">
                  <Smile className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
            </PopoverTrigger>
            <TooltipContent>
              <p>Insert Emoji</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80 h-96">
            <div className="grid grid-cols-8 gap-2 overflow-y-auto h-full">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  className="text-xl"
                  onClick={() => insertText(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleAiFormat} disabled={isGenerating} aria-label="Format with AI">
              <Wand2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Format with AI</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
