import { MapPin, Bed, Bath, Square, Heart, Eye } from 'lucide-react'

interface Property {
  id: string
  title: string
  price: string
  priceNum: number
  location: string
  locationType: 'trinidad' | 'tobago'
  listingType: 'sale' | 'rent'
  beds: number
  baths: number
  sqft: number
  type: string
  image: string
  images: string[]
  favorited: number
}

interface PropertyCardEnhancedProps {
  property: Property
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
  onSave?: () => void
  isSaved?: boolean
}

export function PropertyCardEnhanced({ 
  property, 
  onClick, 
  onSave, 
  isSaved = false 
}: PropertyCardEnhancedProps) {
  return (
    <div 
      className="property-card cursor-pointer"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="property-card-image">
        <img 
          src={property.image} 
          alt={property.title}
          loading="lazy"
        />
        
        {/* Listing Type Badge */}
        <div className="property-card-badge">
          {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
        </div>
        
        {/* Favorite Button */}
        {onSave && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSave()
            }}
            className="property-card-favorite"
            aria-label={isSaved ? 'Remove from saved' : 'Save property'}
          >
            <Heart 
              className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-current' : 'text-white'}`}
            />
          </button>
        )}
        
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Content Section */}
      <div className="property-card-content">
        {/* Price */}
        <div className="property-card-price">
          <span className="text-2xl">{property.price}</span>
          {property.listingType === 'rent' && (
            <span className="text-sm font-normal text-[var(--text-muted)]">/month</span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="property-card-title">
          {property.title}
        </h3>
        
        {/* Location */}
        <div className="property-card-location">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{property.location}</span>
          <span className="text-[var(--color-accent-500)]">•</span>
          <span className="capitalize">{property.locationType}</span>
        </div>
        
        {/* Features */}
        <div className="property-card-features">
          <div className="property-card-feature">
            <Bed className="w-4 h-4" />
            <span>{property.beds} Beds</span>
          </div>
          <div className="property-card-feature">
            <Bath className="w-4 h-4" />
            <span>{property.baths} Baths</span>
          </div>
          <div className="property-card-feature">
            <Square className="w-4 h-4" />
            <span>{property.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
        
        {/* Property Type & Views */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            {property.type}
          </span>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Eye className="w-3 h-3" />
            <span>{property.favorited}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton loader for property cards
export function PropertyCardSkeleton() {
  return (
    <div className="property-card">
      <div className="property-card-image">
        <div className="skeleton w-full h-full" />
      </div>
      <div className="property-card-content">
        <div className="skeleton h-8 w-32 mb-3" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-3/4 mb-4" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
  )
}
