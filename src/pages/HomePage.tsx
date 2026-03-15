import { AccessCard } from '@/components/sections/home/AccessCard'
import { Hero } from '@/components/sections/home/Hero'
import { StepsSection } from '@/components/sections/home/StepsSection'
import { HighlightsSection } from '@/components/sections/home/HighlightsSection'
import { FinalCta } from '@/components/sections/home/FinalCta'

export function HomePage() {
  return (
    <>
      <AccessCard />
      <Hero />
      <StepsSection />
      <HighlightsSection />
      <FinalCta />
    </>
  )
}
