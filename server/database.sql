-- Placesi Database Schema
-- Run with: PGPASSWORD=lumina2026 psql -h localhost -U postgres -d placesi -f database.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'owner',
  agency_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phone VARCHAR(50),
  website VARCHAR(255),
  logo VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  detailed_description TEXT,
  price DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'TTD',
  listing_type VARCHAR(50) NOT NULL, -- 'sale', 'rent', 'short_term'
  property_type VARCHAR(50) NOT NULL, -- 'House', 'Apartment', 'Villa', etc.
  location VARCHAR(500),
  location_type VARCHAR(50), -- 'trinidad', 'tobago'
  region VARCHAR(100),
  region_description TEXT,
  address TEXT,
  beds INTEGER,
  baths INTEGER,
  sqft INTEGER,
  lot_size INTEGER,
  parking INTEGER,
  maintenance DECIMAL(10,2),
  year_built INTEGER,
  images TEXT[],
  features TEXT[],
  amenities TEXT[],
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status VARCHAR(50) DEFAULT 'active',
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  logo VARCHAR(500),
  services TEXT[],
  areas TEXT[],
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plan VARCHAR(50) NOT NULL,
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'TTD',
  status VARCHAR(50) DEFAULT 'active',
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Parent/Student links (for student accounts)
CREATE TABLE IF NOT EXISTS parent_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  parent_email VARCHAR(255) NOT NULL,
  relationship VARCHAR(50),
  token VARCHAR(255) UNIQUE,
  accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Saved/Favorited properties
CREATE TABLE IF NOT EXISTS property_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_properties_user ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_location_type ON properties(location_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
