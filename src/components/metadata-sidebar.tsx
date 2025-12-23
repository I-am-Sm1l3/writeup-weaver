'use client';

import type { Dispatch, SetStateAction } from 'react';
import { suggestCategoriesAndTags } from '@/ai/flows/suggest-categories-and-tags';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Download, Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import JSZip from 'jszip';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { format } from 'date-fns';

interface MetadataSidebarProps {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  author: string;
  setAuthor: Dispatch<SetStateAction<string>>;
  categories: string;
  setCategories: Dispatch<SetStateAction<string>>;
  tags: string;
  setTags: Dispatch<SetStateAction<string>>;
  content: string;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
}

export function MetadataSidebar({
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
}: MetadataSidebarProps) {
  const { toast } = useToast();

  const handleSuggest = async () => {
    setIsGenerating(true);
    try {
      if (!content.trim()) {
        toast({
          title: 'Content is empty',
          description: 'Please write some content before suggesting categories and tags.',
          variant: 'destructive',
        });
        return;
      }
      const result = await suggestCategoriesAndTags({ content });
      if (result.categories) {
        setCategories(result.categories.join(', '));
      }
      if (result.tags) {
        setTags(result.tags.join(', '));
      }
      toast({
        title: 'Suggestions Generated',
        description: 'Categories and tags have been updated.',
      });
    } catch (error) {
      console.error('Failed to suggest categories and tags:', error);
      toast({
        title: 'Suggestion Failed',
        description: 'Could not generate suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    const zip = new JSZip();
    const creationDate = new Date();
    const postSlug = (title || 'new-post').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const postFileName = `${format(creationDate, 'yyyy-MM-dd')}-${postSlug}.md`;
    
    let processedContent = content;
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const imagePaths = new Map<string, string>();
    const imagePromises: Promise<void>[] = [];
    let imageCounter = 1;

    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      const originalPath = match[1];
      if (imagePaths.has(originalPath)) continue;

      const imageInfo = PlaceHolderImages.find(p => originalPath.includes(p.id));
      let imageUrl = originalPath;
      if (imageInfo) {
        imageUrl = imageInfo.imageUrl;
      }

      let extension = 'webp';
      try {
        const url = new URL(imageUrl);
        const pathname = url.pathname;
        const ext = pathname.split('.').pop();
        if (ext) {
          extension = ext.split('?')[0]; // Handle query params
        }
      } catch (e) {
        // Handle relative paths like `image-1.webp`
        const ext = imageUrl.split('.').pop();
        if (ext && ext.length < 5) { // Basic check for valid extension
            extension = ext;
        }
      }
      
      const newImageName = `${imageCounter}.${extension}`;
      const newImagePathInMd = newImageName;
      const newImagePathInZip = `assets/img/posts/${postSlug}/${newImageName}`;
      imagePaths.set(originalPath, newImagePathInMd);
      
      imageCounter++;
      
      const isRelativePlaceholder = PlaceHolderImages.some(p => originalPath.includes(p.id));

      if (isRelativePlaceholder || !imageUrl.startsWith('http')) {
        const placeholder = PlaceHolderImages.find(p => p.id === originalPath);
        if(!placeholder) continue;
        imageUrl = placeholder.imageUrl;
      }

      imagePromises.push(
        fetch(imageUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            return response.blob();
          })
          .then(blob => {
            zip.file(newImagePathInZip, blob);
          })
          .catch(error => {
            console.error(`Failed to download image ${imageUrl}:`, error);
            toast({
              title: 'Image Download Failed',
              description: `Could not download ${originalPath}.`,
              variant: 'destructive',
            });
          })
      );
    }

    await Promise.all(imagePromises);

    imagePaths.forEach((newPath, originalPath) => {
      processedContent = processedContent.replace(new RegExp(escapeRegExp(originalPath), 'g'), newPath);
    });

    const frontMatter = `---
layout: post
title: "${title.replace(/"/g, '\\"')}"
date: ${format(creationDate, 'yyyy-MM-dd HH:mm:ss xx')}
author: ${author}
categories: [${categories.split(',').map(c => c.trim()).join(', ')}]
tags: [${tags.split(',').map(t => t.trim()).join(', ')}]
img_path: /assets/img/posts/${postSlug}/
---

${processedContent}`;

    zip.file(`_posts/${postFileName}`, frontMatter);

    zip.generateAsync({ type: 'blob' }).then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${postSlug}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: 'Export Successful',
        description: 'Your post has been downloaded as a zip file.',
      });
    });
  };

  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Post Details</CardTitle>
        <CardDescription>
          Provide metadata for your post and use tools to help you finish.
        </CardDescription>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categories">Categories (comma-separated)</Label>
            <Input
              id="categories"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </CardContent>
      </ScrollArea>
      <CardFooter className="flex flex-col gap-2 pt-6">
        <Button onClick={handleSuggest} disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Suggest Categories & Tags
        </Button>
        <Button onClick={handleExport} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Export for Jekyll
        </Button>
      </CardFooter>
    </Card>
  );
}
