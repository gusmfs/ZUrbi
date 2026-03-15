import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'govbr'

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
  disabled?: boolean
  ariaLabel?: string
  icon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-institutional text-white hover:bg-institutional-dark shadow-card hover:shadow-card-hover',
  secondary:
    'bg-accent-cyan text-white hover:bg-accent-cyan/90',
  outline:
    'border-2 border-institutional text-institutional hover:bg-institutional hover:text-white',
  ghost:
    'text-institutional hover:bg-cold-gray-lightest/50',
  govbr:
    'rounded-full bg-[#1351B4] text-white hover:bg-[#0d3d8a] shadow-none gap-2 px-6 py-3 text-sm font-semibold',
}

function GovBrIcon() {
  return (
    <svg
      className="w-5 h-5 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

export function Button({
  children,
  variant = 'primary',
  href,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  ariaLabel,
  icon,
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg px-5 py-2.5 text-sm transition-all duration-[var(--transition-normal)] focus:outline-none focus:ring-2 focus:ring-institutional focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const styles = `${base} ${variantStyles[variant]} ${className}`
  const showIcon = icon ?? (variant === 'govbr' ? <GovBrIcon /> : null)
  const content = (
    <>
      {showIcon}
      {children}
    </>
  )

  if (href?.startsWith('http')) {
    return (
      <a
        href={href}
        className={styles}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
      >
        {content}
      </a>
    )
  }

  if (href) {
    return (
      <Link to={href} className={styles} aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={styles}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  )
}
