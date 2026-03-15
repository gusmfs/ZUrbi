import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { aboutData } from '@/data/about'

export function FlowSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { amount: 0.15, once: true })

  return (
    <Section ref={ref} className="bg-cold-gray-lightest/30" aria-labelledby="flow-title">
      <Container>
        <h2 id="flow-title" className="text-2xl sm:text-3xl font-bold text-institutional text-center mb-10 sm:mb-14">
          Fluxo em 4 etapas
        </h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {aboutData.flow.map((item, i) => (
            <motion.li
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="relative"
            >
              <div className="flex flex-col h-full">
                <span className="text-sm font-semibold text-accent-cyan" aria-hidden="true">
                  {String(item.step).padStart(2, '0')}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-institutional">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-cold-gray leading-relaxed flex-1">
                  {item.description}
                </p>
              </div>
              {i < aboutData.flow.length - 1 && (
                <span
                  className="hidden lg:block absolute top-6 -right-4 w-8 border-t-2 border-dashed border-cold-gray-lightest"
                  aria-hidden="true"
                />
              )}
            </motion.li>
          ))}
        </ol>
      </Container>
    </Section>
  )
}
