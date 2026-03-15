import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { navData } from '@/data/nav'
import { hasReportAccess, subscribeToReportAccess } from '@/lib/reportAccess'

export function Footer() {
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
    <footer className="bg-cold-gray-lightest/50 border-t border-cold-gray-lightest">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <Link to="/" className="font-semibold text-institutional text-lg">
              {navData.brand}
            </Link>
            <p className="mt-1 text-sm text-cold-gray-lighter">{navData.brandTagline}</p>
          </div>
          <nav className="flex gap-6" aria-label="Rodapé">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-cold-gray hover:text-institutional transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 pt-6 border-t border-cold-gray-lightest text-xs text-cold-gray-lighter">
          Protótipo acadêmico. Sem backend, autenticação ou integração real com gov.br.
        </p>
      </div>
    </footer>
  )
}
