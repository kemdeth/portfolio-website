import { Link } from 'react-router-dom'
import {
  Award,
  FolderGit2,
  MessageSquare,
  User,
  Wrench,
  ExternalLink,
} from 'lucide-react'
import { useData } from '@/context/useData'
import { timeAgo } from '@/lib/utils'

export default function Overview() {
  const { data } = useData()
  const unread = data.messages.filter((m) => !m.read).length

  const stats = [
    {
      label: 'Projects',
      value: data.projects.length,
      to: '/admin/projects',
      icon: FolderGit2,
    },
    { label: 'Certificates', value: data.certificates.length, to: '/admin/certificates', icon: Award },
    { label: 'Skills', value: data.skills.length, to: '/admin/skills', icon: Wrench },
    { label: 'Messages', value: `${data.messages.length}`, sub: unread > 0 ? `${unread} unread` : 'all read', to: '/admin/messages', icon: MessageSquare },
  ]

  const recentMessages = [...data.messages]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4)

  const avgLevel = Math.round(
    data.skills.reduce((sum, s) => sum + s.level, 0) / Math.max(data.skills.length, 1),
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="card-surface group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-neon/50 hover:shadow-lg"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-neon/15 text-neon-deep dark:text-neon">
              <stat.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
                {stat.sub ? <span className="ml-1 text-neon-deep dark:text-neon">({stat.sub})</span> : null}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
            Recent Messages
          </h2>
          <div className="mt-4 space-y-3">
            {recentMessages.length === 0 && (
              <p className="text-sm text-gray-400">No messages yet.</p>
            )}
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/10"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neon/15 text-neon-deep dark:text-neon">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {msg.name}
                    </p>
                    <span className="shrink-0 text-xs text-gray-400">
                      {timeAgo(msg.createdAt)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {msg.subject || msg.body}
                  </p>
                </div>
                {!msg.read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-neon" title="Unread" />
                )}
              </div>
            ))}
          </div>
          <Link
            to="/admin/messages"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-neon-deep transition hover:underline dark:text-neon"
          >
            View all messages <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="card-surface p-6">
          <h2 className="font-display text-base font-semibold text-gray-900 dark:text-white">
            Profile Summary
          </h2>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <img
                src={data.profile.avatarUrl}
                alt="Avatar"
                width={56}
                height={56}
                className="aspect-square h-14 w-14 rounded-full border-2 border-neon/30 object-cover shadow-sm"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{data.profile.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{data.profile.headline}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Location</p>
                <p className="mt-0.5 text-gray-700 dark:text-gray-200">{data.profile.location}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Avg. skill level</p>
                <p className="mt-0.5 text-gray-700 dark:text-gray-200">{avgLevel}%</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Typing phrases</p>
                <p className="mt-0.5 text-gray-700 dark:text-gray-200">
                  {data.profile.typingPhrases.length}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Intro paragraphs</p>
                <p className="mt-0.5 text-gray-700 dark:text-gray-200">{data.profile.intro.length}</p>
              </div>
            </div>
            <Link
              to="/admin/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-neon-deep hover:text-neon-deep dark:border-white/20 dark:text-gray-200 dark:hover:border-neon dark:hover:text-neon"
            >
              <User className="h-3.5 w-3.5" /> Edit profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
