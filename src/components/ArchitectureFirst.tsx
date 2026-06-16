const outputs = [
  'Executive platform summary and recommendations',
  'Solution architecture diagrams and data flows',
  'Azure landing zone design and resource topology',
  'Cloudflare edge architecture and security boundaries',
  'Deployment topology across regions and environments',
  'Security controls, threat model and compliance mapping',
  'Infrastructure as Code structure and conventions',
  'AI integration points and opportunity identification',
]

export default function ArchitectureFirst() {
  return (
    <section className="bg-rm-dark py-24 px-6 overflow-hidden" aria-label="Architecture first">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── Left column ── */}
          <div>
            <p className="label-mono text-cf-orange mb-4">Architecture-First Approach</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
              Every successful platform starts{' '}
              <span className="text-gradient-azure">with architecture.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Implementation without architecture is guesswork. RapidMVP ensures every
              platform decision is deliberate, documented and aligned to your business goals
              before a single resource is provisioned.
            </p>

            <ul className="space-y-3">
              {outputs.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-4 h-4 flex-shrink-0 text-azure">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-slate-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right column: Architecture SVG diagram ── */}
          <div className="relative">
            <div className="absolute inset-0 glow-azure opacity-20 blur-3xl" aria-hidden />
            <div className="relative rounded-xl border border-slate-700/50 bg-rm-dark-2/80 overflow-hidden p-6">

              {/* Diagram label */}
              <div className="flex items-center justify-between mb-4">
                <span className="label-mono text-slate-600 text-[10px]">PLATFORM ARCHITECTURE OVERVIEW</span>
                <span className="label-mono text-azure text-[10px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-azure animate-pulse" />
                  LIVE PREVIEW
                </span>
              </div>

              <svg
                viewBox="0 0 640 480"
                className="w-full h-auto"
                aria-label="Architecture diagram showing Cloudflare edge, Azure application and Azure data layers"
              >
                {/* ── Cloudflare Edge Layer ── */}
                <rect x="12" y="12" width="616" height="120" rx="8"
                  fill="rgba(244,129,32,0.05)" stroke="rgba(244,129,32,0.25)" strokeWidth="1" />
                <text x="24" y="32" className="label-mono" fill="#f48120" fontSize="9" fontFamily="monospace" letterSpacing="1">
                  CLOUDFLARE EDGE LAYER
                </text>

                {/* CF boxes */}
                {[
                  { x: 36,  label: 'DNS & Routing',      sub: 'Global anycast' },
                  { x: 206, label: 'Workers & Edge',      sub: 'Compute at edge' },
                  { x: 376, label: 'Zero Trust',          sub: 'Access control' },
                  { x: 496, label: 'DDoS & WAF',          sub: 'Threat protection' },
                ].map(({ x, label, sub }) => (
                  <g key={label}>
                    <rect x={x} y="46" width="140" height="72" rx="6"
                      fill="rgba(244,129,32,0.08)" stroke="rgba(244,129,32,0.3)" strokeWidth="1" />
                    <text x={x + 10} y="66" fill="#f9a558" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                      {label}
                    </text>
                    <text x={x + 10} y="80" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
                      {sub}
                    </text>
                  </g>
                ))}

                {/* ── Arrows down ── */}
                {[106, 276, 446].map((cx) => (
                  <g key={cx}>
                    <line x1={cx} y1="118" x2={cx} y2="162"
                      stroke="rgba(0,120,212,0.35)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <polygon points={`${cx-4},158 ${cx+4},158 ${cx},164`}
                      fill="rgba(0,120,212,0.55)" />
                  </g>
                ))}

                {/* ── Azure Application Layer ── */}
                <rect x="12" y="168" width="616" height="136" rx="8"
                  fill="rgba(0,120,212,0.05)" stroke="rgba(0,120,212,0.25)" strokeWidth="1" />
                <text x="24" y="186" fill="#2196f3" fontSize="9" fontFamily="monospace" letterSpacing="1">
                  AZURE APPLICATION LAYER
                </text>

                {[
                  { x: 36,  label: 'Container Apps',     sub: 'Auto-scale compute',   detail: 'Multi-region' },
                  { x: 206, label: 'API Management',     sub: 'Gateway & policies',    detail: 'Rate limiting' },
                  { x: 376, label: 'Azure Functions',    sub: 'Serverless workloads',  detail: 'Event-driven' },
                  { x: 496, label: 'Service Bus',        sub: 'Async messaging',       detail: 'Durable queues' },
                ].map(({ x, label, sub, detail }) => (
                  <g key={label}>
                    <rect x={x} y="198" width="140" height="88" rx="6"
                      fill="rgba(0,120,212,0.08)" stroke="rgba(0,120,212,0.3)" strokeWidth="1" />
                    <text x={x + 10} y="218" fill="#50b4f8" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                      {label}
                    </text>
                    <text x={x + 10} y="232" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
                      {sub}
                    </text>
                    <text x={x + 10} y="246" fill="#64748b" fontSize="7" fontFamily="monospace">
                      {detail}
                    </text>
                  </g>
                ))}

                {/* ── Arrows down ── */}
                {[106, 276, 446].map((cx) => (
                  <g key={cx}>
                    <line x1={cx} y1="304" x2={cx} y2="348"
                      stroke="rgba(0,120,212,0.35)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <polygon points={`${cx-4},344 ${cx+4},344 ${cx},350`}
                      fill="rgba(0,120,212,0.55)" />
                  </g>
                ))}

                {/* ── Azure Data & AI Layer ── */}
                <rect x="12" y="352" width="616" height="116" rx="8"
                  fill="rgba(0,99,177,0.06)" stroke="rgba(0,99,177,0.25)" strokeWidth="1" />
                <text x="24" y="370" fill="#2196f3" fontSize="9" fontFamily="monospace" letterSpacing="1">
                  AZURE DATA &amp; AI LAYER
                </text>

                {[
                  { x: 36,  label: 'PostgreSQL',         sub: 'Flexible Server',    detail: 'Private endpoint' },
                  { x: 206, label: 'Azure OpenAI',       sub: 'GPT-4 / Embeddings', detail: 'EU data residency' },
                  { x: 376, label: 'Blob Storage',       sub: 'Object & CDN',       detail: 'Geo-redundant' },
                  { x: 496, label: 'Key Vault',          sub: 'Secrets & certs',    detail: 'HSM-backed' },
                ].map(({ x, label, sub, detail }) => (
                  <g key={label}>
                    <rect x={x} y="382" width="140" height="72" rx="6"
                      fill="rgba(0,99,177,0.10)" stroke="rgba(0,120,212,0.25)" strokeWidth="1" />
                    <text x={x + 10} y="402" fill="#50b4f8" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                      {label}
                    </text>
                    <text x={x + 10} y="416" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
                      {sub}
                    </text>
                    <text x={x + 10} y="430" fill="#64748b" fontSize="7" fontFamily="monospace">
                      {detail}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-cf-orange/60 block" />
                  <span className="label-mono text-slate-600 text-[10px]">Cloudflare Edge</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-azure/60 block" />
                  <span className="label-mono text-slate-600 text-[10px]">Azure Services</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-slate-600 block" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#64748b 0,#64748b 4px,transparent 4px,transparent 7px)' }} />
                  <span className="label-mono text-slate-600 text-[10px]">Data Flow</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
