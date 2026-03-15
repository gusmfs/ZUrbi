const REPORT_ACCESS_KEY = 'zurbi-report-access'
const REPORT_ACCESS_EVENT = 'zurbi-report-access-changed'

export function hasReportAccess() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.sessionStorage.getItem(REPORT_ACCESS_KEY) === 'granted'
}

export function grantReportAccess() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(REPORT_ACCESS_KEY, 'granted')
  window.dispatchEvent(new Event(REPORT_ACCESS_EVENT))
}

export function subscribeToReportAccess(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handler = () => callback()

  window.addEventListener(REPORT_ACCESS_EVENT, handler)
  window.addEventListener('storage', handler)

  return () => {
    window.removeEventListener(REPORT_ACCESS_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}
