'use client';

import MarkdownIt from 'markdown-it';
import * as emoji from 'markdown-it-emoji';
import { useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';

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
        highlight: (str, lang) => {
            if (lang && Prism.languages[lang]) {
                try {
                    return `<pre class="language-${lang}"><code>${Prism.highlight(str, Prism.languages[lang], lang)}</code></pre>`;
                } catch (__) {}
            }
            return `<pre class="language-text"><code>${md.utils.escapeHtml(str)}</code></pre>`;
        }
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
