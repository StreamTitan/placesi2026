import { useState, useRef, useEffect } from 'react'
import {
  Menu, Plus, MapPin, Bed, Bath, Square,
  ArrowLeft, Heart, X, ChevronLeft, ChevronRight, User, Building,
  Home, Settings, LogOut, Search, BarChart3,
  Eye, Trash2, Edit, Users, Sun, Moon, SlidersHorizontal, ChevronUp, ChevronDown, Mail, Phone, Check, MessageSquare, Clock, Save
} from 'lucide-react'

// Types - aligned with database schema
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'agency' | 'agent' | 'owner' | 'service_provider'
  agency_id?: string
  created_at?: string
}

interface Property {
  id: string
  user_id?: string
  title: string
  description?: string
  detailed_description?: string
  price: string | number
  currency?: string
  location: string
  location_type?: 'trinidad' | 'tobago'
  listing_type?: 'sale' | 'rent'
  region?: string
  region_description?: string
  beds: number
  baths: number
  sqft: number
  lot_size?: number
  parking?: number
  maintenance?: number | string
  year_built?: number
  property_type?: string
  images: string[]
  features?: string[]
  amenities?: string[]
  views?: number
  favorites?: number
  status?: string
  created_at?: string
  updated_at?: string
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  message: string
  property_id?: string
  property_title?: string
  status: 'new' | 'contacted' | 'qualified' | 'closed'
  created_at: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  listings?: Property[]
}

// API
const API = 'http://31.97.150.162:3012'

const api = {
  async post(endpoint: string, data: any, token?: string) {
    const res = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    })
    return res.json()
  },
  async get(endpoint: string, token?: string) {
    const res = await fetch(`${API}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return res.json()
  },
  async del(endpoint: string, token?: string) {
    const res = await fetch(`${API}${endpoint}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return res.json()
  }
}

// Helpers
const formatPrice = (price: string | number, listing_type?: string) => {
  if (!price) return 'Contact for Price'
  return `TT$${Number(price).toLocaleString()}${listing_type === 'rent' ? '/mo' : ''}`
}

const getPropertyImage = (prop: Property) => prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'

// Auth Context
function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('placesi_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.get('/api/auth/me', token).then(data => {
        if (data.user) setUser(data.user)
        else {
          localStorage.removeItem('placesi_token')
          setToken(null)
        }
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const data = await api.post('/api/auth/login', { email, password })
    if (data.token) {
      localStorage.setItem('placesi_token', data.token)
      setToken(data.token)
      setUser(data.user)
    }
    return data
  }

  const register = async (data: any) => {
    const res = await api.post('/api/auth/register', data)
    if (res.token) {
      localStorage.setItem('placesi_token', res.token)
      setToken(res.token)
      setUser(res.user)
    }
    return res
  }

  const logout = () => {
    localStorage.removeItem('placesi_token')
    setToken(null)
    setUser(null)
  }

  return { user, token, loading, login, register, logout }
}

// AI Logo
function AILogo() {
  return (
    <div className="relative w-20 h-20 mx-auto mb-6">
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)' }} />
        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" style={{ color: 'var(--border)' }} />
        <circle cx="40" cy="6" r="2" fill="currentColor" style={{ color: 'var(--text-muted)' }} />
        <circle cx="40" cy="74" r="2" fill="currentColor" style={{ color: 'var(--text-muted)' }} />
        <circle cx="6" cy="40" r="2" fill="currentColor" style={{ color: 'var(--text-muted)' }} />
        <circle cx="74" cy="40" r="2" fill="currentColor" style={{ color: 'var(--text-muted)' }} />
        <line x1="40" y1="8" x2="40" y2="20" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--border)' }} />
        <line x1="40" y1="60" x2="40" y2="72" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--border)' }} />
        <line x1="8" y1="40" x2="20" y2="40" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--border)' }} />
        <line x1="60" y1="40" x2="72" y2="40" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--border)' }} />
        <path d="M40 22 L55 35 L55 52 L45 52 L45 42 L35 42 L35 52 L25 52 L25 35 Z" fill="currentColor" style={{ color: 'var(--text)' }} />
        <circle cx="40" cy="32" r="3" fill="var(--bg)" />
        <circle cx="40" cy="32" r="2" fill="currentColor" style={{ color: 'var(--text)' }} />
      </svg>
    </div>
  )
}

// Dashboard Layout
function DashboardLayout({ user, onLogout, onBack, children, activeTab, onTabChange }: {
  user: User
  onLogout: () => void
  onBack: () => void
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs = {
    admin: [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'properties', label: 'Properties', icon: Home },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    agency: [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'agents', label: 'Agents', icon: Users },
      { id: 'properties', label: 'Properties', icon: Home },
      { id: 'leads', label: 'Leads', icon: Mail },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    agent: [
      { id: 'overview', label: 'Dashboard', icon: BarChart3 },
      { id: 'properties', label: 'My Listings', icon: Home },
      { id: 'add-property', label: 'Add Property', icon: Plus },
      { id: 'leads', label: 'Inquiries', icon: Mail },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    owner: [
      { id: 'overview', label: 'Dashboard', icon: BarChart3 },
      { id: 'properties', label: 'My Properties', icon: Home },
      { id: 'add-property', label: 'Add Property', icon: Plus },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    service_provider: [
      { id: 'overview', label: 'Dashboard', icon: BarChart3 },
      { id: 'profile', label: 'Business Profile', icon: Building },
      { id: 'leads', label: 'Leads', icon: Users },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  }

  const currentTabs = tabs[user.role] || []

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[240px] border-r transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold">Placesi</h1>
          <p className="text-xs capitalize mt-1" style={{ color: 'var(--text-muted)' }}>{user.role.replace('_', ' ')} dashboard</p>
        </div>
        
        {/* Back to Home button */}
        <div className="px-3 mb-2">
          <button
            onClick={() => { onBack(); setSidebarOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
        
        <nav className="px-3 space-y-1">
          {currentTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id ? 'text-white' : ''
              }`}
              style={activeTab === tab.id 
                ? { background: 'var(--color-primary-500)', color: '#fff' } 
                : { color: 'var(--text-muted)' }
              }
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-input)' }}>
              <User className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-2 px-4 py-2 transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 min-h-screen">
        <header 
          className="lg:hidden sticky top-0 z-30 px-4 h-14 flex items-center gap-4"
          style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
        >
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Placesi</h1>
        </header>
        
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

// Stat Card
function StatCard({ label, value, icon: Icon, trend, color }: { 
  label: string; 
  value: string | number; 
  icon: any;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <span className={`text-xs font-medium mt-1 inline-block ${
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </span>
          )}
        </div>
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: color ? `${color}20` : 'var(--bg-input)' }}
        >
          <Icon className="w-5 h-5" style={{ color: color || 'var(--text-muted)' }} />
        </div>
      </div>
    </div>
  )
}

// Property Card
function PropertyCard({ property, onEdit, onDelete, compact = false }: { 
  property: Property; 
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}) {
  const price = formatPrice(property.price, property.listing_type)
  const image = getPropertyImage(property)
  const type = property.property_type || 'Property'

  return (
    <div className="card-dark card-interactive">
      <div className={`relative overflow-hidden ${compact ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
        <img src={image} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 " />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-xs font-medium text-white">
            {type}
          </span>
          {property.listing_type && (
            <span className={`px-2.5 py-1 backdrop-blur-sm rounded-lg text-xs font-medium ${property.listing_type === 'sale' ? 'bg-green-500/80 text-white' : 'bg-blue-500/80 text-white'}`}>
              {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xl font-bold text-white drop-shadow-lg">{price}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold text-base mb-1 line-clamp-1">{property.title}</p>
        <p className="text-sm flex items-center gap-1.5 mb-3" style={{ color: 'var(--text-muted)' }}>
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> 
          <span className="truncate">{property.location}</span>
        </p>
        <div className="flex items-center gap-4 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <Bed className="w-4 h-4" /> 
            <span>{property.beds}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" /> 
            <span>{property.baths}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Square className="w-4 h-4" /> 
            <span>{property.sqft?.toLocaleString()}</span>
          </span>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button 
              onClick={onEdit} 
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete} 
              className={`py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${onEdit ? '' : 'w-full'}`}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--error)' }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// User Row
function UserRow({ user, onAction }: { user: any; onAction?: (action: string, userId: string) => void }) {
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-500/20 text-purple-400',
    agency: 'bg-blue-500/20 text-blue-400',
    agent: 'bg-green-500/20 text-green-400',
    owner: 'bg-gray-500/20 text-gray-400',
    service_provider: 'bg-orange-500/20 text-orange-400',
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-[var(--bg-input)]" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center">
          <User className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </div>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-500/20 text-gray-400'}`}>
          {user.role.replace('_', ' ')}
        </span>
        {onAction && (
          <button 
            onClick={() => onAction('view', user.id)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--bg-input)' }}
          >
            <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>
    </div>
  )
}

// Main App
function App() {
  const { user, loading, login, register, logout } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showDashboard, setShowDashboard] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('light')
  
  // Data state
  const [properties, setProperties] = useState<Property[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [leads, setLeads] = useState<Lead[]>([
    // Sample leads for demonstration
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-868-123-4567',
      message: 'I am interested in viewing the Luxury Villa in Westmoorings. Is it still available for a showing this weekend?',
      property_id: '0de69d52-feb1-4a91-bac6-839d46feec11',
      property_title: 'Luxury Villa in Westmoorings',
      status: 'new',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Michael Chang',
      email: 'mchang@business.tt',
      phone: '+1-868-234-5678',
      message: 'Looking for office space in Port of Spain. What are the lease terms for the commercial property?',
      property_id: 'a081b026-98a6-4f96-b2bf-54d688905aad',
      property_title: 'Executive Office Space in Port of Spain',
      status: 'contacted',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      name: 'Aisha Mohammed',
      email: 'aisha.m@outlook.com',
      phone: '+1-868-345-6789',
      message: 'We are relocating from abroad and need a rental property. Is the house in San Fernando pet-friendly?',
      property_id: '4e911fae-4c42-4978-8996-c43c9c69d374',
      property_title: '3-Bedroom House for Rent in San Fernando',
      status: 'qualified',
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: '4',
      name: 'Robert Singh',
      email: 'r.singh@gmail.com',
      phone: '+1-868-456-7890',
      message: 'Looking to invest in land. Can you provide more details about zoning and utilities for the Arima property?',
      property_id: '83132d5c-b879-4cba-874f-531bd16a6553',
      property_title: 'Land for Sale in Arima',
      status: 'closed',
      created_at: new Date(Date.now() - 259200000).toISOString()
    }
  ])
  
  // Public AI chat state
  const [hasStarted, setHasStarted] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Property | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  
  // Filters
  const [locationFilter, setLocationFilter] = useState<'all' | 'trinidad' | 'tobago'>('all')
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | 'sale' | 'rent'>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Add property form
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    locationType: 'trinidad',
    listingType: 'sale',
    region: '',
    beds: '',
    baths: '',
    sqft: '',
    propertyType: 'House',
    images: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
  })

  // Edit property state
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  
  // Settings form state
  const [settingsName, setSettingsName] = useState(user?.name || '')
  const [settingsEmail, setSettingsEmail] = useState(user?.email || '')
  const [settingsPhone, setSettingsPhone] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('placesi_token')
    
    const propsRes = await api.get('/api/properties', token || undefined)
    if (propsRes.properties) {
      setProperties(propsRes.properties)
    }
    
    if (user?.role === 'admin') {
      const usersRes = await api.get('/api/admin/users', token || undefined)
      if (usersRes.users) {
        setUsers(usersRes.users)
      }
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const simulateResponse = async (userQuery: string) => {
    setIsTyping(true)
    try {
      const response = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userQuery }],
          filters: {
            location: locationFilter,
            listingType: listingTypeFilter
          }
        })
      })
      const data = await response.json()
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: data.message,
        listings: data.listings
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        listings: []
      }])
    }
    setIsTyping(false)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    if (!hasStarted) setHasStarted(true)
    setMessages(prev => [...prev, { id: generateId(), role: 'user', content: query.trim() }])
    simulateResponse(query.trim())
    setQuery('')
  }

  const toggleSave = (id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleLightboxPrev = () => {
    if (lightboxIndex !== null && selectedListing) {
      setLightboxIndex((lightboxIndex - 1 + (selectedListing.images?.length || 1)) % (selectedListing.images?.length || 1))
    }
  }
  
  const handleLightboxNext = () => {
    if (lightboxIndex !== null && selectedListing) {
      setLightboxIndex((lightboxIndex + 1) % (selectedListing.images?.length || 1))
    }
  }

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('placesi_token')
    
    const propertyData = {
      ...propertyForm,
      price: parseFloat(propertyForm.price) || 0,
      beds: parseInt(propertyForm.beds) || 0,
      baths: parseInt(propertyForm.baths) || 0,
      sqft: parseInt(propertyForm.sqft) || 0,
      images: [propertyForm.images],
      status: 'active'
    }
    
    const res = await api.post('/api/properties', propertyData, token || undefined)
    if (res.property) {
      setProperties(prev => [...prev, res.property])
      setPropertyForm({
        title: '',
        description: '',
        price: '',
        location: '',
        locationType: 'trinidad',
        listingType: 'sale',
        region: '',
        beds: '',
        baths: '',
        sqft: '',
        propertyType: 'House',
        images: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
      })
      setActiveTab('properties')
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    const token = localStorage.getItem('placesi_token')
    await api.del(`/api/properties/${id}`, token || undefined)
    setProperties(prev => prev.filter(p => p.id !== id))
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <AILogo />
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Detail View
  if (selectedListing) {
    const isSaved = saved.includes(selectedListing.id)
    const price = formatPrice(selectedListing.price, selectedListing.listing_type)
    const image = getPropertyImage(selectedListing)
    const type = selectedListing.property_type || 'Property'
    const pricePerSqFt = selectedListing.sqft && selectedListing.price 
      ? `TT$${Math.round(Number(selectedListing.price) / selectedListing.sqft)}` 
      : null
    
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <button onClick={() => setSelectedListing(null)} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleSave(selectedListing.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border"
                style={{ borderColor: 'var(--border)', color: isSaved ? 'var(--color-primary-500)' : 'var(--text-muted)' }}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
                {theme === 'dark' ? <Sun className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <Moon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
          </div>
        </header>
        
        <div className="max-w-6xl mx-auto pb-12 w-full">
          {/* Image */}
          <div 
            className="aspect-[4/3] sm:aspect-[16/9] relative cursor-pointer rounded-b-xl overflow-hidden" 
            onClick={() => setLightboxIndex(0)}
          >
            <img src={image} alt={selectedListing.title} className="w-full h-full object-cover" />
            {selectedListing.images && selectedListing.images.length > 1 && (
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-xs font-medium" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                1 / {selectedListing.images.length}
              </div>
            )}
          </div>

          {/* Title + Price */}
          <div className="px-4 sm:px-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: selectedListing.listing_type === 'sale' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', color: selectedListing.listing_type === 'sale' ? 'var(--color-success)' : 'var(--color-info)' }}>
                    {selectedListing.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{type}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">{selectedListing.title}</h1>
                <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: 'var(--text-muted)' }}>
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  {selectedListing.location}
                </p>
              </div>
              <div className="sm:text-right flex-shrink-0">
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-primary-500)' }}>{price}</p>
                {pricePerSqFt && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{pricePerSqFt}/sqft</p>}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mx-4 sm:mx-6 mt-5 flex gap-0 border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {[
              { icon: Bed, label: 'Beds', value: selectedListing.beds },
              { icon: Bath, label: 'Baths', value: selectedListing.baths },
              { icon: Square, label: 'Sq Ft', value: selectedListing.sqft?.toLocaleString() },
              ...(selectedListing.lot_size ? [{ icon: null, label: 'Lot', value: selectedListing.lot_size?.toLocaleString() }] : []),
              ...(selectedListing.parking ? [{ icon: null, label: 'Parking', value: selectedListing.parking }] : []),
              ...(selectedListing.year_built ? [{ icon: null, label: 'Built', value: selectedListing.year_built }] : []),
            ].map((stat, i) => (
              <div key={i} className={`flex-1 flex items-center gap-2.5 py-3 px-4 ${i > 0 ? 'border-l' : ''}`} style={{ borderColor: 'var(--border)' }}>
                {stat.icon && <stat.icon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
                <div>
                  <p className="text-sm font-semibold leading-none">{stat.value}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Two Column */}
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-base font-semibold mb-3">Description</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                  {selectedListing.detailed_description || selectedListing.description || 'No description available.'}
                </p>
              </div>

              {/* Features */}
              {(selectedListing.features && selectedListing.features.length > 0) && (
                <div>
                  <h2 className="text-base font-semibold mb-3">Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedListing.features.map((f, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-md border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {(selectedListing.amenities && selectedListing.amenities.length > 0) && (
                <div>
                  <h2 className="text-base font-semibold mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedListing.amenities.map((a, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-md" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Region */}
              {selectedListing.region && (
                <div>
                  <h2 className="text-base font-semibold mb-3">Location</h2>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span>{selectedListing.region}{selectedListing.region_description ? ` — ${selectedListing.region_description}` : ''}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Contact Card */}
              <div className="rounded-lg p-5 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <h3 className="text-base font-semibold mb-1">Interested in this property?</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  Contact the listing agent for more details or to schedule a viewing.
                </p>
                <button 
                  className="w-full py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: 'var(--color-primary-500)', color: '#0C4A6E' }}
                >
                  Request Details
                </button>
                <button 
                  className="w-full py-2.5 rounded-lg text-sm font-medium mt-2 border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  Schedule Viewing
                </button>
              </div>

              {/* Key Details */}
              <div className="rounded-lg p-5 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-semibold mb-3">Property Details</h3>
                <dl className="space-y-2.5 text-sm">
                  {[
                    ['Property ID', selectedListing.id?.slice(0, 8).toUpperCase()],
                    ['Type', type],
                    ['Listing', selectedListing.listing_type ? (selectedListing.listing_type === 'sale' ? 'For Sale' : 'For Rent') : null],
                    ['Region', selectedListing.region],
                    ['Year Built', selectedListing.year_built],
                    ...(selectedListing.maintenance ? [['Maintenance', `TT$${selectedListing.maintenance}/mo`]] : []),
                    ['Listed', selectedListing.created_at ? new Date(selectedListing.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null],
                    ['Views', selectedListing.views || 0],
                    ['Saves', selectedListing.favorites || 0],
                  ].filter(([, v]) => v).map(([label, value], i) => (
                    <div key={i} className="flex justify-between">
                      <dt style={{ color: 'var(--text-muted)' }}>{label}</dt>
                      <dd className="font-medium text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Mortgage Calculator Link */}
              <div className="rounded-lg p-5 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-semibold mb-1">Calculate Payments</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  Estimate your monthly mortgage payment.
                </p>
                <button className="text-sm font-medium" style={{ color: 'var(--color-primary-500)' }}>
                  Open Calculator →
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lightbox */}
        {lightboxIndex !== null && selectedListing.images && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
            <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80" style={{ background: 'var(--bg-input)' }}>
              <X className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleLightboxPrev() }} className="absolute left-2 sm:left-4 w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center hover:opacity-80" style={{ background: 'var(--bg-input)' }}>
              <ChevronLeft className="w-6 sm:w-8 h-6 sm:h-8" />
            </button>
            <img src={selectedListing.images[lightboxIndex]} alt="" className="max-h-[85vh] max-w-[95vw] sm:max-w-[85vw] object-contain" onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); handleLightboxNext() }} className="absolute right-2 sm:right-4 w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center hover:opacity-80" style={{ background: 'var(--bg-input)' }}>
              <ChevronRight className="w-6 sm:w-8 h-6 sm:h-8" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {selectedListing.images.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === lightboxIndex ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Dashboard content
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {user?.role === 'admin' ? 'Admin Dashboard' : user?.role === 'agency' ? 'Agency Dashboard' : 'Dashboard'}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <StatCard 
                label="Properties" 
                value={properties.length} 
                icon={Home}
                color="#10B981"
              />
              <StatCard 
                label="Total Views" 
                value={properties.reduce((acc, p) => acc + (p.views || 0), 0)} 
                icon={Eye}
                color="#3B82F6"
              />
              <StatCard 
                label="Saved" 
                value={saved.length} 
                icon={Heart}
                color="#EC4899"
              />
              <StatCard 
                label="Favorites" 
                value={properties.reduce((acc, p) => acc + (p.favorites || 0), 0)} 
                icon={Heart}
                color="#8B5CF6"
              />
            </div>

            <div className="rounded-lg p-4 md:p-6 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => setActiveTab('add-property')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500 text-white">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Add Property</span>
                </button>
                <button 
                  onClick={() => setActiveTab('properties')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500 text-white">
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">View Listings</span>
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500 text-white">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button 
                  onClick={() => { logout(); setShowDashboard(false) }}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg transition-colors"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500 text-white">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>

            {properties.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Properties</h3>
                  <button onClick={() => setActiveTab('properties')} className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
                    View all →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.slice(0, 3).map(prop => (
                    <PropertyCard key={prop.id} property={prop} compact />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Users</h2>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {users.length} total users
              </div>
            </div>
            
            {users.length === 0 ? (
              <div className="text-center py-12 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <UserRow key={u.id} user={u} />
                ))}
              </div>
            )}
          </div>
        )
      
      case 'properties':
        const handleEditProperty = (property: Property) => {
          setEditingProperty(property)
          setActiveTab('edit-property')
        }
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Properties</h2>
              <button 
                onClick={() => setActiveTab('add-property')} 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm"
                style={{ background: 'var(--color-primary-500)', color: '#0C4A6E' }}
              >
                <Plus className="w-4 h-4" /> Add Property
              </button>
            </div>
            
            {properties.length === 0 ? (
              <div className="text-center py-12 rounded-lg border border-dashed" style={{ borderColor: 'var(--border)' }}>
                <Home className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p className="mb-2" style={{ color: 'var(--text-muted)' }}>No properties yet</p>
                <button onClick={() => setActiveTab('add-property')} className="hover:underline">Add your first property</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map(prop => (
                  <PropertyCard 
                    key={prop.id} 
                    property={prop}
                    onEdit={() => handleEditProperty(prop)}
                    onDelete={() => handleDeleteProperty(prop.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      
      case 'edit-property':
        const handleUpdateProperty = async (e: React.FormEvent) => {
          e.preventDefault()
          if (!editingProperty) return
          
          // In a real app, this would call an API update endpoint
          // For now, just update local state
          setProperties(prev => prev.map(p => p.id === editingProperty.id ? editingProperty : p))
          setEditingProperty(null)
          setActiveTab('properties')
        }
        
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { setEditingProperty(null); setActiveTab('properties') }}
                className="p-2 rounded-lg"
                style={{ background: 'var(--bg-input)' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold">Edit Property</h2>
            </div>
            
            {editingProperty && (
              <form onSubmit={handleUpdateProperty} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Property Title *" 
                  value={editingProperty.title}
                  onChange={e => setEditingProperty({ ...editingProperty, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                  style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                />
                <textarea 
                  placeholder="Description"
                  value={editingProperty.description || ''}
                  onChange={e => setEditingProperty({ ...editingProperty, description: e.target.value })}
                  rows={4} 
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none" 
                  style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" 
                    placeholder="Price (TTD) *"
                    value={editingProperty.price || ''}
                    onChange={e => setEditingProperty({ ...editingProperty, price: parseFloat(e.target.value) || 0 })}
                    required 
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  />
                  <select 
                    value={editingProperty.property_type || 'House'}
                    onChange={e => setEditingProperty({ ...editingProperty, property_type: e.target.value })}
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Villa">Villa</option>
                    <option value="Land">Land</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={editingProperty.listing_type || 'sale'}
                    onChange={e => setEditingProperty({ ...editingProperty, listing_type: e.target.value as 'sale' | 'rent' })}
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                  <select 
                    value={editingProperty.location_type || 'trinidad'}
                    onChange={e => setEditingProperty({ ...editingProperty, location_type: e.target.value as 'trinidad' | 'tobago' })}
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  >
                    <option value="trinidad">Trinidad</option>
                    <option value="tobago">Tobago</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <input 
                    type="number" 
                    placeholder="Beds *"
                    value={editingProperty.beds ?? ''}
                    onChange={e => setEditingProperty({ ...editingProperty, beds: parseInt(e.target.value) || 0 })}
                    required 
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  />
                  <input 
                    type="number" 
                    placeholder="Baths *"
                    value={editingProperty.baths ?? ''}
                    onChange={e => setEditingProperty({ ...editingProperty, baths: parseInt(e.target.value) || 0 })}
                    required 
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  />
                  <input 
                    type="number" 
                    placeholder="Sq Ft *"
                    value={editingProperty.sqft ?? ''}
                    onChange={e => setEditingProperty({ ...editingProperty, sqft: parseInt(e.target.value) || 0 })}
                    required 
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Location / Address *"
                  value={editingProperty.location || ''}
                  onChange={e => setEditingProperty({ ...editingProperty, location: e.target.value })}
                  required 
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                  style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                />
                <select 
                  value={editingProperty.region || ''}
                  onChange={e => setEditingProperty({ ...editingProperty, region: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                >
                  <option value="">Select Region</option>
                  <option value="Central">Central</option>
                  <option value="North East">North East</option>
                  <option value="North West">North West</option>
                  <option value="South East">South East</option>
                  <option value="South West">South West</option>
                  <option value="Tobago">Tobago</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Image URL"
                  value={editingProperty.images?.[0] || ''}
                  onChange={e => setEditingProperty({ ...editingProperty, images: [e.target.value] })}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                  style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                />
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => { setEditingProperty(null); setActiveTab('properties') }}
                    className="flex-1 py-3 rounded-lg font-medium"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 font-semibold rounded-lg"
                    style={{ background: 'var(--color-primary-500)', color: '#0C4A6E' }}
                  >
                    Update Property
                  </button>
                </div>
              </form>
            )}
          </div>
        )
      
      case 'add-property':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Add Property</h2>
              <form onSubmit={handleAddProperty} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Property Title *" 
                  value={propertyForm.title}
                  onChange={e => setPropertyForm({ ...propertyForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                  style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                />
                <textarea 
                  placeholder="Description"
                  value={propertyForm.description}
                  onChange={e => setPropertyForm({ ...propertyForm, description: e.target.value })}
                  rows={4} 
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none" 
                  style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" 
                    placeholder="Price (TTD) *"
                    value={propertyForm.price}
                    onChange={e => setPropertyForm({ ...propertyForm, price: e.target.value })}
                    required 
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  />
                  <select 
                    value={propertyForm.propertyType}
                    onChange={e => setPropertyForm({ ...propertyForm, propertyType: e.target.value })}
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Villa">Villa</option>
                    <option value="Land">Land</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={propertyForm.listingType}
                    onChange={e => setPropertyForm({ ...propertyForm, listingType: e.target.value })}
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                  <select 
                    value={propertyForm.locationType}
                    onChange={e => setPropertyForm({ ...propertyForm, locationType: e.target.value })}
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  >
                    <option value="trinidad">Trinidad</option>
                    <option value="tobago">Tobago</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <input 
                    type="number" 
                    placeholder="Beds *"
                    value={propertyForm.beds}
                    onChange={e => setPropertyForm({ ...propertyForm, beds: e.target.value })}
                    required 
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  />
                  <input 
                    type="number" 
                    placeholder="Baths *"
                    value={propertyForm.baths}
                    onChange={e => setPropertyForm({ ...propertyForm, baths: e.target.value })}
                    required 
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  />
                  <input 
                    type="number" 
                    placeholder="Sq Ft *"
                    value={propertyForm.sqft}
                    onChange={e => setPropertyForm({ ...propertyForm, sqft: e.target.value })}
                    required 
                    className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Location / Address *"
                  value={propertyForm.location}
                  onChange={e => setPropertyForm({ ...propertyForm, location: e.target.value })}
                  required 
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                  style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                />
                <select 
                  value={propertyForm.region}
                  onChange={e => setPropertyForm({ ...propertyForm, region: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                >
                  <option value="">Select Region</option>
                  <option value="Central">Central</option>
                  <option value="North East">North East</option>
                  <option value="North West">North West</option>
                  <option value="South East">South East</option>
                  <option value="South West">South West</option>
                  <option value="Tobago">Tobago</option>
                </select>
                <input 
                  type="url" 
                  placeholder="Image URL"
                  value={propertyForm.images}
                  onChange={e => setPropertyForm({ ...propertyForm, images: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" 
                  style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
                />
                <button 
                  type="submit" 
                  className="w-full py-3 font-semibold rounded-lg transition-colors"
                  style={{ background: 'var(--color-primary-500)', color: '#0C4A6E' }}
                >
                  Create Listing
                </button>
              </form>
            </div>
          </div>
        )
      
      case 'settings':
        const handleSaveSettings = async () => {
          setSavingSettings(true)
          // In a real app, this would call the API
          await new Promise(resolve => setTimeout(resolve, 1000))
          setSavingSettings(false)
          setSettingsSaved(true)
          setTimeout(() => setSettingsSaved(false), 3000)
        }
        
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            
            {settingsSaved && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 text-green-500">
                <Check className="w-5 h-5" />
                <span className="font-medium">Settings saved successfully!</span>
              </div>
            )}
            
            <div className="rounded-lg p-5 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <h3 className="font-semibold mb-4">Profile</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Name</label>
                  <input 
                    type="text" 
                    placeholder="Your name" 
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }} 
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Email</label>
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    value={settingsEmail}
                    onChange={(e) => setSettingsEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }} 
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Phone</label>
                  <input 
                    type="tel" 
                    placeholder="+1-868-XXX-XXXX" 
                    value={settingsPhone}
                    onChange={(e) => setSettingsPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2" 
                    style={{ background: 'var(--bg-input)', color: 'var(--text)' }} 
                  />
                </div>
              </div>
              <button 
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="mt-4 px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                style={{ background: 'var(--color-primary-500)', color: '#0C4A6E' }}
              >
                <Save className="w-4 h-4" />
                {savingSettings ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            <div className="rounded-lg p-5 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <h3 className="font-semibold mb-4">Appearance</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => setTheme('light')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
                  style={theme === 'light' 
                    ? { background: 'var(--text)', color: 'var(--bg)' } 
                    : { background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
                  style={theme === 'dark' 
                    ? { background: 'var(--text)', color: 'var(--bg)' } 
                    : { background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>
          </div>
        )
      
      case 'leads':
        const statusColors: Record<string, { bg: string; text: string; label: string }> = {
          new: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'New' },
          contacted: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Contacted' },
          qualified: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Qualified' },
          closed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Closed' }
        }
        
        const updateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
        }
        
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Inquiries</h2>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(statusColors).map(([key, val]) => (
                  <span 
                    key={key}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${val.bg} ${val.text}`}
                  >
                    {leads.filter(l => l.status === key).length} {val.label}
                  </span>
                ))}
              </div>
            </div>
            
            {leads.length === 0 ? (
              <div className="text-center py-12 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <Mail className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No inquiries yet</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  Inquiries from property listings will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(lead => {
                  const status = statusColors[lead.status]
                  const timeAgo = (date: string) => {
                    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
                    if (seconds < 60) return 'Just now'
                    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
                    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
                    return `${Math.floor(seconds / 86400)}d ago`
                  }
                  
                  return (
                    <div 
                      key={lead.id}
                      className="rounded-lg border overflow-hidden transition-colors hover:border-[var(--color-primary-500)]"
                      style={{ background: 'var(--bg-elevated)', borderColor: lead.status === 'new' ? 'var(--color-primary-500)' : 'var(--border)' }}
                    >
                      {/* Header */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ background: 'var(--bg-input)' }}>
                            {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{lead.name}</p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{lead.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <Clock className="w-3 h-3" />
                            {timeAgo(lead.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Property Reference */}
                      {lead.property_title && (
                        <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'var(--bg-input)' }}>
                          <Home className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                          <span className="text-sm font-medium">{lead.property_title}</span>
                        </div>
                      )}
                      
                      {/* Message */}
                      <div className="p-4">
                        <div className="flex gap-2">
                          <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {lead.message}
                          </p>
                        </div>
                      </div>
                      
                      {/* Contact Info & Actions */}
                      <div className="px-4 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <a 
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1.5 hover:underline"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </a>
                          <a 
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1.5 hover:underline"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </a>
                        </div>
                        
                        <div className="flex gap-2">
                          {lead.status === 'new' && (
                            <button 
                              onClick={() => updateLeadStatus(lead.id, 'contacted')}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                              style={{ background: 'var(--text)', color: 'var(--bg)' }}
                            >
                              <Check className="w-3 h-3" />
                              Mark Contacted
                            </button>
                          )}
                          {(lead.status === 'contacted' || lead.status === 'new') && (
                            <button 
                              onClick={() => updateLeadStatus(lead.id, 'qualified')}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                            >
                              Qualify
                            </button>
                          )}
                          {lead.status !== 'closed' && (
                            <button 
                              onClick={() => updateLeadStatus(lead.id, 'closed')}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-green-500 transition-colors"
                              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      
      default:
        return (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <Settings className="w-12 h-12 mx-auto mb-4" />
            <p>This section is coming soon...</p>
          </div>
        )
    }
  }

  // Dashboard view
  if (showDashboard && user) {
    return (
      <DashboardLayout 
        user={user} 
        onLogout={() => { logout(); setShowDashboard(false) }} 
        onBack={() => setShowDashboard(false)}
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      >
        {renderContent()}
      </DashboardLayout>
    )
  }

  // Public AI Chat
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b h-14" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: theme === 'dark' ? 'white' : '#1a1a1a' }}>
              <span className="font-bold text-sm" style={{ color: theme === 'dark' ? 'black' : 'white' }}>P</span>
            </div>
            <span className="font-semibold">Placesi</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'var(--bg-input)' }}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
            
            {user ? (
              <>
                <button 
                  onClick={() => setShowDashboard(true)}
                  className="text-sm px-3 py-2 rounded-lg transition-colors hidden sm:block"
                  style={{ background: 'var(--bg-input)' }}
                >
                  My Account
                </button>
                <button 
                  onClick={() => setShowDashboard(true)}
                  className="p-2 rounded-lg sm:hidden"
                  style={{ background: 'var(--bg-input)' }}
                >
                  <User className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setAuthMode('login')}
                className="px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ background: theme === 'dark' ? 'white' : '#1a1a1a', color: theme === 'dark' ? 'black' : 'white' }}
              >
                <span className="hidden sm:inline">Sign In</span>
                <User className="w-5 h-5 sm:hidden" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-32 sm:pb-24">
        {!hasStarted ? (
          <div className="text-center max-w-md px-4">
            <AILogo />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Ask Placesi</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              Find properties in Trinidad & Tobago through conversation
            </p>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-4 py-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                  <div className={`rounded-lg px-4 py-3`} style={{ 
                    background: msg.role === 'user' ? 'var(--bg-input)' : 'transparent',
                    color: 'var(--text)'
                  }}>
                    <p className="text-sm sm:text-base">{msg.content}</p>
                  </div>

                  {msg.listings && msg.listings.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.listings.map((listing) => (
                        <div 
                          key={listing.id}
                          onClick={() => setSelectedListing(listing)}
                          className="card-dark cursor-pointer"
                        >
                          <div className="aspect-[16/10] relative">
                            <img 
                              src={getPropertyImage(listing)} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                            {listing.images && listing.images.length > 1 && (
                              <div className="absolute top-3 right-3 px-2 py-1 rounded text-xs" style={{ background: 'rgba(0,0,0,0.6)' }}>
                                {listing.images.length} photos
                              </div>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleSave(listing.id) }}
                              className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ background: 'rgba(0,0,0,0.6)' }}
                            >
                              <Heart className={`w-4 h-4 ${saved.includes(listing.id) ? 'fill-white text-white' : ''}`} />
                            </button>
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-1 gap-2">
                              <p className="text-lg font-semibold">{formatPrice(listing.price, listing.listing_type)}</p>
                              <span className="text-xs px-2 py-0.5 rounded shrink-0" style={{ background: 'var(--bg-input)' }}>
                                {listing.property_type || 'Property'}
                              </span>
                            </div>
                            <p className="text-sm mb-1 line-clamp-1">{listing.title}</p>
                            <p className="text-xs flex items-center gap-1 mb-3" style={{ color: 'var(--text-muted)' }}>
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{listing.location}</span>
                            </p>
                            <div className="flex items-center gap-3 text-xs pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                              <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {listing.beds}</span>
                              <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {listing.baths}</span>
                              <span className="flex items-center gap-1"><Square className="w-3 h-3" /> {listing.sqft?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm">Searching...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input - Mobile optimized */}
      <div className="fixed bottom-0 left-0 right-0 pt-3 sm:pt-4 pb-4 sm:pb-6 px-3 sm:px-4" style={{ background: 'var(--bg)' }}>
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          {/* Mobile Filter Toggle */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto flex items-center justify-between px-4 py-2.5 rounded-full"
              style={{ background: 'var(--bg-input)' }}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm font-medium">
                  {(locationFilter !== 'all' || listingTypeFilter !== 'all') 
                    ? 'Filters active' 
                    : 'Add filters'}
                </span>
              </div>
              {showFilters ? (
                <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
            
            {(locationFilter !== 'all' || listingTypeFilter !== 'all') && !showFilters && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {locationFilter !== 'all' && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{ background: theme === 'dark' ? 'white' : '#1a1a1a', color: theme === 'dark' ? 'black' : 'white' }}>
                    {locationFilter.charAt(0).toUpperCase() + locationFilter.slice(1)}
                  </span>
                )}
                {listingTypeFilter !== 'all' && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    style={{ background: theme === 'dark' ? 'white' : '#1a1a1a', color: theme === 'dark' ? 'black' : 'white' }}>
                    {listingTypeFilter === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                )}
              </div>
            )}
            
            {showFilters && (
              <div className="mt-3 p-3 rounded-lg space-y-3" style={{ background: 'var(--bg-input)' }}>
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Location</p>
                  <div className="flex gap-2">
                    {['all', 'trinidad', 'tobago'].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocationFilter(loc as any)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: locationFilter === loc 
                            ? (theme === 'dark' ? 'white' : '#1a1a1a')
                            : 'transparent',
                          border: `1px solid ${locationFilter === loc ? 'transparent' : 'var(--border)'}`,
                          color: locationFilter === loc 
                            ? (theme === 'dark' ? 'black' : 'white')
                            : 'var(--text)'
                        }}
                      >
                        {loc === 'all' ? 'All' : loc.charAt(0).toUpperCase() + loc.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Listing Type</p>
                  <div className="flex gap-2">
                    {['all', 'sale', 'rent'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setListingTypeFilter(type as any)}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: listingTypeFilter === type 
                            ? (theme === 'dark' ? 'white' : '#1a1a1a')
                            : 'transparent',
                          border: `1px solid ${listingTypeFilter === type ? 'transparent' : 'var(--border)'}`,
                          color: listingTypeFilter === type 
                            ? (theme === 'dark' ? 'black' : 'white')
                            : 'var(--text)'
                        }}
                      >
                        {type === 'all' ? 'All' : type === 'sale' ? 'Sale' : 'Rent'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Field */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              placeholder="Ask about properties..."
              className="w-full px-4 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] pr-12 text-base"
              style={{ 
                background: 'var(--bg-input)', 
                color: 'var(--text)',
              }}
            />
            <button
              type="submit"
              disabled={!query.trim() || isTyping}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{ 
                background: theme === 'dark' ? 'white' : '#1a1a1a',
                color: theme === 'dark' ? 'black' : 'white'
              }}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Auth Modal */}
      {authMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div 
            className="relative w-full max-w-md rounded-lg border p-6"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
          >
            <button 
              onClick={() => setAuthMode(null)}
              className="absolute top-4 right-4 hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
            
            {authMode === 'login' ? (
              <LoginForm 
                onLogin={async (email, password) => {
                  const res = await login(email, password)
                  if (!res.error) {
                    setAuthMode(null)
                    setShowDashboard(true)
                  }
                  return res
                }}
                onSwitch={() => setAuthMode('register')}
              />
            ) : (
              <RegisterForm 
                onRegister={async (data) => {
                  const res = await register(data)
                  if (!res.error) {
                    setAuthMode(null)
                    setShowDashboard(true)
                  }
                  return res
                }}
                onSwitch={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Login Form
function LoginForm({ onLogin, onSwitch }: { onLogin: (email: string, password: string) => any; onSwitch: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await onLogin(email, password)
    setLoading(false)
    if (res.error) setError(res.error)
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
          style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
          style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 font-semibold rounded-lg disabled:opacity-50"
          style={{ background: 'var(--color-primary-500)', color: '#0C4A6E' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <button onClick={onSwitch} className="hover:underline font-medium" style={{ color: 'var(--text)' }}>Sign up</button>
      </p>
    </>
  )
}

// Register Form
function RegisterForm({ onRegister, onSwitch }: { onRegister: (data: any) => any; onSwitch: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'owner' as User['role'] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await onRegister(form)
    setLoading(false)
    if (res.error) setError(res.error)
  }

  const roles = [
    { value: 'owner', label: 'Property Owner', desc: 'Free' },
    { value: 'agent', label: 'Real Estate Agent', desc: 'TT$100/month' },
    { value: 'agency', label: 'Real Estate Agency', desc: 'TT$1,000/month' },
    { value: 'service_provider', label: 'Service Provider', desc: 'TT$50/month' }
  ]

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Full Name"
          required
          className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
          style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
        />
        <input
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          required
          className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
          style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
        />
        <input
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          required
          className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
          style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
        />
        <div className="space-y-2 pt-2">
          {roles.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setForm({ ...form, role: r.value as User['role'] })}
              className="w-full p-3 rounded-lg text-left border transition-all"
              style={{
                borderColor: form.role === r.value ? 'var(--text)' : 'var(--border)',
                background: form.role === r.value ? 'rgba(255,255,255,0.05)' : 'transparent'
              }}
            >
              <p className="font-medium text-sm">{r.label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.desc}</p>
            </button>
          ))}
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 font-semibold rounded-lg disabled:opacity-50"
          style={{ background: 'var(--color-primary-500)', color: '#0C4A6E' }}
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <button onClick={onSwitch} className="hover:underline font-medium" style={{ color: 'var(--text)' }}>Sign in</button>
      </p>
    </>
  )
}

export default App
