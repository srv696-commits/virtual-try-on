import { useState, useRef, useCallback } from 'react'
import {
  Search, Heart, ShoppingBag, User, ChevronDown, Upload,
  Download, Sparkles, X, AlertCircle, ImageIcon, Star,
  SlidersHorizontal, ChevronRight, Zap
} from 'lucide-react'

const WEBHOOK_URL =
  'https://WEBHOOK_URL_REMOVED_SEE_ENV'

// ─── Nav ────────────────────────────────────────────────────────────────────
const NAV_LINKS = ['MEN', 'WOMEN', 'KIDS', 'HOME', 'BEAUTY', 'IDEAS']

function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1280px] mx-auto flex items-center gap-6 px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-8 h-8 bg-[#ff3f6c] rounded flex items-center justify-center">
            <span className="text-white font-black text-lg leading-none">S</span>
          </div>
          <span className="font-black text-[22px] tracking-tight text-[#ff3f6c] leading-none">tyra</span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-[13px] font-semibold text-gray-700 hover:text-[#ff3f6c] tracking-wide transition-colors"
            >
              {link}
            </a>
          ))}
          <a href="#" className="flex items-center gap-1 text-[13px] font-semibold text-[#ff3f6c] tracking-wide">
            STUDIO
            <span className="text-[9px] font-bold bg-[#ff3f6c] text-white px-1.5 py-0.5 rounded-sm leading-none">
              NEW
            </span>
          </a>
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-sm ml-2">
          <div className="flex items-center bg-gray-100 rounded px-3 py-2 gap-2">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search for brands, products and more..."
              className="bg-transparent text-[13px] text-gray-700 placeholder-gray-400 outline-none w-full"
            />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5 ml-auto">
          {[
            { icon: <User size={20} />, label: 'Profile' },
            { icon: <Heart size={20} />, label: 'Wishlist' },
            { icon: <ShoppingBag size={20} />, label: 'Bag' },
          ].map(({ icon, label }) => (
            <button key={label} className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#ff3f6c] transition-colors">
              {icon}
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────
function UploadZone({ label, badge, hint, file, onFile, onClear }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) {
      onFile({ file: f, preview: URL.createObjectURL(f) })
    }
  }, [onFile])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">{label}</span>
          <span className="text-[10px] font-semibold bg-[#ff3f6c]/10 text-[#ff3f6c] px-1.5 py-0.5 rounded-sm">{badge}</span>
        </div>
        {file && (
          <button
            onClick={onClear}
            className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <X size={11} /> Remove
          </button>
        )}
      </div>

      <div
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          relative rounded overflow-hidden transition-all duration-200 cursor-pointer
          ${file
            ? 'h-52 border border-gray-200'
            : `h-52 border-2 border-dashed ${dragging ? 'border-[#ff3f6c] bg-pink-50' : 'border-gray-300 hover:border-[#ff3f6c] hover:bg-pink-50/30'}`
          }
          bg-gray-50
        `}
      >
        {file ? (
          <img src={file.preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${dragging ? 'bg-[#ff3f6c]/20' : 'bg-gray-200'}`}>
              <Upload size={18} className={dragging ? 'text-[#ff3f6c]' : 'text-gray-400'} />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-gray-600">
                {dragging ? 'Drop here' : 'Drag & drop'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>
            </div>
            <span className="text-[11px] font-semibold text-[#ff3f6c] border border-[#ff3f6c]/40 px-3 py-1 rounded-sm hover:bg-[#ff3f6c] hover:text-white transition-colors">
              Browse Files
            </span>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const f = e.target.files[0]
        if (f) onFile({ file: f, preview: URL.createObjectURL(f) })
      }} />
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ file1, setFile1, file2, setFile2, onGenerate, canGenerate, isLoading }) {
  return (
    <aside className="w-[240px] shrink-0 border-r border-gray-200 bg-white">
      <div className="sticky top-14 max-h-[calc(100vh-56px)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-500" />
            <span className="text-[13px] font-bold text-gray-800 tracking-wide uppercase">
              Try-On Studio
            </span>
          </div>
          <Sparkles size={14} className="text-[#ff3f6c]" />
        </div>

        <div className="px-4 py-4 space-y-6">
          {/* Upload Section */}
          <UploadZone
            label="Person"
            badge="Base"
            hint="Upload the person photo"
            file={file1}
            onFile={setFile1}
            onClear={() => setFile1(null)}
          />

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">+</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <UploadZone
            label="Clothing"
            badge="Style"
            hint="Upload the outfit or item"
            file={file2}
            onFile={setFile2}
            onClear={() => setFile2(null)}
          />

          {/* Generate Button */}
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className={`
              w-full py-3 rounded text-[13px] font-bold uppercase tracking-wider transition-all duration-200
              ${canGenerate
                ? 'bg-[#ff3f6c] text-white hover:bg-[#e8365f] shadow-[0_4px_15px_rgba(255,63,108,0.35)]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap size={14} />
                Generate Try-On
              </span>
            )}
          </button>

          {!file1 || !file2 ? (
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Upload both images to enable AI try-on generation
            </p>
          ) : null}

          {/* Tips */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Tips</p>
            {[
              'Use front-facing person photos',
              'Flat-lay clothing images work best',
              'Higher resolution = better results',
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-1.5">
                <span className="text-[#ff3f6c] mt-0.5 text-[10px]">•</span>
                <p className="text-[11px] text-gray-400 leading-snug">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Product-style result card ─────────────────────────────────────────────
function ResultArea({ resultImage, isLoading, error }) {
  return (
    <div className="flex-1 min-w-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-1 py-3 text-[12px] text-gray-500">
        <span className="hover:text-[#ff3f6c] cursor-pointer">Home</span>
        <ChevronRight size={12} />
        <span className="hover:text-[#ff3f6c] cursor-pointer">Studio</span>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-medium">AI Try-On</span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded px-4 py-3 mb-4 mx-1">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : resultImage ? (
        <ResultCard resultImage={resultImage} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mx-1">
      <div className="mb-4">
        <h1 className="text-[22px] font-black text-gray-900 tracking-tight">AI Try-On Studio</h1>
        <p className="text-[13px] text-gray-500 mt-1">Upload your photos and generate a realistic try-on in seconds</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {PLACEHOLDER_CARDS.map((card) => (
          <div key={card.id} className="bg-gray-50 rounded border border-gray-200 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
              <ImageIcon size={28} className="text-gray-300" />
              <div className="absolute inset-0 bg-[#ff3f6c]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-2.5">
              <p className="text-[11px] font-bold text-gray-700">{card.brand}</p>
              <p className="text-[11px] text-gray-400 truncate">{card.desc}</p>
              <p className="text-[13px] font-black text-gray-900 mt-1">Rs. {card.price}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] bg-green-600 text-white px-1 py-0.5 rounded-sm font-semibold">{card.rating} ★</span>
                <span className="text-[10px] text-gray-400">{card.reviews}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center py-20 gap-4 bg-gray-50/50">
        <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <Sparkles size={24} className="text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-bold text-gray-500">Your try-on result will appear here</p>
          <p className="text-[12px] text-gray-400 mt-1">Upload photos on the left panel and click Generate</p>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="mx-1">
      <div className="mb-4 animate-pulse">
        <div className="h-7 w-56 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-80 bg-gray-100 rounded" />
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="aspect-[3/4] max-h-[600px] bg-gray-100 animate-pulse flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2 w-48">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-center gap-2 text-[#ff3f6c]">
            <div className="w-2 h-2 rounded-full bg-[#ff3f6c] animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-[#ff3f6c] animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-[#ff3f6c] animate-bounce" />
            <span className="text-[13px] font-semibold ml-1">Processing with AI...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultCard({ resultImage }) {
  return (
    <div className="mx-1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-black text-gray-900 tracking-tight">Try-On Result</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">AI-generated virtual try-on</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:border-[#ff3f6c] hover:text-[#ff3f6c] px-3 py-2 rounded text-[12px] font-semibold transition-colors">
            <Heart size={14} />
            Wishlist
          </button>
          <a
            href={resultImage}
            download="styra-tryon.png"
            className="flex items-center gap-1.5 bg-[#ff3f6c] text-white hover:bg-[#e8365f] px-4 py-2 rounded text-[12px] font-bold transition-colors shadow-[0_2px_8px_rgba(255,63,108,0.3)]"
          >
            <Download size={14} />
            Download
          </a>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Result image */}
        <div className="flex-1 max-w-sm">
          <div className="border border-gray-200 rounded overflow-hidden">
            <img src={resultImage} alt="Try-on result" className="w-full object-cover" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-[12px] text-gray-500 ml-1">AI Generated Result</span>
          </div>
        </div>

        {/* Info panel */}
        <div className="flex-1 space-y-4 py-1">
          <div>
            <p className="text-[11px] font-bold text-green-600 uppercase tracking-wide">● In Stock</p>
            <h2 className="text-[20px] font-black text-gray-900 mt-1">Virtual Try-On</h2>
            <p className="text-[14px] text-gray-500">Styra AI Studio · Personalized</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-green-600 text-white px-1.5 py-0.5 rounded-sm font-bold">4.8 ★</span>
            <span className="text-[12px] text-gray-400">Generated successfully</span>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-[13px] font-semibold text-gray-700">Share your look</p>
            <div className="flex gap-2">
              {['Instagram', 'WhatsApp', 'Pinterest'].map((s) => (
                <button key={s} className="text-[11px] font-semibold border border-gray-200 text-gray-500 hover:border-[#ff3f6c] hover:text-[#ff3f6c] px-3 py-1.5 rounded transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[12px] text-gray-400 leading-relaxed">
              This image was generated by Styra AI. Results may vary based on image quality.
              For best results, use high-resolution front-facing photos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder product cards for empty state
const PLACEHOLDER_CARDS = [
  { id: 1, brand: 'ROADSTER', desc: 'Pure Cotton T-shirt', price: '449', rating: '4.2', reviews: '12.3k' },
  { id: 2, brand: 'H&M', desc: 'Regular Fit Crew T-shirt', price: '699', rating: '4.5', reviews: '8.1k' },
  { id: 3, brand: 'SNITCH', desc: 'Oversized Drop Shoulder', price: '557', rating: '4.3', reviews: '5.6k' },
  { id: 4, brand: 'BREAKBOUNCE', desc: 'Typography Printed Tee', price: '399', rating: '4.1', reviews: '3.2k' },
]

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  const [file1, setFile1] = useState(null)
  const [file2, setFile2] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const canGenerate = !!file1 && !!file2 && !isLoading

  const handleGenerate = async () => {
    if (!canGenerate) return
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
      if (blob.size === 0) throw new Error('No image returned from the API.')

      setResultImage(URL.createObjectURL(blob))
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="max-w-[1280px] mx-auto flex">
        <Sidebar
          file1={file1}
          setFile1={setFile1}
          file2={file2}
          setFile2={setFile2}
          onGenerate={handleGenerate}
          canGenerate={canGenerate}
          isLoading={isLoading}
        />
        <main className="flex-1 min-w-0 px-5 py-2 bg-white">
          <ResultArea resultImage={resultImage} isLoading={isLoading} error={error} />
        </main>
      </div>
    </div>
  )
}
