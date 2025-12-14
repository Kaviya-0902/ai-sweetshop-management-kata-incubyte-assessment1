import { useState } from 'react'

export default function AuthPage() {
  const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8000'
  const [mode, setMode] = useState('login')
  const isLogin = mode === 'login'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setStatus(null)
    setBusy(true)
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = isLogin ? { username, password } : { username, password, role }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = data?.detail || data?.message || 'Something went wrong'
        setStatus({ kind: 'error', message })
        return
      }

      if (isLogin) {
        const token = data?.access_token
        const userRole = data?.role

        if (!token) {
          setStatus({ kind: 'error', message: 'Login succeeded but token was missing' })
          return
        }

        localStorage.setItem('token', token)
        if (userRole) localStorage.setItem('role', userRole)

        if (userRole === 'admin') {
          window.location.hash = '#admin'
        } else {
          window.location.hash = '#shop'
        }

        window.dispatchEvent(new Event('authchange'))

        setStatus({ kind: 'success', message: 'Login successful' })
        return
      }

      setStatus({ kind: 'success', message: data?.message || 'Account created successfully' })
      setPassword('')
      setMode('login')
    } catch (err) {
      const message =
        err?.name === 'AbortError'
          ? `Request timed out. Is the backend running on ${apiBase} ?`
          : 'Unable to reach the server'
      setStatus({ kind: 'error', message })
    } finally {
      setBusy(false)
    }
  }

  function onSwap(next) {
    setStatus(null)
    setMode(next)
  }

  return (
    <div className="authShell">
      <section className="authLeft">
        <div className="authBrand">
          <div className="authLogo">Sweet Shop</div>
          <div className="authTag">Fresh • Festive • Flavorful</div>
        </div>

      
      </section>

      <section className="authRight">
        <div className="authCard">
          <div className="authCardHeader">
            <div className="authTitle">{isLogin ? 'Welcome back' : 'Create your account'}</div>
            <div className="authSubTitle">
              {isLogin ? 'Login to explore today\'s delights.' : 'Sign up to start your sweet journey.'}
            </div>
          </div>

          <form className="authForm" onSubmit={submit}>
            <label className="authLabel">
              Username
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </label>

            <label className="authLabel">
              Password
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? 'Enter password' : 'Create a password'}
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </label>

            {!isLogin ? (
              <label className="authLabel">
                Role
                <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            ) : null}

            {status ? (
              <div className={status.kind === 'error' ? 'authAlert error' : 'authAlert success'}>{status.message}</div>
            ) : null}

            <button className="btn" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : isLogin ? 'Login' : 'Sign up'}
            </button>

            <div className="authSwap">
              {isLogin ? (
                <>
                  Don’t have an account?{' '}
                  <button className="authLink" type="button" onClick={() => onSwap('signup')}>
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button className="authLink" type="button" onClick={() => onSwap('login')}>
                    Login
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
