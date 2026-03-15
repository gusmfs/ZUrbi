import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { homeData } from '@/data/home'
import { grantReportAccess } from '@/lib/reportAccess'

export function AccessCard() {
  const navigate = useNavigate()
  const { accessCard } = homeData
  const [isWelcoming, setIsWelcoming] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleAccess = () => {
    setIsWelcoming(true)

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      grantReportAccess()
      setIsWelcoming(false)
      navigate('/registrar')
    }, 2600)
  }

  return (
    <>
      <section className="py-10 sm:py-14" aria-labelledby="access-title">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto"
          >
            <Card className="p-6 sm:p-8 text-center">
              <h2 id="access-title" className="text-xl sm:text-2xl font-semibold text-institutional">
                {accessCard.title}
              </h2>
              <p className="mt-3 text-cold-gray text-sm sm:text-base leading-relaxed">
                {accessCard.description}
              </p>
              <div className="mt-6 flex flex-col items-center gap-4">
                <img
                  src="/images/govbr.png"
                  alt="gov.br"
                  className="h-8 w-auto"
                />
                <Button onClick={handleAccess} variant="govbr" className="w-full sm:w-auto min-w-[220px]">
                  {accessCard.buttonLabel}
                </Button>
              </div>
              <p className="mt-4 text-xs text-cold-gray-lighter">
                {accessCard.prototypeNote}
              </p>
            </Card>
          </motion.div>
        </Container>
      </section>

      <AnimatePresence>
        {isWelcoming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-[radial-gradient(circle_at_top,_rgba(144,224,239,0.18),_transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(226,232,240,0.96))]"
            aria-modal="true"
            role="dialog"
            aria-label="Boas-vindas ao projeto"
          >
            <div className="flex h-full items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-xl rounded-3xl border border-cold-gray-lightest bg-white/90 px-8 py-10 text-center shadow-elevated backdrop-blur"
              >
                <span className="inline-flex rounded-full bg-institutional/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-cyan">
                  Acesso liberado
                </span>
                <h2 className="mt-5 text-3xl font-bold text-institutional sm:text-4xl">
                  Seja bem-vindo ao nosso projeto
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-cold-gray sm:text-base">
                  Obrigado por conhecer o zUrbi. Estamos preparando sua entrada para a experiência de registro de
                  ocorrências urbanas.
                </p>
                <div className="mx-auto mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-cold-gray-lightest">
                  <motion.div
                    className="h-full rounded-full bg-institutional"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.25, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
