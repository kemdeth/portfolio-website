import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('ts', typescript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('js', javascript)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('shell', bash)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('html', markup)
SyntaxHighlighter.registerLanguage('markup', markup)

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const code = String(children).replace(/\n$/, '')
    if (match) {
      return (
        <SyntaxHighlighter
          language={match[1]}
          style={oneDark}
          customStyle={{
            margin: '0.5rem 0',
            borderRadius: '0.5rem',
            fontSize: '0.78rem',
            lineHeight: '1.5',
          }}
          codeTagProps={{ style: { fontFamily: 'inherit' } }}
        >
          {code}
        </SyntaxHighlighter>
      )
    }
    return (
      <code
        className="rounded-md bg-slate-200/70 px-1.5 py-0.5 font-mono text-[0.8em] text-rose-600 dark:bg-white/10 dark:text-neon"
        {...props}
      >
        {children}
      </code>
    )
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="font-medium text-neon-deep underline underline-offset-2 hover:text-neon-dark dark:text-neon"
      >
        {children}
      </a>
    )
  },
}

export function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
