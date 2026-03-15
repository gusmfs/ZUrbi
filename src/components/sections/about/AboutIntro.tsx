import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { aboutData } from '@/data/about'

export function AboutIntro() {
  const { intro } = aboutData
  return (
    <Section className="pt-8 sm:pt-12 bg-cold-gray-lightest/30" aria-labelledby="about-intro-title">
      <Container>
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 id="about-intro-title" className="text-3xl sm:text-4xl font-bold text-institutional">
            {intro.title}
          </h1>
          <p className="mt-4 text-cold-gray text-lg leading-relaxed">
            {intro.lead}
          </p>
        </motion.div>
      </Container>
    </Section>
  )
}
