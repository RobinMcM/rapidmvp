const EMAIL = 'mailto:robin@rapidmvp.io'

export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="text-white font-semibold">RapidMVP.io © 2026</p>
          <p className="text-slate-500 text-sm">Rapid by Name, Rapid by Nature</p>
        </div>
        <nav className="flex items-center gap-6" aria-label="Footer links">
          <a
            href="#"
            className="text-slate-400 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] rounded"
          >
            LinkedIn
          </a>
          <a
            href={EMAIL}
            className="text-slate-400 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] rounded"
          >
            Email
          </a>
        </nav>
      </div>
    </footer>
  )
}
