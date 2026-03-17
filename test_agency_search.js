// Test agency name extraction
const query = "show me listings from Alcazar Realtors";

const agencyPatterns = [
    /(?:from|by|listed by)\s+agency\s+([A-Z][a-zA-Z0-9&\s]+?)(?=\s+(?:for|in|with|$))/i,
    /(?:show|find|get|search)(?:\s+me)?\s+(?:listings|properties|homes|houses|apartments)\s+(?:from|by|listed by)\s+agency\s+([A-Z][a-zA-Z0-9&\s]+?)(?=\s+(?:for|in|with|$))/i,
    /agency\s+([A-Z][a-zA-Z0-9&\s]+?)(?:'s)?\s+(?:listings|properties|homes|houses|apartments)/i,
    /(?:from|by|listed by)\s+([A-Z][a-zA-Z0-9&\s]+?)\s+(?:the\s+)?agency/i,
    /(?:from|by|at)\s+([A-Z][a-zA-Z0-9&\s]{2,})(?=\s+(?:agency)?\s*$)/i,
    /agency\s+([A-Z][a-zA-Z0-9&\s]+)/i
];

console.log('Testing query:', query);
console.log('');

for (let i = 0; i < agencyPatterns.length; i++) {
    const pattern = agencyPatterns[i];
    const match = query.match(pattern);
    console.log(`Pattern ${i + 1}:`, pattern.toString());
    console.log('  Match:', match ? match[1] : 'No match');
    console.log('');
}
