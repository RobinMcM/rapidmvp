import { notFound } from 'next/navigation'
import { BLUEPRINTS, getBlueprintBySlug } from '../../../data/blueprints'
import BlueprintDetail from '../../../components/blueprints/BlueprintDetail'

export function generateStaticParams() {
  return BLUEPRINTS.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blueprint = getBlueprintBySlug(slug)
  if (!blueprint) return {}
  return {
    title: `${blueprint.title} | RapidMVP`,
    description: blueprint.summary,
  }
}

export default async function BlueprintSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blueprint = getBlueprintBySlug(slug)
  if (!blueprint) notFound()
  return <BlueprintDetail blueprint={blueprint} />
}
