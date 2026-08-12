import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  Check,
  Copy,
  Download,
  Eye,
  Send,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useData } from '@/context/DataContext'
import { useToast } from '@/context/ToastContext'

// react-markdown + syntax highlighting are heavy — load them only when the chat opens.
const ChatMarkdown = lazy(() =>
  import('@/components/ChatMarkdown').then((m) => ({ default: m.ChatMarkdown })),
)

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** True when the reply answers a question related to Kem → shows CV quick actions. */
  cvRelevant?: boolean
}

const HISTORY_KEY = 'portfolio:chat-history'
const SOUND_KEY = 'portfolio:chat-sound'

const GREETING =
  'Hi there! 👋 I\'m **Kem AI**, the virtual assistant for **Kem Deth**. Ask me about his skills, projects, experience, education, or how to get in touch. What would you like to know?'

const SUGGESTIONS = [
  { emoji: '💼', label: "What are Kem's top skills?" },
  { emoji: '🚀', label: 'Show me his recent projects' },
  { emoji: '📄', label: 'How can I contact Kem or get his resume?' },
  { emoji: '🎓', label: 'What is his education background?' },
]

// Pronouns / name that indicate a question about Kem himself.
const KEM_PRONOUNS = /\b(you|your|yours|he|his|him|kem)\b/i
// Topic words about his profile/background (substring match is fine — they're long words).
const KEM_TOPICS = [
  'cv',
  'resume',
  'hire',
  'hiring',
  'freelance',
  'job',
  'skill',
  'project',
  'experience',
  'education',
  'degree',
  'university',
  'background',
  'contact',
  'email',
  'telegram',
  'github',
  'linkedin',
  'developer',
  'frontend',
  'portfolio',
]

/** Detects whether a visitor's question relates to Kem (person/background/CV). */
function isKemRelated(text: string): boolean {
  if (KEM_PRONOUNS.test(text)) return true
  const lower = text.toLowerCase()
  return KEM_TOPICS.some((t) => lower.includes(t))
}

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessage[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore corrupt storage
  }
  return [{ id: 'greeting', role: 'assistant', content: GREETING }]
}

function loadSound(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

function playPing() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
    osc.onended = () => void ctx.close()
  } catch {
    // audio not available
  }
}

export function ChatWidget() {
  const { pathname } = useLocation()
  const { data } = useData()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [soundOn, setSoundOn] = useState(loadSound)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Hide the widget on admin routes
  const isAdmin = pathname.startsWith('/admin')

  // Persist history & sound pref
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages))
    } catch {
      // storage full — ignore
    }
  }, [messages])

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off')
    } catch {
      // ignore
    }
  }, [soundOn])

  // Auto-scroll to bottom on new messages / streaming
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isStreaming])

  // Auto-expand textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [input])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed }
      const assistantId = `a-${Date.now()}`
      const cvRelevant = isKemRelated(trimmed)

      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '', cvRelevant },
      ])
      setInput('')
      setIsStreaming(true)

      const history = [...messages, userMsg]
        .filter((m) => m.content.trim() !== '')
        .map((m) => ({ role: m.role, content: m.content }))

      const controller = new AbortController()
      abortRef.current = controller

      // ai.ts pulls in @google/generative-ai — load it only on first send.
      let configured = true
      try {
        const ai = await import('@/lib/ai')
        configured = ai.isGeminiConfigured()
        await ai.streamKemReply(
          history,
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + chunk } : m,
              ),
            )
            scrollToBottom()
          },
          {
            profile: data?.profile,
            skills: data?.skills,
            projects: data?.projects,
            signal: controller.signal,
          },
        )
      } catch {
        const aborted = controller.signal.aborted
        const message = aborted
          ? ''
          : !configured
            ? "⚠️ Kem AI needs a Google Gemini API key to respond. Add `VITE_GEMINI_API_KEY` to your `.env` file and restart the dev server."
            : '⚠️ Sorry, I couldn\'t reach Gemini right now. Please try again in a moment.'
        if (message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: message } : m)),
          )
        }
      } finally {
        abortRef.current = null
        setIsStreaming(false)
        if (soundOn) playPing()
      }
    },
    [isStreaming, messages, scrollToBottom, soundOn, data],
  )

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    void sendMessage(input)
  }

  const clearChat = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
    setInput('')
    setMessages([{ id: 'greeting', role: 'assistant', content: GREETING }])
  }

  const copyMessage = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  const lastAssistantStreaming =
    isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant'

  const resumeUrl = data?.profile.resumeUrl || ''

  if (isAdmin) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon to-neon-deep text-black shadow-lg shadow-neon/30">
                  <Bot className="h-5 w-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-neon dark:border-slate-900">
                  <span className="absolute inset-0 animate-ping rounded-full bg-neon opacity-75" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  Kem AI Assistant
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  Powered by Gemini
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  title="Clear chat"
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-slate-100 hover:text-red-500 dark:text-gray-400 dark:hover:bg-white/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSoundOn((s) => !s)}
                  title={soundOn ? 'Mute sound' : 'Enable sound'}
                  className={cn(
                    'rounded-lg p-2 text-gray-500 transition hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-white/10',
                    !soundOn && 'text-gray-400 line-through dark:text-gray-500',
                  )}
                >
                  {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  title="Close"
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-slate-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="scrollbar-hide flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={cn('group flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm',
                      m.role === 'user'
                        ? 'rounded-br-sm bg-neon text-black'
                        : 'rounded-bl-sm border border-slate-200 bg-slate-50 text-gray-800 dark:border-slate-800 dark:bg-slate-800/70 dark:text-gray-100',
                    )}
                  >
                    {m.role === 'assistant' ? (
                      m.content ? (
                        <>
                          <Suspense
                            fallback={
                              <p className="text-sm text-gray-500 dark:text-gray-400">…</p>
                            }
                          >
                            <ChatMarkdown content={m.content} />
                          </Suspense>
                          {m.cvRelevant && resumeUrl && (
                            <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-2.5 dark:border-slate-700/70">
                              <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                title="Open Kem's CV in a new tab"
                                className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-xs font-medium text-neon-deep transition hover:bg-neon/20 dark:text-neon"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View CV
                              </a>
                              <a
                                href={resumeUrl}
                                download
                                title="Download Kem's CV"
                                onClick={() => toast('CV download started! 📄')}
                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:border-neon/60 hover:text-neon-deep dark:border-slate-700 dark:bg-slate-800/80 dark:text-gray-200 dark:hover:border-neon dark:hover:text-neon"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download CV
                              </a>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => void copyMessage(m.id, m.content)}
                            title="Copy message"
                            className="absolute -bottom-2 -right-2 rounded-full border border-slate-200 bg-white p-1.5 text-gray-500 opacity-0 shadow transition hover:text-neon-deep group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:text-neon"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3 w-3 text-neon" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </>
                      ) : isStreaming ? (
                        <div className="flex items-center gap-1.5 py-1 text-gray-500 dark:text-gray-300">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="sr-only">Kem AI is typing…</span>
                        </div>
                      ) : null
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {!isStreaming &&
                !lastAssistantStreaming &&
                messages.filter((m) => m.role === 'assistant').length <= 1 && (
                  <div className="space-y-2 pt-1">
                    <p className="px-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Try asking:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => void sendMessage(s.label)}
                          disabled={isStreaming}
                          className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-gray-700 shadow-sm transition hover:border-neon/60 hover:text-neon-deep disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-gray-200 dark:hover:border-neon dark:hover:text-neon"
                        >
                          <span className="mr-1">{s.emoji}</span>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Input bar */}
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 border-t border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void sendMessage(input)
                  }
                }}
                rows={1}
                placeholder="Ask Kem AI…"
                className="input-base max-h-30 min-h-10 flex-1 resize-none rounded-xl px-3 py-2.5"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                title="Send"
                className="btn-primary h-10 w-10 shrink-0 rounded-xl p-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="group relative"
          >
            {/* Tooltip */}
            <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-700 opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900/95 dark:text-gray-100">
              Ask AI about Kem
              <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-200 dark:border-l-slate-700" />
            </span>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open Kem AI Assistant"
              className="chat-glow relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-neon to-neon-deep text-black shadow-lg shadow-neon/30 transition hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-6 w-6" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-neon-dark dark:border-slate-900" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
