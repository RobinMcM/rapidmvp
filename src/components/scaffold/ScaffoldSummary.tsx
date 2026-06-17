import type { ScaffoldOutput } from '../../types/scaffold'

type ScaffoldSummaryProps = {
  output: ScaffoldOutput
}

export default function ScaffoldSummary({ output }: ScaffoldSummaryProps) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-white">Review your scaffold</h2>
      <dl className="mt-6 grid gap-4 text-slate-200">
        <div>
          <dt className="text-sm uppercase tracking-wide text-slate-400">Scaffold type</dt>
          <dd className="mt-1 font-medium">{output.scaffoldType}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-slate-400">Pages</dt>
          <dd className="mt-1">{output.pageSet.join(', ')}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-slate-400">Auth</dt>
          <dd className="mt-1">
            {output.auth.enabled
              ? `Enabled (${output.auth.recipe})${output.auth.optional ? ' - optional by type' : ' - required by type'}`
              : 'Disabled'}
          </dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-slate-400">AI modes</dt>
          <dd className="mt-1">{output.aiModes.join(', ')}</dd>
        </div>
      </dl>
    </section>
  )
}
