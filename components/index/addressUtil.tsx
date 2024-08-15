// Map of state names to their abbreviations
const stateAbbreviations = {
    alabama: 'AL',
    alaska: 'AK',
    arizona: 'AZ',
    arkansas: 'AR',
    california: 'CA',
    colorado: 'CO',
    connecticut: 'CT',
    delaware: 'DE',
    florida: 'FL',
    georgia: 'GA',
    hawaii: 'HI',
    idaho: 'ID',
    illinois: 'IL',
    indiana: 'IN',
    iowa: 'IA',
    kansas: 'KS',
    kentucky: 'KY',
    louisiana: 'LA',
    maine: 'ME',
    maryland: 'MD',
    massachusetts: 'MA',
    michigan: 'MI',
    minnesota: 'MN',
    mississippi: 'MS',
    missouri: 'MO',
    montana: 'MT',
    nebraska: 'NE',
    nevada: 'NV',
    'new hampshire': 'NH',
    'new jersey': 'NJ',
    'new mexico': 'NM',
    'new york': 'NY',
    'north carolina': 'NC',
    'north dakota': 'ND',
    ohio: 'OH',
    oklahoma: 'OK',
    oregon: 'OR',
    pennsylvania: 'PA',
    'rhode island': 'RI',
    'south carolina': 'SC',
    'south dakota': 'SD',
    tennessee: 'TN',
    texas: 'TX',
    utah: 'UT',
    vermont: 'VT',
    virginia: 'VA',
    washington: 'WA',
    'west virginia': 'WV',
    wisconsin: 'WI',
    wyoming: 'WY'
};

// Function to abbreviate state names
const abbreviateStateNames = (address: string) => {
    return address.replace(/,\s*([a-zA-Z\s]+)(?=,|$)/g, (match, stateName) => {
        const lowerStateName = stateName.toLowerCase().trim();
        // @ts-ignore
        return stateAbbreviations[lowerStateName] ? `, ${stateAbbreviations[lowerStateName]}` : match;
    });
};

const normalizeAbbreviations = (address: string) => {
    return address
        .replace(/\bSt\b/g, 'Street')
        .replace(/\bAve\b/g, 'Avenue')
        .replace(/\bRd\b/g, 'Road')
        .replace(/\bBlvd\b/g, 'Boulevard');
};

const keywords = [
    'Apartment Homes',
    'Suites',
    'Floor',
    'Unit',
    'Building',
    'Suite',
];

export function cleanAddress(address: string){

    let cleaned = address.replace(/\b\d{5}(?:-\d{4})?\b\s*(,|$)/, '');
    cleaned = cleaned.replace(/,\s*United States/, '');
    cleaned = normalizeAbbreviations(cleaned);
    cleaned = abbreviateStateNames(cleaned);
    keywords.forEach((keyword) => {
        const regex = new RegExp(`,\\s*[^,]*?${keyword}[^,]*?(,|$)`, 'gi');
        cleaned = cleaned.replace(regex, ',');
    });
    cleaned = cleaned.replace(/,\s*,/g, ',').replace(/,\s*$/, '').trim();
    return cleaned.trim();
};

