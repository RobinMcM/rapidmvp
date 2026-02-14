import { Link } from 'react-router-dom'

const EMAIL = 'mailto:robin@rapidmvp.io'
const LINKEDIN_URL = 'https://www.linkedin.com/in/robinmcmanus/'

export default function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <Link to="/" className="text-white font-semibold hover:opacity-90">
            RapidMvᵖ.io © 2026
          </Link>
          <p className="text-slate-500 text-sm">Rapid by Name, Rapid by Nature</p>
        </div>
        <nav className="flex items-center gap-6" aria-label="Footer links">
          <Link
            to="/projects"
            className="text-slate-400 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] rounded"
          >
            Projects
          </Link>
          <Link
            to="/process"
            className="text-slate-400 hover:text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] rounded"
          >
            Process
          </Link>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
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
