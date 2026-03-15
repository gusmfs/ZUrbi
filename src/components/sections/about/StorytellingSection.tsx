import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { aboutData } from '@/data/about'

const stepTransition = {
  type: 'spring',
  stiffness: 120,
  damping: 24,
  mass: 0.9,
}

export function StorytellingSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { amount: 0.15, once: true })
  const { storytelling } = aboutData

  return (
    <Section ref={ref} className="bg-white" aria-labelledby="storytelling-title">
      <Container>
        <div className="max-w-3xl mx-auto">
          <motion.h2
            id="storytelling-title"
            className="text-2xl sm:text-3xl font-bold text-institutional text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...stepTransition, delay: 0.1 }}
          >
            {storytelling.title}
          </motion.h2>
          <motion.p
            className="mt-3 text-cold-gray text-center text-sm sm:text-base"
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...stepTransition, delay: 0.2 }}
          >
            {storytelling.subtitle}
          </motion.p>

          <ol className="mt-12 sm:mt-16 space-y-14 sm:space-y-16">
            {storytelling.steps.map((step) => (
              <motion.li
                key={step.id}
                className="relative pl-8 sm:pl-10 border-l-2 border-cold-gray-lightest border-solid"
                initial={{ opacity: 0, x: -12, scale: 0.985 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ amount: 0.25, once: true }}
                transition={stepTransition}
              >
                <motion.span
                  className="absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full bg-institutional border-2 border-white shadow-sm"
                  aria-hidden
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ amount: 0.25, once: true }}
                  transition={{ ...stepTransition, delay: 0.08 }}
                />
                <div
                  className={
                    step.id === '1' || step.id === '3'
                      ? 'grid gap-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start'
                      : step.id === '2' || step.id === '4'
                        ? 'grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-start'
                        : ''
                  }
                >
                  {(step.id === '1' || step.id === '3') && (
                    <motion.img
                      src={step.id === '1' ? '/images/etapa1.png' : '/images/etapa3.png'}
                      alt={
                        step.id === '1'
                          ? 'Ilustração da etapa problema na via'
                          : 'Ilustração da etapa prefeitura recebe e agenda'
                      }
                      className="w-full max-w-[180px] rounded-2xl bg-cold-gray-lightest/20 object-contain"
                      initial={{ opacity: 0, x: -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ amount: 0.25, once: true }}
                      transition={{ ...stepTransition, delay: 0.04 }}
                    />
                  )}
                  <div>
                    <motion.h3
                      className="text-lg sm:text-xl font-semibold text-institutional"
                      initial={{ opacity: 0, y: 5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ amount: 0.25, once: true }}
                      transition={{ ...stepTransition, delay: 0.06 }}
                    >
                      {step.title}
                    </motion.h3>
                    <motion.p
                      className="mt-2 text-cold-gray text-sm sm:text-base leading-relaxed"
                      initial={{ opacity: 0, y: 4 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ amount: 0.25, once: true }}
                      transition={{ ...stepTransition, delay: 0.12 }}
                    >
                      {step.description}
                    </motion.p>
                  </div>
                  {(step.id === '2' || step.id === '4') && (
                    <motion.img
                      src={step.id === '2' ? '/images/etapa2.png' : '/images/etapa5.png'}
                      alt={
                        step.id === '2'
                          ? 'Ilustração da etapa registro pelo app'
                          : 'Ilustração da etapa reparo da via'
                      }
                      className="w-full max-w-[180px] justify-self-start sm:justify-self-end rounded-2xl bg-cold-gray-lightest/20 object-contain"
                      initial={{ opacity: 0, x: 6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ amount: 0.25, once: true }}
                      transition={{ ...stepTransition, delay: 0.04 }}
                    />
                  )}
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  )
}
