// Comprehensive test of the search logic

// Simulate what happens when searching "show me listings in arima with a powder room and a shared pool"

// Step 1: Parse features
const userQuery = "show me listings in arima with a powder room and a shared pool";
const fullQuery = userQuery.toLowerCase();

console.log('=== STEP 1: PARSE FEATURES ===');
console.log('User query:', userQuery);
console.log('Full query (lowercase):', fullQuery);

const featuresNeeded = ['Powder Room', 'Shared Pool'];
console.log('Features needed:', featuresNeeded);

// Step 2: Simulate property query results (from database)
const arimaProperties = [
  { id: 'ebdb35ec-d246-493a-8534-3329cf23e117', title: 'Mandalay Gardens, Buena Vista Estate, Arima' }
];

console.log('\n=== STEP 2: INITIAL QUERY (CITY=ARIMA) ===');
console.log('Properties found:', arimaProperties.length);
console.log('Titles:', arimaProperties.map(p => p.title));

// Step 3: Simulate feature data from database
const featureData = [
  { property_id: 'ebdb35ec-d246-493a-8534-3329cf23e117', feature_name: 'Parking on Compound' },
  { property_id: 'ebdb35ec-d246-493a-8534-3329cf23e117', feature_name: 'Pet-friendly Policy' },
  { property_id: 'ebdb35ec-d246-493a-8534-3329cf23e117', feature_name: 'Powder Room' },
  { property_id: 'ebdb35ec-d246-493a-8534-3329cf23e117', feature_name: 'Walk-in Closet(s)' },
  { property_id: 'ebdb35ec-d246-493a-8534-3329cf23e117', feature_name: 'Air Conditioning' },
  { property_id: 'ebdb35ec-d246-493a-8534-3329cf23e117', feature_name: 'Water Tank' },
  { property_id: 'ebdb35ec-d246-493a-8534-3329cf23e117', feature_name: 'Gated Community' },
  { property_id: 'ebdb35ec-d246-493a-8534-3329cf23e117', feature_name: 'Shared Pool' },
  { property_id: 'ebdb35ec-d246-493a-8534-3329cf23e117', feature_name: 'Security Patrols' }
];

console.log('\n=== STEP 3: FETCH FEATURES ===');
console.log('Feature records retrieved:', featureData.length);

// Step 4: Build property-feature map (JavaScript logic)
const propertyFeatureMap = new Map();
featureData.forEach(pf => {
  if (!propertyFeatureMap.has(pf.property_id)) {
    propertyFeatureMap.set(pf.property_id, new Set());
  }
  propertyFeatureMap.get(pf.property_id).add(pf.feature_name);
});

console.log('\n=== STEP 4: BUILD FEATURE MAP ===');
console.log('Properties in map:', propertyFeatureMap.size);
for (const [propId, features] of propertyFeatureMap.entries()) {
  console.log('Property', propId + ':', Array.from(features));
}

// Step 5: Filter properties (the critical logic)
console.log('\n=== STEP 5: FILTER PROPERTIES ===');
const filteredProperties = arimaProperties.filter(property => {
  const propertyFeatures = propertyFeatureMap.get(property.id);
  console.log('\nChecking property:', property.title);
  console.log('  Property ID:', property.id);
  console.log('  Features in map:', propertyFeatures ? Array.from(propertyFeatures) : 'NONE');

  if (!propertyFeatures) {
    console.log('  ❌ NO features found in map');
    return false;
  }

  console.log('  Checking if has ALL required features...');
  const results = featuresNeeded.map(feature => {
    const has = propertyFeatures.has(feature);
    console.log('    ' + feature + ':', has ? '✅' : '❌');
    return has;
  });

  const hasAll = results.every(r => r);
  console.log('  Final result:', hasAll ? '✅ HAS ALL' : '❌ MISSING SOME');

  return hasAll;
});

console.log('\n=== FINAL RESULT ===');
console.log('Filtered properties:', filteredProperties.length);
console.log('Titles:', filteredProperties.map(p => p.title));
