import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { homeData } from '@/data/home'

export function Hero() {
  const { hero } = homeData
  return (
    <section className="pt-8 sm:pt-12 pb-12 sm:pb-16" aria-labelledby="hero-title">
      <Container>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <motion.h1
              id="hero-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-institutional leading-tight"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {hero.title}
            </motion.h1>
            <motion.p
              className="mt-4 text-cold-gray text-base sm:text-lg leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {hero.subtitle}
            </motion.p>
            <motion.p
              className="mt-6 text-xs text-cold-gray-lighter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {hero.ctaNote}
            </motion.p>
          </div>
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="w-56 sm:w-64 aspect-[9/19] rounded-[2rem] border-[10px] border-cold-gray shadow-elevated bg-cold-gray-lightest overflow-hidden">
              <div className="h-full flex flex-col bg-white">
                <div className="h-10 flex items-center justify-center border-b border-cold-gray-lightest">
                  <span className="text-xs font-medium text-cold-gray">zUrbi</span>
                </div>
                <div className="flex-1 min-h-0 flex flex-col p-2">
                  <video
                    src="/video/Civic_Tech_Brand_Animation_Generation.mp4"
                    className="w-full h-full object-contain rounded-lg bg-cold-gray-lightest/30"
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label="Animação da logo zUrbi"
                  />
                </div>
                <div className="p-4 border-t border-cold-gray-lightest">
                  <div className="h-10 rounded-lg bg-institutional/10 flex items-center justify-center">
                    <span className="text-xs text-institutional font-medium">Mapa</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
