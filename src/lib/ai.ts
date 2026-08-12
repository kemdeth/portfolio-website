import { GoogleGenerativeAI, type Content } from '@google/generative-ai'
import type { Profile, Project, Skill } from '@/lib/types'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Base persona injected into the Gemini model so it answers as
 * "Kem AI" — Kem Deth's personal portfolio assistant.
 */
const SYSTEM_PROMPT_BASE = `You are "Kem AI", the virtual AI assistant for Kem Deth.
Your job is to answer portfolio visitors' questions accurately, professionally, and warmly.

Information about Kem Deth:
- Name: Kem Deth
- Role: Frontend Developer / JavaScript Enthusiast
- Education: Computer Science student at the Royal University of Phnom Penh (RUPP)
- Location: Phnom Penh, Cambodia
- Status: Open to opportunities / Freelance / Full-time roles
- Key Skills: React.js, Vite, Tailwind CSS, JavaScript (ES6+), TypeScript, HTML5, CSS3, PHP, Node.js, Git/GitHub, REST APIs, UI/UX Design.
- Contact:
  - Email: kemdeth25@gmail.com
  - GitHub: https://github.com/kemdeth
  - LinkedIn: https://linkedin.com/in/kemdeth
  - Telegram: https://t.me/KEMDETH
- Experience: 2+ Years Coding, 600+ Hours Learned, multiple frontend projects.

Guidelines:
- Keep answers concise, helpful, friendly, and structured using markdown (bullet points, bold key terms).
- Always encourage visitors to view his projects, download his CV, or reach out via email/Telegram.
- If asked about something unrelated to Kem Deth, politely steer the conversation back to Kem's portfolio and software engineering background.`

export function isGeminiConfigured(): boolean {
  return Boolean(API_KEY)
}

/** Enriches the static persona with live portfolio data so answers stay accurate. */
function buildSystemPrompt(profile?: Profile, skills?: Skill[], projects?: Project[]): string {
  let extra = ''
  if (profile) {
    const contact = [
      `Email: ${profile.email}`,
      profile.github && `GitHub: ${profile.github}`,
      profile.linkedin && `LinkedIn: ${profile.linkedin}`,
      profile.telegram && `Telegram: ${profile.telegram}`,
    ]
      .filter(Boolean)
      .join('\n  - ')
    extra += `\n\nLive site data — use this as the source of truth when asked:\n- Headline: ${profile.headline}\n- Location: ${profile.location}\n- Availability: ${profile.availability}\n- CV / Resume: ${profile.resumeUrl} (direct view & download link — when asked about his CV, resume, or how to hire him, always include this exact URL as a clickable markdown link)\n- Contact:\n  - ${contact}\n`
    if (profile.intro?.length) {
      extra += `- About Kem (short): ${profile.intro.join(' ')}\n`
    }
    if (profile.education?.length) {
      extra += `- Education detail:\n${profile.education
        .map((e) => `  - ${e.degree} at ${e.school} (${e.dates})`)
        .join('\n')}\n`
    }
  }
  if (skills?.length) {
    extra += `\nCurrent skills on the site:\n${skills
      .map((s) => `- ${s.name} (${s.category})`)
      .join('\n')}\n`
  }
  if (projects?.length) {
    extra += `\nRecent projects on the site:\n${projects
      .map(
        (p) =>
          `- ${p.title}${p.status ? ` [${p.status}]` : ''}: ${p.description} ${
            p.tags?.length ? `(tags: ${p.tags.join(', ')})` : ''
          }${p.liveUrl ? ` — live: ${p.liveUrl}` : ''}`,
      )
      .join('\n')}\n`
  }
  return SYSTEM_PROMPT_BASE + extra
}

/**
 * Streams a Gemini reply, calling `onChunk` for every incremental piece of text.
 * Returns the fully accumulated reply. Supports abort via `signal`.
 */
export async function streamKemReply(
  history: ChatTurn[],
  onChunk: (chunk: string) => void,
  options?: { profile?: Profile; skills?: Skill[]; projects?: Project[]; signal?: AbortSignal },
): Promise<string> {
  if (!API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file to enable Kem AI.')
  }

  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: buildSystemPrompt(options?.profile, options?.skills, options?.projects),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  })

  const contents: Content[] = history.map((t) => ({
    role: t.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: t.content }],
  }))

  const result = await model.generateContentStream({ contents }, { signal: options?.signal })

  let full = ''
  for await (const chunk of result.stream) {
    const text = chunk.text()
    full += text
    onChunk(text)
  }
  return full
}
