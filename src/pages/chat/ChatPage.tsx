import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Loader2, Menu, Plus, Home } from 'lucide-react';
import { chatWithAI, parseSearchQuery, parseContractorQuery, isContractorQuery, type Message, type PropertySearchCriteria, type ContractorSearchCriteria } from '../../services/deepseek';
import { enhanceAIResponse } from '../../services/placesi';
import { generateAreaResponse, generateProximityResponse, getAreaInformation } from '../../services/areaKnowledge';
import { searchContractors, type ContractorWithProfile } from '../../services/contractorManagement';
import { supabase } from '../../lib/supabase';
import { PLACESI_SYSTEM_PROMPT } from '../../lib/aiSystemPrompt';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PropertyRowCard } from '../../components/property/PropertyRowCard';
import { ContractorChatCard } from '../../components/contractors/ContractorChatCard';
import { ChatSidebar } from '../../components/chat/ChatSidebar';
import { AdBanner } from '../../components/ui/AdBanner';
import { MembersOnlyModal } from '../../components/ui/MembersOnlyModal';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';
import type { FilterOptions } from '../../components/home/FilterSidebar';
import { logger } from '../../utils/logger';
import { queryCache } from '../../utils/queryCache';
import { shouldUseAI, getMaxTokensForComplexity } from '../../utils/queryComplexity';

type Property = Database['public']['Tables']['properties']['Row'];

export function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: PLACESI_SYSTEM_PROMPT,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contractors, setContractors] = useState<ContractorWithProfile[]>([]);
  const [immediateResults, setImmediateResults] = useState<Property[]>([]);
  const [lastSearchCriteria, setLastSearchCriteria] = useState<PropertySearchCriteria | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [initialQueryProcessed, setInitialQueryProcessed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [membersOnlyModalOpen, setMembersOnlyModalOpen] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, properties, contractors, scrollToBottom]);

  const normalizeCriteria = useCallback((criteria: PropertySearchCriteria): PropertySearchCriteria => {
    const normalized = { ...criteria };
    if (normalized.city) {
      normalized.city = normalized.city.toLowerCase().trim();
    }
    if (normalized.region) {
      normalized.region = normalized.region.toLowerCase().trim();
    }
    if (normalized.propertyType) {
      normalized.propertyType = normalized.propertyType.toLowerCase().trim();
    }
    delete normalized.searchText;
    return normalized;
  }, []);

  const areCriteriaEquivalent = useCallback((criteria1: PropertySearchCriteria | null, criteria2: PropertySearchCriteria | null): boolean => {
    if (!criteria1 || !criteria2) return false;

    const norm1 = normalizeCriteria(criteria1);
    const norm2 = normalizeCriteria(criteria2);

    const keys1 = Object.keys(norm1).sort();
    const keys2 = Object.keys(norm2).sort();

    if (keys1.length !== keys2.length) return false;
    if (keys1.join(',') !== keys2.join(',')) return false;

    for (const key of keys1) {
      const val1 = norm1[key as keyof PropertySearchCriteria];
      const val2 = norm2[key as keyof PropertySearchCriteria];

      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length || !val1.every((v, i) => v === val2[i])) {
          return false;
        }
      } else if (typeof val1 === 'string' && typeof val2 === 'string') {
        if (val1.toLowerCase() !== val2.toLowerCase()) {
          return false;
        }
      } else if (val1 !== val2) {
        return false;
      }
    }

    return true;
  }, [normalizeCriteria]);


  useEffect(() => {
    const state = location.state as { initialQuery?: string; filters?: FilterOptions } | null;
    if (state?.initialQuery && !initialQueryProcessed) {
      setInput(state.initialQuery);
      setInitialQueryProcessed(true);

      if (state.filters) {
        const filterCriteria: PropertySearchCriteria = {
          bedrooms: state.filters.bedrooms ? parseInt(state.filters.bedrooms) : undefined,
          bathrooms: state.filters.bathrooms ? parseFloat(state.filters.bathrooms) : undefined,
          minPrice: state.filters.minPrice ? parseFloat(state.filters.minPrice) : undefined,
          maxPrice: state.filters.maxPrice ? parseFloat(state.filters.maxPrice) : undefined,
          propertyType: state.filters.propertyType || undefined,
          city: state.filters.city || undefined,
          region: state.filters.region || undefined,
          listingType: state.filters.listingType || 'rent',
          features: state.filters.features || undefined,
          isNegotiable: state.filters.isNegotiable || undefined,
        };
        searchProperties(filterCriteria).then(result => {
          setProperties(result.properties);
          setLastSearchCriteria(filterCriteria);
        });
      }

      setTimeout(() => {
        handleSendWithQuery(state.initialQuery);
      }, 300);
    }
  }, [location.state, initialQueryProcessed]);

  const resolveAgentId = useCallback(async (agentName: string): Promise<string | null> => {
    try {
      logger.log('Looking up agent by name:', agentName);

      const nameParts = agentName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];

      let query = supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'agent');

      if (nameParts.length === 1) {
        query = query.or(`full_name.ilike.%${agentName}%`);
      } else {
        query = query.or(`full_name.ilike.%${agentName}%,full_name.ilike.%${firstName}%${lastName}%`);
      }

      const { data, error } = await query.limit(5);

      if (error) {
        console.error('Error looking up agent:', error);
        return null;
      }

      if (!data || data.length === 0) {
        logger.log('No agent found with name:', agentName);
        return null;
      }

      const exactMatch = data.find(agent =>
        agent.full_name?.toLowerCase() === agentName.toLowerCase()
      );

      if (exactMatch) {
        logger.log('Found exact agent match:', exactMatch.full_name, 'ID:', exactMatch.id);
        return exactMatch.id;
      }

      const partialMatch = data.find(agent => {
        const agentFullName = agent.full_name?.toLowerCase() || '';
        return agentFullName.includes(firstName.toLowerCase()) &&
               agentFullName.includes(lastName.toLowerCase());
      });

      if (partialMatch) {
        logger.log('Found partial agent match:', partialMatch.full_name, 'ID:', partialMatch.id);
        return partialMatch.id;
      }

      logger.log('Found agent (first result):', data[0].full_name, 'ID:', data[0].id);
      return data[0].id;
    } catch (error) {
      console.error('Error resolving agent ID:', error);
      return null;
    }
  }, []);

  const resolveAgencyId = useCallback(async (agencyName: string): Promise<string | null> => {
    try {
      logger.log('Looking up agency by name:', agencyName);

      const cleanName = agencyName.trim();
      const businessSuffixes = /\s+(?:realtors?|realty|properties|real estate|group|company|agency|inc\.?|ltd\.?|llc)$/i;
      const baseNameMatch = cleanName.match(/^(.+?)\s+(?:realtors?|realty|properties|real estate|group|company|agency|inc\.?|ltd\.?|llc)$/i);
      const baseName = baseNameMatch ? baseNameMatch[1].trim() : cleanName;

      let query = supabase
        .from('agencies')
        .select('id, name')
        .ilike('name', `%${cleanName}%`);

      const { data, error } = await query.limit(10);

      if (error) {
        console.error('Error looking up agency:', error);
        return null;
      }

      if (!data || data.length === 0) {
        logger.log('No agency found with name:', agencyName, '- trying base name:', baseName);

        if (baseName !== cleanName) {
          const { data: baseData, error: baseError } = await supabase
            .from('agencies')
            .select('id, name')
            .ilike('name', `%${baseName}%`)
            .limit(10);

          if (!baseError && baseData && baseData.length > 0) {
            const bestMatch = baseData.find(agency => {
              const agencyNameLower = agency.name?.toLowerCase() || '';
              return agencyNameLower.includes(baseName.toLowerCase());
            });

            if (bestMatch) {
              logger.log('Found base name match:', bestMatch.name, 'ID:', bestMatch.id);
              return bestMatch.id;
            }
          }
        }

        return null;
      }

      const exactMatch = data.find(agency =>
        agency.name?.toLowerCase() === cleanName.toLowerCase()
      );

      if (exactMatch) {
        logger.log('Found exact agency match:', exactMatch.name, 'ID:', exactMatch.id);
        return exactMatch.id;
      }

      const startsWithMatch = data.find(agency => {
        const agencyNameLower = agency.name?.toLowerCase() || '';
        return agencyNameLower.startsWith(cleanName.toLowerCase());
      });

      if (startsWithMatch) {
        logger.log('Found starts-with match:', startsWithMatch.name, 'ID:', startsWithMatch.id);
        return startsWithMatch.id;
      }

      const partialMatch = data.find(agency => {
        const agencyNameLower = agency.name?.toLowerCase() || '';
        const cleanNameLower = cleanName.toLowerCase();
        return agencyNameLower.includes(cleanNameLower) || cleanNameLower.includes(agencyNameLower);
      });

      if (partialMatch) {
        logger.log('Found partial agency match:', partialMatch.name, 'ID:', partialMatch.id);
        return partialMatch.id;
      }

      if (baseName !== cleanName) {
        const baseNameMatch = data.find(agency => {
          const agencyNameLower = agency.name?.toLowerCase() || '';
          return agencyNameLower.includes(baseName.toLowerCase());
        });

        if (baseNameMatch) {
          logger.log('Found base name match:', baseNameMatch.name, 'ID:', baseNameMatch.id);
          return baseNameMatch.id;
        }
      }

      logger.log('Found agency (first result):', data[0].name, 'ID:', data[0].id);
      return data[0].id;
    } catch (error) {
      console.error('Error resolving agency ID:', error);
      return null;
    }
  }, []);

  const searchProperties = useCallback(async (criteria: PropertySearchCriteria): Promise<{ properties: Property[], isExactMatch: boolean, requestedBedrooms?: number, agentNotFound?: boolean, agencyNotFound?: boolean }> => {
    try {
      console.log('🔍 === SEARCH PROPERTIES CALLED ===');
      console.log('🔍 Search criteria:', JSON.stringify(criteria, null, 2));
      logger.log('=== SEARCH PROPERTIES CALLED ===');
      logger.log('Search criteria:', JSON.stringify(criteria, null, 2));

      if (criteria.agentName && !criteria.agentId) {
        const agentId = await resolveAgentId(criteria.agentName);
        if (agentId) {
          criteria.agentId = agentId;
        } else {
          logger.log('Could not find agent, returning empty results');
          return { properties: [], isExactMatch: false, agentNotFound: true };
        }
      }

      if (criteria.agencyName && !criteria.agencyId) {
        const agencyId = await resolveAgencyId(criteria.agencyName);
        if (agencyId) {
          criteria.agencyId = agencyId;
        } else {
          logger.log('Could not find agency, returning empty results');
          return { properties: [], isExactMatch: false, agencyNotFound: true };
        }
      }

      const testQuery = await supabase.from('properties').select('id, title').eq('status', 'active').limit(1);
      logger.log('Test query result:', testQuery.data?.length || 0, 'properties');

      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active');

      if (criteria.agentId) {
        logger.log('Filtering by agent ID:', criteria.agentId);
        query = query.eq('listed_by', criteria.agentId);
      } else if (criteria.agencyId) {
        logger.log('Filtering by agency ID:', criteria.agencyId);
        const { data: agentProfiles } = await supabase
          .from('agent_profiles')
          .select('user_id')
          .eq('agency_id', criteria.agencyId);

        if (agentProfiles && agentProfiles.length > 0) {
          const agentIds = agentProfiles.map(ap => ap.user_id);
          query = query.in('listed_by', agentIds);
        } else {
          return { properties: [], isExactMatch: false };
        }
      }

      if (criteria.propertyCategory) {
        query = query.eq('property_category', criteria.propertyCategory);
      } else if (criteria.listingType) {
        query = query.eq('listing_type', criteria.listingType);
      }

      if (criteria.searchText && !criteria.city && !criteria.propertyType && !criteria.bedrooms && !criteria.agentId && !criteria.agencyId) {
        logger.log('Using general text search');
        query = query.or(`title.ilike.%${criteria.searchText}%,description.ilike.%${criteria.searchText}%,city.ilike.%${criteria.searchText}%,property_type.ilike.%${criteria.searchText}%`);
      } else {
        logger.log('Using specific criteria filters');

        if (criteria.bedrooms) {
          logger.log('Filtering by EXACT bedrooms:', criteria.bedrooms);
          query = query.eq('bedrooms', criteria.bedrooms);
        }

        if (criteria.bathrooms) {
          logger.log('Filtering by bathrooms (minimum):', criteria.bathrooms);
          query = query.gte('bathrooms', criteria.bathrooms);
        }

        if (criteria.minPrice) {
          logger.log('Filtering by min price:', criteria.minPrice);
          query = query.gte('price', criteria.minPrice);
        }

        if (criteria.maxPrice) {
          logger.log('Filtering by max price:', criteria.maxPrice);
          query = query.lte('price', criteria.maxPrice);
        }

        if (criteria.propertyGeneralType) {
          logger.log('Filtering by general type:', criteria.propertyGeneralType);
          query = query.eq('property_general_type', criteria.propertyGeneralType);
        }

        if (criteria.propertyStyle) {
          logger.log('Filtering by property style:', criteria.propertyStyle);
          if (criteria.propertyStyle === 'apartment_townhouse') {
            query = query.in('property_style', ['apartment_townhouse', 'house']);
          } else {
            query = query.eq('property_style', criteria.propertyStyle);
          }
        }

        if (criteria.propertyType && !criteria.propertyStyle) {
          logger.log('Filtering by property type:', criteria.propertyType);
          query = query.ilike('property_type', `%${criteria.propertyType}%`);
        }

        if (criteria.city) {
          logger.log('Filtering by city:', criteria.city);
          query = query.ilike('city', `%${criteria.city}%`);
        }

        if (criteria.region) {
          logger.log('Filtering by region:', criteria.region);
          query = query.ilike('region', `%${criteria.region}%`);
        }

        if (criteria.isNegotiable !== undefined) {
          logger.log('Filtering by negotiable:', criteria.isNegotiable);
          query = query.eq('is_negotiable', criteria.isNegotiable);
        }

        if (criteria.minSizeSqft) {
          logger.log('Filtering by min size sqft:', criteria.minSizeSqft);
          query = query.gte('size_sqft', criteria.minSizeSqft);
        }

        if (criteria.maxSizeSqft) {
          logger.log('Filtering by max size sqft:', criteria.maxSizeSqft);
          query = query.lte('size_sqft', criteria.maxSizeSqft);
        }

        if (criteria.minLotSizeSqft) {
          logger.log('Filtering by min lot size sqft:', criteria.minLotSizeSqft);
          query = query.gte('lot_size_sqft', criteria.minLotSizeSqft);
        }

        if (criteria.maxLotSizeSqft) {
          logger.log('Filtering by max lot size sqft:', criteria.maxLotSizeSqft);
          query = query.lte('lot_size_sqft', criteria.maxLotSizeSqft);
        }

        if (criteria.minYearBuilt) {
          logger.log('Filtering by min year built:', criteria.minYearBuilt);
          query = query.gte('year_built', criteria.minYearBuilt);
        }

        if (criteria.maxYearBuilt) {
          logger.log('Filtering by max year built:', criteria.maxYearBuilt);
          query = query.lte('year_built', criteria.maxYearBuilt);
        }
      }

      query = query.limit(50);

      const { data, error } = await query;

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      logger.log('Raw query results:', data?.length, 'properties');
      logger.log('First 2 results:', data?.slice(0, 2));
      let filteredData = data || [];

      if (criteria.bedrooms && filteredData.length === 0) {
        logger.log('No exact bedroom matches found, trying fallback search');
        const minBedrooms = Math.max(1, criteria.bedrooms - 1);
        const maxBedrooms = criteria.bedrooms + 1;

        let fallbackQuery = supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .gte('bedrooms', minBedrooms)
          .lte('bedrooms', maxBedrooms);

        if (criteria.propertyCategory) {
          fallbackQuery = fallbackQuery.eq('property_category', criteria.propertyCategory);
        } else if (criteria.listingType) {
          fallbackQuery = fallbackQuery.eq('listing_type', criteria.listingType);
        }

        if (criteria.propertyGeneralType) {
          fallbackQuery = fallbackQuery.eq('property_general_type', criteria.propertyGeneralType);
        }

        if (criteria.propertyStyle) {
          if (criteria.propertyStyle === 'apartment_townhouse') {
            fallbackQuery = fallbackQuery.in('property_style', ['apartment_townhouse', 'house']);
          } else {
            fallbackQuery = fallbackQuery.eq('property_style', criteria.propertyStyle);
          }
        }

        if (criteria.propertyType && !criteria.propertyStyle) {
          fallbackQuery = fallbackQuery.ilike('property_type', `%${criteria.propertyType}%`);
        }

        if (criteria.city) {
          fallbackQuery = fallbackQuery.ilike('city', `%${criteria.city}%`);
        }

        if (criteria.region) {
          fallbackQuery = fallbackQuery.ilike('region', `%${criteria.region}%`);
        }

        if (criteria.minPrice) {
          fallbackQuery = fallbackQuery.gte('price', criteria.minPrice);
        }

        if (criteria.maxPrice) {
          fallbackQuery = fallbackQuery.lte('price', criteria.maxPrice);
        }

        if (criteria.isNegotiable !== undefined) {
          fallbackQuery = fallbackQuery.eq('is_negotiable', criteria.isNegotiable);
        }

        if (criteria.minSizeSqft) {
          fallbackQuery = fallbackQuery.gte('size_sqft', criteria.minSizeSqft);
        }

        if (criteria.maxSizeSqft) {
          fallbackQuery = fallbackQuery.lte('size_sqft', criteria.maxSizeSqft);
        }

        if (criteria.minLotSizeSqft) {
          fallbackQuery = fallbackQuery.gte('lot_size_sqft', criteria.minLotSizeSqft);
        }

        if (criteria.maxLotSizeSqft) {
          fallbackQuery = fallbackQuery.lte('lot_size_sqft', criteria.maxLotSizeSqft);
        }

        if (criteria.minYearBuilt) {
          fallbackQuery = fallbackQuery.gte('year_built', criteria.minYearBuilt);
        }

        if (criteria.maxYearBuilt) {
          fallbackQuery = fallbackQuery.lte('year_built', criteria.maxYearBuilt);
        }

        fallbackQuery = fallbackQuery.limit(50);

        const { data: fallbackData, error: fallbackError } = await fallbackQuery;

        if (!fallbackError && fallbackData) {
          logger.log('Fallback search found:', fallbackData.length, 'properties');
          filteredData = fallbackData;
        }
      }

      if (criteria.features && criteria.features.length > 0) {
        console.log('✨ === FEATURE FILTERING ===');
        console.log('✨ Required features:', criteria.features);
        console.log('✨ Number of required features:', criteria.features.length);
        console.log('✨ Current filtered data count:', filteredData.length);
        logger.log('=== FEATURE FILTERING ===');
        logger.log('Required features:', criteria.features);
        logger.log('Number of required features:', criteria.features.length);
        logger.log('Current filtered data count:', filteredData.length);

        // If no properties yet (feature-only search), get all matching feature properties
        if (filteredData.length === 0) {
          console.log('✨ Feature-only search detected - no properties from initial query');
          console.log('✨ Will query database directly for properties with features:', criteria.features);
          logger.log('Feature-only search detected - no properties from initial query');
          logger.log('Will query database directly for properties with features:', criteria.features);

          // Find properties that have ALL required features
          const { data: propertyIdsWithFeatures, error: featureError } = await supabase
            .from('property_features')
            .select('property_id')
            .in('feature_name', criteria.features);

          if (featureError) {
            console.error('Error querying property_features:', featureError);
          } else {
            logger.log('Found property-feature records:', propertyIdsWithFeatures?.length || 0);
          }

          if (!featureError && propertyIdsWithFeatures && propertyIdsWithFeatures.length > 0) {
            // Count how many times each property appears (must have all features)
            const propertyFeatureCounts = new Map<string, number>();
            propertyIdsWithFeatures.forEach(pf => {
              propertyFeatureCounts.set(pf.property_id, (propertyFeatureCounts.get(pf.property_id) || 0) + 1);
            });

            logger.log('Property feature counts:', Object.fromEntries(propertyFeatureCounts));
            logger.log('Required feature count:', criteria.features!.length);

            // Filter to properties that have ALL required features
            const matchingPropertyIds = Array.from(propertyFeatureCounts.entries())
              .filter(([_, count]) => count === criteria.features!.length)
              .map(([id, _]) => id);

            logger.log('Properties with ALL features:', matchingPropertyIds.length);
            logger.log('Matching property IDs:', matchingPropertyIds);

            if (matchingPropertyIds.length > 0) {
              // Fetch the full property data
              let propQuery = supabase
                .from('properties')
                .select('*')
                .eq('status', 'active')
                .in('id', matchingPropertyIds);

              // Apply any other criteria
              if (criteria.propertyCategory) {
                propQuery = propQuery.eq('property_category', criteria.propertyCategory);
              } else if (criteria.listingType) {
                propQuery = propQuery.eq('listing_type', criteria.listingType);
              }

              if (criteria.region) {
                logger.log('Also filtering by region:', criteria.region);
                propQuery = propQuery.ilike('region', `%${criteria.region}%`);
              }

              if (criteria.city) {
                logger.log('Also filtering by city:', criteria.city);
                propQuery = propQuery.ilike('city', `%${criteria.city}%`);
              }

              if (criteria.minPrice) {
                propQuery = propQuery.gte('price', criteria.minPrice);
              }

              if (criteria.maxPrice) {
                propQuery = propQuery.lte('price', criteria.maxPrice);
              }

              if (criteria.bedrooms) {
                propQuery = propQuery.eq('bedrooms', criteria.bedrooms);
              }

              if (criteria.bathrooms) {
                propQuery = propQuery.eq('bathrooms', criteria.bathrooms);
              }

              const { data: featureProperties, error: propError } = await propQuery.limit(50);
              if (propError) {
                console.error('Error fetching properties:', propError);
              } else if (featureProperties) {
                filteredData = featureProperties;
                logger.log('Successfully fetched properties with all features:', filteredData.length);
                logger.log('Property titles:', featureProperties.map(p => p.title));
              } else {
                logger.log('No properties returned from query');
              }
            } else {
              logger.log('No properties have ALL required features');
            }
          } else {
            logger.log('No property-feature records found for the requested features');
          }
        } else {
          // Filter existing results by features
          console.log('✨ Filtering existing results by features');
          console.log('✨ Properties to filter:', filteredData.length);
          console.log('✨ Property titles to filter:', filteredData.map(p => p.title));
          logger.log('Filtering existing results by features');
          logger.log('Properties to filter:', filteredData.length);
          const propertyIds = filteredData.map(p => p.id);
          console.log('✨ Property IDs:', propertyIds);
          const { data: featuresData, error: featuresError } = await supabase
            .from('property_features')
            .select('property_id, feature_name')
            .in('property_id', propertyIds);

          if (featuresError) {
            console.error('❌ Error fetching features:', featuresError);
          } else if (featuresData) {
            console.log('✨ Retrieved feature data for', featuresData.length, 'property-feature records');
            logger.log('Retrieved feature data for', featuresData.length, 'property-feature records');
            const propertyFeatureMap = new Map<string, Set<string>>();
            featuresData.forEach(pf => {
              if (!propertyFeatureMap.has(pf.property_id)) {
                propertyFeatureMap.set(pf.property_id, new Set());
              }
              propertyFeatureMap.get(pf.property_id)?.add(pf.feature_name);
            });

            const beforeFilterCount = filteredData.length;
            console.log('✨ Property-feature map created for', propertyFeatureMap.size, 'properties');
            filteredData = filteredData.filter(property => {
              const propertyFeatures = propertyFeatureMap.get(property.id);
              if (!propertyFeatures) {
                console.log(`✨ Property ${property.title} has NO features in map`);
                return false;
              }

              // Debug each feature individually
              console.log(`\n✨ Checking property: ${property.title}`);
              console.log(`✨ Property has these features:`, Array.from(propertyFeatures));
              console.log(`✨ Checking for these required features:`, criteria.features);

              const featureChecks = criteria.features!.map(requiredFeature => {
                const hasIt = propertyFeatures.has(requiredFeature);
                console.log(`  ✨ Feature "${requiredFeature}": ${hasIt ? '✅ YES' : '❌ NO'}`);
                return hasIt;
              });

              const hasAll = featureChecks.every(check => check);

              if (!hasAll) {
                console.log(`✨ Property ${property.title} missing features. Has: [${Array.from(propertyFeatures).join(', ')}], Needs: [${criteria.features!.join(', ')}]`);
                logger.log(`Property ${property.title} missing features. Has: [${Array.from(propertyFeatures).join(', ')}], Needs: [${criteria.features!.join(', ')}]`);
              } else {
                console.log(`✅ Property ${property.title} HAS ALL features!`);
              }
              return hasAll;
            });
            console.log(`✨ Feature filtering: ${beforeFilterCount} properties → ${filteredData.length} properties`);
            logger.log(`Feature filtering: ${beforeFilterCount} properties → ${filteredData.length} properties`);
          }
        }
      }

      filteredData.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (criteria.bedrooms) {
          if (a.bedrooms === criteria.bedrooms) scoreA += 20;
          if (b.bedrooms === criteria.bedrooms) scoreB += 20;

          const diffA = Math.abs(a.bedrooms - criteria.bedrooms);
          const diffB = Math.abs(b.bedrooms - criteria.bedrooms);
          if (diffA < diffB) scoreA += 10;
          if (diffB < diffA) scoreB += 10;
        }

        if (criteria.city) {
          if (a.city.toLowerCase().includes(criteria.city.toLowerCase())) scoreA += 10;
          if (b.city.toLowerCase().includes(criteria.city.toLowerCase())) scoreB += 10;
        }

        if (criteria.propertyStyle) {
          if (a.property_style === criteria.propertyStyle) scoreA += 5;
          if (b.property_style === criteria.propertyStyle) scoreB += 5;
        }

        if (scoreA !== scoreB) return scoreB - scoreA;

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      filteredData = filteredData.slice(0, 12);

      const isExactMatch = criteria.bedrooms ? (data && data.length > 0) : true;

      console.log('✅ === FINAL SEARCH RESULTS ===');
      console.log('✅ Search results:', filteredData.length, 'properties found');
      console.log('✅ Is exact match:', isExactMatch);
      console.log('✅ Properties to display:', filteredData.map(p => ({ id: p.id, title: p.title, bedrooms: p.bedrooms })));
      logger.log('=== FINAL SEARCH RESULTS ===');
      logger.log('Search results:', filteredData.length, 'properties found');
      logger.log('Is exact match:', isExactMatch);
      logger.log('Properties to display:', filteredData.map(p => ({ id: p.id, title: p.title, bedrooms: p.bedrooms })));
      logger.log('=== RETURNING SEARCH RESULTS (not setting state yet) ===');
      console.log('✅ === RETURNING SEARCH RESULTS ===');
      return { properties: filteredData, isExactMatch, requestedBedrooms: criteria.bedrooms };
    } catch (error) {
      console.error('Error searching properties:', error);
      return { properties: [], isExactMatch: true };
    }
  }, [resolveAgentId, resolveAgencyId]);

  const handleSendWithQuery = async (query: string) => {
    if (!query.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: query,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setLoading(true);

    const isContractorQueryDetected = isContractorQuery(query);
    logger.log('=== QUERY TYPE DETECTION ===');
    logger.log('Is contractor query:', isContractorQueryDetected);

    const immediateCriteria = isContractorQueryDetected ? null : parseSearchQuery(query, '');
    const immediateContractorCriteria = isContractorQueryDetected ? parseContractorQuery(query, '') : null;
    logger.log('=== IMMEDIATE SEARCH ===');
    logger.log('Immediate criteria before AI:', immediateCriteria);
    logger.log('Immediate contractor criteria before AI:', immediateContractorCriteria);

    let immediateResultsFound: Property[] = [];
    let immediateContractorsFound: ContractorWithProfile[] = [];
    let immediateIsExactMatch = true;
    let immediateRequestedBedrooms: number | undefined;
    let agentNotFound = false;
    let agencyNotFound = false;
    let searchedAgentName: string | undefined;
    let searchedAgencyName: string | undefined;
    let isAreaQuery = false;
    let isProximityQuery = false;

    if (immediateCriteria?.isAreaInfoQuery && (immediateCriteria.city || immediateCriteria.region)) {
      isAreaQuery = true;
      logger.log('Area information query detected');
    }

    if (immediateCriteria?.proximityQuery) {
      isProximityQuery = true;
      logger.log('Proximity query detected:', immediateCriteria.proximityQuery);
    }

    if (immediateContractorCriteria) {
      logger.log('Searching contractors immediately');

      // Check cache first
      const cachedContractors = queryCache.get<ContractorWithProfile[]>(query, 'contractor');
      if (cachedContractors) {
        logger.log('Using cached contractors:', cachedContractors.length);
        immediateContractorsFound = cachedContractors;
        setContractors(cachedContractors);
        setProperties([]);
      } else {
        try {
          immediateContractorsFound = await searchContractors({
            category: immediateContractorCriteria.category,
            serviceArea: immediateContractorCriteria.serviceArea,
            searchQuery: immediateContractorCriteria.category ? undefined : immediateContractorCriteria.searchText,
            minYearsInBusiness: immediateContractorCriteria.minYearsInBusiness,
            hasCertifications: immediateContractorCriteria.hasCertifications,
            employeeCountRange: immediateContractorCriteria.employeeCountRange,
            averageJobSize: immediateContractorCriteria.averageJobSize,
            residentialOrCommercial: immediateContractorCriteria.residentialOrCommercial
          });
          logger.log('Found contractors:', immediateContractorsFound.length);
          queryCache.set(query, 'contractor', immediateContractorsFound);
          setContractors(immediateContractorsFound);
          setProperties([]);
        } catch (error) {
          console.error('Error searching contractors:', error);
        }
      }
    } else if (immediateCriteria && !isAreaQuery && !isProximityQuery) {
      logger.log('Setting search criteria immediately');
      logger.log('Immediate criteria details:', JSON.stringify(immediateCriteria, null, 2));

      // Check cache first
      const cachedProperties = queryCache.get<Property[]>(query, 'property');
      if (cachedProperties) {
        logger.log('Using cached properties:', cachedProperties.length);
        immediateResultsFound = cachedProperties;
        setImmediateResults(cachedProperties);
        setProperties(cachedProperties);
        setContractors([]);
      } else {
        console.log('🔍 Calling searchProperties with criteria:', immediateCriteria);
        const searchResult = await searchProperties(immediateCriteria);
        console.log('🔍 searchProperties returned:', searchResult.properties.length, 'properties');
        immediateResultsFound = searchResult.properties;
        immediateIsExactMatch = searchResult.isExactMatch;
        immediateRequestedBedrooms = searchResult.requestedBedrooms;
        agentNotFound = searchResult.agentNotFound || false;
        agencyNotFound = searchResult.agencyNotFound || false;
        searchedAgentName = immediateCriteria.agentName;
        searchedAgencyName = immediateCriteria.agencyName;
        queryCache.set(query, 'property', immediateResultsFound);
        setImmediateResults(immediateResultsFound);
        // CRITICAL: Set properties immediately so they display while AI processes
        console.log('🎯 CALLING setProperties with', immediateResultsFound.length, 'properties');
        console.log('🎯 Property IDs:', immediateResultsFound.map(p => p.id));
        setProperties(immediateResultsFound);
        console.log('🎯 setProperties CALLED SUCCESSFULLY');
        setLastSearchCriteria(immediateCriteria);
        setContractors([]);
        logger.log('Stored immediate results:', immediateResultsFound.length);
        logger.log('Properties set in state:', immediateResultsFound.length);
        logger.log('Is exact match:', immediateIsExactMatch);
        logger.log('Agent not found:', agentNotFound);
        logger.log('Agency not found:', agencyNotFound);
      }
    }

    try {
      let aiResponseText = '';

      // Skip AI entirely for contractor queries - use deterministic responses
      if (isContractorQueryDetected) {
        logger.log('Contractor query detected - skipping AI call');
        // AI response will be set below based on search results
      } else if (isAreaQuery && immediateCriteria) {
        const areaName = immediateCriteria.city || immediateCriteria.region || '';
        aiResponseText = generateAreaResponse(areaName);
        setProperties([]);
      } else if (isProximityQuery && immediateCriteria?.proximityQuery) {
        const areaName = immediateCriteria.city || immediateCriteria.region || '';
        if (areaName) {
          aiResponseText = generateProximityResponse(areaName, immediateCriteria.proximityQuery.type);
        } else {
          aiResponseText = `I'd be happy to tell you about amenities! Could you let me know which area you're interested in?`;
        }
        setProperties([]);
      } else {
        // Use smart complexity-based AI calling
        const useAI = shouldUseAI(query, immediateCriteria);
        if (useAI) {
          const maxTokens = getMaxTokensForComplexity(query, immediateCriteria);
          logger.log('Using AI with max_tokens:', maxTokens);
          try {
            aiResponseText = await chatWithAI(newMessages, maxTokens);
          } catch (error: any) {
            if (error.message === 'AI_TIMEOUT') {
              logger.log('AI timed out, using fallback response');
              aiResponseText = "I found some properties that match your search! Take a look below.";
            } else {
              throw error;
            }
          }
        } else {
          logger.log('Query is simple, skipping AI call');
          aiResponseText = immediateResultsFound.length > 0
            ? "I found some great properties for you! Check them out below."
            : "Let me search for properties matching your criteria.";
        }
      }

      if (immediateContractorsFound.length > 0) {
        const contractorWord = immediateContractorsFound.length === 1 ? 'contractor' : 'contractors';
        const serviceText = immediateContractorCriteria?.category ? ` for ${immediateContractorCriteria.category.replace(/_/g, ' ')}` : '';
        const areaText = immediateContractorCriteria?.serviceArea ? ` in ${immediateContractorCriteria.serviceArea}` : '';
        aiResponseText = `Great! I found ${immediateContractorsFound.length} reliable ${contractorWord}${serviceText}${areaText}. Take a look at their profiles and contact them directly!`;
      } else if (immediateContractorCriteria && immediateContractorsFound.length === 0) {
        const serviceText = immediateContractorCriteria.category ? ` for ${immediateContractorCriteria.category.replace(/_/g, ' ')}` : '';
        const areaText = immediateContractorCriteria.serviceArea ? ` in ${immediateContractorCriteria.serviceArea}` : '';
        aiResponseText = `I'm sorry, but I couldn't find any contractors${serviceText}${areaText} at the moment. Try browsing our full Contractors Directory or search in a different area!`;
      } else if (agentNotFound && searchedAgentName) {
        aiResponseText = `I'm sorry, but I couldn't find any agent named "${searchedAgentName}" in our system. Please check the spelling of the agent's name and try again. You can also browse all agents on our Agents page to find the one you're looking for.`;
      } else if (agencyNotFound && searchedAgencyName) {
        aiResponseText = `I'm sorry, but I couldn't find any agency named "${searchedAgencyName}" in our system. Please check the spelling of the agency's name and try again. You can also browse all agencies on our Agencies page to find the one you're looking for.`;
      } else if (immediateCriteria?.agentName && immediateResultsFound.length === 0 && !agentNotFound) {
        aiResponseText = `I found agent ${immediateCriteria.agentName}, but they don't have any active listings at the moment. You can check back later or browse other agents' properties!`;
      } else if (immediateCriteria?.agencyName && immediateResultsFound.length === 0 && !agencyNotFound) {
        aiResponseText = `I found ${immediateCriteria.agencyName}, but they don't have any active listings at the moment. You can check back later or browse other agencies' properties!`;
      } else if (immediateCriteria?.agentName && immediateResultsFound.length > 0) {
        const propertyWord = immediateResultsFound.length === 1 ? 'property' : 'properties';
        aiResponseText = `Perfect! I found ${immediateResultsFound.length} wonderful ${propertyWord} from agent ${immediateCriteria.agentName}. Take a look at these listings!`;
      } else if (immediateCriteria?.agencyName && immediateResultsFound.length > 0) {
        const propertyWord = immediateResultsFound.length === 1 ? 'property' : 'properties';
        aiResponseText = `Perfect! I found ${immediateResultsFound.length} wonderful ${propertyWord} from ${immediateCriteria.agencyName}! Take a look at these listings!`;
      } else if (immediateRequestedBedrooms && !immediateIsExactMatch && immediateResultsFound.length > 0) {
        const bedroomCounts = immediateResultsFound.map(p => p.bedrooms);
        const uniqueBedrooms = Array.from(new Set(bedroomCounts)).sort((a, b) => a - b);
        const bedroomList = uniqueBedrooms.join(', ').replace(/, ([^,]*)$/, ' and $1');

        aiResponseText = `I couldn't find any ${immediateRequestedBedrooms}-bedroom properties matching your criteria right now. However, I found some wonderful ${bedroomList}-bedroom options that might interest you! Take a look at these properties.`;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponseText,
      };

      setMessages([...newMessages, assistantMessage]);

      if (isContractorQueryDetected) {
        logger.log('=== CONTRACTOR QUERY COMPLETED ===');
        logger.log('Skipping property search logic for contractor query');
        logger.log('Contractors found:', immediateContractorsFound.length);

        if (user) {
          await saveConversation([...newMessages, assistantMessage]);
        }
        setLoading(false);
        return;
      }

      const criteriaWithAI = parseSearchQuery(query, aiResponseText);
      logger.log('=== AI ENHANCED SEARCH ===');
      logger.log('Criteria after AI response:', criteriaWithAI);
      logger.log('Immediate results count:', immediateResultsFound.length);

      if (!criteriaWithAI) {
        logger.log('AI did not extract criteria, preserving immediate results');
        if (immediateResultsFound.length > 0) {
          logger.log('Ensuring immediate results are displayed');
          setProperties(immediateResultsFound);
          if (immediateCriteria) setLastSearchCriteria(immediateCriteria);
        }
      } else if (!immediateCriteria) {
        logger.log('AI extracted criteria when immediate search had none, searching now');
        const aiResults = await searchProperties(criteriaWithAI);
        if (aiResults.properties.length === 0 && immediateResultsFound.length > 0) {
          logger.log('AI search returned no results, falling back to immediate results');
          setProperties(immediateResultsFound);
          if (immediateCriteria) setLastSearchCriteria(immediateCriteria);
        } else if (aiResults.properties.length > 0) {
          setProperties(aiResults.properties);
          setLastSearchCriteria(criteriaWithAI);
        }
      } else if (areCriteriaEquivalent(criteriaWithAI, immediateCriteria)) {
        logger.log('Criteria are equivalent, preserving initial results');
        if (immediateResultsFound.length > 0) {
          logger.log('Ensuring immediate results are displayed');
          setProperties(immediateResultsFound);
          setLastSearchCriteria(immediateCriteria);
        } else {
          logger.log('No immediate results found, trying AI criteria');
          const aiResults = await searchProperties(criteriaWithAI);
          setProperties(aiResults.properties);
          setLastSearchCriteria(criteriaWithAI);
        }
      } else {
        const immediateCriteriaKeys = Object.keys(normalizeCriteria(immediateCriteria));
        const aiCriteriaKeys = Object.keys(normalizeCriteria(criteriaWithAI));

        const hasMoreCriteria = aiCriteriaKeys.length > immediateCriteriaKeys.length;
        const hasMoreSpecificCriteria = hasMoreCriteria || (
          criteriaWithAI.minPrice !== undefined ||
          criteriaWithAI.maxPrice !== undefined ||
          (criteriaWithAI.features && criteriaWithAI.features.length > 0)
        );

        logger.log('Immediate criteria keys:', immediateCriteriaKeys);
        logger.log('AI criteria keys:', aiCriteriaKeys);
        logger.log('Has more specific criteria:', hasMoreSpecificCriteria);

        if (hasMoreSpecificCriteria) {
          logger.log('AI provided additional meaningful criteria, performing enhanced search');
          const aiResults = await searchProperties(criteriaWithAI);
          if (aiResults.properties.length === 0 && immediateResultsFound.length > 0) {
            logger.log('AI search returned no results, falling back to immediate results');
            setProperties(immediateResultsFound);
            setLastSearchCriteria(immediateCriteria);
          } else if (aiResults.properties.length > 0) {
            setProperties(aiResults.properties);
            setLastSearchCriteria(criteriaWithAI);
          }
        } else {
          logger.log('AI did not add meaningful criteria, preserving immediate results');
          if (immediateResultsFound.length > 0) {
            logger.log('Ensuring immediate results are displayed');
            setProperties(immediateResultsFound);
            setLastSearchCriteria(immediateCriteria);
          }
        }
      }

      // Fallback: ensure immediate results are displayed if we found them and properties is still empty
      if (immediateResultsFound.length > 0 && properties.length === 0) {
        logger.log('Fallback: Setting immediate results as properties were not set through normal flow');
        setProperties(immediateResultsFound);
        if (immediateCriteria) setLastSearchCriteria(immediateCriteria);
      }

      if (user) {
        await saveConversation([...newMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages([...newMessages, errorMessage]);

      if (user) {
        await saveConversation([...newMessages, errorMessage]);
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const saveConversation = async (msgs: Message[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .upsert({
          session_id: sessionId,
          user_id: user.id,
          messages: msgs,
          updated_at: new Date().toISOString()
        }, { onConflict: 'session_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const handleNewChat = () => {
    setMessages([{
      role: 'system',
      content: PLACESI_SYSTEM_PROMPT,
    }]);
    setProperties([]);
    setImmediateResults([]);
    setLastSearchCriteria(null);
    setInput('');
    setSessionId(crypto.randomUUID());
    setInitialQueryProcessed(false);
  };

  const handleSelectChat = async (selectedSessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('session_id', selectedSessionId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSessionId(selectedSessionId);
        setMessages(data.messages as Message[]);

        const lastUserMessage = (data.messages as Message[]).reverse().find(m => m.role === 'user');
        if (lastUserMessage) {
          const lastAssistantMessage = (data.messages as Message[]).reverse().find(m => m.role === 'assistant');
          if (lastAssistantMessage) {
            const criteria = parseSearchQuery(lastUserMessage.content, lastAssistantMessage.content);
            if (criteria) {
              const result = await searchProperties(criteria);
              setProperties(result.properties);
              setLastSearchCriteria(criteria);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!user) {
      setMembersOnlyModalOpen(true);
      return;
    }
    if (!input.trim() || loading) return;

    const query = input;
    await handleSendWithQuery(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayMessages = messages.filter((m) => m.role !== 'system');

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 relative">
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentSessionId={sessionId}
      />

      <div className="w-full lg:w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700 relative">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:block p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Property Search
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChat}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="New Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chat naturally to find your dream property
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide pb-4 lg:pb-4 pb-32">
          {displayMessages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Hello! I'm Placesi, your friendly real estate assistant for Trinidad and Tobago. How can I help you find your perfect property today?
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setInput('Find me 3-bedroom homes in Westmoorings under $2M')}
                  className="block w-full text-left px-4 py-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Find me 3-bedroom homes in Westmoorings under $2M
                  </p>
                </button>
                <button
                  onClick={() => setInput('Show me apartments for rent in Trincity')}
                  className="block w-full text-left px-4 py-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Show me apartments for rent in Trincity
                  </p>
                </button>
              </div>
            </div>
          )}

          {displayMessages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>

              {message.role === 'assistant' && (properties.length > 0 || contractors.length > 0) && index === displayMessages.length - 1 && (
                <div className="lg:hidden mt-4 mb-6 space-y-4">
                  {contractors.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
                      <div className="mb-3">
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {contractors.length} {contractors.length === 1 ? 'Contractor' : 'Contractors'} Found
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Search results
                        </p>
                      </div>
                      <div className="space-y-3">
                        {contractors.map((contractor) => (
                          <ContractorChatCard key={contractor.id} contractor={contractor} />
                        ))}
                      </div>
                    </div>
                  )}
                  {properties.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
                      <div className="mb-3">
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Found
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Search results
                        </p>
                      </div>
                      <div className="space-y-3">
                        {properties.map((property) => (
                          <PropertyRowCard key={property.id} property={property} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
                <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4 lg:h-0" />
        </div>

        <div className="lg:static fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
              }}
              onFocus={(e) => {
                if (!user) {
                  e.preventDefault();
                  e.target.blur();
                  setMembersOnlyModalOpen(true);
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder="Search for properties or contractors..."
              rows={1}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none overflow-y-auto scrollbar-hide"
              style={{ minHeight: '40px', maxHeight: '150px' }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              title="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-gray-800 hidden lg:flex">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Search Results
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {properties.length} properties found
              </p>
            </div>
            <div className="flex-shrink-0 max-w-md w-full">
              <AdBanner
                imageUrl="/buzzad2 copy copy.png"
                altText="Buzz Beer - Get it Now"
                className="max-h-16"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {properties.length === 0 && contractors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Start chatting to see results here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {contractors.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">
                    Contractors Found ({contractors.length})
                  </h3>
                  <div className="grid gap-4">
                    {contractors.map((contractor) => (
                      <ContractorChatCard key={contractor.id} contractor={contractor} />
                    ))}
                  </div>
                </div>
              )}
              {properties.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">
                    Properties Found ({properties.length})
                  </h3>
                  <div className="grid gap-4">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} fromChat={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <MembersOnlyModal
        isOpen={membersOnlyModalOpen}
        onClose={() => setMembersOnlyModalOpen(false)}
      />
    </div>
  );
}
