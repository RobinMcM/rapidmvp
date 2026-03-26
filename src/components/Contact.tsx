import Section from './ui/Section'

export default function Contact() {
  return (
    <Section
      id="contact"
      heading="Ready to Build Fast?"
      subheading="Let's discuss your project."
      animate
    >
      <div className="max-w-xl mx-auto rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 sm:p-8">
        <form className="space-y-4" action="#" method="post">
          <div>
            <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-slate-200">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-slate-200">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              placeholder="Tell us what you are building..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Submit (Demo)
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          Demo form only. Submission wiring will be added in a future update.
        </p>
      </div>
    </Section>
  )
}
