import type { PropertyCategory, PropertyGeneralType, PropertyStyle } from './database.types';

export interface PropertyTypeOption {
  value: string;
  label: string;
  category?: PropertyCategory;
}

export const PROPERTY_CATEGORIES: PropertyTypeOption[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
];

export const PROPERTY_GENERAL_TYPES_BUY: PropertyTypeOption[] = [
  { value: 'agricultural', label: 'Agricultural', category: 'buy' },
  { value: 'commercial', label: 'Commercial', category: 'buy' },
  { value: 'residential', label: 'Residential', category: 'buy' },
];

export const PROPERTY_GENERAL_TYPES_RENT: PropertyTypeOption[] = [
  { value: 'residential_rental', label: 'Residential Rental', category: 'rent' },
  { value: 'commercial_rental', label: 'Commercial Rental', category: 'rent' },
  { value: 'agricultural_rental', label: 'Agricultural Rental', category: 'rent' },
];

export const PROPERTY_STYLES_RESIDENTIAL: PropertyTypeOption[] = [
  { value: 'apartment_townhouse', label: 'Apartment / Townhouse' },
  { value: 'house', label: 'House' },
];

export const PROPERTY_STYLES_COMMERCIAL: PropertyTypeOption[] = [
  { value: 'office_building', label: 'Office Building' },
  { value: 'office_space', label: 'Office Space' },
  { value: 'venue', label: 'Venue' },
  { value: 'warehouse', label: 'Warehouse' },
];

export const PROPERTY_STYLES_AGRICULTURAL: PropertyTypeOption[] = [
  { value: 'land', label: 'Land' },
];

export function getGeneralTypesForCategory(category: PropertyCategory): PropertyTypeOption[] {
  return category === 'buy' ? PROPERTY_GENERAL_TYPES_BUY : PROPERTY_GENERAL_TYPES_RENT;
}

export function getStylesForGeneralType(generalType: PropertyGeneralType): PropertyTypeOption[] {
  if (generalType === 'residential' || generalType === 'residential_rental') {
    return PROPERTY_STYLES_RESIDENTIAL;
  } else if (generalType === 'commercial' || generalType === 'commercial_rental') {
    return PROPERTY_STYLES_COMMERCIAL;
  } else if (generalType === 'agricultural' || generalType === 'agricultural_rental') {
    return PROPERTY_STYLES_AGRICULTURAL;
  }
  return [];
}

export function formatPropertyType(
  category: PropertyCategory,
  generalType: PropertyGeneralType,
  style: PropertyStyle
): string {
  const categoryLabel = PROPERTY_CATEGORIES.find(c => c.value === category)?.label || '';
  const generalTypeLabel = [...PROPERTY_GENERAL_TYPES_BUY, ...PROPERTY_GENERAL_TYPES_RENT]
    .find(t => t.value === generalType)?.label || '';
  const styleLabel = [
    ...PROPERTY_STYLES_RESIDENTIAL,
    ...PROPERTY_STYLES_COMMERCIAL,
    ...PROPERTY_STYLES_AGRICULTURAL
  ].find(s => s.value === style)?.label || '';

  return `${styleLabel} - ${generalTypeLabel}`;
}

export function getPropertyCategoryFromListingType(listingType: string): PropertyCategory {
  return listingType === 'rent' ? 'rent' : 'buy';
}

export function getListingTypeFromCategory(category: PropertyCategory): string {
  return category === 'rent' ? 'rent' : 'sale';
}

export function isValidPropertyCombination(
  category: PropertyCategory,
  generalType: PropertyGeneralType,
  style: PropertyStyle
): boolean {
  if (category === 'buy' && generalType.includes('_rental')) {
    return false;
  }

  if (category === 'rent' && !generalType.includes('_rental')) {
    return false;
  }

  const validStyles = getStylesForGeneralType(generalType);
  return validStyles.some(s => s.value === style);
}
