// Test feature parsing
const userQuery = "i'm looking for a listing in cascade with an attic and a shared pool";
const fullQuery = userQuery.toLowerCase();

console.log('Full query:', fullQuery);
console.log('Contains "attic":', fullQuery.includes('attic'));
console.log('Contains "shared pool":', fullQuery.includes('shared pool'));

// Test the exact matching logic
const featureKeywords = {
  'Attic': ['attic', 'attic space', 'loft', 'upper storage', 'attic storage'],
  'Shared Pool': ['shared pool', 'common pool', 'communal pool', 'community pool'],
};

const matchedFeatures = [];

// Test Attic
if (fullQuery.includes('attic')) {
  console.log('✅ Matched: Attic');
  matchedFeatures.push('Attic');
} else {
  for (const keyword of featureKeywords['Attic']) {
    if (fullQuery.includes(keyword)) {
      console.log('✅ Matched: Attic via keyword:', keyword);
      matchedFeatures.push('Attic');
      break;
    }
  }
}

// Test Shared Pool
if (fullQuery.includes('shared pool')) {
  console.log('✅ Matched: Shared Pool');
  matchedFeatures.push('Shared Pool');
} else {
  for (const keyword of featureKeywords['Shared Pool']) {
    if (fullQuery.includes(keyword)) {
      console.log('✅ Matched: Shared Pool via keyword:', keyword);
      matchedFeatures.push('Shared Pool');
      break;
    }
  }
}

console.log('\nFinal matched features:', matchedFeatures);
