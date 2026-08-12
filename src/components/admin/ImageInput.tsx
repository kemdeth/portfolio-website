import { useRef, useState, type DragEvent } from 'react'
import { ImagePlus, Link2, Trash2, UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'

const ASPECTS = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[4/3]',
} as const

const MAX_SIZE = 2 * 1024 * 1024 // 2MB to stay safely within localStorage limits

export function ImageInput({
  label = 'Image',
  value,
  onChange,
  aspect = 'square',
  hint,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  aspect?: keyof typeof ASPECTS
  hint?: string
}) {
  const [mode, setMode] = useState<'upload' | 'url'>(value.startsWith('data:') ? 'upload' : 'url')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, WEBP, GIF).')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Image is too large. Please use an image under 2 MB.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.onerror = () => setError('Failed to read the file. Please try again.')
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}

      {/* Mode toggle */}
      <div className="mb-3 inline-flex rounded-xl border border-gray-200 bg-gray-100 p-0.5 dark:border-white/10 dark:bg-white/5">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            mode === 'upload'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
          )}
        >
          <UploadCloud className="h-3.5 w-3.5" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            mode === 'url'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
          )}
        >
          <Link2 className="h-3.5 w-3.5" /> Paste URL
        </button>
      </div>

      {error && (
        <p className="mb-2 rounded-lg border border-red-400/40 bg-red-50 px-3 py-1.5 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Preview */}
      {value ? (
        <div
          className={cn(
            'group relative overflow-hidden rounded-xl border border-gray-200 dark:border-white/15',
            ASPECTS[aspect],
          )}
        >
          <img
            src={value}
            alt="Image preview"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Remove image"
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur transition hover:bg-red-500"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
      ) : (
        <div
          onClick={() => mode === 'upload' && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          role={mode === 'upload' ? 'button' : undefined}
          className={cn(
            'grid cursor-pointer place-items-center rounded-xl border-2 border-dashed transition',
            dragOver
              ? 'border-neon bg-neon/5'
              : 'border-gray-300 hover:border-neon/60 dark:border-white/15 dark:hover:border-neon/50',
            ASPECTS[aspect],
          )}
        >
          <div className="px-4 text-center">
            <ImagePlus className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
            {mode === 'upload' ? (
              <>
                <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                  Drop an image or <span className="text-neon-deep dark:text-neon">browse</span>
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                  PNG, JPG, WEBP · max 2 MB
                </p>
              </>
            ) : (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Paste an image URL below
              </p>
            )}
          </div>
        </div>
      )}

      {/* URL input */}
      {mode === 'url' && (
        <div className="mt-3 flex items-center gap-2">
          <Link2 className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="url"
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            className="input-base flex-1"
            placeholder="https://example.com/image.png"
          />
        </div>
      )}

      {/* Hidden file input */}
      {mode === 'upload' && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      )}

      {hint && <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  )
}
