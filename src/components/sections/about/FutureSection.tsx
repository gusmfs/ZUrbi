import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { aboutData } from '@/data/about'

export function FutureSection() {
  const { future } = aboutData
  return (
    <Section className="bg-institutional text-white" aria-labelledby="future-title">
      <Container>
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 id="future-title" className="text-2xl sm:text-3xl font-bold">
            {future.title}
          </h2>
          <p className="mt-4 text-white/90 leading-relaxed">
            {future.description}
          </p>
        </motion.div>
      </Container>
    </Section>
  )
}
