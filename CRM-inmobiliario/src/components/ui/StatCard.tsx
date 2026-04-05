import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  color?: string
}

export default function StatCard({ title, value, icon: Icon, change, changeType = 'neutral', color = 'bg-brand-50 text-brand-600' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={cn(
              'text-xs font-medium mt-2',
              changeType === 'positive' && 'text-emerald-600',
              changeType === 'negative' && 'text-red-600',
              changeType === 'neutral' && 'text-gray-500',
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={cn('w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
