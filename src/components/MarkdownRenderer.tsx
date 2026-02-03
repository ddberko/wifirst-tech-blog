"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import Mermaid from "./Mermaid";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-p:text-gray-600 prose-p:leading-[1.8] prose-a:text-[#0066CC] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-950 prose-pre:text-zinc-100 prose-pre:rounded-xl prose-pre:shadow-2xl prose-pre:border prose-pre:border-white/5 prose-pre:p-6 prose-blockquote:border-l-[#0066CC] prose-blockquote:bg-blue-50/50 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:pr-4 prose-img:rounded-xl prose-img:shadow-md prose-hr:border-gray-200 prose-li:text-gray-600">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkFrontmatter]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-mermaid/.exec(className || "");
            if (match) {
              return <Mermaid chart={String(children).replace(/\n$/, "")} />;
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

