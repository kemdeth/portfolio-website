import { createContext } from 'react'

export interface BotGateContextValue {
  verified: boolean
  canEdit: boolean
  /** The current verification token used to authorize write actions. */
  token: string | null
  verify: (token: string) => void
  reset: () => void
}

export const BotGateContext = createContext<BotGateContextValue | null>(null)
