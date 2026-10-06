import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { DemoTab } from '../data/ask'
import type { RoleId } from '../data/types'

interface DemoState {
  role: RoleId
  setRole: (r: RoleId) => void
  tab: DemoTab
  setTab: (t: DemoTab) => void
  /** Changes whenever the demo is reset or the role changes — panels key on it to reset local state. */
  sessionKey: string
  resetNonce: number
  resetAll: () => void
  /** Open Ask Sudha with a pre-filled question. */
  askSeed: { q: string; n: number } | null
  askAbout: (q: string) => void
  announce: string
  setAnnounce: (s: string) => void
}

const Ctx = createContext<DemoState | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<RoleId>('tm')
  const [tab, setTab] = useState<DemoTab>('coverage')
  const [resetNonce, setResetNonce] = useState(0)
  const [askSeed, setAskSeed] = useState<{ q: string; n: number } | null>(null)
  const [announce, setAnnounce] = useState('')

  const setRole = useCallback((r: RoleId) => {
    setRoleState(r)
    setAskSeed(null)
  }, [])
  const resetAll = useCallback(() => {
    setRoleState('tm')
    setTab('coverage')
    setAskSeed(null)
    setResetNonce((n) => n + 1)
    setAnnounce('Demo reset. All simulated changes cleared.')
  }, [])
  const askAbout = useCallback((q: string) => {
    setAskSeed((s) => ({ q, n: (s?.n ?? 0) + 1 }))
    setTab('ask')
  }, [])

  const value = useMemo(
    () => ({ role, setRole, tab, setTab, sessionKey: `${role}-${resetNonce}`, resetNonce, resetAll, askSeed, askAbout, announce, setAnnounce }),
    [role, setRole, tab, resetNonce, resetAll, askSeed, askAbout, announce],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDemo(): DemoState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useDemo must be used inside DemoProvider')
  return v
}
