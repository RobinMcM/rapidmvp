import Hero                from '../components/Hero'
import TechnologyPillars   from '../components/TechnologyPillars'
import AIArchitectPreview  from '../components/AIArchitectPreview'
import ArchitectureFirst   from '../components/ArchitectureFirst'
import WhatYouReceive      from '../components/WhatYouReceive'
import HowItWorks          from '../components/HowItWorks'
import WhyRapidMVP         from '../components/WhyRapidMVP'
import RegistrationSection from '../components/RegistrationSection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <TechnologyPillars />
      <AIArchitectPreview />
      <ArchitectureFirst />
      <WhatYouReceive />
      <HowItWorks />
      <WhyRapidMVP />
      <RegistrationSection />
    </>
  )
}
