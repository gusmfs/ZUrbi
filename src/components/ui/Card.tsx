import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white border border-cold-gray-lightest shadow-card hover:shadow-card-hover transition-shadow duration-[var(--transition-normal)] ${className}`}
    >
      {children}
    </div>
  )
}
