// src/components/ui/Card.tsx

import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200',
        'hover:shadow-md transition-shadow',
        className
      )} 
      {...props}  // ✅ Esto permite pasar onClick, onMouseEnter, etc.
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <div 
      className={cn('p-4 sm:p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ✅ Exportar también como componentes separados si lo necesitas
export const CardHeader = ({ children, className, ...props }: CardProps) => (
  <div className={cn('p-4 sm:p-6 border-b border-gray-100', className)} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ children, className, ...props }: CardProps) => (
  <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ children, className, ...props }: CardProps) => (
  <p className={cn('text-sm text-gray-500', className)} {...props}>
    {children}
  </p>
)