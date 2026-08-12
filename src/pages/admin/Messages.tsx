import { useState } from 'react'
import { Mail, MailOpen, MessageSquare, Reply, Trash2 } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useToast } from '@/context/ToastContext'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function Messages() {
  const { data, setMessageRead, removeMessage } = useData()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState<Message | null>(null)
  const [busy, setBusy] = useState(false)

  const messages = [...data.messages].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  )

  const toggleRead = async (msg: Message) => {
    await setMessageRead(msg.id, !msg.read)
  }

  const handleDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await removeMessage(deleting.id)
    setBusy(false)
    setDeleting(null)
    toast('Message deleted.', 'info')
  }

  const unreadCount = data.messages.filter((m) => !m.read).length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {unreadCount > 0
            ? `${unreadCount} unread of ${data.messages.length} total`
            : `${data.messages.length} message${data.messages.length === 1 ? '' : 's'} · all read`}
        </p>
      </div>

      {messages.length === 0 && (
        <div className="card-surface grid place-items-center p-12 text-center">
          <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            No messages yet. When visitors use the contact form, their messages will appear here.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((msg) => (
          <article
            key={msg.id}
            className={cn(
              'card-surface p-5 transition',
              !msg.read && 'border-neon/40 bg-neon/[0.03]',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                    msg.read
                      ? 'bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-500'
                      : 'bg-neon/15 text-neon-deep dark:text-neon',
                  )}
                >
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {msg.name}
                    {!msg.read && (
                      <span className="ml-2 rounded-full bg-neon px-1.5 py-0.5 text-[10px] font-bold text-black">
                        New
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {msg.email}
                    {msg.subject ? ` · ${msg.subject}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(msg.createdAt)}</p>
                </div>
              </div>
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
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {msg.body}
            </p>
          </article>
        ))}
      </div>

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
