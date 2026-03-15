import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { homeData } from '@/data/home'

export function FinalCta() {
  const cta = homeData.finalCta
  return (
    <Section
      className="relative overflow-hidden"
      aria-labelledby="final-cta-title"
    >
      {/* Vídeo de fundo */}
      <div className="absolute inset-0 z-0">
        <video
          src="/video/Vídeo_de_Mulher_Brasileira_Reportando_Obstáculo.mp4"
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        {/* Overlay claro para o vídeo aparecer e texto legível */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)' }}
          aria-hidden
        />
      </div>

      <div className="relative z-10">
        <Container>
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 id="final-cta-title" className="text-2xl sm:text-3xl font-bold text-institutional">
              {cta.title}
            </h2>
            <p className="mt-3 text-cold-gray text-sm sm:text-base">
              {cta.subtitle}
            </p>
            <div className="mt-8">
              <Button
                href={cta.buttonHref}
                variant="primary"
                className="bg-institutional text-white hover:bg-institutional-dark"
              >
                {cta.buttonLabel}
              </Button>
            </div>
          </motion.div>
        </Container>
      </div>
    </Section>
  )
}
