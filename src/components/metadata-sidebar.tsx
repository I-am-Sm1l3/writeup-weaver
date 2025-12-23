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
import { format } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
    if (!title.trim()) {
      toast({
        title: 'Title is missing',
        description: 'Please provide a title for your post before exporting.',
        variant: 'destructive',
      });
      return;
    }
  
    const zip = new JSZip();
    const creationDate = new Date();
    const postSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const postFileName = `${format(creationDate, 'yyyy-MM-dd')}-${postSlug}.md`;
    
    // Create the empty directory for images, so it's always present.
    zip.folder(`assets/img/posts/${postSlug}`);

    let processedContent = content;
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const imagePaths = new Map<string, string>();
    const imagePromises: Promise<void>[] = [];
    let imageCounter = 1;

    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      const originalPath = match[1];
      if (imagePaths.has(originalPath)) continue;

      let fetchPromise: Promise<Blob | null>;

      // Handle both data URIs and external URLs
      if (originalPath.startsWith('data:') || originalPath.startsWith('http')) {
         fetchPromise = fetch(originalPath)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            return response.blob();
          })
          .catch(error => {
            console.error(`Failed to process image ${originalPath}:`, error);
            // Don't block export for a single failed image, just skip it.
            toast({
              title: 'Image Skipped',
              description: `Could not download image from ${originalPath}. It will be skipped in the export.`,
              variant: 'destructive',
            })
            return null;
          });
      } else {
        const placeholderMatch = originalPath.match(/image-(\d+)\.webp/);
        const placeholder = placeholderMatch ? PlaceHolderImages.find(p => p.id === `image-${placeholderMatch[1]}.webp`) : null;

        if (!placeholder) {
          // If it's not a known placeholder, data URI, or http url, skip it.
          continue;
        }
        
        fetchPromise = fetch(placeholder.imageUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            return response.blob();
          })
          .catch(error => {
            console.error(`Failed to process image ${placeholder.imageUrl}:`, error);
            return null;
          });
      }

      imagePromises.push(
        fetchPromise.then(blob => {
          if (blob) {
            const extension = blob.type.split('/')[1] || 'png';
            const newImageName = `${imageCounter}.${extension}`;
            const newImagePathInPost = `/${postSlug}/${newImageName}`;
            const newImagePathInZip = `assets/img/posts${newImagePathInPost}`;
            
            imagePaths.set(originalPath, newImagePathInPost);
            zip.file(newImagePathInZip, blob);
            imageCounter++;
          }
        })
      );
    }

    await Promise.all(imagePromises);

    imagePaths.forEach((newPath, originalPath) => {
      const escapedOriginalPath = escapeRegExp(originalPath);
      // The new path should be relative to the img_path
      const finalImgPath = newPath.split('/').pop();
      processedContent = processedContent.replace(new RegExp(`\\(${escapedOriginalPath}\\)`, 'g'), `(${finalImgPath})`);
    });

    const frontMatter = `---
layout: post
title: "${title.replace(/"/g, '\\"')}"
date: ${format(creationDate, 'yyyy-MM-dd HH:mm:ss O')}
author: ${author}
categories: [${categories.split(',').map(c => c.trim()).filter(Boolean).join(', ')}]
tags: [${tags.split(',').map(t => t.trim()).filter(Boolean).join(', ')}]
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
    // $& means the whole matched string
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
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your Awesome Post Title" />
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
              placeholder="Tech, Security"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Nmap, Recon" />
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
