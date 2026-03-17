import { getAllAreas, findRegionByArea, REGIONS } from '../lib/locations';
import { PROPERTY_FEATURES, COMMERCIAL_FEATURES, AGRICULTURAL_FEATURES } from '../lib/propertyFeatures';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PropertySearchCriteria {
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minSizeSqft?: number;
  maxSizeSqft?: number;
  minLotSizeSqft?: number;
  maxLotSizeSqft?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  propertyType?: string;
  propertyCategory?: 'buy' | 'rent';
  propertyGeneralType?: string;
  propertyStyle?: string;
  city?: string;
  region?: string;
  area?: string;
  amenities?: string[];
  features?: string[];
  searchText?: string;
  listingType?: string;
  isNegotiable?: boolean;
  agentName?: string;
  agentId?: string;
  agencyName?: string;
  agencyId?: string;
  proximityQuery?: {
    type: 'schools' | 'shopping' | 'medical' | 'transportation' | 'general';
    searchTerm?: string;
  };
  isAreaInfoQuery?: boolean;
}

export interface ContractorSearchCriteria {
  category?: string;
  categories?: string[];
  serviceArea?: string;
  region?: string;
  city?: string;
  companyName?: string;
  searchText?: string;
  residentialOrCommercial?: 'residential' | 'commercial' | 'both';
  minYearsInBusiness?: number;
  hasCertifications?: boolean;
  employeeCountRange?: 'small' | 'medium' | 'large';
  averageJobSize?: string;
}

const NON_REAL_ESTATE_KEYWORDS = [
  'weather', 'recipe', 'movie', 'music', 'sports', 'politics',
  'programming', 'code', 'science', 'history', 'restaurant', 'food', 'travel',
  'hotel', 'flight', 'car rental', 'population', 'capital', 'president', 'government',
  'covid', 'vaccine', 'doctor', 'hospital', 'school', 'university', 'education',
  'job', 'career', 'salary', 'stock market', 'cryptocurrency'
];

const CONTRACTOR_KEYWORDS = [
  'plumber', 'plumbing', 'electrician', 'electrical', 'carpenter', 'carpentry',
  'painter', 'painting', 'mason', 'masonry', 'roofer', 'roofing', 'landscaper',
  'landscaping', 'hvac', 'pool maintenance', 'cleaning', 'pest control', 'security',
  'handyman', 'interior designer', 'architect', 'general contractor', 'contractor',
  'service provider', 'home service', 'repair', 'maintenance', 'installation'
];

export function isNonRealEstateQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  const hasRealEstateKeywords = /\b(property|properties|house|home|apartment|condo|land|rent|buy|bedroom|bathroom|sqft|listing|agent|mortgage|real estate)\b/i.test(query);
  if (hasRealEstateKeywords) return false;

  const hasContractorKeywords = CONTRACTOR_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
  if (hasContractorKeywords) return false;

  return NON_REAL_ESTATE_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

export async function chatWithAI(messages: Message[], maxTokens: number = 300, timeoutMs: number = 5000): Promise<string> {
  try {
    const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];

    if (lastUserMessage && isNonRealEstateQuery(lastUserMessage.content)) {
      return "I am sorry, but my programming does not allow me to answer this question. I'm here to help you find properties in Trinidad and Tobago! How can I assist you with your property search today?";
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('AI_TIMEOUT');
      }
      throw error;
    }
  } catch (error) {
    console.error('Deepseek API error:', error);
    throw error;
  }
}

export function parseSearchQuery(userQuery: string, aiResponse: string): PropertySearchCriteria | null {
  console.log('🔎 === parseSearchQuery CALLED ===');
  console.log('🔎 User query:', userQuery);
  console.log('🔎 AI response:', aiResponse);

  const criteria: PropertySearchCriteria = {};

  const fullQuery = `${userQuery} ${aiResponse}`.toLowerCase();
  console.log('🔎 Full query (lowercase):', fullQuery);

  const bedroomMatch = userQuery.match(/(\d+)[\s-]*(bed|bedroom)/i) ||
                       aiResponse.match(/(\d+)[\s-]*(bed|bedroom)/i);
  if (bedroomMatch) {
    criteria.bedrooms = parseInt(bedroomMatch[1]);
  }

  const bathroomMatch = userQuery.match(/(\d+)[\s-]*(bath|bathroom)/i) ||
                        aiResponse.match(/(\d+)[\s-]*(bath|bathroom)/i);
  if (bathroomMatch) {
    criteria.bathrooms = parseInt(bathroomMatch[1]);
  }

  const priceMatch = userQuery.match(/(?:under|below|less than|max)\s*\$?\s*([\d,]+)(?:k|m)?/i) ||
                     aiResponse.match(/(?:under|below|less than|max)\s*\$?\s*([\d,]+)(?:k|m)?/i);
  if (priceMatch) {
    let price = parseFloat(priceMatch[1].replace(/,/g, ''));
    if (priceMatch[0].toLowerCase().includes('k')) price *= 1000;
    if (priceMatch[0].toLowerCase().includes('m')) price *= 1000000;
    criteria.maxPrice = price;
  }

  const minPriceMatch = userQuery.match(/(?:above|over|more than|min)\s*\$?\s*([\d,]+)(?:k|m)?/i) ||
                        aiResponse.match(/(?:above|over|more than|min)\s*\$?\s*([\d,]+)(?:k|m)?/i);
  if (minPriceMatch) {
    let price = parseFloat(minPriceMatch[1].replace(/,/g, ''));
    if (minPriceMatch[0].toLowerCase().includes('k')) price *= 1000;
    if (minPriceMatch[0].toLowerCase().includes('m')) price *= 1000000;
    criteria.minPrice = price;
  }

  // Parse square footage
  const sqftPatterns = [
    /(?:over|above|more than|at least|minimum)\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet|square foot|sf)/i,
    /(?:under|below|less than|max|maximum)\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet|square foot|sf)/i,
    /([\d,]+)\s*(?:to|-)\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet|square foot|sf)/i,
    /([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet|square foot|sf)/i
  ];

  for (const pattern of sqftPatterns) {
    const match = userQuery.match(pattern) || aiResponse.match(pattern);
    if (match) {
      if (match[0].toLowerCase().match(/over|above|more than|at least|minimum/)) {
        criteria.minSizeSqft = parseFloat(match[1].replace(/,/g, ''));
      } else if (match[0].toLowerCase().match(/under|below|less than|max|maximum/)) {
        criteria.maxSizeSqft = parseFloat(match[1].replace(/,/g, ''));
      } else if (match[2]) {
        criteria.minSizeSqft = parseFloat(match[1].replace(/,/g, ''));
        criteria.maxSizeSqft = parseFloat(match[2].replace(/,/g, ''));
      } else {
        criteria.minSizeSqft = parseFloat(match[1].replace(/,/g, ''));
      }
      break;
    }
  }

  // Parse lot size
  const lotSizePatterns = [
    /(?:lot size|lot|land size|land)\s*(?:of|:)?\s*(?:over|above|more than|at least)?\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet|sf)/i,
    /(?:over|above|more than|at least)\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet|sf)\s*lot/i,
    /(?:lot size|lot|land size|land)\s*(?:of|:)?\s*(?:under|below|less than)?\s*([\d,]+)\s*(?:sq\.?\s*ft|sqft|square feet|sf)/i
  ];

  for (const pattern of lotSizePatterns) {
    const match = userQuery.match(pattern) || aiResponse.match(pattern);
    if (match) {
      if (match[0].toLowerCase().match(/over|above|more than|at least/)) {
        criteria.minLotSizeSqft = parseFloat(match[1].replace(/,/g, ''));
      } else if (match[0].toLowerCase().match(/under|below|less than/)) {
        criteria.maxLotSizeSqft = parseFloat(match[1].replace(/,/g, ''));
      } else {
        criteria.minLotSizeSqft = parseFloat(match[1].replace(/,/g, ''));
      }
      break;
    }
  }

  // Parse year built
  const yearBuiltPatterns = [
    /(?:built|constructed)\s*(?:in|after|from|since)\s*(\d{4})/i,
    /(?:built|constructed)\s*(?:before|until)\s*(\d{4})/i,
    /(?:newer than|after|since)\s*(\d{4})/i,
    /(?:older than|before)\s*(\d{4})/i,
    /(\d{4})\s*or\s*newer/i,
    /(\d{4})\s*or\s*older/i,
    /(?:new|recent|modern|newly built|recently built)/i
  ];

  for (const pattern of yearBuiltPatterns) {
    const match = userQuery.match(pattern) || aiResponse.match(pattern);
    if (match) {
      if (match[0].toLowerCase().match(/new|recent|modern|newly|recently/)) {
        criteria.minYearBuilt = new Date().getFullYear() - 5;
      } else if (match[0].toLowerCase().match(/after|since|newer than|or newer/)) {
        criteria.minYearBuilt = parseInt(match[1]);
      } else if (match[0].toLowerCase().match(/before|until|older than|or older/)) {
        criteria.maxYearBuilt = parseInt(match[1]);
      } else {
        criteria.minYearBuilt = parseInt(match[1]);
      }
      break;
    }
  }

  const propertyStyles = [
    { keywords: ['apartments', 'apartment', 'townhouses', 'townhouse', 'flats', 'flat', 'condos', 'condo', 'condominium'], value: 'apartment_townhouse' },
    { keywords: ['houses', 'house', 'homes', 'home', 'villas', 'villa', 'bungalows', 'bungalow'], value: 'house' },
    { keywords: ['land', 'plot', 'plots', 'lot', 'lots', 'parcel'], value: 'land' },
    { keywords: ['office building', 'office buildings'], value: 'office_building' },
    { keywords: ['office space', 'office spaces', 'offices'], value: 'office_space' },
    { keywords: ['warehouse', 'warehouses'], value: 'warehouse' },
    { keywords: ['venue', 'venues'], value: 'venue' },
  ];

  for (const style of propertyStyles) {
    for (const keyword of style.keywords) {
      if (fullQuery.includes(keyword)) {
        criteria.propertyStyle = style.value;
        break;
      }
    }
    if (criteria.propertyStyle) break;
  }

  const rentalKeywords = ['rent', 'rental', 'rentals', 'renting', 'lease', 'leasing', 'for rent', 'to rent', 'to let'];
  const buyKeywords = ['buy', 'buying', 'purchase', 'purchasing', 'sale', 'for sale', 'to buy'];

  let hasRentalKeyword = false;
  let hasBuyKeyword = false;

  for (const keyword of rentalKeywords) {
    if (fullQuery.includes(keyword)) {
      hasRentalKeyword = true;
      break;
    }
  }

  for (const keyword of buyKeywords) {
    if (fullQuery.includes(keyword)) {
      hasBuyKeyword = true;
      break;
    }
  }

  if (hasRentalKeyword && !hasBuyKeyword) {
    criteria.propertyCategory = 'rent';
    criteria.listingType = 'rent';
  } else if (hasBuyKeyword && !hasRentalKeyword) {
    criteria.propertyCategory = 'buy';
    criteria.listingType = 'sale';
  }

  const generalTypes = [
    { keywords: ['agricultural', 'farm', 'farming'], value: 'agricultural' },
    { keywords: ['commercial', 'business', 'office'], value: 'commercial' },
    { keywords: ['residential', 'living'], value: 'residential' },
  ];

  for (const type of generalTypes) {
    for (const keyword of type.keywords) {
      if (fullQuery.includes(keyword)) {
        criteria.propertyGeneralType = type.value;
        break;
      }
    }
    if (criteria.propertyGeneralType) break;
  }

  if (!criteria.propertyGeneralType && criteria.propertyStyle) {
    if (criteria.propertyStyle === 'apartment_townhouse' || criteria.propertyStyle === 'house') {
      criteria.propertyGeneralType = 'residential';
    } else if (criteria.propertyStyle === 'office_building' || criteria.propertyStyle === 'office_space' ||
               criteria.propertyStyle === 'warehouse' || criteria.propertyStyle === 'venue') {
      criteria.propertyGeneralType = 'commercial';
    } else if (criteria.propertyStyle === 'land') {
      criteria.propertyGeneralType = 'agricultural';
    }
  }

  if (criteria.propertyCategory === 'rent' && criteria.propertyGeneralType && !criteria.propertyGeneralType.includes('_rental')) {
    criteria.propertyGeneralType = `${criteria.propertyGeneralType}_rental` as string;
  }

  const propertyTypes = ['townhouses', 'townhouse', 'apartments', 'apartment', 'commercial', 'condos', 'condo', 'houses', 'house', 'land'];
  for (const type of propertyTypes) {
    if (userQuery.toLowerCase().includes(type) || aiResponse.toLowerCase().includes(type)) {
      criteria.propertyType = type;
      break;
    }
  }

  const allAreas = getAllAreas();

  for (const area of allAreas) {
    if (fullQuery.includes(area.toLowerCase())) {
      criteria.city = area;
      const region = findRegionByArea(area);
      if (region) {
        criteria.region = region;
      }
      break;
    }
  }

  if (!criteria.city) {
    const cityPattern = /\b(?:in|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    const cityMatch = userQuery.match(cityPattern) || aiResponse.match(cityPattern);
    if (cityMatch) {
      const extractedCity = cityMatch[0].replace(/\b(?:in|at|near)\s+/i, '').trim();
      criteria.city = extractedCity;
    }
  }

  if (!criteria.region) {
    for (const region of REGIONS) {
      if (fullQuery.includes(region.toLowerCase())) {
        criteria.region = region;
        break;
      }
    }
  }

  if (fullQuery.includes('north west') || fullQuery.includes('northwest')) {
    criteria.region = 'North West';
  } else if (fullQuery.includes('north east') || fullQuery.includes('northeast')) {
    criteria.region = 'North East';
  } else if (fullQuery.includes('south west') || fullQuery.includes('southwest')) {
    criteria.region = 'South West';
  } else if (fullQuery.includes('south east') || fullQuery.includes('southeast')) {
    criteria.region = 'South East';
  }

  const matchedFeatures: string[] = [];
  const allFeatures = [...PROPERTY_FEATURES, ...COMMERCIAL_FEATURES, ...AGRICULTURAL_FEATURES];
  console.log('🔎 Total features to check:', allFeatures.length);

  const featureKeywords: Record<string, string[]> = {
    'T&C Approved': ['t&c', 't and c', 'tnc', 'approved', 'town and country', 'planning approved'],
    'Shared Pool': ['shared pool', 'common pool', 'communal pool', 'community pool'],
    'Kid Friendly': ['kid friendly', 'kids friendly', 'child friendly', 'children friendly', 'family friendly', 'family oriented'],
    'Fully Furnished': ['fully furnished', 'furnished', 'fully-furnished', 'completely furnished'],
    'Semi Furnished': ['semi furnished', 'semi-furnished', 'partially furnished', 'partly furnished'],
    'Unfurnished': ['unfurnished', 'no furniture', 'empty', 'bare', 'no furnishings', 'not furnished'],
    'Laundry Area/Facility': ['laundry area', 'laundry facility', 'laundry', 'washing area', 'laundry room'],
    'Internet Access': ['internet', 'wifi', 'wi-fi', 'broadband', 'internet access', 'internet connection', 'online', 'internet ready'],
    'High-speed Internet Ready': ['high-speed internet', 'fiber internet', 'fiber ready', 'high speed wifi', 'fast internet'],
    'Swimming Pool': ['pool', 'swimming pool', 'private pool', 'swim pool'],
    'Gated Community': ['gated', 'gated community', 'secure compound', 'secured community', 'security gate'],
    'Gated Compound': ['gated compound', 'compound', 'secured compound'],
    'Parking on Compound': ['parking', 'parking space', 'parking available', 'on-site parking'],
    'Covered Garage': ['covered garage', 'covered parking', 'garage', 'carport', 'enclosed parking'],
    'Visitor Parking': ['visitor parking', 'guest parking', 'visitor spaces'],
    'Air Conditioning': ['ac', 'air conditioning', 'air conditioned', 'a/c', 'central ac', 'air con'],
    'Central Air Conditioning': ['central air', 'central ac', 'central air conditioning'],
    'Pet-friendly Policy': ['pet friendly', 'pets allowed', 'allow pets', 'pets welcome', 'pet ok'],
    'Annex': ['annex', 'separate building', 'guest house', 'cottage', 'guest suite'],
    'Attic': ['attic', 'attic space', 'loft', 'upper storage', 'attic storage'],
    'Office': ['office', 'home office', 'study', 'work space', 'workspace', 'den'],
    'Home Office / Study': ['home office', 'study', 'office space', 'work from home'],
    'Fully Fenced': ['fully fenced', 'fenced', 'fenced yard', 'fenced property', 'fence', 'enclosed', 'perimeter fencing'],
    'Perimeter Fencing': ['perimeter fence', 'perimeter fencing', 'boundary fence'],
    'Remote Gate': ['remote gate', 'automatic gate', 'electric gate', 'remote access gate', 'gate remote', 'automated gate', 'remote control gate'],
    'Patio': ['patio', 'outdoor space', 'deck', 'terrace', 'veranda', 'outdoor area'],
    'Balcony': ['balcony', 'balconies', 'terrace'],
    'Powder Room': ['powder room', 'half bath', 'half bathroom', 'guest bathroom', 'guest bath', 'half-bath'],
    'Walk-in Closet(s)': ['walk-in closet', 'walk in closet', 'walkin closet', 'large closet', 'master closet'],
    'Built-in Closets': ['built-in closet', 'builtin closet', 'built in closet', 'fitted closets'],
    'Storage Room': ['storage room', 'storage space', 'storage area', 'store room'],
    'Pantry': ['pantry', 'kitchen pantry', 'food storage'],
    'Water Heater': ['water heater', 'hot water', 'water heating'],
    'Water Tank': ['water tank', 'storage tank', 'water storage'],
    'Water Pump': ['water pump', 'pressure pump', 'pump'],
    'Backup Power': ['backup power', 'generator', 'backup generator', 'emergency power'],
    'Backup Generator': ['backup generator', 'generator', 'standby generator', 'emergency generator'],
    'Security System / Cameras / Alarm': ['security system', 'cameras', 'alarm', 'cctv', 'surveillance', 'security cameras', 'alarm system'],
    'Security Patrols': ['security patrols', 'security patrol', 'patrolled', 'security guards'],
    'Move in Ready': ['move in ready', 'move-in ready', 'ready to move', 'turnkey', 'immediate occupancy'],
    'Kitchen Appliances': ['kitchen appliances', 'appliances', 'kitchen equipped', 'appliances included'],
    'Playground / Park': ['playground', 'park', 'play area', 'children\'s playground'],
    'Tennis / Basketball Court': ['tennis court', 'basketball court', 'sports court', 'court'],
    'Smart Home System / Automation': ['smart home', 'home automation', 'smart system', 'automated home'],
    'On-site Maintenance / Management': ['on-site maintenance', 'onsite management', 'property management', 'maintenance included'],
    'Elevator': ['elevator', 'lift'],
    'Elevator Access': ['elevator access', 'lift access', 'elevator available'],
    'Lobby / Reception': ['lobby', 'reception', 'reception area', 'entrance lobby'],
    'Irrigation System': ['irrigation', 'irrigated', 'watering system', 'sprinkler'],
    'Water Access': ['water access', 'water supply', 'water available'],
    'Water Rights': ['water rights', 'water allocation'],
    'Natural Water Source': ['natural water', 'spring', 'creek', 'stream', 'river'],
    'Suitable for Crops': ['crops', 'farming', 'cultivation', 'planting'],
    'Suitable for Cocoa': ['cocoa', 'cacao', 'chocolate'],
    'Suitable for Livestock': ['livestock', 'cattle', 'animals', 'grazing'],
    'Fertile Soil': ['fertile', 'rich soil', 'good soil'],
    'Cleared Land': ['cleared', 'cleared land', 'clean land'],
    'Fruit Trees': ['fruit trees', 'orchard', 'fruits'],
    'Road Frontage': ['road frontage', 'road access', 'paved access'],
    'Zoned Agricultural': ['zoned agricultural', 'agricultural zoning', 'ag zone'],
    'Loading Dock': ['loading dock', 'loading bay', 'truck dock'],
    'High Ceilings': ['high ceilings', 'tall ceilings', 'ceiling height'],
    'HVAC System': ['hvac', 'heating and cooling', 'climate control'],
    'Wheelchair Access': ['wheelchair access', 'wheelchair accessible', 'wheelchair friendly', 'handicap accessible', 'handicap access', 'disability access', 'accessible', 'ada compliant', 'ada accessible', 'mobility accessible'],
    'ADA Compliant / Handicap Accessible': ['ada compliant', 'ada accessible', 'handicap accessible', 'wheelchair accessible', 'disability access']
  };

  // Create a Set to track which keywords have already been matched
  const matchedKeywords = new Set<string>();

  // Sort features by the length of their longest keyword (most specific first)
  const featuresWithKeywordLengths = allFeatures.map(feature => {
    const keywords = featureKeywords[feature.name] || [feature.name.toLowerCase()];
    const maxKeywordLength = Math.max(...keywords.map(k => k.length));
    return { feature, keywords, maxKeywordLength };
  });

  // Sort by longest keyword first to prioritize more specific matches
  featuresWithKeywordLengths.sort((a, b) => b.maxKeywordLength - a.maxKeywordLength);

  for (const { feature, keywords } of featuresWithKeywordLengths) {
    const featureLower = feature.name.toLowerCase();
    let matched = false;
    let matchedKeyword = '';

    // Check if the exact feature name matches (if not already matched)
    if (fullQuery.includes(featureLower) && !matchedKeywords.has(featureLower)) {
      matched = true;
      matchedKeyword = featureLower;
    } else {
      // Check all keywords for this feature
      for (const keyword of keywords) {
        // Skip if this exact keyword was already matched by a more specific feature
        if (matchedKeywords.has(keyword)) {
          continue;
        }

        if (fullQuery.includes(keyword)) {
          // Check if any already-matched keyword contains this keyword as a substring
          // This prevents "pool" from matching if "shared pool" was already matched
          let isSubstringOfMatched = false;
          for (const alreadyMatched of matchedKeywords) {
            if (alreadyMatched.includes(keyword) && alreadyMatched !== keyword) {
              isSubstringOfMatched = true;
              break;
            }
          }

          if (!isSubstringOfMatched) {
            matched = true;
            matchedKeyword = keyword;
            break;
          }
        }
      }
    }

    if (matched && matchedKeyword) {
      matchedFeatures.push(feature.name);
      matchedKeywords.add(matchedKeyword);
      // Also add all keywords for this feature to prevent substring matches
      for (const kw of keywords) {
        matchedKeywords.add(kw);
      }
    }
  }

  console.log('🔎 Matched features:', matchedFeatures);
  if (matchedFeatures.length > 0) {
    criteria.features = matchedFeatures;
    console.log('🔎 Added features to criteria:', matchedFeatures);
  } else {
    console.log('🔎 No features matched from query');
  }

  const negotiableKeywords = ['negotiable', 'flexible price', 'open to offers', 'price negotiable', 'obo', 'or best offer', 'willing to negotiate'];
  for (const keyword of negotiableKeywords) {
    if (fullQuery.includes(keyword)) {
      criteria.isNegotiable = true;
      break;
    }
  }

  const agentPatterns = [
    /(?:from|by|listed by|agent)\s+agent\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /(?:show|find|get|search)(?:\s+me)?\s+(?:listings|properties|homes|houses|apartments)\s+(?:from|by|listed by)\s+agent\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /agent\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:'s)?\s+(?:listings|properties|homes|houses|apartments)/i,
    /(?:from|by|listed by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:the\s+)?agent/i,
    /agent\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i
  ];

  for (const pattern of agentPatterns) {
    const agentMatch = userQuery.match(pattern);
    if (agentMatch && agentMatch[1]) {
      criteria.agentName = agentMatch[1].trim();
      console.log('Detected agent name:', criteria.agentName);
      break;
    }
  }

  const agencyPatterns = [
    /(?:from|by|listed by)\s+agency\s+([A-Z][a-zA-Z0-9&\s]+?)(?=\s+(?:for|in|with|$))/i,
    /(?:show|find|get|search)(?:\s+me)?\s+(?:listings|properties|homes|houses|apartments)\s+(?:from|by|listed by)\s+agency\s+([A-Z][a-zA-Z0-9&\s]+?)(?=\s+(?:for|in|with|$))/i,
    /agency\s+([A-Z][a-zA-Z0-9&\s]+?)(?:'s)?\s+(?:listings|properties|homes|houses|apartments)/i,
    /(?:from|by|listed by)\s+([A-Z][a-zA-Z0-9&\s]+?)\s+(?:the\s+)?agency/i,
    /(?:what does|what's)\s+([A-Z][a-zA-Z0-9&\s/]+?)\s+(?:have|offer)/i,
    /(?:show|find|get|search)(?:\s+me)?\s+(?:listings|properties|homes|houses|apartments)\s+(?:from|by|at)\s+([A-Z][a-zA-Z0-9&\s/]+?)(?=\s*$)/i,
    /(?:listings|properties|homes|houses|apartments)\s+(?:from|by|at)\s+([A-Z][a-zA-Z0-9&\s/]+?)(?=\s*$)/i,
    /(?:from|by|at)\s+([A-Z][a-zA-Z0-9&\s/]+?)\s+(?:realtors?|realty|properties|real estate|group|company|inc\.?|ltd\.?|llc)(?:\s*$)/i,
    /(?:from|by|at)\s+([A-Z][a-zA-Z0-9&\s]{2,})(?=\s+(?:agency)?\s*$)/i,
    /agency\s+([A-Z][a-zA-Z0-9&\s]+)/i
  ];

  if (!criteria.agentName) {
    for (const pattern of agencyPatterns) {
      const agencyMatch = userQuery.match(pattern);
      if (agencyMatch && agencyMatch[1]) {
        let agencyName = agencyMatch[1].trim();

        const businessSuffixes = /\s+(?:realtors?|realty|properties|real estate|group|company|agency|inc\.?|ltd\.?|llc)$/i;
        const hasBusinessIndicator = businessSuffixes.test(agencyName);

        if (hasBusinessIndicator || agencyName.split(/\s+/).length >= 2) {
          criteria.agencyName = agencyName;
          console.log('Detected agency name:', criteria.agencyName);
          break;
        }
      }
    }
  }

  const proximityPatterns = [
    { pattern: /(?:any|what|where|show|find|are there|is there).*(?:schools?|education|learning centers?)/i, type: 'schools' as const },
    { pattern: /(?:schools?|education|learning centers?).*(?:nearby|near|close|around|in the area)/i, type: 'schools' as const },
    { pattern: /(?:any|what|where|show|find|are there|is there).*(?:shopping|mall|store|supermarket|grocery)/i, type: 'shopping' as const },
    { pattern: /(?:shopping|mall|store|supermarket|grocery).*(?:nearby|near|close|around|in the area)/i, type: 'shopping' as const },
    { pattern: /(?:any|what|where|show|find|are there|is there).*(?:hospital|clinic|medical|doctor|health)/i, type: 'medical' as const },
    { pattern: /(?:hospital|clinic|medical|doctor|health).*(?:nearby|near|close|around|in the area)/i, type: 'medical' as const },
    { pattern: /(?:any|what|where|show|find|are there|is there).*(?:transport|bus|taxi|maxi)/i, type: 'transportation' as const },
    { pattern: /(?:transport|bus|taxi|maxi).*(?:nearby|near|close|around|in the area)/i, type: 'transportation' as const }
  ];

  for (const { pattern, type } of proximityPatterns) {
    if (pattern.test(fullQuery)) {
      criteria.proximityQuery = { type };
      break;
    }
  }

  const areaInfoPatterns = [
    /(?:tell me about|what is|describe|information about|info about|about|what's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /(?:how is|what's it like in|what's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];

  for (const pattern of areaInfoPatterns) {
    const match = userQuery.match(pattern);
    if (match && match[1]) {
      const potentialArea = match[1].trim();
      const allAreas = getAllAreas();
      if (allAreas.some(area => area.toLowerCase() === potentialArea.toLowerCase()) ||
          REGIONS.some(region => region.toLowerCase() === potentialArea.toLowerCase())) {
        criteria.isAreaInfoQuery = true;
        if (!criteria.city && !criteria.region) {
          const foundRegion = REGIONS.find(r => r.toLowerCase() === potentialArea.toLowerCase());
          if (foundRegion) {
            criteria.region = foundRegion;
          } else {
            criteria.city = potentialArea;
          }
        }
        break;
      }
    }
  }

  if (userQuery && userQuery.trim().length > 0) {
    criteria.searchText = userQuery.trim();
  }

  console.log('🔎 === PARSED SEARCH CRITERIA ===');
  console.log('🔎 Criteria object:', JSON.stringify(criteria, null, 2));
  console.log('🔎 Number of criteria keys:', Object.keys(criteria).length);
  console.log('Parsed search criteria:', criteria);
  const result = Object.keys(criteria).length > 0 ? criteria : null;
  console.log('🔎 Returning:', result ? 'VALID CRITERIA' : 'NULL');
  return result;
}

export function parseContractorQuery(userQuery: string, aiResponse: string): ContractorSearchCriteria | null {
  const criteria: ContractorSearchCriteria = {};

  const fullQuery = `${userQuery} ${aiResponse}`.toLowerCase();

  const contractorCategories: Record<string, string[]> = {
    'plumber': ['plumber', 'plumbing', 'pipe', 'leak', 'drain', 'water pipe'],
    'electrician': ['electrician', 'electrical', 'wiring', 'electric', 'electricity', 'power'],
    'carpenter': ['carpenter', 'carpentry', 'woodwork', 'cabinet', 'furniture'],
    'painter': ['painter', 'painting', 'paint job', 'interior paint', 'exterior paint'],
    'mason': ['mason', 'masonry', 'bricklayer', 'concrete', 'brick'],
    'roofer': ['roofer', 'roofing', 'roof repair', 'roof installation'],
    'landscaper': ['landscaper', 'landscaping', 'gardening', 'lawn', 'yard work'],
    'hvac': ['hvac', 'air conditioning', 'ac repair', 'heating', 'cooling', 'ventilation'],
    'pool_maintenance': ['pool maintenance', 'pool cleaning', 'pool repair', 'pool service'],
    'cleaning': ['cleaning service', 'house cleaning', 'maid', 'cleaner', 'janitorial'],
    'pest_control': ['pest control', 'exterminator', 'pest removal', 'fumigation', 'termite'],
    'security': ['security service', 'security system', 'alarm', 'cctv', 'surveillance'],
    'handyman': ['handyman', 'general repair', 'odd jobs', 'fix', 'repair'],
    'interior_designer': ['interior designer', 'interior design', 'decorator'],
    'architect': ['architect', 'architectural design', 'building design'],
    'general_contractor': ['general contractor', 'contractor', 'construction', 'builder', 'renovation']
  };

  const matchedCategories: string[] = [];
  for (const [categoryId, keywords] of Object.entries(contractorCategories)) {
    for (const keyword of keywords) {
      if (fullQuery.includes(keyword)) {
        matchedCategories.push(categoryId);
        break;
      }
    }
  }

  if (matchedCategories.length > 0) {
    criteria.categories = matchedCategories;
    criteria.category = matchedCategories[0];
  }

  const allAreas = getAllAreas();
  for (const area of allAreas) {
    if (fullQuery.includes(area.toLowerCase())) {
      criteria.city = area;
      criteria.serviceArea = area;
      break;
    }
  }

  if (!criteria.city) {
    for (const region of REGIONS) {
      if (fullQuery.includes(region.toLowerCase())) {
        criteria.region = region;
        break;
      }
    }
  }

  if (fullQuery.includes('residential')) {
    criteria.residentialOrCommercial = 'residential';
  } else if (fullQuery.includes('commercial')) {
    criteria.residentialOrCommercial = 'commercial';
  }

  // Parse years in business
  const yearsPatterns = [
    /(\d+)\+?\s*years?\s*(?:in business|experience|established)/i,
    /(?:over|more than|at least)\s*(\d+)\s*years?/i,
    /(?:experienced|veteran|established)/i
  ];

  for (const pattern of yearsPatterns) {
    const match = fullQuery.match(pattern);
    if (match) {
      if (match[1]) {
        criteria.minYearsInBusiness = parseInt(match[1]);
      } else if (match[0].match(/experienced|veteran/)) {
        criteria.minYearsInBusiness = 10;
      } else if (match[0].match(/established/)) {
        criteria.minYearsInBusiness = 5;
      }
      break;
    }
  }

  // Parse certifications
  if (fullQuery.match(/certified|licensed|certification|license/)) {
    criteria.hasCertifications = true;
  }

  // Parse employee count
  if (fullQuery.match(/small\s+(?:contractor|company|business)/)) {
    criteria.employeeCountRange = 'small';
  } else if (fullQuery.match(/(?:medium|mid-sized)\s+(?:contractor|company|business)/)) {
    criteria.employeeCountRange = 'medium';
  } else if (fullQuery.match(/large\s+(?:contractor|company|business)/)) {
    criteria.employeeCountRange = 'large';
  }

  // Parse average job size
  const jobSizePatterns = [
    { pattern: /small\s+(?:jobs?|projects?)/i, value: 'small' },
    { pattern: /medium\s+(?:jobs?|projects?)/i, value: 'medium' },
    { pattern: /large\s+(?:jobs?|projects?)/i, value: 'large' }
  ];

  for (const { pattern, value } of jobSizePatterns) {
    if (fullQuery.match(pattern)) {
      criteria.averageJobSize = value;
      break;
    }
  }

  if (userQuery && userQuery.trim().length > 0) {
    criteria.searchText = userQuery.trim();
  }

  console.log('Parsed contractor criteria:', criteria);
  return Object.keys(criteria).length > 0 ? criteria : null;
}

export function isContractorQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return CONTRACTOR_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}
