import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { aboutData } from '@/data/about'

export function UseCasesSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { amount: 0.15, once: true })

  return (
    <Section ref={ref} className="bg-cold-gray-lightest/30" aria-labelledby="usecases-title">
      <Container>
        <h2 id="usecases-title" className="text-2xl sm:text-3xl font-bold text-institutional text-center mb-8 sm:mb-10">
          Casos de uso urbanos
        </h2>
        <motion.ul
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
        >
          {aboutData.useCases.map((useCase, i) => (
            <motion.li
              key={useCase}
              initial={{ opacity: 0, x: -8 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 text-sm text-cold-gray"
            >
              <span className="text-accent-cyan shrink-0" aria-hidden="true">•</span>
              {useCase}
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </Section>
  )
}
