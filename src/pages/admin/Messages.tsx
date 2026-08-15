import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail,
  MailOpen,
  MessageSquare,
  RefreshCw,
  Reply,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useData } from '@/context/useData'
import { useAuth } from '@/context/useAuth'
import { useToast } from '@/context/useToast'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { fetchMessages, sendAdminAction } from '@/lib/adminApi'
import { formatDate } from '@/lib/utils'
import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'

const POLL_INTERVAL_MS = 15000

export default function Messages() {
  const { data, setMessageRead, removeMessage, setMessages } = useData()
  const { logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState<Message | null>(null)
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [live, setLive] = useState(false)

  const messages = [...data.messages].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  )

  const handleUnauthorized = useCallback(async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }, [logout, navigate])

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setRefreshing(true)
      const res = await fetchMessages()
      if (res.status === 401) {
        void handleUnauthorized()
        return
      }
      if (res.messages) {
        await setMessages(res.messages)
        setLive(true)
      } else {
        setLive(false)
        if (!opts?.silent) {
          toast('Showing local inbox. Server sync is unavailable.', 'info')
        }
      }
      setLoading(false)
      setRefreshing(false)
    },
    [setMessages, toast, handleUnauthorized],
  )

  useEffect(() => {
    void refresh({ silent: true })
    const id = setInterval(() => void refresh({ silent: true }), POLL_INTERVAL_MS)
    const onFocus = () => void refresh({ silent: true })
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  /** Sends a read-state change to Supabase (optimistically updates local state). */
  const setReadOnServer = async (msg: Message, read: boolean) => {
    await setMessageRead(msg.id, read)
    const res = await sendAdminAction({
      action: 'set_message_read',
      data: { id: msg.id, read },
    })
    if (res.status === 401) {
      void handleUnauthorized()
      return
    }
    if (!res.ok) {
      toast(`Could not update message: ${res.error ?? 'Unknown error'}`, 'error')
      await setMessageRead(msg.id, msg.read)
    }
  }

  const handleExpand = async (msg: Message) => {
    const isOpening = expanded !== msg.id
    setExpanded(isOpening ? msg.id : null)
    // Auto-mark as read when an admin opens a message.
    if (isOpening && !msg.read) {
      await setReadOnServer(msg, true)
    }
  }

  const toggleRead = async (msg: Message) => {
    await setReadOnServer(msg, !msg.read)
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await removeMessage(deleting.id)
    const res = await sendAdminAction({
      action: 'delete_message',
      data: { id: deleting.id },
    })
    if (res.status === 401) {
      setBusy(false)
      setDeleting(null)
      void handleUnauthorized()
      return
    }
    if (!res.ok) {
      toast(`Could not delete message: ${res.error ?? 'Unknown error'}`, 'error')
      void refresh({ silent: true })
    } else {
      toast('Message deleted.', 'info')
    }
    setBusy(false)
    if (expanded === deleting.id) setExpanded(null)
    setDeleting(null)
  }

  const unreadCount = data.messages.filter((m) => !m.read).length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unreadCount > 0
              ? `${unreadCount} unread of ${data.messages.length} total`
              : `${data.messages.length} message${data.messages.length === 1 ? '' : 's'} — all read`}
          </p>
          {live && (
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              Live — synced with Supabase
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-neon/50 hover:text-neon-deep disabled:opacity-50 dark:border-white/15 dark:text-gray-300 dark:hover:border-neon dark:hover:text-neon"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {loading && data.messages.length === 0 ? (
        <div className="card-surface grid place-items-center p-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="card-surface grid place-items-center p-12 text-center">
          <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            No messages yet. When visitors use the contact form, their messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOpen = expanded === msg.id
            return (
              <article
                key={msg.id}
                className={cn(
                  'card-surface overflow-hidden transition',
                  !msg.read && 'border-neon/40 bg-neon/[0.03]',
                )}
              >
                {/* Message header row — use div to avoid nesting buttons inside a button */}
                <div className="flex w-full flex-wrap items-start gap-3 p-5">
                  {/* Avatar icon */}
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                      msg.read
                        ? 'bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-500'
                        : 'bg-neon/15 text-neon-deep dark:text-neon',
                    )}
                  >
                    {msg.read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  </span>

                  {/* Sender info — clicking this area expands the message */}
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    aria-controls={`msg-body-${msg.id}`}
                    onClick={() => void handleExpand(msg)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        void handleExpand(msg)
                      }
                    }}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {msg.name}
                      {!msg.read && (
                        <span className="ml-2 rounded-full bg-neon px-1.5 py-0.5 text-[10px] font-bold text-black">
                          New
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {msg.email}
                      {msg.subject ? ` — ${msg.subject}` : ''}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{formatDate(msg.createdAt)}</p>
                  </div>

                  {/* Action buttons — kept outside the expand area */}
                  <div className="flex items-center gap-1">
                    <a
                      href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject ?? 'Your message'}`)}`}
                      aria-label={`Reply to ${msg.name}`}
                      title="Reply"
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-neon-deep dark:hover:bg-white/10 dark:hover:text-neon"
                    >
                      <Reply className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      aria-label={msg.read ? 'Mark as unread' : 'Mark as read'}
                      title={msg.read ? 'Mark as unread' : 'Mark as read'}
                      onClick={() => void toggleRead(msg)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-neon-deep dark:hover:bg-white/10 dark:hover:text-neon"
                    >
                      {msg.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete message from ${msg.name}`}
                      title="Delete"
                      onClick={() => setDeleting(msg)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={isOpen ? 'Collapse message' : 'Expand message'}
                      title={isOpen ? 'Collapse' : 'Expand'}
                      onClick={() => void handleExpand(msg)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded body */}
                {isOpen && (
                  <div
                    id={`msg-body-${msg.id}`}
                    className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-white/10"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {msg.body}
                    </p>
                    <a
                      href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject ?? 'Your message'}`)}&body=${encodeURIComponent(`

---
On ${formatDate(msg.createdAt)}, ${msg.name} wrote:
${msg.body}`)}`}
                      className="btn-ghost mt-4 inline-flex items-center gap-2 text-sm"
                    >
                      <Reply className="h-4 w-4" />
                      Reply to {msg.name}
                    </a>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        busy={busy}
        title="Delete Message"
        message={`Delete the message from "${deleting?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
