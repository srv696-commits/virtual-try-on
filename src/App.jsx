import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Search, Heart, ShoppingBag, User, Upload, Download,
  Sparkles, X, AlertCircle, ImageIcon, Star, Zap,
  ChevronRight, ArrowRight, CheckCircle2, Lock
} from 'lucide-react'
import { supabase } from './supabase.js'
import AuthPage from './AuthPage.jsx'

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL
const PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK

const NAV_LINKS = ['MEN', 'WOMEN', 'KIDS', 'HOME', 'BEAUTY', 'IDEAS']

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ user, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1280px] mx-auto flex items-center gap-6 px-6 h-14">
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-8 h-8 bg-[#ff3f6c] rounded flex items-center justify-center">
            <span className="text-white font-black text-lg leading-none">S</span>
          </div>
          <span className="font-black text-[22px] tracking-tight text-[#ff3f6c] leading-none">tyra</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" className="text-[13px] font-semibold text-gray-700 hover:text-[#ff3f6c] tracking-wide transition-colors">
              {link}
            </a>
          ))}
          <a href="#" className="flex items-center gap-1.5 text-[13px] font-semibold text-[#ff3f6c]">
            STUDIO
            <span className="text-[9px] font-bold bg-[#ff3f6c] text-white px-1.5 py-0.5 rounded-sm">NEW</span>
          </a>
        </nav>

        <div className="flex-1 max-w-sm ml-2">
          <div className="flex items-center bg-gray-100 rounded px-3 py-2 gap-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search for brands, products..." className="bg-transparent text-[13px] text-gray-700 placeholder-gray-400 outline-none w-full" />
          </div>
        </div>

        <div className="flex items-center gap-5 ml-auto">
          <button className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#ff3f6c] transition-colors">
            <Heart size={19} />
            <span className="text-[10px] font-medium">Wishlist</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#ff3f6c] transition-colors">
            <ShoppingBag size={19} />
            <span className="text-[10px] font-medium">Bag</span>
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-gray-700 hidden md:block">
                {user.user_metadata?.name ?? user.email}
              </span>
              <button
                onClick={onLogout}
                className="text-[12px] font-bold text-[#ff3f6c] border border-[#ff3f6c] px-3 py-1.5 rounded-lg hover:bg-[#ff3f6c] hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#ff3f6c] transition-colors">
              <User size={19} />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────
function UploadZone({ step, label, sublabel, description, file, onFile, onClear }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.type === 'image/jpeg' || f.type === 'image/png')) {
      onFile({ file: f, preview: URL.createObjectURL(f) })
    }
  }, [onFile])

  const handleChange = (e) => {
    const f = e.target.files[0]
    if (f) onFile({ file: f, preview: URL.createObjectURL(f) })
    e.target.value = ''
  }

  const hasFile = !!file

  return (
    <div className="flex flex-col h-full">
      {/* Step header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black transition-colors ${hasFile ? 'bg-[#ff3f6c] text-white' : 'bg-gray-100 text-gray-500'}`}>
          {hasFile ? <CheckCircle2 size={15} /> : step}
        </div>
        <div>
          <h3 className="text-[14px] font-black text-gray-900">{label}</h3>
          <p className="text-[11px] text-gray-400">{sublabel}</p>
        </div>
      </div>

      {/* Drop area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          flex-1 relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2
          ${hasFile
            ? 'border-[#ff3f6c]/40 shadow-[0_0_0_4px_rgba(255,63,108,0.08)]'
            : dragging
              ? 'border-[#ff3f6c] bg-pink-50 shadow-[0_0_0_4px_rgba(255,63,108,0.08)]'
              : 'border-dashed border-gray-300 hover:border-[#ff3f6c] hover:bg-pink-50/40'
          }
        `}
        style={{ minHeight: 280 }}
      >
        {hasFile ? (
          <>
            <img src={file.preview} alt={label} className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <button
                onClick={(e) => { e.stopPropagation(); onClear() }}
                className="self-end w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-red-100 transition-colors"
              >
                <X size={13} className="text-gray-700" />
              </button>
            </div>
            {/* Uploaded badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#ff3f6c] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
              <CheckCircle2 size={10} />
              Uploaded
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center" style={{ minHeight: 280 }}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-[#ff3f6c]/15' : 'bg-gray-100'}`}>
              <Upload size={24} className={dragging ? 'text-[#ff3f6c]' : 'text-gray-400'} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-700">{description}</p>
              <p className="text-[12px] text-gray-400 mt-1">Drag & drop or click to browse</p>
              <p className="text-[11px] text-gray-300 mt-1">JPEG · PNG accepted</p>
            </div>
            <span className="text-[12px] font-bold text-[#ff3f6c] border border-[#ff3f6c] px-5 py-2 rounded-lg hover:bg-[#ff3f6c] hover:text-white transition-colors">
              Choose Photo
            </span>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleChange} />
    </div>
  )
}

// ─── Result Panel ─────────────────────────────────────────────────────────────
function ResultPanel({ resultImage, isLoading }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black transition-colors ${resultImage ? 'bg-[#ff3f6c] text-white' : 'bg-gray-100 text-gray-500'}`}>
          {resultImage ? <CheckCircle2 size={15} /> : '3'}
        </div>
        <div>
          <h3 className="text-[14px] font-black text-gray-900">Your Result</h3>
          <p className="text-[11px] text-gray-400">AI-generated try-on</p>
        </div>
        {resultImage && (
          <a
            href={resultImage}
            download="styra-tryon.png"
            className="ml-auto flex items-center gap-1.5 bg-[#ff3f6c] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#e8365f] transition-colors shadow-[0_2px_8px_rgba(255,63,108,0.3)]"
          >
            <Download size={13} />
            Download
          </a>
        )}
      </div>

      <div
        className={`flex-1 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
          resultImage ? 'border-[#ff3f6c]/40' : 'border-dashed border-gray-200'
        }`}
        style={{ minHeight: 280 }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 p-6 bg-gray-50" style={{ minHeight: 280 }}>
            <div className="w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center">
              <Sparkles size={24} className="text-[#ff3f6c] animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-[14px] font-bold text-gray-700">Processing with AI...</p>
              <p className="text-[12px] text-gray-400">This may take a few seconds</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#ff3f6c] animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            {/* Skeleton */}
            <div className="w-full max-w-[180px] space-y-2 animate-pulse">
              <div className="h-2 bg-gray-200 rounded-full" />
              <div className="h-2 bg-gray-200 rounded-full w-3/4 mx-auto" />
            </div>
          </div>
        ) : resultImage ? (
          <img src={resultImage} alt="Try-on result" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6 bg-gray-50/60" style={{ minHeight: 280 }}>
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ImageIcon size={24} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-gray-400">Result will appear here</p>
              <p className="text-[11px] text-gray-300 mt-1">Complete steps 1 & 2, then generate</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Paywall Screen ───────────────────────────────────────────────────────────
function PaywallScreen({ user, onLogout, paymentError, onClearError }) {
  const handleSubscribe = () => {
    window.location.href = `${PAYMENT_LINK}?client_reference_id=${user.id}`
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar user={user} onLogout={onLogout} />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={28} className="text-[#ff3f6c]" />
          </div>
          <h2 className="text-[24px] font-black text-gray-900 tracking-tight">Unlock Styra Studio</h2>
          <p className="text-[14px] text-gray-500 mt-2">Get unlimited access to AI virtual try-on</p>
          <p className="text-[32px] font-black text-[#ff3f6c] mt-5">
            $9.99<span className="text-[16px] font-semibold text-gray-400"> / month</span>
          </p>
          <p className="text-[12px] text-gray-400 mb-6">Cancel anytime</p>

          <ul className="text-left space-y-2.5 mb-8">
            {['Unlimited AI try-ons', 'Download your results', 'New features every month'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-[13px] text-gray-600">
                <CheckCircle2 size={14} className="text-[#ff3f6c] shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {paymentError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 text-left">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-[12px] text-red-600 flex-1">{paymentError}</p>
              <button onClick={onClearError}><X size={13} className="text-red-400" /></button>
            </div>
          )}

          <button
            onClick={handleSubscribe}
            className="w-full py-3.5 bg-[#ff3f6c] text-white font-black text-[15px] rounded-xl hover:bg-[#e8365f] transition-colors shadow-[0_4px_16px_rgba(255,63,108,0.35)]"
          >
            Subscribe for $9.99 / month
          </button>
          <button onClick={onLogout} className="mt-4 block w-full text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const sessionHandledRef = useRef(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fetch profile whenever user changes
  useEffect(() => {
    if (!user) return
    setProfileLoading(true)
    supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
      .then(({ data }) => {
        setProfile(data ?? { subscription_status: 'free' })
        setProfileLoading(false)
      })
  }, [user?.id])

  // Handle ?session_id=cs_... redirect back from Stripe checkout
  useEffect(() => {
    if (!user || profileLoading || sessionHandledRef.current) return
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (!sessionId || !sessionId.startsWith('cs_')) return

    sessionHandledRef.current = true
    window.history.replaceState({}, '', window.location.pathname)
    setVerifyingPayment(true)

    supabase.functions.invoke('verify-payment', { body: { session_id: sessionId } })
      .then(async ({ data, error }) => {
        if (error || data?.error) {
          setPaymentError(error?.message || data?.error || 'Payment verification failed. Please contact support.')
        } else {
          const { data: profileData } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single()
          setProfile(profileData ?? { subscription_status: 'free' })
        }
      })
      .finally(() => setVerifyingPayment(false))
  }, [user, profileLoading])

  const [file1, setFile1] = useState(null)
  const [file2, setFile2] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const canGenerate = !!file1 && !!file2 && !isLoading

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleGenerate = async () => {
    if (!canGenerate) return
    if (!WEBHOOK_URL) {
      setError('Webhook URL is not configured. Add VITE_WEBHOOK_URL to your Vercel environment variables.')
      return
    }
    setIsLoading(true)
    setError(null)
    setResultImage(null)

    try {
      const fd = new FormData()
      fd.append('image1', file1.file)
      fd.append('image2', file2.file)

      const res = await fetch(WEBHOOK_URL, { method: 'POST', body: fd })
      if (!res.ok) throw new Error(`Server returned ${res.status} — please try again.`)

      const blob = await res.blob()
      if (blob.size === 0) throw new Error('No image was returned. Please try again.')

      setResultImage(URL.createObjectURL(blob))
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const bothUploaded = !!file1 && !!file2

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#ff3f6c] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage onAuthSuccess={(u) => setUser(u)} />
  }

  if (verifyingPayment) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[#ff3f6c] border-t-transparent animate-spin" />
          <p className="text-[14px] font-semibold text-gray-600">Verifying your payment…</p>
        </div>
      </div>
    )
  }

  if (profile?.subscription_status !== 'active') {
    return (
      <PaywallScreen
        user={user}
        onLogout={handleLogout}
        paymentError={paymentError}
        onClearError={() => setPaymentError(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Breadcrumb */}
      <div className="max-w-[1280px] mx-auto px-6 pt-4 flex items-center gap-1 text-[12px] text-gray-400">
        <span className="hover:text-[#ff3f6c] cursor-pointer">Home</span>
        <ChevronRight size={12} />
        <span className="hover:text-[#ff3f6c] cursor-pointer">Studio</span>
        <ChevronRight size={12} />
        <span className="text-gray-700 font-semibold">Virtual Try-On</span>
      </div>

      {/* Hero heading */}
      <div className="max-w-[1280px] mx-auto px-6 pt-5 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">
            Virtual Try-On Studio
          </h1>
          <p className="text-[14px] text-gray-500 mt-1.5 flex items-center gap-2">
            <Sparkles size={14} className="text-[#ff3f6c]" />
            Upload a person photo + clothing item — AI does the rest
          </p>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[12px] text-gray-400">
          {['Realistic output', 'Instant results', 'Free to use'].map((f) => (
            <span key={f} className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#ff3f6c]" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Main 3-column grid */}
      <div className="max-w-[1280px] mx-auto px-6 pb-12">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
            <AlertCircle size={15} className="text-red-500 shrink-0" />
            <p className="text-[13px] text-red-600">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-stretch">
          {/* Upload 1 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col">
            <UploadZone
              step="1"
              label="Person Photo"
              sublabel="The base image"
              description="Upload the person you want to try clothes on"
              file={file1}
              onFile={setFile1}
              onClear={() => { setFile1(null); setResultImage(null) }}
            />
          </div>

          {/* Arrow divider */}
          <div className="hidden md:flex items-center justify-center px-1">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <ArrowRight size={15} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Upload 2 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col">
            <UploadZone
              step="2"
              label="Clothing / Item"
              sublabel="The outfit or accessory"
              description="Upload the clothing or item to try on"
              file={file2}
              onFile={setFile2}
              onClear={() => { setFile2(null); setResultImage(null) }}
            />
          </div>

          {/* Generate divider */}
          <div className="hidden md:flex items-center justify-center px-1">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                  ${canGenerate
                    ? 'bg-[#ff3f6c] shadow-[0_4px_16px_rgba(255,63,108,0.45)] hover:bg-[#e8365f] hover:scale-110'
                    : 'bg-gray-100'
                  }
                `}
                title="Generate Try-On"
              >
                {isLoading
                  ? <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                  : <Zap size={16} className={canGenerate ? 'text-white' : 'text-gray-300'} />
                }
              </button>
              {canGenerate && !isLoading && (
                <span className="text-[9px] font-bold text-[#ff3f6c] uppercase tracking-wide text-center leading-tight">
                  Tap to<br/>generate
                </span>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col">
            <ResultPanel resultImage={resultImage} isLoading={isLoading} />
          </div>
        </div>

        {/* Mobile generate button */}
        <div className="md:hidden mt-4">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`
              w-full py-4 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all duration-200
              ${canGenerate
                ? 'bg-[#ff3f6c] text-white shadow-[0_4px_16px_rgba(255,63,108,0.4)] hover:bg-[#e8365f]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading
              ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg> Generating...</>
              : <><Zap size={15} /> Generate Try-On</>
            }
          </button>
        </div>

        {/* Progress hint */}
        {!bothUploaded && !resultImage && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-gray-400">
            <div className={`flex items-center gap-1.5 ${file1 ? 'text-[#ff3f6c]' : ''}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${file1 ? 'border-[#ff3f6c] bg-[#ff3f6c] text-white' : 'border-gray-300'}`}>1</div>
              Person photo
            </div>
            <div className="w-8 h-px bg-gray-200" />
            <div className={`flex items-center gap-1.5 ${file2 ? 'text-[#ff3f6c]' : ''}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${file2 ? 'border-[#ff3f6c] bg-[#ff3f6c] text-white' : 'border-gray-300'}`}>2</div>
              Clothing item
            </div>
            <div className="w-8 h-px bg-gray-200" />
            <div className={`flex items-center gap-1.5 ${resultImage ? 'text-[#ff3f6c]' : ''}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${resultImage ? 'border-[#ff3f6c] bg-[#ff3f6c] text-white' : 'border-gray-300'}`}>3</div>
              See your result
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
