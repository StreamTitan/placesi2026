import { supabase } from '../lib/supabase';
import { TRINIDAD_TOBAGO_LOCATIONS } from '../lib/locations';

export interface AreaInformation {
  region: string;
  area_name: string;
  description: string;
  property_market_overview?: string;
  average_property_price_buy?: number;
  average_property_price_rent?: number;
  safety_rating?: number;
  family_friendly_rating?: number;
  business_friendly_rating?: number;
  lifestyle_description?: string;
  transportation_access?: string;
  notable_features?: string[];
  schools_overview?: string;
  shopping_overview?: string;
  medical_facilities_overview?: string;
}

export interface AreaAmenity {
  amenity_type: 'school' | 'hospital' | 'shopping' | 'park' | 'transportation' | 'bank' | 'restaurant' | 'gym' | 'other';
  name: string;
  description?: string;
  address?: string;
  rating?: number;
  distance_description?: string;
}

export interface LocationInsight {
  region: string;
  area_name?: string;
  insight_type: 'general' | 'schools' | 'shopping' | 'medical' | 'transportation' | 'lifestyle' | 'investment' | 'family' | 'business';
  content: string;
  keywords?: string[];
  priority: number;
}

const AREA_KNOWLEDGE_BASE: Record<string, AreaInformation> = {
  'Westmoorings': {
    region: 'North West',
    area_name: 'Westmoorings',
    description: 'Westmoorings is one of Trinidad\'s most prestigious and upscale residential communities, known for its modern infrastructure, security, and proximity to Port of Spain.',
    property_market_overview: 'High-end market with premium properties. Prices range from $2M to $15M for houses, and $3,500 to $12,000 per month for rentals.',
    average_property_price_buy: 5000000,
    average_property_price_rent: 7000,
    safety_rating: 4.5,
    family_friendly_rating: 5,
    business_friendly_rating: 4,
    lifestyle_description: 'Upscale suburban living with modern amenities, excellent security, and close to shopping and dining.',
    transportation_access: 'Easy access to major highways, close to Port of Spain, Piarco Airport within 30-40 minutes.',
    notable_features: ['Westmoorings Mall', 'MovieTowne', 'Excellent schools', 'Gated communities', '24/7 security'],
    schools_overview: 'Home to excellent private and public schools including Westmoorings Secondary, St. Andrew\'s Anglican School, and several prep schools.',
    shopping_overview: 'Westmoorings Mall, MovieTowne, and numerous restaurants and cafes within walking distance.',
    medical_facilities_overview: 'Close to St. Clair Medical Centre and Westshore Medical facilities.'
  },
  'Maraval': {
    region: 'North West',
    area_name: 'Maraval',
    description: 'Maraval is a sought-after area offering a perfect blend of urban convenience and suburban tranquility, nestled in the hills with beautiful views.',
    property_market_overview: 'Mid to high-end market. Houses range from $1.5M to $8M, rentals from $4,000 to $10,000 per month.',
    average_property_price_buy: 3500000,
    average_property_price_rent: 6000,
    safety_rating: 4,
    family_friendly_rating: 4.5,
    business_friendly_rating: 3.5,
    lifestyle_description: 'Quiet residential area with hillside properties, close to city amenities while maintaining a peaceful atmosphere.',
    transportation_access: 'Well-connected to Port of Spain via Saddle Road and Long Circular Road. Easy highway access.',
    notable_features: ['Maraval RC School', 'St. Andrew\'s Golf Course', 'Hillside views', 'Proximity to city'],
    schools_overview: 'Maraval RC School, Fatima College nearby, and several private schools in the area.',
    shopping_overview: 'Local shops, supermarkets, and close to Port of Spain shopping districts.',
    medical_facilities_overview: 'Access to St. Clair Medical Centre and private clinics.'
  },
  'Trincity': {
    region: 'North East',
    area_name: 'Trincity',
    description: 'Trincity is a rapidly growing family-friendly area known for excellent shopping facilities, schools, and modern residential developments.',
    property_market_overview: 'Mid-range market with growing demand. Houses from $1.8M to $5M, rentals $3,500 to $8,000 per month.',
    average_property_price_buy: 2800000,
    average_property_price_rent: 5000,
    safety_rating: 4,
    family_friendly_rating: 5,
    business_friendly_rating: 4,
    lifestyle_description: 'Modern suburban living perfect for families, with shopping, schools, and recreational facilities.',
    transportation_access: 'Located on the Churchill-Roosevelt Highway, excellent access to east-west corridor, close to Piarco Airport.',
    notable_features: ['Trincity Mall', 'MovieTowne', 'Excellent schools', 'Modern developments', 'Family-friendly'],
    schools_overview: 'Home to Providence Girls\' Catholic School, Valsayn Government Primary, and several private institutions.',
    shopping_overview: 'Trincity Mall with major retailers, MovieTowne, restaurants, and entertainment facilities.',
    medical_facilities_overview: 'Medical facilities in Trincity Mall area and close to Mt. Hope Medical Complex.'
  },
  'St. Augustine': {
    region: 'North East',
    area_name: 'St. Augustine',
    description: 'St. Augustine is a vibrant university town, home to the University of the West Indies (UWI), offering a mix of residential and student accommodation.',
    property_market_overview: 'Mixed market with student and family properties. Houses $1.5M to $4M, rentals $2,500 to $7,000 per month.',
    average_property_price_buy: 2200000,
    average_property_price_rent: 4000,
    safety_rating: 3.5,
    family_friendly_rating: 4,
    business_friendly_rating: 3,
    lifestyle_description: 'University town atmosphere with diverse community, cultural activities, and student life.',
    transportation_access: 'Well-connected via Eastern Main Road and Churchill-Roosevelt Highway.',
    notable_features: ['UWI', 'St. Augustine Market', 'Cultural diversity', 'Student community'],
    schools_overview: 'UWI main campus, St. Augustine Secondary, and several primary schools.',
    shopping_overview: 'Local markets, shopping plazas, and close to Trincity Mall.',
    medical_facilities_overview: 'Eric Williams Medical Sciences Complex (Mt. Hope Hospital) nearby.'
  },
  'Chaguanas': {
    region: 'Central',
    area_name: 'Chaguanas',
    description: 'Chaguanas is Trinidad\'s largest borough and fastest-growing commercial hub, offering excellent value and central location.',
    property_market_overview: 'Affordable to mid-range market. Houses $1.2M to $4M, rentals $2,500 to $6,000 per month.',
    average_property_price_buy: 2000000,
    average_property_price_rent: 3500,
    safety_rating: 3.5,
    family_friendly_rating: 4,
    business_friendly_rating: 5,
    lifestyle_description: 'Bustling commercial center with growing residential areas, excellent shopping and business opportunities.',
    transportation_access: 'Central location on Uriah Butler Highway, easy access to both north and south Trinidad.',
    notable_features: ['Chaguanas Market', 'Movie Towne', 'Price Plaza', 'Central location', 'Growing economy'],
    schools_overview: 'Numerous primary and secondary schools including Chaguanas North Secondary and several denominational schools.',
    shopping_overview: 'Mid Centre Mall, Chaguanas Market, Price Plaza, and extensive retail options.',
    medical_facilities_overview: 'Chaguanas Health Facility and several private medical centers.'
  },
  'Diego Martin': {
    region: 'North West',
    area_name: 'Diego Martin',
    description: 'Diego Martin offers beautiful hillside properties with stunning views, ranging from affordable to luxury homes.',
    property_market_overview: 'Wide range from affordable to luxury. Houses $1M to $6M, rentals $2,500 to $8,000 per month.',
    average_property_price_buy: 2500000,
    average_property_price_rent: 4500,
    safety_rating: 4,
    family_friendly_rating: 4.5,
    business_friendly_rating: 3,
    lifestyle_description: 'Hillside living with valley and mountain views, quiet residential neighborhoods.',
    transportation_access: 'Connected via Diego Martin Main Road and Western Main Road, close to Port of Spain.',
    notable_features: ['Blue Basin', 'Hillside views', 'Valley properties', 'Quiet neighborhoods'],
    schools_overview: 'Diego Martin RC, several private schools, close to St. Andrew\'s schools.',
    shopping_overview: 'West Mall, local shopping plazas, and markets.',
    medical_facilities_overview: 'Diego Martin Health Centre and private clinics.'
  },
  'San Fernando': {
    region: 'South West',
    area_name: 'San Fernando',
    description: 'San Fernando is the business capital of South Trinidad, offering commercial and residential opportunities with a vibrant city atmosphere.',
    property_market_overview: 'Mixed market. Houses $1.5M to $5M, rentals $3,000 to $7,000 per month.',
    average_property_price_buy: 2300000,
    average_property_price_rent: 4000,
    safety_rating: 3.5,
    family_friendly_rating: 4,
    business_friendly_rating: 5,
    lifestyle_description: 'City living with business opportunities, cultural activities, and southern hospitality.',
    transportation_access: 'Central to South Trinidad, connected via major highways.',
    notable_features: ['San Fernando Hill', 'Gulf City Mall', 'Business district', 'Cultural center'],
    schools_overview: 'Naparima College, Naparima Girls\' High School, Presentation College, and many others.',
    shopping_overview: 'Gulf City Mall, San Fernando High Street, and various shopping centers.',
    medical_facilities_overview: 'San Fernando General Hospital and numerous private facilities.'
  },
  'Valsayn': {
    region: 'North East',
    area_name: 'Valsayn',
    description: 'Valsayn is a peaceful residential area popular with families, offering modern housing and excellent schools.',
    property_market_overview: 'Mid-range family market. Houses $1.8M to $4.5M, rentals $3,500 to $7,000 per month.',
    average_property_price_buy: 2600000,
    average_property_price_rent: 4800,
    safety_rating: 4,
    family_friendly_rating: 5,
    business_friendly_rating: 3.5,
    lifestyle_description: 'Quiet residential living perfect for families with children, close to schools and amenities.',
    transportation_access: 'Well-connected via Churchill-Roosevelt Highway and Eastern Main Road.',
    notable_features: ['Family-friendly', 'Gated communities', 'Excellent schools', 'Modern developments'],
    schools_overview: 'Valsayn Government Primary, Providence Girls\' Catholic, close to St. Augustine schools.',
    shopping_overview: 'Nearby Trincity Mall, local supermarkets and plazas.',
    medical_facilities_overview: 'Close to Mt. Hope Medical Complex and private clinics.'
  },
  'Couva': {
    region: 'Central',
    area_name: 'Couva',
    description: 'Couva is a growing area in Central Trinidad with excellent access to Point Lisas Industrial Estate and central amenities.',
    property_market_overview: 'Affordable market. Houses $1M to $3M, rentals $2,000 to $5,000 per month.',
    average_property_price_buy: 1800000,
    average_property_price_rent: 3000,
    safety_rating: 3.5,
    family_friendly_rating: 4,
    business_friendly_rating: 4.5,
    lifestyle_description: 'Central living with access to industrial opportunities, growing residential areas.',
    transportation_access: 'Located on Uriah Butler Highway and Southern Main Road.',
    notable_features: ['Point Lisas nearby', 'Central location', 'Affordable housing', 'Growing area'],
    schools_overview: 'Couva East Secondary, Couva Anglican School, and several primary schools.',
    shopping_overview: 'Local markets and close to Chaguanas shopping centers.',
    medical_facilities_overview: 'Couva District Health Facility and private clinics.'
  },
  'Arouca': {
    region: 'North East',
    area_name: 'Arouca',
    description: 'Arouca is an established residential area offering affordable housing with good access to the east-west corridor.',
    property_market_overview: 'Affordable market. Houses $1.2M to $3.5M, rentals $2,500 to $5,500 per month.',
    average_property_price_buy: 1900000,
    average_property_price_rent: 3500,
    safety_rating: 3.5,
    family_friendly_rating: 4,
    business_friendly_rating: 3.5,
    lifestyle_description: 'Established residential community with local amenities and easy highway access.',
    transportation_access: 'Located on Churchill-Roosevelt Highway with good public transport.',
    notable_features: ['Affordable housing', 'Established community', 'Highway access'],
    schools_overview: 'Arouca RC School, Arouca Government Primary, and nearby secondary schools.',
    shopping_overview: 'Local shopping plazas, markets, and close to Trincity Mall.',
    medical_facilities_overview: 'Arouca Health Centre and nearby facilities.'
  }
};

export async function getAreaInformation(areaName: string): Promise<AreaInformation | null> {
  try {
    const { data, error } = await supabase
      .from('area_information')
      .select('*')
      .ilike('area_name', areaName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching area information:', error);
    }

    if (data) {
      return data as AreaInformation;
    }

    return AREA_KNOWLEDGE_BASE[areaName] || null;
  } catch (error) {
    console.error('Error in getAreaInformation:', error);
    return AREA_KNOWLEDGE_BASE[areaName] || null;
  }
}

export async function getAreaAmenities(areaName: string, amenityType?: string): Promise<AreaAmenity[]> {
  try {
    const { data: areaInfo } = await supabase
      .from('area_information')
      .select('id')
      .ilike('area_name', areaName)
      .maybeSingle();

    if (!areaInfo) {
      return getDefaultAmenities(areaName, amenityType);
    }

    let query = supabase
      .from('area_amenities')
      .select('*')
      .eq('area_info_id', areaInfo.id);

    if (amenityType) {
      query = query.eq('amenity_type', amenityType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching amenities:', error);
      return getDefaultAmenities(areaName, amenityType);
    }

    return (data || []) as AreaAmenity[];
  } catch (error) {
    console.error('Error in getAreaAmenities:', error);
    return getDefaultAmenities(areaName, amenityType);
  }
}

function getDefaultAmenities(areaName: string, amenityType?: string): AreaAmenity[] {
  const areaInfo = AREA_KNOWLEDGE_BASE[areaName];
  if (!areaInfo) return [];

  const amenities: AreaAmenity[] = [];

  if (!amenityType || amenityType === 'school') {
    if (areaInfo.schools_overview) {
      amenities.push({
        amenity_type: 'school',
        name: 'Schools in area',
        description: areaInfo.schools_overview,
        distance_description: 'Various schools throughout the area'
      });
    }
  }

  if (!amenityType || amenityType === 'shopping') {
    if (areaInfo.shopping_overview) {
      amenities.push({
        amenity_type: 'shopping',
        name: 'Shopping facilities',
        description: areaInfo.shopping_overview,
        distance_description: 'Multiple shopping options available'
      });
    }
  }

  if (!amenityType || amenityType === 'hospital') {
    if (areaInfo.medical_facilities_overview) {
      amenities.push({
        amenity_type: 'hospital',
        name: 'Medical facilities',
        description: areaInfo.medical_facilities_overview,
        distance_description: 'Healthcare services available'
      });
    }
  }

  return amenities;
}

export async function getLocationInsights(region?: string, areaName?: string, insightType?: string): Promise<LocationInsight[]> {
  try {
    let query = supabase.from('location_insights').select('*');

    if (region) {
      query = query.eq('region', region);
    }

    if (areaName) {
      query = query.eq('area_name', areaName);
    }

    if (insightType) {
      query = query.eq('insight_type', insightType);
    }

    query = query.order('priority', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching insights:', error);
      return [];
    }

    return (data || []) as LocationInsight[];
  } catch (error) {
    console.error('Error in getLocationInsights:', error);
    return [];
  }
}

export function generateAreaResponse(areaName: string): string {
  const areaInfo = AREA_KNOWLEDGE_BASE[areaName];

  if (!areaInfo) {
    const normalizedName = areaName.toLowerCase();
    for (const [region, data] of Object.entries(TRINIDAD_TOBAGO_LOCATIONS)) {
      if (data.areas.some(area => area.toLowerCase() === normalizedName)) {
        return `${areaName} is located in the ${region} region of Trinidad and Tobago. It's a residential area with various property options available. Would you like to see properties in this area?`;
      }
    }
    return `I don't have detailed information about ${areaName} yet, but I can help you search for properties in that area. What type of property are you looking for?`;
  }

  let response = `${areaInfo.description}\n\n`;

  if (areaInfo.property_market_overview) {
    response += `**Property Market**: ${areaInfo.property_market_overview}\n\n`;
  }

  if (areaInfo.schools_overview) {
    response += `**Schools**: ${areaInfo.schools_overview}\n\n`;
  }

  if (areaInfo.shopping_overview) {
    response += `**Shopping & Amenities**: ${areaInfo.shopping_overview}\n\n`;
  }

  if (areaInfo.transportation_access) {
    response += `**Transportation**: ${areaInfo.transportation_access}\n\n`;
  }

  if (areaInfo.lifestyle_description) {
    response += `**Lifestyle**: ${areaInfo.lifestyle_description}\n\n`;
  }

  if (areaInfo.notable_features && areaInfo.notable_features.length > 0) {
    response += `**Notable Features**: ${areaInfo.notable_features.join(', ')}\n\n`;
  }

  response += `Would you like to see available properties in ${areaName}?`;

  return response;
}

export function generateProximityResponse(areaName: string, proximityType: 'schools' | 'shopping' | 'medical' | 'transportation'): string {
  const areaInfo = AREA_KNOWLEDGE_BASE[areaName];

  if (!areaInfo) {
    return `I don't have specific information about ${proximityType} near ${areaName}. However, I can help you find properties in the area. What else would you like to know?`;
  }

  switch (proximityType) {
    case 'schools':
      return areaInfo.schools_overview || `${areaName} has various schools in the area. I'd recommend viewing specific properties to see which schools are closest.`;

    case 'shopping':
      return areaInfo.shopping_overview || `${areaName} has shopping facilities available. Let me show you properties in the area so you can see proximity details.`;

    case 'medical':
      return areaInfo.medical_facilities_overview || `${areaName} has access to medical facilities. Would you like to see properties in this area?`;

    case 'transportation':
      return areaInfo.transportation_access || `${areaName} has good transportation access. Let me help you find properties in this area.`;

    default:
      return `${areaName} is a great area with various amenities. Would you like to see available properties?`;
  }
}

export async function searchAreasByAmenity(amenityType: string, searchTerm?: string): Promise<string[]> {
  const areas: string[] = [];

  for (const [areaName, info] of Object.entries(AREA_KNOWLEDGE_BASE)) {
    let hasAmenity = false;

    switch (amenityType.toLowerCase()) {
      case 'school':
      case 'schools':
        if (info.schools_overview && (!searchTerm || info.schools_overview.toLowerCase().includes(searchTerm.toLowerCase()))) {
          hasAmenity = true;
        }
        break;

      case 'shopping':
      case 'mall':
        if (info.shopping_overview && (!searchTerm || info.shopping_overview.toLowerCase().includes(searchTerm.toLowerCase()))) {
          hasAmenity = true;
        }
        break;

      case 'hospital':
      case 'medical':
      case 'healthcare':
        if (info.medical_facilities_overview && (!searchTerm || info.medical_facilities_overview.toLowerCase().includes(searchTerm.toLowerCase()))) {
          hasAmenity = true;
        }
        break;
    }

    if (hasAmenity) {
      areas.push(areaName);
    }
  }

  return areas;
}
