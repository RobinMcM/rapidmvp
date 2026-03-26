import { Suspense } from 'react'
import AuthScreen from '../../components/auth/AuthScreen'

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto flex min-h-[75vh] max-w-4xl items-center justify-center px-6 py-16">
          <p className="text-slate-300">Preparing authentication UI...</p>
        </section>
      }
    >
      <AuthScreen />
    </Suspense>
  )
}
