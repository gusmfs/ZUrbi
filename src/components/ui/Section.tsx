import { forwardRef, type ReactNode } from 'react'

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
  ariaLabelledby?: string
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  function Section({ id, children, className = '', ariaLabelledby }, ref) {
  return (
    <section
      ref={ref}
      id={id}
      className={`py-12 sm:py-16 lg:py-20 ${className}`}
      aria-labelledby={ariaLabelledby}
    >
      {children}
    </section>
  )
})
