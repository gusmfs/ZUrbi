import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { aboutData } from '@/data/about'

export function ModulesSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { amount: 0.1, once: true })

  return (
    <Section ref={ref} aria-labelledby="modules-title">
      <Container>
        <h2 id="modules-title" className="text-2xl sm:text-3xl font-bold text-institutional text-center mb-10 sm:mb-14">
          Módulos da plataforma
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {aboutData.modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Card className="p-5 sm:p-6 h-full">
                <h3 className="font-semibold text-institutional">{mod.title}</h3>
                <p className="mt-2 text-sm text-cold-gray leading-relaxed">
                  {mod.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
