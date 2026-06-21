import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact — RapidMVP',
  description:
    'Upload a repository or contact the RapidMVP team. Two pathways for organisations ready to install delivered software into the cloud.',
}

const CONTACT_EMAIL = 'hello@rapidmvp.io'

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <div className="bg-rm-black pt-20 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-animated opacity-60" aria-hidden />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] glow-azure opacity-25 blur-3xl" aria-hidden />
        <div className="relative max-w-7xl mx-auto text-center">
          <p className="label-mono text-azure mb-4">Get in Touch</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Two ways to work with RapidMVP
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Choose the path that suits your organisation — whether you want to start designing
            your platform immediately or speak to us first.
          </p>
        </div>
        <div className="divider-azure mt-16" aria-hidden />
      </div>

      {/* Two pathways */}
      <div className="bg-rm-dark py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Pathway 1: Upload a repository */}
          <div className="rounded-xl border border-azure/30 bg-azure/5 p-8 flex flex-col gap-5 card-glow-azure">
            <div className="w-12 h-12 rounded-xl bg-azure/15 text-azure flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div>
              <h2 className="text-white font-bold text-xl mb-2">Upload your repository</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Register for platform access and upload your repository ZIP immediately. RapidMVP
                inspects it and turns it into a cloud installation plan with a stakeholder handover
                report.
              </p>
            </div>

            <ul className="space-y-2">
              {[
                'Immediate access after registration',
                'Automatic stack & secrets detection',
                'Azure cloud installation blueprint',
                'No sales process required',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-azure flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/#register"
              className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm bg-azure text-white hover:bg-azure-600 hover:-translate-y-0.5 transition-all shadow-md shadow-azure/25"
            >
              Upload your repository
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Pathway 2: Direct contact */}
          <div className="rounded-xl border border-slate-700/60 bg-rm-dark-2/60 p-8 flex flex-col gap-5">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div>
              <h2 className="text-white font-bold text-xl mb-2">Contact RapidMVP</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Prefer to speak with our team before starting? Enterprise clients with specific
                requirements, compliance constraints or multi-team engagements are welcome to
                reach out directly.
              </p>
            </div>

            <ul className="space-y-2">
              {[
                'Enterprise engagement discussions',
                'Multi-team or multi-project programmes',
                'Compliance and data sovereignty queries',
                'Partnership and integration enquiries',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                  <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-lg font-semibold text-sm border border-slate-600 text-slate-200 hover:border-slate-400 hover:text-white hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

        </div>

        {/* FAQ strip */}
        <div className="max-w-5xl mx-auto mt-16">
          <h2 className="text-xl font-bold text-white mb-8 text-center">Frequently asked questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: 'How long does an inspection take?',
                a: 'Inspection is automatic and typically completes in seconds after the repository ZIP finishes uploading. The cloud installation blueprint and readiness score are generated immediately.',
              },
              {
                q: 'Do we need technical staff to use it?',
                a: 'No. Stakeholders get a plain-language handover report explaining what was delivered and whether it is ready. Infrastructure engineers get the detailed install guide.',
              },
              {
                q: 'What happens after the blueprint is generated?',
                a: 'Infrastructure engineers follow the cloud installation guide to install the software into Azure. AWS and Google Cloud support are on the roadmap.',
              },
              {
                q: 'Is our repository kept confidential?',
                a: 'Repository ZIPs and inspection results are stored securely and scoped to your account. We do not share your code, configuration or reports with third parties.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-slate-800 bg-rm-dark-2/40 p-6">
                <h3 className="text-white font-semibold text-sm mb-2">{q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
