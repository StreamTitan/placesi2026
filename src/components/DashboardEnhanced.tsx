import { Home, Eye, Users, TrendingUp, Plus, Settings, BarChart3, Edit, Trash2 } from 'lucide-react'

interface Stat {
  label: string
  value: string | number
  change?: string
  icon: React.ComponentType<any>
  trend?: 'up' | 'down' | 'neutral'
}

interface StatCardProps {
  stat: Stat
}

export function StatCardEnhanced({ stat }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">
        <stat.icon className="w-6 h-6 text-[var(--color-accent-500)]" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="stat-card-value">{stat.value}</div>
          <div className="stat-card-label">{stat.label}</div>
        </div>
        {stat.change && (
          <div className={`text-sm font-medium flex items-center gap-1 ${
            stat.trend === 'up' ? 'text-green-500' : 
            stat.trend === 'down' ? 'text-red-500' : 
            'text-[var(--text-muted)]'
          }`}>
            {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {stat.change}
          </div>
        )}
      </div>
    </div>
  )
}

interface DashboardGridProps {
  children: React.ReactNode
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {children}
    </div>
  )
}

interface QuickActionProps {
  icon: React.ComponentType<any>
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function QuickAction({ icon: Icon, label, onClick, variant = 'secondary' }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
        variant === 'primary' 
          ? 'border-[var(--color-accent-500)] bg-[var(--color-accent-500)]/10 hover:bg-[var(--color-accent-500)]/20 text-[var(--color-accent-500)]'
          : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text)]'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  )
}

interface PropertyListProps {
  properties: any[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function PropertyListEnhanced({ properties, onEdit, onDelete }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[var(--bg-input)] flex items-center justify-center">
          <Home className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
        <p className="text-[var(--text-muted)] mb-6">
          Start building your portfolio by adding your first property listing
        </p>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Your First Property
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <div
          key={property.id}
          className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] transition-all"
        >
          <img
            src={property.image}
            alt={property.title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">{property.title}</h4>
            <p className="text-sm text-[var(--text-muted)] truncate">{property.location}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text)]">{property.price}</span>
              <span>•</span>
              <span>{property.beds} beds</span>
              <span>•</span>
              <span>{property.baths} baths</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit?.(property.id)}
              className="icon-btn"
              aria-label="Edit property"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(property.id)}
              className="icon-btn text-red-500 hover:bg-red-500/10"
              aria-label="Delete property"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

interface ActivityFeedProps {
  activities: Array<{
    id: string
    type: 'view' | 'lead' | 'inquiry' | 'update'
    message: string
    timestamp: Date
  }>
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-muted)]">
          Activity will appear here as you use Placesi
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-input)]"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent-500)]/10 flex items-center justify-center flex-shrink-0">
            {activity.type === 'view' && <Eye className="w-4 h-4 text-[var(--color-accent-500)]" />}
            {activity.type === 'lead' && <Users className="w-4 h-4 text-[var(--color-accent-500)]" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">{activity.message}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {activity.timestamp.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Example usage component
export function DashboardOverviewExample() {
  const stats: Stat[] = [
    { label: 'Total Properties', value: '12', change: '+2', trend: 'up', icon: Home },
    { label: 'Total Views', value: '1,247', change: '+12%', trend: 'up', icon: Eye },
    { label: 'Total Leads', value: '28', change: '+5', trend: 'up', icon: Users },
    { label: 'Response Rate', value: '94%', change: '0%', trend: 'neutral', icon: TrendingUp },
  ]
  
  const quickActions = [
    { icon: Plus, label: 'Add Property', onClick: () => console.log('Add property'), variant: 'primary' as const },
    { icon: BarChart3, label: 'View Analytics', onClick: () => console.log('Analytics') },
    { icon: Settings, label: 'Settings', onClick: () => console.log('Settings') },
  ]
  
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Overview</h2>
        <DashboardGrid>
          {stats.map((stat, index) => (
            <StatCardEnhanced key={index} stat={stat} />
          ))}
        </DashboardGrid>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>
    </div>
  )
}
