import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { homeData } from '@/data/home'

export function StepsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { amount: 0.2, once: true })
  const [stickyStep, setStickyStep] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const steps = el.querySelectorAll('[data-step]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = Number((entry.target as HTMLElement).dataset.step)
            setStickyStep(step)
          }
        })
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    )
    steps.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <Section id="como-funciona" className="bg-cold-gray-lightest/30" aria-labelledby="steps-title">
      <Container as="section">
        <h2 id="steps-title" className="text-2xl sm:text-3xl font-bold text-institutional text-center mb-12 sm:mb-16">
          Ver · Priorizar · Agir
        </h2>
        <div ref={ref} className="lg:flex lg:gap-12">
          <div className="hidden lg:block lg:w-1/3 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-1">
              {homeData.steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`py-2 px-3 rounded-lg transition-colors ${
                    stickyStep === i ? 'bg-institutional text-white' : 'text-cold-gray'
                  }`}
                >
                  <span className="text-sm font-medium">{s.number}</span>
                  <span className="ml-2 font-semibold">{s.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-2/3 space-y-16 sm:space-y-20">
            {homeData.steps.map((step, i) => (
              <motion.article
                key={step.id}
                data-step={i}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="scroll-mt-24"
              >
                <div className="lg:max-w-xl">
                  <span className="text-sm font-medium text-accent-cyan">{step.number}</span>
                  <h3 className="mt-1 text-xl sm:text-2xl font-semibold text-institutional">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-cold-gray leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
