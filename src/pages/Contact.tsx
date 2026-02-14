import { useEffect } from 'react'
import Button from '../components/ui/Button'
import Section from '../components/ui/Section'

const EMAIL = 'robin@rapidmvp.io'
const LINKEDIN_URL = 'https://www.linkedin.com/in/robinmcmanus/'

const pricingCards = [
  {
    title: 'Consultation',
    price: '£430',
    items: ['2-hour deep-dive', 'Architecture design', 'Technical roadmap', 'Cost estimate'],
    cta: 'Book Now',
    to: `mailto:${EMAIL}?subject=Consultation%20Booking`,
  },
  {
    title: 'Rapid MVP',
    price: '£9,500 – £16,000',
    items: ['2-3 week delivery', 'Full-stack platform', 'Production deployment', 'Clean, documented code'],
    cta: 'Get Started',
    to: '/contact',
    highlight: true,
  },
  {
    title: 'Enterprise',
    price: '£32,000+',
    items: ['Complex systems', 'Security focus', 'Ongoing support', 'Team training'],
    cta: 'Contact Us',
    to: `mailto:${EMAIL}?subject=Enterprise%20Enquiry`,
  },
]

export default function Contact() {
  useEffect(() => {
    document.title = 'Contact – RapidMVP.io'
  }, [])

  return (
    <div className="min-h-screen">
      <Section heading="Let's Build Something Fast" subheading="From idea to production in 2-3 weeks" animate>
        <div className="max-w-2xl mx-auto text-center text-slate-400">
          <p>Reach out for a free consultation or a fixed-price quote.</p>
        </div>
      </Section>

      {/* Two-column: Contact + Consultation */}
      <Section animate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Left: Contact */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Get in Touch</h3>
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-3 text-2xl font-semibold text-[#3b82f6] hover:text-[#60a5fa] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b82f6] rounded-lg p-3"
            >
              <span className="text-3xl" aria-hidden>✉</span>
              {EMAIL}
            </a>
            <p className="text-slate-500 text-sm">Typical response: 24 hours</p>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-6 py-3 rounded-lg border border-slate-600 text-slate-300 hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>

          {/* Right: Consultation info */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-4">Free 30-Minute Consultation</h3>
            <p className="text-slate-400 mb-4">What we'll discuss:</p>
            <ul className="text-slate-300 space-y-2 mb-4">
              <li>• Your project goals</li>
              <li>• Timeline requirements</li>
              <li>• Technical approach</li>
              <li>• Pricing estimate</li>
            </ul>
            <p className="text-slate-500 text-sm">No obligation. No hard sell.</p>
          </div>
        </div>
      </Section>

      {/* Pricing cards */}
      <Section heading="Pricing" animate>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-xl border p-6 flex flex-col ${
                card.highlight
                  ? 'border-[#3b82f6] bg-slate-900/80 shadow-lg shadow-[#3b82f6]/10'
                  : 'border-slate-700/50 bg-slate-900/60'
              }`}
            >
              <h4 className="text-lg font-bold text-white mb-2">{card.title}</h4>
              <p className="text-2xl font-bold text-[#3b82f6] mb-4">{card.price}</p>
              <ul className="text-slate-400 text-sm space-y-2 mb-6 flex-1">
                {card.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              {card.to.startsWith('mailto:') ? (
                <a
                  href={card.to}
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-3 rounded-lg bg-[#3b82f6] text-white font-semibold hover:bg-[#2563eb] transition-colors"
                >
                  {card.cta}
                </a>
              ) : (
                <Button to={card.to} variant="primary">
                  {card.cta}
                </Button>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Location / Availability */}
      <Section animate>
        <div className="max-w-2xl mx-auto text-center p-6 rounded-xl bg-slate-900/60 border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-3">Location & Availability</h3>
          <p className="text-slate-300 mb-2">Based in Birmingham, UK</p>
          <p className="text-slate-300 mb-2">Available for remote projects worldwide</p>
          <p className="text-[#3b82f6] font-medium">Special pricing for Hub71 startups (Abu Dhabi)</p>
        </div>
      </Section>
    </div>
  )
}
