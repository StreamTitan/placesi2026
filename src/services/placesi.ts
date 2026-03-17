import type { PropertySearchCriteria } from './deepseek';
import { TRINIDAD_TOBAGO_LOCATIONS } from '../lib/locations';

export function getLocationInsight(city?: string, region?: string): string {
  if (city) {
    const cityLower = city.toLowerCase();

    if (cityLower.includes('westmoorings') || cityLower.includes('westmoor')) {
      return "Westmoorings is one of Trinidad's most prestigious and upscale communities!";
    }
    if (cityLower.includes('trincity')) {
      return "Trincity is a wonderful family-friendly area with excellent shopping and schools nearby!";
    }
    if (cityLower.includes('chaguanas')) {
      return "Chaguanas is Trinidad's fastest-growing commercial hub with great value properties!";
    }
    if (cityLower.includes('st. augustine') || cityLower.includes('st augustine')) {
      return "St. Augustine is perfect for families and students, close to UWI!";
    }
    if (cityLower.includes('diego martin')) {
      return "Diego Martin offers beautiful hillside properties with stunning views!";
    }
    if (cityLower.includes('maraval')) {
      return "Maraval is a sought-after area with a perfect blend of urban and suburban living!";
    }
    if (cityLower.includes('san fernando')) {
      return "San Fernando is the business capital of South Trinidad!";
    }
    if (cityLower.includes('crown point') || cityLower.includes('tobago')) {
      return "Tobago offers beautiful beachfront and vacation properties in paradise!";
    }
    if (cityLower.includes('port of spain')) {
      return "Port of Spain is the vibrant capital city with premium properties!";
    }
    if (cityLower.includes('valsayn')) {
      return "Valsayn is a peaceful residential area popular with families!";
    }
    if (cityLower.includes('couva')) {
      return "Couva is a growing area with excellent access to central Trinidad!";
    }
  }

  if (region) {
    if (region === 'North West') {
      return "The North West region features some of the most prestigious addresses in Trinidad!";
    }
    if (region === 'North East') {
      return "The North East is perfect for families seeking great schools and amenities!";
    }
    if (region === 'Central') {
      return "Central Trinidad offers excellent value and is the island's commercial heart!";
    }
    if (region === 'South West' || region === 'South East') {
      return "South Trinidad offers peaceful living with great business opportunities!";
    }
    if (region === 'Tobago') {
      return "Tobago is paradise - perfect for vacation homes and peaceful living!";
    }
  }

  return '';
}

export function getPriceContextMessage(criteria: PropertySearchCriteria): string {
  const { maxPrice, minPrice, listingType, propertyCategory } = criteria;
  const isRental = listingType === 'rent' || propertyCategory === 'rent';

  if (maxPrice) {
    if (isRental) {
      if (maxPrice <= 4000) {
        return " I'm showing you budget-friendly rentals.";
      } else if (maxPrice <= 8000) {
        return " These are great mid-range rental options.";
      } else {
        return " I've found some premium rental properties for you.";
      }
    } else {
      if (maxPrice <= 1500000) {
        return " These are excellent starter homes and affordable options.";
      } else if (maxPrice <= 4000000) {
        return " Great mid-range properties with excellent value.";
      } else {
        return " I've found some stunning luxury properties for you.";
      }
    }
  }

  return '';
}

export function getPropertyTypeMessage(criteria: PropertySearchCriteria): string {
  const { propertyStyle, bedrooms } = criteria;

  if (propertyStyle === 'house') {
    return bedrooms && bedrooms >= 4
      ? " These beautiful homes offer plenty of space for families."
      : " These lovely homes are perfect for comfortable living.";
  }

  if (propertyStyle === 'apartment_townhouse') {
    return " Modern apartments with excellent amenities and security.";
  }

  if (propertyStyle === 'land') {
    return " Great parcels ready for your dream project!";
  }

  if (propertyStyle === 'office_space' || propertyStyle === 'office_building') {
    return " Professional spaces perfect for your business.";
  }

  if (propertyStyle === 'warehouse') {
    return " These commercial spaces offer great functionality.";
  }

  return '';
}

export function getNoResultsMessage(criteria: PropertySearchCriteria): string {
  const parts = [];

  if (criteria.city) {
    parts.push(`in ${criteria.city}`);
  } else if (criteria.region) {
    parts.push(`in ${criteria.region}`);
  }

  if (criteria.bedrooms) {
    parts.push(`with ${criteria.bedrooms} bedrooms`);
  }

  if (criteria.maxPrice) {
    const isRental = criteria.listingType === 'rent' || criteria.propertyCategory === 'rent';
    parts.push(`under $${criteria.maxPrice.toLocaleString()}`);
  }

  const searchDescription = parts.length > 0 ? ` ${parts.join(' ')}` : '';

  return `I don't have any properties available${searchDescription} at the moment. However, I'd be happy to show you similar options nearby or with slightly different features. What would you prefer?`;
}

export function getSuggestedAlternatives(criteria: PropertySearchCriteria): string[] {
  const suggestions: string[] = [];

  if (criteria.city) {
    const region = Object.entries(TRINIDAD_TOBAGO_LOCATIONS).find(([_, data]) =>
      data.areas.some(area => area.toLowerCase() === criteria.city?.toLowerCase())
    );

    if (region) {
      const [regionName, regionData] = region;
      const nearbyAreas = regionData.areas.filter(area =>
        area.toLowerCase() !== criteria.city?.toLowerCase()
      ).slice(0, 3);

      if (nearbyAreas.length > 0) {
        suggestions.push(`Properties in nearby ${nearbyAreas.join(', ')}`);
      }
    }
  }

  if (criteria.maxPrice) {
    const increasedBudget = Math.round(criteria.maxPrice * 1.2);
    const isRental = criteria.listingType === 'rent' || criteria.propertyCategory === 'rent';
    suggestions.push(`Slightly higher budget up to $${increasedBudget.toLocaleString()}`);
  }

  if (criteria.bedrooms && criteria.bedrooms > 1) {
    suggestions.push(`${criteria.bedrooms - 1}-bedroom properties with extra features`);
  }

  if (criteria.propertyStyle === 'house') {
    suggestions.push('Townhouses or apartments in gated communities');
  } else if (criteria.propertyStyle === 'apartment_townhouse') {
    suggestions.push('Houses with similar amenities');
  }

  return suggestions;
}

export function enhanceAIResponse(
  originalResponse: string,
  criteria: PropertySearchCriteria,
  resultsCount: number
): string {
  if (resultsCount === 0) {
    return getNoResultsMessage(criteria);
  }

  let enhanced = originalResponse;

  const locationInsight = getLocationInsight(criteria.city, criteria.region);
  if (locationInsight && !enhanced.toLowerCase().includes(criteria.city?.toLowerCase() || '')) {
    enhanced = `${enhanced} ${locationInsight}`;
  }

  const priceContext = getPriceContextMessage(criteria);
  if (priceContext) {
    enhanced = `${enhanced}${priceContext}`;
  }

  return enhanced;
}
