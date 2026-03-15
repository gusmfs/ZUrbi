import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { navData } from '@/data/nav'
import { hasReportAccess, subscribeToReportAccess } from '@/lib/reportAccess'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportAccess, setReportAccess] = useState(false)

  useEffect(() => {
    setReportAccess(hasReportAccess())
    return subscribeToReportAccess(() => {
      setReportAccess(hasReportAccess())
    })
  }, [])

  const visibleLinks = useMemo(
    () => navData.links.filter((link) => reportAccess || !['/registrar', '/monitoramento'].includes(link.href)),
    [reportAccess],
  )

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cold-gray-lightest">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <Link
          to="/"
          className="font-semibold text-institutional text-lg tracking-tight hover:text-institutional-dark transition-colors"
        >
          {navData.brand}
        </Link>

        <nav className="hidden sm:flex items-center gap-8" aria-label="Principal">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-cold-gray hover:text-institutional transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="sm:hidden p-2 -mr-2 text-institutional"
          aria-label="Abrir menu"
          onClick={() => setMenuOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 sm:hidden"
            aria-modal="true"
            role="dialog"
            aria-label="Menu de navegação"
          >
            <div className="flex flex-col h-full pt-14 px-4">
              <button
                type="button"
                className="absolute top-4 right-4 p-2 text-institutional"
                aria-label="Fechar menu"
                onClick={() => setMenuOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <nav className="flex flex-col gap-6" aria-label="Principal">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-lg font-medium text-institutional hover:text-institutional-dark"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
