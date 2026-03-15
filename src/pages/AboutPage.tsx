import { AboutIntro } from '@/components/sections/about/AboutIntro'
import { ManifestoSection } from '@/components/sections/about/ManifestoSection'
import { FlowSection } from '@/components/sections/about/FlowSection'
import { StorytellingSection } from '@/components/sections/about/StorytellingSection'
import { ModulesSection } from '@/components/sections/about/ModulesSection'
import { UseCasesSection } from '@/components/sections/about/UseCasesSection'
import { FutureSection } from '@/components/sections/about/FutureSection'

export function AboutPage() {
  return (
    <>
      <AboutIntro />
      <ManifestoSection />
      <FlowSection />
      <StorytellingSection />
      <ModulesSection />
      <UseCasesSection />
      <FutureSection />
    </>
  )
}
