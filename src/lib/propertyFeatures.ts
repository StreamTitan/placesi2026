import {
  Wind,
  Zap,
  Fence,
  Building2,
  Wifi,
  Briefcase,
  ChefHat,
  WashingMachine,
  Users,
  Home,
  Wrench,
  Package,
  Car,
  Armchair,
  PawPrint,
  TreePine,
  Shield,
  ShieldCheck,
  Sofa,
  Cpu,
  Box,
  Waves,
  Dumbbell,
  Droplets,
  Truck,
  DoorOpen,
  Accessibility,
  Clock,
  Flame,
  ArrowUpDown,
  Server,
  Store,
  MapPin,
  Factory,
  Award,
  Baby,
  Bolt,
  FileText,
  Bath,
  Warehouse,
  Sprout,
  Tractor,
  Mountain,
  Leaf,
  Receipt,
  type LucideIcon,
} from 'lucide-react';
import type { PropertyGeneralType } from './database.types';

export interface PropertyFeature {
  name: string;
  icon: LucideIcon;
  category: 'approvals' | 'comfort' | 'utilities' | 'security' | 'amenities' | 'space' | 'accessibility' | 'infrastructure' | 'facilities' | 'technology' | 'operational' | 'land_rights' | 'agricultural';
}

export const PROPERTY_FEATURES: PropertyFeature[] = [
  { name: 'T&C Approved', icon: Award, category: 'approvals' },
  { name: 'Air Conditioning', icon: Wind, category: 'comfort' },
  { name: 'Annex', icon: Building2, category: 'amenities' },
  { name: 'Attic', icon: Box, category: 'space' },
  { name: 'Backup Power', icon: Zap, category: 'utilities' },
  { name: 'Balcony', icon: Fence, category: 'space' },
  { name: 'Built-in Closets', icon: Package, category: 'space' },
  { name: 'Covered Garage', icon: Warehouse, category: 'amenities' },
  { name: 'Electricity', icon: Bolt, category: 'utilities' },
  { name: 'Elevator', icon: Building2, category: 'amenities' },
  { name: 'Elevator Access', icon: Building2, category: 'amenities' },
  { name: 'Freehold Land', icon: FileText, category: 'land_rights' },
  { name: 'Fully Fenced', icon: Fence, category: 'security' },
  { name: 'Fully Furnished', icon: Sofa, category: 'amenities' },
  { name: 'Gated Community', icon: Shield, category: 'security' },
  { name: 'Gated Compound', icon: Shield, category: 'security' },
  { name: 'High-speed Internet Ready', icon: Wifi, category: 'utilities' },
  { name: 'Home Office / Study', icon: Briefcase, category: 'space' },
  { name: 'Internet Access', icon: Wifi, category: 'utilities' },
  { name: 'Kid Friendly', icon: Baby, category: 'amenities' },
  { name: 'Kitchen Appliances', icon: ChefHat, category: 'amenities' },
  { name: 'Laundry Area/Facility', icon: WashingMachine, category: 'space' },
  { name: 'Laundry Room', icon: WashingMachine, category: 'space' },
  { name: 'Leasehold Land', icon: Clock, category: 'land_rights' },
  { name: 'Lobby / Reception', icon: Users, category: 'amenities' },
  { name: 'Move in Ready', icon: Home, category: 'amenities' },
  { name: 'Office', icon: Briefcase, category: 'space' },
  { name: 'On-site Maintenance / Management', icon: Wrench, category: 'amenities' },
  { name: 'Pantry', icon: Package, category: 'space' },
  { name: 'Parking on Compound', icon: Car, category: 'amenities' },
  { name: 'Patio', icon: Armchair, category: 'space' },
  { name: 'Pet-friendly Policy', icon: PawPrint, category: 'amenities' },
  { name: 'Playground / Park', icon: TreePine, category: 'amenities' },
  { name: 'Powder Room', icon: Bath, category: 'amenities' },
  { name: 'Remote Gate', icon: DoorOpen, category: 'security' },
  { name: 'Security Patrols', icon: ShieldCheck, category: 'security' },
  { name: 'Security System / Cameras / Alarm', icon: Shield, category: 'security' },
  { name: 'Semi Furnished', icon: Sofa, category: 'amenities' },
  { name: 'Shared Pool', icon: Waves, category: 'amenities' },
  { name: 'Smart Home System / Automation', icon: Cpu, category: 'utilities' },
  { name: 'Unfurnished', icon: Box, category: 'amenities' },
  { name: 'Storage Room', icon: Box, category: 'space' },
  { name: 'Swimming Pool', icon: Waves, category: 'amenities' },
  { name: 'Tennis / Basketball Court', icon: Dumbbell, category: 'amenities' },
  { name: 'Utilities Included', icon: Receipt, category: 'utilities' },
  { name: 'Visitor Parking', icon: Car, category: 'amenities' },
  { name: 'Walk-in Closet(s)', icon: Package, category: 'space' },
  { name: 'Water Heater', icon: Droplets, category: 'utilities' },
  { name: 'Water Pump', icon: Droplets, category: 'utilities' },
  { name: 'Water Tank', icon: Droplets, category: 'utilities' },
  { name: 'Wheelchair Access', icon: Accessibility, category: 'accessibility' },
];

export const COMMERCIAL_FEATURES: PropertyFeature[] = [
  { name: '24/7 Access', icon: Clock, category: 'operational' },
  { name: 'ADA Compliant / Handicap Accessible', icon: Accessibility, category: 'accessibility' },
  { name: 'Annex', icon: Building2, category: 'facilities' },
  { name: 'Attic', icon: Box, category: 'space' },
  { name: 'Backup Generator', icon: Zap, category: 'utilities' },
  { name: 'Backup Power', icon: Zap, category: 'utilities' },
  { name: 'Central Air Conditioning', icon: Wind, category: 'infrastructure' },
  { name: 'Commercial Kitchen', icon: ChefHat, category: 'facilities' },
  { name: 'Conference Rooms', icon: Users, category: 'facilities' },
  { name: 'Covered Garage', icon: Warehouse, category: 'infrastructure' },
  { name: 'Dedicated Parking Spaces', icon: Car, category: 'infrastructure' },
  { name: 'Elevator Access', icon: Building2, category: 'accessibility' },
  { name: 'Fire Suppression System', icon: Flame, category: 'security' },
  { name: 'Freight Elevator', icon: ArrowUpDown, category: 'infrastructure' },
  { name: 'Fully Fenced', icon: Fence, category: 'security' },
  { name: 'High Ceilings', icon: ArrowUpDown, category: 'space' },
  { name: 'High-speed Internet / Fiber Ready', icon: Wifi, category: 'technology' },
  { name: 'HVAC System', icon: Wind, category: 'infrastructure' },
  { name: 'Internet Access', icon: Wifi, category: 'technology' },
  { name: 'Loading Dock', icon: Truck, category: 'infrastructure' },
  { name: 'Lobby / Reception Area', icon: Users, category: 'facilities' },
  { name: 'Multiple Entrances', icon: DoorOpen, category: 'accessibility' },
  { name: 'Office', icon: Briefcase, category: 'space' },
  { name: 'On-site Management', icon: Wrench, category: 'operational' },
  { name: 'Open Floor Plan', icon: Box, category: 'space' },
  { name: 'Retail Frontage', icon: Store, category: 'facilities' },
  { name: 'Remote Gate', icon: DoorOpen, category: 'security' },
  { name: 'Security Patrols', icon: ShieldCheck, category: 'security' },
  { name: 'Security System / Cameras', icon: Shield, category: 'security' },
  { name: 'Server Room / Data Center Ready', icon: Server, category: 'technology' },
  { name: 'Signage Rights', icon: MapPin, category: 'operational' },
  { name: 'Smart Building System', icon: Cpu, category: 'technology' },
  { name: 'Storage / Warehouse Space', icon: Box, category: 'space' },
  { name: 'Unfurnished', icon: Box, category: 'facilities' },
  { name: 'Visitor Parking', icon: Car, category: 'infrastructure' },
  { name: 'Warehouse Facilities', icon: Factory, category: 'facilities' },
  { name: 'Water Tank', icon: Droplets, category: 'utilities' },
  { name: 'Wheelchair Access', icon: Accessibility, category: 'accessibility' },
];

export const AGRICULTURAL_FEATURES: PropertyFeature[] = [
  { name: 'Access Road', icon: MapPin, category: 'infrastructure' },
  { name: 'Cleared Land', icon: Mountain, category: 'agricultural' },
  { name: 'Creek / Stream', icon: Waves, category: 'agricultural' },
  { name: 'Crop History Available', icon: Leaf, category: 'agricultural' },
  { name: 'Electricity Access', icon: Bolt, category: 'utilities' },
  { name: 'Farming Equipment Included', icon: Tractor, category: 'agricultural' },
  { name: 'Fertile Soil', icon: Sprout, category: 'agricultural' },
  { name: 'Flat Terrain', icon: Mountain, category: 'agricultural' },
  { name: 'Freehold Land', icon: FileText, category: 'land_rights' },
  { name: 'Fully Fenced', icon: Fence, category: 'security' },
  { name: 'Fruit Trees', icon: TreePine, category: 'agricultural' },
  { name: 'Irrigation System', icon: Droplets, category: 'agricultural' },
  { name: 'Leasehold Land', icon: Clock, category: 'land_rights' },
  { name: 'Natural Water Source', icon: Waves, category: 'agricultural' },
  { name: 'Partially Cleared', icon: Mountain, category: 'agricultural' },
  { name: 'Perimeter Fencing', icon: Fence, category: 'security' },
  { name: 'River / Pond Access', icon: Waves, category: 'agricultural' },
  { name: 'Road Frontage', icon: MapPin, category: 'infrastructure' },
  { name: 'Shed / Storage', icon: Warehouse, category: 'agricultural' },
  { name: 'Sloped Terrain', icon: Mountain, category: 'agricultural' },
  { name: 'Suitable for Cocoa', icon: Leaf, category: 'agricultural' },
  { name: 'Suitable for Crops', icon: Sprout, category: 'agricultural' },
  { name: 'Suitable for Livestock', icon: Tractor, category: 'agricultural' },
  { name: 'T&C Approved', icon: Award, category: 'approvals' },
  { name: 'Water Access', icon: Droplets, category: 'utilities' },
  { name: 'Water Rights', icon: Droplets, category: 'land_rights' },
  { name: 'Water Tank', icon: Droplets, category: 'utilities' },
  { name: 'Well / Borehole', icon: Droplets, category: 'utilities' },
  { name: 'Wooded Area', icon: TreePine, category: 'agricultural' },
  { name: 'Zoned Agricultural', icon: Award, category: 'approvals' },
];

export const LAND_FEATURES: PropertyFeature[] = [
  { name: 'Access Road', icon: MapPin, category: 'infrastructure' },
  { name: 'Cleared Land', icon: Mountain, category: 'land_rights' },
  { name: 'Creek / Stream', icon: Waves, category: 'land_rights' },
  { name: 'Electricity Access', icon: Bolt, category: 'utilities' },
  { name: 'Flat Terrain', icon: Mountain, category: 'land_rights' },
  { name: 'Freehold Land', icon: FileText, category: 'land_rights' },
  { name: 'Fully Fenced', icon: Fence, category: 'security' },
  { name: 'Leasehold Land', icon: Clock, category: 'land_rights' },
  { name: 'Natural Water Source', icon: Waves, category: 'utilities' },
  { name: 'Partially Cleared', icon: Mountain, category: 'land_rights' },
  { name: 'Perimeter Fencing', icon: Fence, category: 'security' },
  { name: 'River / Pond Access', icon: Waves, category: 'land_rights' },
  { name: 'Road Frontage', icon: MapPin, category: 'infrastructure' },
  { name: 'Sloped Terrain', icon: Mountain, category: 'land_rights' },
  { name: 'T&C Approved', icon: Award, category: 'approvals' },
  { name: 'Water Access', icon: Droplets, category: 'utilities' },
  { name: 'Water Rights', icon: Droplets, category: 'land_rights' },
  { name: 'Well / Borehole', icon: Droplets, category: 'utilities' },
  { name: 'Wooded Area', icon: TreePine, category: 'land_rights' },
];

export function isCommercialPropertyType(propertyGeneralType?: string): boolean {
  return propertyGeneralType === 'commercial' || propertyGeneralType === 'commercial_rental';
}

export function isAgriculturalPropertyType(propertyGeneralType?: string): boolean {
  return propertyGeneralType === 'agricultural' || propertyGeneralType === 'agricultural_rental';
}

export function isLandPropertyType(propertyGeneralType?: string, propertyStyle?: string): boolean {
  return propertyStyle === 'land';
}

export function getFeaturesForPropertyType(propertyGeneralType?: string, propertyStyle?: string): PropertyFeature[] {
  if (isLandPropertyType(propertyGeneralType, propertyStyle)) {
    return LAND_FEATURES;
  }
  if (isAgriculturalPropertyType(propertyGeneralType)) {
    return AGRICULTURAL_FEATURES;
  }
  if (isCommercialPropertyType(propertyGeneralType)) {
    return COMMERCIAL_FEATURES;
  }
  return PROPERTY_FEATURES;
}

export function getFeaturesByCategory(propertyGeneralType?: string, propertyStyle?: string) {
  const features = getFeaturesForPropertyType(propertyGeneralType, propertyStyle);
  const categoryOrder = ['approvals', 'land_rights', 'agricultural', 'amenities', 'space', 'comfort', 'utilities', 'security', 'accessibility', 'infrastructure', 'facilities', 'technology', 'operational'];

  const grouped = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, PropertyFeature[]>);

  const orderedResult: Record<string, PropertyFeature[]> = {};
  categoryOrder.forEach(category => {
    if (grouped[category]) {
      orderedResult[category] = grouped[category];
    }
  });

  Object.keys(grouped).forEach(category => {
    if (!orderedResult[category]) {
      orderedResult[category] = grouped[category];
    }
  });

  return orderedResult;
}

export function getFeatureIcon(featureName: string, propertyGeneralType?: string): LucideIcon | null {
  const features = getFeaturesForPropertyType(propertyGeneralType);
  const feature = features.find(f => f.name === featureName);
  if (feature) return feature.icon;

  const allFeatures = [...PROPERTY_FEATURES, ...COMMERCIAL_FEATURES, ...AGRICULTURAL_FEATURES, ...LAND_FEATURES];
  const fallbackFeature = allFeatures.find(f => f.name === featureName);
  return fallbackFeature ? fallbackFeature.icon : null;
}
