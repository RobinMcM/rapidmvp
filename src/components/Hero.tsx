import Button from './ui/Button'

export default function Hero() {
  return (
    <header className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]"
        aria-hidden
      />
      <div className="absolute inset-0 grid-pattern opacity-30" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto animate-float">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4">
          <span className="text-gradient">RapidMvᵖ.io</span>
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-white font-semibold mb-10">
          From Idea to Production in Weeks
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button href="#process" variant="primary">
            See How It Works
          </Button>
          <Button href="#contact" variant="secondary">
            Get in Touch
          </Button>
        </div>
      </div>
    </header>
  )
}
