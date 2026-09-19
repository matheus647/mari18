import { useState, useEffect, useRef, useCallback } from 'react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface PageData {
  title: string
  content: string
  type?: 'cover' | 'backCover' | 'normal'
}

interface Song {
  title: string
  artist: string
  videoId: string
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PHOTOS = [
  { url: 'WhatsApp Image 2026-08-22 at 10.43.33 (1).jpeg', alt: 'Retrato 1' },
  { url: 'WhatsApp Image 2026-08-22 at 10.43.33.jpeg', alt: 'Retrato 2' },
  { url: 'WhatsApp Image 2026-08-28 at 22.44.10 (1).jpeg', alt: 'Retrato 3' },
  { url: 'WhatsApp Image 2026-08-28 at 22.44.10 (2).jpeg', alt: 'Retrato 4' },
  { url: 'WhatsApp Image 2026-08-28 at 22.44.10 (3).jpeg', alt: 'Retrato 5' },
  { url: 'WhatsApp Image 2026-08-28 at 22.44.10 (4).jpeg', alt: 'Retrato 6' },
  { url: 'WhatsApp Image 2026-08-28 at 22.44.10.jpeg', alt: 'Retrato 7' },
  { url: 'WhatsApp Image 2026-09-13 at 13.00.24.jpeg', alt: 'Retrato 8' },
]

const SONGS: Song[] = [
  { title: 'Fica', artist: 'ANAVITORIA & Mateus e Kauan', videoId: '-QdZ2VtOkhc' },
  { title: 'Não quero dinheiro', artist: 'Tim Maia', videoId: 'FM2tZnIPZUk' },
  { title: 'Pupila', artist: 'ANAVITORIA', videoId: '9Sk7RQtSl5g' },
  { title: 'Os Anjos Cantam', artist: 'Jorge & Mateus', videoId: 'ICS6uKC93w0' },
  { title: 'Vem ser Minha', artist: 'Charlie Brown jr', videoId: 'Zs0tcD7LpuI' },
  { title: 'Pras Damas', artist: 'Oriente', videoId: 'boPw4_DguGI' },
]

const INITIAL_PAGES: PageData[] = [
  {
    title: 'Feliz Aniversário',
    content: 'Quero te desejar feliz aniversário, e falar hoje neste dia tão especial que, Para mim, hoje, você é a pessoa que mais tenho carinho, confiança, admiração, consideração, afeto, respeito, gratidão, apego, preocupação e vontade de estar perto. Você se tornou alguém extremamente importante para mim, alguém que ocupa um espaço enorme nos meus pensamentos e no meu coração. É uma pessoa que eu faço questão de ter por perto, que eu valorizo de verdade e cuja presença consegue tornar meus dias melhores.',
    type: 'cover',
  },
  {
    title: 'Você é muito ESPECIAL',
    content:
      'Gosto da forma como posso ser eu mesmo quando estou com você, sem precisar fingir ser alguém diferente. Posso conversar sobre qualquer coisa, desde os assuntos mais sérios até as coisas mais bobas do meu dia, e ainda assim sinto que existe uma liberdade enorme entre nós. Talvez seja justamente essa sensação de poder ser quem eu realmente sou que faça você ser tão especial para mim.',
  },
  {
    title: 'Você está entre as pessoas que mais importam',
    content:
      'Hoje, quando penso nas pessoas que realmente importam na minha vida, você é uma das primeiras pessoas que vêm à minha cabeça. Tenho um carinho enorme por tudo que vivemos, por cada conversa, cada risada, cada momento, cada conselho, cada palavra e até pelos pequenos detalhes que talvez você nem perceba, mas que significam muito para mim.',
  },
  {
    title: 'Agradeço por ter você na minha vida',
    content:
      'Você é alguém que eu quero continuar tendo na minha vida, alguém cuja presença eu não considero comum ou passageira. Eu valorizo você não apenas pelo que faz por mim, mas principalmente pela pessoa que você é. Pela maneira como me trata, pela forma como consegue me fazer bem e por todos os momentos que, de alguma maneira, se tornaram importantes para mim.',
  },
  {
    title: 'Palavras que nunca parecem suficientes',
    content:
      'E, sinceramente, talvez eu nem consiga colocar em palavras tudo aquilo que sinto e penso sobre você, porque existem sentimentos que são grandes demais para caber em uma simples frase. Às vezes, eu penso em tudo que você representa para mim e percebo que nenhuma quantidade de palavras seria suficiente para explicar completamente o quanto eu gosto de ter você por perto e o quanto sua presença se tornou importante na minha vida.',
  },
  { title: 'Mensagem',
    content: 'Só quero que você saiba que, para mim, hoje, você é uma das pessoas mais importantes que existem. Alguém que eu admiro, respeito, valorizo, considero e quero muito bem. Quero continuar compartilhando momentos, conversas, risadas, conquistas e até os dias difíceis com você. E, independentemente do que aconteça daqui para frente, espero que você nunca se esqueça de que sempre vai ter um lugar muito especial na minha vida.',
    type: 'backCover' },
]

// Build spread pairs: [{left, right}]
// Spread 0: left=null, right=page[0]
// Spread n: left=page[2n-1], right=page[2n]
// Last: left=page[last], right=null
function buildSpreads(pages: PageData[]) {
  const result: Array<{ left: PageData | null; right: PageData | null }> = []
  result.push({ left: null, right: pages[0] })
  for (let i = 1; i < pages.length - 1; i += 2) {
    result.push({ left: pages[i], right: pages[i + 1] ?? null })
  }
  if (pages.length > 1) result.push({ left: pages[pages.length - 1], right: null })
  return result
}

// Page index in pages array from spread + side
function spreadPageIdx(spreadIdx: number, side: 'left' | 'right', totalSpreads: number, totalPages: number): number {
  if (spreadIdx === 0) return side === 'right' ? 0 : -1
  if (spreadIdx === totalSpreads - 1) return side === 'left' ? totalPages - 1 : -1
  const base = 1 + (spreadIdx - 1) * 2
  return side === 'left' ? base : base + 1
}

// ─── FLOATING HEARTS ──────────────────────────────────────────────────────────

const HEART_ITEMS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${4 + Math.random() * 92}%`,
  fontSize: `${0.9 + Math.random() * 1.5}rem`,
  dur: `${6 + Math.random() * 9}s`,
  delay: `${Math.random() * 12}s`,
  rot: `${-30 + Math.random() * 60}deg`,
  symbol: ['❤', '♥', '💗', '💖'][Math.floor(Math.random() * 4)],
}))

function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {HEART_ITEMS.map(h => (
        <span
          key={h.id}
          className="heart-float"
          style={
            {
              left: h.left,
              bottom: '-60px',
              fontSize: h.fontSize,
              '--dur': h.dur,
              '--delay': h.delay,
              '--rot': h.rot,
            } as React.CSSProperties
          }
        >
          {h.symbol}
        </span>
      ))}
    </div>
  )
}

// ─── SECTION HEADING ──────────────────────────────────────────────────────────

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-16">
      <p className="font-lora text-[11px] tracking-[0.55em] text-gold/50 uppercase mb-4">{eyebrow}</p>
      <h2 className="font-playfair text-5xl md:text-6xl font-bold italic text-gold mb-4">{title}</h2>
      {subtitle && <p className="font-lora text-muted italic">{subtitle}</p>}
    </div>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const bgRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (bgRef.current) bgRef.current.style.transform = `translateY(${y * 0.46}px)`
      if (contentRef.current) contentRef.current.style.transform = `translateY(${y * 0.18}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative h-screen overflow-hidden flex items-center justify-center">
      {/* Parallax background */}
      <div ref={bgRef} className="absolute will-change-transform" style={{ inset: 0, top: '-20%', height: '140%' }}>
        <img
          src="https://images.unsplash.com/photo-1487035242901-d419a42d17af?w=1920&h=1400&fit=crop&auto=format"
          alt="Rosas vermelhas românticas"
          className="w-full h-full object-cover"
          style={{ opacity: 0.32 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, #070208cc 0%, #0d050a22 50%, #070208 100%)' }}
        />
      </div>

      {/* Particle layer */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              background: i % 3 === 0 ? '#d4a847' : '#b91c3f',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.15 + Math.random() * 0.25,
              animation: `floatUp ${6 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative text-center px-6 will-change-transform" style={{ zIndex: 2 }}>
        <p className="font-lora text-[11px] tracking-[0.6em] uppercase mb-8" style={{ color: 'rgba(212,168,71,0.55)' }}>
          Uma mensagem especial
        </p>

        <h1
          className="shimmer-gold font-playfair font-bold italic leading-none"
          style={{ fontSize: 'clamp(4.5rem, 13vw, 10rem)', textShadow: '0 0 80px rgba(212,168,71,0.25)' }}
        >
          Feliz
        </h1>
        <h1
          className="font-playfair font-semibold italic leading-none mb-8"
          style={{
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            color: '#f5e6d3',
            textShadow: '0 0 50px rgba(245,230,211,0.15)',
          }}
        >
          Aniversário
        </h1>

        <div className="flex items-center justify-center gap-5 mb-8">
          <div className="h-px w-20 bg-linear-to-r from-transparent to-gold/40" />
          <div className="h-px w-20 bg-linear-to-l from-transparent to-gold/40" />
        </div>

        <p className="font-lora text-lg italic mb-12 tracking-wide" style={{ color: 'rgba(212,168,71,0.65)' }}>
          com todo o meu carinho
        </p>

        <button
          onClick={() => document.getElementById('music')?.scrollIntoView({ behavior: 'smooth' })}
          className="font-lora text-xs tracking-[0.4em] uppercase transition-all duration-500"
          style={{
            padding: '14px 40px',
            border: '1px solid rgba(212,168,71,0.35)',
            color: '#d4a847',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,168,71,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Descobrir
        </button>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" style={{ zIndex: 2, opacity: 0.45 }}>
        <span className="font-lora text-[9px] text-cream tracking-[0.5em] uppercase">role para baixo</span>
        <div className="w-px h-10 bg-linear-to-b from-gold to-transparent animate-pulse" />
      </div>
    </section>
  )
}

// ─── MUSIC ────────────────────────────────────────────────────────────────────

function MusicSection() {
  const [current, setCurrent] = useState(0)
  const [embedError, setEmbedError] = useState(false)
  const song = SONGS[current]

  useEffect(() => {
    setEmbedError(false)
  }, [current])

  const getEmbedUrl = (videoId: string) =>
    `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&controls=1&iv_load_policy=3`

  return (
    <section id="music" className="relative py-28 px-6">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, #070208 0%, #12060f 50%, #070208 100%)' }}
      />

      <div className="relative max-w-4xl mx-auto" style={{ zIndex: 2 }}>
        <SectionHeading
          eyebrow="Trilha Sonora"
          title="Playlist"
          subtitle="musicas que dedico a você"
        />

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Player */}
          <div
            className="md:col-span-3 rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgba(212,168,71,0.22)',
              boxShadow: '0 25px 70px rgba(0,0,0,0.65)',
              background: 'rgba(28,10,18,0.9)',
            }}
          >
            <div className="px-5 py-4 flex items-center gap-4" style={{ background: '#1c0a12' }}>
              <div className="flex-1 min-w-0">
                <div className="font-playfair text-cream font-semibold truncate">{song.title}</div>
                <div className="font-lora text-muted text-sm italic truncate">{song.artist}</div>
              </div>
              <div className="flex items-end gap-0.5 shrink-0" style={{ height: 20 }}>
                {[10, 16, 12, 18, 8].map((h, i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full bg-gold animate-bounce"
                    style={{ height: h, animationDelay: `${i * 0.1}s`, animationDuration: '0.8s' }}
                  />
                ))}
              </div>
            </div>

            <div className="aspect-video bg-[#100509]">
              {embedError ? (
                <div className="flex h-full w-full items-center justify-center px-6 text-center">
                  <div>
                    <p className="font-playfair text-xl italic text-cream mb-2">Não foi possível carregar essa música.</p>
                    <button
                      onClick={() => setEmbedError(false)}
                      className="font-lora text-xs tracking-[0.2em] uppercase rounded-full border px-4 py-2 transition-all duration-300"
                      style={{ borderColor: 'rgba(212,168,71,0.35)', color: '#d4a847' }}
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              ) : (
                <iframe
                  key={song.videoId}
                  src={getEmbedUrl(song.videoId)}
                  title={`${song.title} – ${song.artist}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  onError={() => setEmbedError(true)}
                />
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            {SONGS.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="flex items-center gap-3 text-left rounded-xl border transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  padding: '12px 14px',
                  borderColor: i === current ? 'rgba(212,168,71,0.4)' : '#3d1828',
                  background: i === current ? 'rgba(212,168,71,0.08)' : 'rgba(28,10,18,0.5)',
                  color: i === current ? '#d4a847' : '#f5e6d3',
                  boxShadow: i === current ? '0 12px 22px rgba(212,168,71,0.08)' : 'none',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-playfair text-sm font-semibold truncate">{s.title}</div>
                  <div className="font-lora text-[11px] italic truncate" style={{ color: '#9b7080' }}>
                    {s.artist}
                  </div>
                </div>
                {i === current && (
                  <div className="flex items-end gap-0.5 shrink-0">
                    {[8, 14, 10].map((h, j) => (
                      <div
                        key={j}
                        className="w-0.5 rounded-full bg-gold animate-bounce"
                        style={{ height: h, animationDelay: `${j * 0.12}s`, animationDuration: '0.7s' }}
                      />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CARROSSEL ─────────────────────────────────────────────────────────────────

function CarouselSection() {
  const angleRef = useRef(0)
  const [angle, setAngle] = useState(0)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const autoOn = useRef(true)
  const rafId = useRef<number | null>(null)
  const lastT = useRef(0)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const N = PHOTOS.length
  const radius = 300

  useEffect(() => {
    const tick = (t: number) => {
      if (autoOn.current && !dragging.current) {
        if (lastT.current) {
          angleRef.current += (t - lastT.current) * 0.017
          setAngle(angleRef.current)
        }
        lastT.current = t
      } else {
        lastT.current = 0
      }
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current) }
  }, [])

  const pauseAuto = () => {
    autoOn.current = false
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => { autoOn.current = true }, 3000)
  }

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = true
    setIsDragging(true)
    lastX.current = 'touches' in e ? e.touches[0].clientX : e.clientX
    pauseAuto()
  }

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current) return
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    angleRef.current += (x - lastX.current) * 0.38
    setAngle(angleRef.current)
    lastX.current = x
  }

  const onUp = () => { dragging.current = false; setIsDragging(false) }

  const step = 360 / N

  const advance = (dir: 1 | -1) => {
    pauseAuto()
    angleRef.current += dir * step
    setAngle(angleRef.current)
  }

  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, #070208, #0c040a, #070208)' }}
      />
      <div className="absolute inset-0" style={{ opacity: 0.06 }}>
        <img
          src="https://images.unsplash.com/photo-1596905904987-3dc12d4f0f33?w=1920&h=1080&fit=crop&auto=format"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden
        />
      </div>

      <div className="relative max-w-6xl mx-auto" style={{ zIndex: 2 }}>
        <SectionHeading
          eyebrow="Memórias"
          title="Galeria"
          subtitle="Galeria de lindas fotos"
        />

        {/* 3D Carousel */}
        <div
          className="relative mx-auto select-none"
          style={{ height: 380, perspective: '1200px', cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        >
          <div
            className="relative w-full h-full"
            style={{ transformStyle: 'preserve-3d', transform: `rotateY(${angle}deg)` }}
          >
            {PHOTOS.map((p, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: 175,
                  height: 250,
                  left: '50%',
                  top: '50%',
                  marginLeft: -87,
                  marginTop: -125,
                  transform: `rotateY(${step * i}deg) translateZ(${radius}px)`,
                }}
              >
                <div
                  className="w-full h-full rounded-xl overflow-hidden relative group"
                  style={{
                    border: '1px solid rgba(109,21,48,0.6)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                  }}
                >
                  <img
                    src={`/${encodeURIComponent(p.url)}`}
                    alt={p.alt}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div
                    className="absolute inset-0 flex items-end p-3 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to top, rgba(13,4,8,0.85) 0%, transparent 60%)',
                      opacity: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                  >
                    <span className="font-lora text-cream text-xs italic">{p.alt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-10">
          {([['← Anterior', -1], ['Próximo →', 1]] as const).map(([label, dir]) => (
            <button
              key={label}
              onClick={() => advance(dir as 1 | -1)}
              className="font-lora text-sm rounded-full transition-all duration-300"
              style={{
                padding: '10px 24px',
                border: '1px solid #3d1828',
                color: 'rgba(155,112,128,0.8)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(212,168,71,0.4)'
                e.currentTarget.style.color = '#d4a847'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#3d1828'
                e.currentTarget.style.color = 'rgba(155,112,128,0.8)'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── BOOK ─────────────────────────────────────────────────────────────────────

function EditableField({
  value,
  onChange,
  multiline,
  className,
  style,
}: {
  value: string
  onChange?: (v: string) => void
  multiline?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const [editing, setEditing] = useState(false)

  if (!onChange) {
    return (
      <div className={className} style={style}>
        {value}
      </div>
    )
  }

  if (editing) {
    const shared = {
      value,
      className: `bg-transparent outline-none resize-none w-full ${className ?? ''}`,
      style: {
        ...style,
        borderBottom: '1px solid rgba(212,168,71,0.4)',
        overflowY: 'auto',
        overflowWrap: 'anywhere' as const,
        wordBreak: 'break-word' as const,
      } as React.CSSProperties,
      autoFocus: true,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
      onBlur: () => setEditing(false),
    }
    return multiline ? <textarea rows={5} {...shared} /> : <input {...shared} />
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={`cursor-text transition-opacity duration-200 hover:opacity-70 ${className ?? ''}`}
      style={style}
      title="Clique para editar"
    >
      {value}
    </div>
  )
}

type PageWithHandler = PageData & {
  _onChange?: (field: 'title' | 'content', value: string) => void
}

function BookPageView({ page }: { page: PageWithHandler }) {
  if (page.type === 'cover') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ padding: '2rem' }}>
        <div className="absolute top-4 left-4 text-6xl select-none" style={{ color: 'rgba(212,168,71,0.12)' }}>✦</div>
        <div className="absolute bottom-4 right-4 text-4xl select-none" style={{ color: 'rgba(212,168,71,0.12)' }}>✦</div>
        <EditableField
          value={page.title}
          onChange={page._onChange ? v => page._onChange!('title', v) : undefined}
          className="font-playfair font-bold italic block w-full"
          style={{ fontSize: '1.35rem', color: '#d4a847', marginBottom: '0.5rem', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
        />
        <div style={{ width: 48, height: 1, background: 'rgba(212,168,71,0.3)', margin: '0.75rem auto' }} />
        <EditableField
          value={page.content}
          onChange={page._onChange ? v => page._onChange!('content', v) : undefined}
          multiline
          className="font-lora italic block w-full"
          style={{
            fontSize: '0.72rem',
            lineHeight: 1.7,
            color: 'rgba(245,230,211,0.65)',
            maxHeight: '100%',
            overflowY: 'auto',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        />
      </div>
    )
  }

  if (page.type === 'backCover') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center overflow-hidden" style={{ padding: '2rem' }}>
        <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
          <EditableField
            value={page.title}
            onChange={page._onChange ? v => page._onChange!('title', v) : undefined}
            className="block"
            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
          />
        </div>
        <EditableField
          value={page.content}
          onChange={page._onChange ? v => page._onChange!('content', v) : undefined}
          className="font-lora italic block"
          style={{
            fontSize: '0.75rem',
            color: '#9b7080',
            maxHeight: '100%',
            overflowY: 'auto',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden" style={{ padding: '1.4rem' }}>
      <div className="absolute top-3 right-3 select-none" style={{ color: 'rgba(212,168,71,0.14)', fontSize: '1.1rem' }}>✦</div>
      <EditableField
        value={page.title}
        onChange={page._onChange ? v => page._onChange!('title', v) : undefined}
        className="font-playfair font-bold italic block w-full"
        style={{ fontSize: '1.1rem', color: '#d4a847', marginBottom: '0.6rem', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
      />
      <div style={{ width: 36, height: 1, background: 'rgba(212,168,71,0.25)', marginBottom: '0.9rem' }} />
      <EditableField
        value={page.content}
        onChange={page._onChange ? v => page._onChange!('content', v) : undefined}
        multiline
        className="font-lora block flex-1 w-full"
        style={{
          fontSize: '0.72rem',
          lineHeight: 1.85,
          color: 'rgba(245,230,211,0.82)',
          overflowY: 'auto',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      />
    </div>
  )
}

const PAGE_BG_LEFT = 'linear-gradient(135deg, #3e0d18 0%, #2d0510 100%)'
const PAGE_BG_RIGHT = 'linear-gradient(225deg, #3e0d18 0%, #2d0510 100%)'

function BookSection() {
  const [pages, setPages] = useState<PageData[]>(INITIAL_PAGES)
  const [spread, setSpread] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const [leafFlipped, setLeafFlipped] = useState(false)
  const [leafFront, setLeafFront] = useState<PageData | null>(null)
  const [leafBack, setLeafBack] = useState<PageData | null>(null)

  const spreads = buildSpreads(pages)
  const totalSpreads = spreads.length

  const updatePage = useCallback((idx: number, field: 'title' | 'content', value: string) => {
    setPages(ps => ps.map((p, i) => (i === idx ? { ...p, [field]: value } : p)))
  }, [])

  const withHandler = (page: PageData | null, idx: number): PageWithHandler | null => {
    if (!page || idx < 0) return page
    return { ...page, _onChange: (f, v) => updatePage(idx, f, v) }
  }

  const leftIdx = spreadPageIdx(spread, 'left', totalSpreads, pages.length)
  const rightIdx = spreadPageIdx(spread, 'right', totalSpreads, pages.length)

  const turnNext = () => {
    if (spread >= totalSpreads - 1 || flipping) return
    const front = spreads[spread].right
    const back = spreads[spread + 1].left
    setLeafFront(front)
    setLeafBack(back)
    setLeafFlipped(false)
    setFlipping(true)
    setSpread(s => s + 1)
    requestAnimationFrame(() => requestAnimationFrame(() => setLeafFlipped(true)))
    setTimeout(() => setFlipping(false), 900)
  }

  const turnPrev = () => {
    if (spread <= 0 || flipping) return
    const front = spreads[spread - 1].right
    const back = spreads[spread].left
    setLeafFront(front)
    setLeafBack(back)
    setLeafFlipped(true)
    setFlipping(true)
    setSpread(s => s - 1)
    requestAnimationFrame(() => requestAnimationFrame(() => setLeafFlipped(false)))
    setTimeout(() => setFlipping(false), 900)
  }

  const pageLabel =
    spread === 0
      ? 'Capa'
      : spread === totalSpreads - 1
      ? 'Contracapa'
      : `Páginas ${spread * 2} – ${spread * 2 + 1}`

  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, #070208, #100508, #070208)' }}
      />

      <div className="relative max-w-4xl mx-auto" style={{ zIndex: 2 }}>
        <SectionHeading
          eyebrow="Sua Mensagem"
          title="Feliz Aniversário"
        />

        <div className="flex flex-col items-center">
          {/* Book */}
          <div
            style={{
              width: 'min(680px, 94vw)',
              height: 'min(440px, 62vw)',
              perspective: '2000px',
              position: 'relative',
            }}
          >
            {/* Static spread */}
            <div
              className="absolute inset-0 flex rounded-2xl"
              style={{
                boxShadow: '0 35px 90px rgba(0,0,0,0.85), 0 0 0 1px rgba(109,21,48,0.5)',
                overflow: 'hidden',
              }}
            >
              {/* Left page */}
              <div className="h-full shrink-0" style={{ width: 'calc(50% - 3px)', background: PAGE_BG_LEFT }}>
                {spreads[spread].left && leftIdx >= 0 ? (
                  <BookPageView page={withHandler(spreads[spread].left, leftIdx)!} />
                ) : (
                  <EmptyBookSide />
                )}
              </div>

              {/* Spine */}
              <div
                className="shrink-0"
                style={{
                  width: 6,
                  background: 'linear-gradient(to right, #5a1225, #9a2040, #5a1225)',
                  boxShadow: '0 0 18px rgba(0,0,0,0.6)',
                }}
              />

              {/* Right page */}
              <div className="flex-1 h-full" style={{ background: PAGE_BG_RIGHT }}>
                {spreads[spread].right && rightIdx >= 0 ? (
                  <BookPageView page={withHandler(spreads[spread].right, rightIdx)!} />
                ) : (
                  <EmptyBookSide />
                )}
              </div>
            </div>

            {/* Flipping leaf */}
            {flipping && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 'calc(50% + 3px)',
                  width: 'calc(50% - 3px)',
                  height: '100%',
                  transformOrigin: 'left center',
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${leafFlipped ? -180 : 0}deg) translateX(${leafFlipped ? -6 : 0}px) scale(${leafFlipped ? 1.01 : 1})`,
                  transition: 'transform 0.96s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.96s ease',
                  zIndex: 10,
                  filter: 'drop-shadow(-12px 0 18px rgba(0,0,0,0.45))',
                }}
              >
                {/* Front face */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, rgba(88,18,31,0.98), rgba(30,5,13,0.98) 60%, rgba(57,12,21,0.98))',
                    clipPath: 'inset(0 round 0 12px 12px 0)',
                    boxShadow: '-18px 0 34px rgba(0,0,0,0.32)',
                    borderLeft: '1px solid rgba(212,168,71,0.24)',
                  }}
                >
                  {leafFront && <BookPageView page={leafFront} />}
                </div>
                {/* Back face */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(225deg, rgba(82,18,31,0.98), rgba(35,7,17,0.98) 60%, rgba(57,12,22,0.98))',
                    clipPath: 'inset(0 round 0 12px 12px 0)',
                    boxShadow: '18px 0 34px rgba(0,0,0,0.32)',
                    borderRight: '1px solid rgba(212,168,71,0.18)',
                  }}
                >
                  {leafBack && <BookPageView page={leafBack} />}
                </div>
              </div>
            )}
          </div>

          {/* Page dots */}
          <div className="flex items-center gap-2 mt-6">
            {Array.from({ length: totalSpreads }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (!flipping && i !== spread) {
                    // Jump to a spread (simplified: just set state)
                    setSpread(i)
                  }
                }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === spread ? 18 : 7,
                  height: 7,
                  background: i === spread ? '#d4a847' : '#3d1828',
                  border: 'none',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-5 mt-5">
            <button
              onClick={turnPrev}
              disabled={spread <= 0 || flipping}
              className="font-lora text-sm rounded-full transition-all duration-300"
              style={{
                padding: '10px 24px',
                border: '1px solid #3d1828',
                color: 'rgba(155,112,128,0.8)',
                opacity: spread <= 0 || flipping ? 0.3 : 1,
                cursor: spread <= 0 || flipping ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.borderColor = 'rgba(212,168,71,0.4)'
                  e.currentTarget.style.color = '#d4a847'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#3d1828'
                e.currentTarget.style.color = 'rgba(155,112,128,0.8)'
              }}
            >
              ← Anterior
            </button>

            <span className="font-lora text-xs italic" style={{ color: '#9b7080' }}>
              {pageLabel}
            </span>

            <button
              onClick={turnNext}
              disabled={spread >= totalSpreads - 1 || flipping}
              className="font-lora text-sm rounded-full transition-all duration-300"
              style={{
                padding: '10px 24px',
                border: '1px solid #3d1828',
                color: 'rgba(155,112,128,0.8)',
                opacity: spread >= totalSpreads - 1 || flipping ? 0.3 : 1,
                cursor: spread >= totalSpreads - 1 || flipping ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(212,168,71,0.4)'
                e.currentTarget.style.color = '#d4a847'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#3d1828'
                e.currentTarget.style.color = 'rgba(155,112,128,0.8)'
              }}
            >
              Próxima →
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}

function EmptyBookSide() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ opacity: 0.18 }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: '1px solid #d4a847',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d4a847',
          fontSize: '1.4rem',
        }}
      >
        ✦
      </div>
    </div>
  )
}


function Footer() {
  return (
    <footer className="relative py-24 text-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, #0d0408, #070208)' }}
      />
      <div className="relative" style={{ zIndex: 2 }}>
        <p className="font-playfair text-3xl md:text-4xl italic" style={{ color: '#d4a847', marginBottom: '0.75rem' }}>
          Mensagem especial para você
        </p>
        <div className="flex items-center justify-center gap-4 my-5">
          <div className="h-px w-12" style={{ background: 'rgba(212,168,71,0.2)' }} />
          <span style={{ color: 'rgba(212,168,71,0.4)', fontSize: '0.6rem', letterSpacing: '0.5em' }}>✦</span>
          <div className="h-px w-12" style={{ background: 'rgba(212,168,71,0.2)' }} />
        </div>
        <p className="font-lora text-sm italic" style={{ color: '#9b7080' }}>
          Cada página, cada nota, cada memória — tudo por você. Feliz aniversário.
        </p>
      </div>
    </footer>
  )
}


export default function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070208', color: '#f5e6d3' }}>
      <FloatingHearts />
      <HeroSection />
      <MusicSection />
      <CarouselSection />
      <BookSection />
      <Footer />
    </div>
  )
}
