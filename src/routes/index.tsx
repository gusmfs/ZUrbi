import { Navigate, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { ReportPage } from '@/pages/ReportPage'
import { OperationsPage } from '@/pages/OperationsPage'
import { hasReportAccess } from '@/lib/reportAccess'

function ProtectedAccessRoute({ children }: { children: JSX.Element }) {
  if (!hasReportAccess()) {
    return <Navigate to="/" replace />
  }

  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="registrar" element={<ProtectedAccessRoute><ReportPage /></ProtectedAccessRoute>} />
        <Route path="monitoramento" element={<ProtectedAccessRoute><OperationsPage /></ProtectedAccessRoute>} />
        <Route path="sobre" element={<AboutPage />} />
      </Route>
    </Routes>
  )
}
