import type { PropertySearchCriteria, ContractorSearchCriteria } from '../services/deepseek';

export function calculateQueryComplexity(
  query: string,
  criteria: PropertySearchCriteria | ContractorSearchCriteria | null
): number {
  let score = 0;

  // Length of query
  const wordCount = query.trim().split(/\s+/).length;
  if (wordCount <= 5) score += 0; // Very short queries are simple
  else if (wordCount <= 10) score += 1;
  else score += 2;

  // Number of criteria extracted
  if (criteria) {
    const criteriaCount = Object.keys(criteria).filter(key => {
      const value = criteria[key as keyof typeof criteria];
      return value !== undefined && value !== null && key !== 'searchText';
    }).length;

    // If we have many specific criteria, the query is already well-understood
    if (criteriaCount >= 3) {
      score += 1; // Reduced from 3-5
    } else {
      score += criteriaCount;
    }
  }

  // Check for ambiguous language
  const ambiguousTerms = ['maybe', 'around', 'about', 'roughly', 'approximately', 'kind of', 'sort of'];
  if (ambiguousTerms.some(term => query.toLowerCase().includes(term))) {
    score += 2;
  }

  // Check for complex requirements (only if they add actual complexity)
  const complexTerms = ['but', 'except', 'without'];
  const complexCount = complexTerms.filter(term => query.toLowerCase().includes(term)).length;
  score += Math.min(complexCount, 2);

  return score;
}

export function shouldUseAI(query: string, criteria: PropertySearchCriteria | ContractorSearchCriteria | null): boolean {
  const complexity = calculateQueryComplexity(query, criteria);

  // Simple queries (score 0-2): don't need AI
  // Medium queries (score 3-4): use AI with reduced tokens
  // Complex queries (score 5+): use full AI processing

  // Skip AI for searches with clear, well-extracted criteria
  if (criteria) {
    const criteriaKeys = Object.keys(criteria).filter(k =>
      criteria[k as keyof typeof criteria] !== undefined &&
      k !== 'searchText'
    );

    // If we have 2+ specific criteria, the search is clear enough
    if (criteriaKeys.length >= 2) {
      // Check if it's just basic location + type queries
      const hasBasicCriteria = criteriaKeys.some(k =>
        ['city', 'region', 'bedrooms', 'bathrooms', 'propertyStyle', 'category', 'listingType'].includes(k)
      );
      if (hasBasicCriteria && complexity <= 3) {
        return false;
      }
    }

    // Skip AI for feature-only searches
    if ('features' in criteria && criteria.features && criteria.features.length > 0) {
      const nonFeatureKeys = criteriaKeys.filter(k => k !== 'features' && k !== 'listingType' && k !== 'propertyCategory');
      if (nonFeatureKeys.length <= 1) {
        return false;
      }
    }

    // Skip AI for straightforward numeric criteria queries
    const hasNumericCriteria = criteriaKeys.some(k =>
      ['minPrice', 'maxPrice', 'minSizeSqft', 'maxSizeSqft', 'minYearBuilt', 'maxYearBuilt'].includes(k)
    );
    if (hasNumericCriteria && criteriaKeys.length >= 2 && complexity <= 3) {
      return false;
    }
  }

  return complexity >= 3;
}

export function getMaxTokensForComplexity(query: string, criteria: PropertySearchCriteria | ContractorSearchCriteria | null): number {
  const complexity = calculateQueryComplexity(query, criteria);

  // Feature searches and searches with clear criteria need minimal AI response
  if (criteria) {
    const criteriaKeys = Object.keys(criteria).filter(k =>
      criteria[k as keyof typeof criteria] !== undefined &&
      k !== 'searchText'
    );

    // If we have good criteria extraction, use minimal tokens
    if (criteriaKeys.length >= 2) {
      return 100;
    }

    if ('features' in criteria && criteria.features && criteria.features.length > 0) {
      return 100;
    }
  }

  if (complexity <= 2) return 100; // Simple (reduced from 150)
  if (complexity <= 4) return 150; // Medium (reduced from 200)
  return 200; // Complex (reduced from 250)
}
