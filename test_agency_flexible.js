const queries = [
    "show me listings from Alcazar Realtors",
    "show me listings from agency Alcazar Realtors",
    "show me properties from RE/MAX",
    "what does Prestige Realty have available",
    "properties from Tucker Real Estate",
    "show me homes by Your Move Real Estate",
    "listings at Century 21",
    "find me properties from Keller Williams",
];

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

console.log('Testing Agency Name Detection Patterns\n');
console.log('='.repeat(60));

queries.forEach(query => {
    console.log(`\nQuery: "${query}"`);
    let found = false;
    
    for (let i = 0; i < agencyPatterns.length; i++) {
        const match = query.match(agencyPatterns[i]);
        if (match && match[1]) {
            const agencyName = match[1].trim();
            const businessSuffixes = /\s+(?:realtors?|realty|properties|real estate|group|company|agency|inc\.?|ltd\.?|llc)$/i;
            const hasBusinessIndicator = businessSuffixes.test(agencyName);
            const wordCount = agencyName.split(/\s+/).length;
            
            if (hasBusinessIndicator || wordCount >= 2) {
                console.log(`  ✓ Pattern ${i + 1} matched`);
                console.log(`    Agency: "${agencyName}"`);
                console.log(`    Has business indicator: ${hasBusinessIndicator}`);
                console.log(`    Word count: ${wordCount}`);
                found = true;
                break;
            }
        }
    }
    
    if (!found) {
        console.log('  ✗ No match found');
    }
});

console.log('\n' + '='.repeat(60));
