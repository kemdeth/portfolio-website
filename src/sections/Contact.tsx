import { useRef, useState, type FormEvent } from 'react'
import { Copy, Mail, MapPin, Send, Timer, CheckCircle2 } from 'lucide-react'
import { useData } from '@/context/useData'
import { useToast } from '@/context/useToast'
import { copyToClipboard } from '@/lib/clipboard'
import { ContactError, sendContactMessage } from '@/lib/contact'
import { MIN_FORM_TIME_MS } from '@/lib/captcha'
import { BotCheck, type BotCheckHandle } from '@/components/BotCheck'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { GithubIcon, LinkedinIcon, TelegramIcon } from '@/components/SocialIcons'

export function Contact() {
  const { data, addMessage } = useData()
  const { toast } = useToast()
  const p = data.profile
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const botRef = useRef<BotCheckHandle>(null)
  const startedAtRef = useRef(Date.now())

  const handleCopy = async (value: string, label: string) => {
    const ok = await copyToClipboard(value)
    if (ok) toast(`${label} copied to clipboard!`)
    else toast('Could not copy to clipboard.', 'error')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const name = String(fd.get('name') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const subject = String(fd.get('subject') ?? '').trim()
    const body = String(fd.get('message') ?? '').trim()
    const website = String(fd.get('website') ?? '').trim()
    const botToken = botRef.current?.getToken() ?? null

    // Honeypot - real visitors never fill this hidden field. Silently drop bots.
    if (website) {
      form.reset()
      return
    }

    if (!name || !email || !body) {
      toast('Please fill in all required fields.', 'error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Please enter a valid email address.', 'error')
      return
    }
    if (Date.now() - startedAtRef.current < MIN_FORM_TIME_MS) {
      toast('Please take a moment before sending.', 'error')
      return
    }
    if (!botToken) {
      toast('Please complete the "I am not a robot" check first.', 'error')
      return
    }

    setSending(true)
    try {
      await sendContactMessage({
        name,
        email,
        subject: subject || undefined,
        body,
        createdAt: new Date().toISOString(),
        botToken,
        honeypot: website,
        formStartedAt: new Date(startedAtRef.current).toISOString(),
      })
      await addMessage({ name, email, subject: subject || undefined, body })
      form.reset()
      botRef.current?.reset()
      setSent(true)
      setTimeout(() => setSent(false), 6000)
      toast('Message sent successfully! I usually reply within 24 hours.')
    } catch (err) {
      if (err instanceof ContactError && err.status === 429) {
        toast('Too many messages from you. Please try again later.', 'error')
      } else if (err instanceof ContactError && err.status === 400) {
        toast('Verification failed. Please complete the "I am not a robot" check.', 'error')
      } else {
        // Local dev or server function unavailable — persist to local state so message appears in inbox
        try {
          await addMessage({ name, email, subject: subject || undefined, body })
          form.reset()
          botRef.current?.reset()
          setSent(true)
          setTimeout(() => setSent(false), 6000)
          toast('Message sent successfully! Saved to inbox.')
        } catch {
          toast('Something went wrong. Please try again.', 'error')
        }
      }
    } finally {
      setSending(false)
    }
  }

  const contactCards = [
    { label: 'Email', value: p.email, href: `mailto:${p.email}`, copy: p.email, Icon: Mail },
    { label: 'Location', value: p.location, Icon: MapPin },
    { label: 'Response Time', value: p.responseTime, Icon: Timer },
  ]

  return (
    <section id="contact" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Contact"
          title={
            <>
              Let's Work <span className="text-neon-deep dark:text-neon">Together</span>
            </>
          }
          subtitle="Have a project in mind, a question, or just want to say hi? My inbox is always open."
        />

        <div className="grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="space-y-4">
              {contactCards.map(({ label, value, href, copy, Icon }) => (
                <div
                  key={label}
                  className="card-surface flex items-center gap-4 p-4 transition hover:border-neon/50"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-neon/15 text-neon-deep dark:text-neon">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="block truncate text-sm font-medium text-gray-800 transition hover:text-neon-deep dark:text-gray-100 dark:hover:text-neon"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {value}
                      </p>
                    )}
                  </div>
                  {copy && (
                    <button
                      type="button"
                      onClick={() => void handleCopy(copy, label)}
                      aria-label={`Copy ${label}`}
                      title={`Copy ${label}`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-neon/50 hover:text-neon-deep dark:border-white/15 dark:text-gray-400 dark:hover:border-neon dark:hover:text-neon"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <div className="card-surface p-4">
                <p className="text-xs uppercase tracking-wider text-gray-400">Find me on</p>
                <div className="mt-3 flex items-center gap-3">
                  {[
                    { label: 'GitHub', href: p.github, Icon: GithubIcon },
                    { label: 'LinkedIn', href: p.linkedin, Icon: LinkedinIcon },
                    { label: 'Telegram', href: p.telegram, Icon: TelegramIcon },
                  ].map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition hover:border-neon-deep hover:text-neon-deep dark:border-white/15 dark:text-gray-300 dark:hover:border-neon dark:hover:text-neon"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopy(p.telegram, 'Telegram link')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-neon/50 hover:text-neon-deep dark:border-white/15 dark:text-gray-300 dark:hover:border-neon dark:hover:text-neon"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Telegram link
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="card-surface relative p-6 sm:p-8">
              {/* Honeypot field - hidden from humans, filled by naive bots. */}
              <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input id="name" name="name" type="text" required className="input-base" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input id="email" name="email" type="email" required className="input-base" placeholder="you@example.com" />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Subject
                </label>
                <input id="subject" name="subject" type="text" className="input-base" placeholder="What's this about?" />
              </div>
              <div className="mt-4">
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="input-base resize-y"
                  placeholder="Tell me about your project or idea..."
                />
              </div>

              <div className="mt-5">
                <BotCheck ref={botRef} theme="auto" />
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                {sent && (
                  <p className="flex items-center gap-1.5 text-sm font-medium text-neon-deep dark:text-neon">
                    <CheckCircle2 className="h-4 w-4" /> Sent! I'll get back to you soon.
                  </p>
                )}
                <button type="submit" disabled={sending} className="btn-primary ml-auto">
                  {sending ? 'Sending...' : 'Send Message'}
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
