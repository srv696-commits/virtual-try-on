import { useState } from 'react'
import { AlertCircle, X, Mail } from 'lucide-react'
import { supabase } from './supabase.js'

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const clearError = () => setError(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    if (data.user) onAuthSuccess(data.user)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    // session is null when email confirmation is required
    if (data.session) {
      onAuthSuccess(data.user)
    } else {
      setConfirmationSent(true)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError(null)
    setConfirmationSent(false)
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  const inputClass = 'w-full bg-gray-100 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#ff3f6c]/30 focus:bg-white transition-all'
  const labelClass = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1'

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-1 mb-7">
          <div className="w-8 h-8 bg-[#ff3f6c] rounded flex items-center justify-center">
            <span className="text-white font-black text-lg leading-none">S</span>
          </div>
          <span className="font-black text-[22px] tracking-tight text-[#ff3f6c] leading-none">tyra</span>
        </div>

        {confirmationSent ? (
          /* Confirmation pending screen */
          <div className="text-center">
            <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail size={26} className="text-[#ff3f6c]" />
            </div>
            <h2 className="text-[16px] font-black text-gray-900 mb-2">Check your inbox</h2>
            <p className="text-[13px] text-gray-500 mb-1">We sent a confirmation link to</p>
            <p className="text-[13px] font-semibold text-gray-800 mb-5">{email}</p>
            <p className="text-[12px] text-gray-400 mb-5">
              Click the link in the email to activate your account, then log in below.
            </p>
            <button
              onClick={() => switchMode('login')}
              className="w-full bg-[#ff3f6c] text-white font-bold text-[13px] py-3 rounded-xl hover:bg-[#e8365f] transition-colors shadow-[0_2px_8px_rgba(255,63,108,0.3)]"
            >
              Go to Log In
            </button>
          </div>
        ) : (
          <>
            {/* Mode tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 pb-2.5 text-[13px] font-bold capitalize transition-colors ${
                    mode === m
                      ? 'text-[#ff3f6c] border-b-2 border-[#ff3f6c] -mb-px'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {m === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-[12px] text-red-600 flex-1">{error}</p>
                <button onClick={clearError} className="text-red-400 hover:text-red-600">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {mode === 'signup' && (
                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={inputClass}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff3f6c] text-white font-bold text-[13px] py-3 rounded-xl hover:bg-[#e8365f] transition-colors shadow-[0_2px_8px_rgba(255,63,108,0.3)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {mode === 'login' ? 'Log In' : 'Create Account'}
              </button>
            </form>

            {/* Footer toggle */}
            <p className="text-center text-[12px] text-gray-400 mt-5">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[#ff3f6c] font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
