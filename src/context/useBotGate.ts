import { useContext } from 'react'
import { BotGateContext, type BotGateContextValue } from '@/context/botGateContextValue'

export function useBotGate(): BotGateContextValue {
  const ctx = useContext(BotGateContext)
  if (!ctx) throw new Error('useBotGate must be used within a BotGateProvider')
  return ctx
}
