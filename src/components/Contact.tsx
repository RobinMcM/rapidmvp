import Section from './ui/Section'

const EMAIL = 'robin@rapidmvp.io'

export default function Contact() {
  return (
    <Section
      id="contact"
      heading="Ready to Build Fast?"
      subheading="Let's discuss your project."
      animate
    >
      <div className="text-center max-w-xl mx-auto">
        <a
          href={`mailto:${EMAIL}`}
          className="text-2xl sm:text-3xl font-semibold text-[#3b82f6] hover:text-[#60a5fa] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0a0a0f] rounded px-2 py-1 inline-block"
        >
          {EMAIL}
        </a>
        <div className="mt-6 flex justify-center gap-4">
          <a
            href="#"
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0a0a0f]"
            aria-label="LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
        <p className="mt-6 text-slate-500 text-sm">Typical response time: 24 hours</p>
      </div>
    </Section>
  )
}
