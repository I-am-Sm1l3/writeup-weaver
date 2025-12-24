'use client';

import MarkdownIt from 'markdown-it';
import * as emoji from 'markdown-it-emoji';
import { useMemo } from 'react';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const md = useMemo(
    () =>
      new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
      }).use(emoji.full),
    []
  );

  const html = useMemo(() => md.render(content), [md, content]);

  return (
    <div
      className="prose dark:prose-invert max-w-none p-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
