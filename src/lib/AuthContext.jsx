import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth as firebaseAuth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { base44 } from '@/api/base44Client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [user, setUser] = useState(null)

  // allowed users from env, comma-separated
  const allowed = (import.meta.env.VITE_ALLOWED_USERS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

  useEffect(() => {
    // Check for redirect result first (for Google Login)
    const checkRedirect = async () => {
      try {
        await base44.auth.handleRedirectResult('/')
      } catch (e) {
        console.error('Redirect result error:', e)
      }
    }
    checkRedirect()

    const unsub = onAuthStateChanged(firebaseAuth, async (u) => {
      setIsLoadingAuth(false)
      if (!u) {
        setUser(null)
        setAuthError({ type: 'auth_required' })
        return
      }

      const email = (u.email || '').toLowerCase()
      if (allowed.length > 0 && !allowed.includes(email)) {
        // not allowed: sign out and set error
        try { await signOut(firebaseAuth) } catch (e) { console.warn('signOut failed', e) }
        setUser(null)
        setAuthError({ type: 'user_not_registered' })
        return
      }

      setUser(u)
      setAuthError(null)
    })
    return () => unsub()
  }, [])

  const navigateToLogin = (path = '/login') => {
    if (window.location.pathname !== path) {
      window.location.href = path
    }
  }

  const logout = async () => {
    await signOut(firebaseAuth)
    setUser(null)
    setAuthError({ type: 'auth_required' })
    navigateToLogin('/login')
  }

  return (
    <AuthContext.Provider value={{ isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthProvider
