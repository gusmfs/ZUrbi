import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { aboutData } from '@/data/about'

export function ManifestoSection() {
  const { manifesto } = aboutData
  return (
    <Section aria-labelledby="manifesto-title">
      <Container>
        <motion.blockquote
          className="max-w-3xl border-l-4 border-accent-cyan pl-6 py-2"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 id="manifesto-title" className="text-xl font-semibold text-institutional">
            {manifesto.title}
          </h2>
          <p className="mt-2 text-cold-gray leading-relaxed">
            {manifesto.text}
          </p>
        </motion.blockquote>
      </Container>
    </Section>
  )
}
