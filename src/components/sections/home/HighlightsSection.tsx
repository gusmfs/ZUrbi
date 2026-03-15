import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { homeData } from '@/data/home'

const iconClass = 'w-8 h-8 text-institutional shrink-0'

function IconGps() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21c-3.5-3.5-7-7-7-11a7 7 0 1 1 14 0c0 4-3.5 7.5-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function IconUrgencia() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

function IconFiscalizacao() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 14v4" />
      <path d="M12 10v8" />
      <path d="M17 6v12" />
    </svg>
  )
}

function IconDados() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

const iconComponents: Record<string, () => JSX.Element> = {
  gps: IconGps,
  urgencia: IconUrgencia,
  fiscalizacao: IconFiscalizacao,
  dados: IconDados,
}

export function HighlightsSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { amount: 0.15, once: true })

  return (
    <Section ref={ref} id="destaques" aria-labelledby="highlights-title">
      <Container>
        <motion.h2
          id="highlights-title"
          className="text-2xl sm:text-3xl font-bold text-institutional text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          Destaques da plataforma
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {homeData.highlights.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <Card className="p-5 sm:p-6 h-full">
                <span className="inline-flex" aria-hidden="true">
                  {(() => {
                    const Icon = iconComponents[item.id]
                    return Icon ? <Icon /> : null
                  })()}
                </span>
                <h3 className="mt-3 font-semibold text-institutional">{item.title}</h3>
                <p className="mt-2 text-sm text-cold-gray leading-relaxed">
                  {item.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
