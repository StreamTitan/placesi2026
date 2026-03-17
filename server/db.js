// Trinidad & Tobago Regions Data
export const regions = {
  central: {
    name: 'Central',
    areas: [
      'Balmain', 'Balmain Gardens', 'California', 'Carapichaima', 'Caroni',
      'Central Park', 'Chaguanas', 'Charlieville', 'Chase Village', 'Chin Chin',
      'Couva', 'Cunupia', 'Edinburgh', 'Endeavour', 'Esperanza', 'Exchange',
      'Felicity', 'Flanagin Town', 'Freeport', 'Gran Couva', 'Jerningham Junction',
      'Kelly Village', 'Lange Park', 'Longdenville', 'Mamoral', 'Piparo',
      'Point Lisas', 'Preysal', 'Reform', 'Roystonia', 'Savonetta', 'St. Helena',
      'Tabaquite', 'Talparo', "Todd's Road", 'Tortuga', 'Waterloo'
    ]
  },
  northEast: {
    name: 'North East',
    areas: [
      'Aranguez', 'Arima', 'Arouca', 'Balandra', 'Bamboo', 'Barataria', 'Biche',
      'Blanchisseuse', 'Brazil', 'Caura', 'Champs Fleurs', 'Cumaca', 'Cumuto',
      'Curepe', "D'abadie", 'El Dorado', 'El Socorro', 'Grand Riviere', 'La Fillette',
      'La Horquetta', 'Las Cuevas', 'Las Lomas', 'Lopinot', 'Macoya', 'Maloney',
      'Manzanilla', 'Maracas', 'Maracas Bay', 'Maracas Valley', 'Matura', 'Mausica',
      'Mt. Hope', 'Mt. Lambert', 'Orange Grove Estates', 'Paria', 'Petit Bourg',
      'Piarco', 'Salybia', 'San Juan', 'San Raphael', 'Sangre Chiquito',
      'Sangre Grande', 'Sans Souci', 'Santa Cruz', 'Santa Rosa', 'St. Augustine',
      'St. Joseph', 'Tacarigua', 'Toco', 'Trincity', 'Tunapuna', 'Valencia',
      'Valsayn', 'Wallerfield'
    ]
  },
  northWest: {
    name: 'North West',
    areas: [
      'Alyce Glen', 'Bayshore', 'Bayside', 'Bayview', 'Belmont', 'Blue Basin',
      'Blue Range', 'Buoys', 'Carenage', 'Cascade', 'Chaguaramas', 'Cocorite',
      'Diamond Vale', 'Diego Martin', 'Ellerslie Park', 'Fairways', 'Federation Park',
      'Fort George', 'Gasparee Island', 'Gasper Grande', 'Glencoe', 'Goodwood Gardens',
      'Goodwood Heights', 'Goodwood Park', 'Haleland Park', 'Hillsboro',
      'Lady Chancellor', 'Laventille', 'Long Circular', 'Maraval', 'Moka',
      'Monos Island', 'Morvant', 'Mucurapo', 'Newtown', 'Paramin', 'Perseverance',
      'Petit Valley', 'Point Cumana', 'Port of Spain', 'Shorelands', "St. Ann's",
      'St. Clair', 'St. James', 'Victoria Gardens', 'Westmoorings', 'Woodbrook'
    ]
  },
  southEast: {
    name: 'South East',
    areas: [
      'Galeota', 'Guayaguayare', 'Mayaro', 'Rio Claro', 'Tableland', 'Williamsville'
    ]
  },
  southWest: {
    name: 'South West',
    areas: [
      'Aripero', 'Avocat', 'Barrackpore', 'Bel Air', 'Brode Narve', 'Caratal',
      'Cedros', 'Chatam', 'Claxton Bay', 'Cocoyea', 'Cross Crossing', 'Debe',
      'Dow Village', 'Duncan Village', 'Erin', 'Esperance', 'Fyzabad', 'Gasparillo',
      'Gopaul Lands', 'Granville', 'Gulf View', 'Hermitage', 'La Brea', 'La Romain',
      'Marabella', 'Mootoo Lands', 'Moruga', 'Otaheite', 'Palmiste', 'Palo Seco',
      'Penal', 'Phillipine', 'Plaisance Park', 'Point Fortin', 'Pointe-a-Pierre',
      'Princes Town', 'Retrench Village', 'Rousillac', 'San Fernando', 'Siparia',
      'South Oropouche', 'St. Joseph Village', 'Ste. Madeleine', 'Union Hall',
      'Vistabella', 'Woodland'
    ]
  },
  tobago: {
    name: 'Tobago',
    areas: [
      'Arnos Vale', 'Bacolet', 'Bethany', 'Black Rock', 'Bon Accord', 'Buccoo',
      'Canaan', 'Carnbee', 'Castara', 'Concordia', 'Courland', 'Crown Point',
      'Englishmans Bay', 'Goodwood', 'Grafton', 'Granby', 'Grange', 'Hope Estate',
      'Lambeau', 'Les Coteaux', "Little Englishman's Bay", "Louis d'Or", 'Lowlands',
      "Mary's Hill", 'Mason Hall', 'Moriah', 'Mt Pleasant', 'Mt. Irvine',
      'Mt. St. George', 'Orange Hill', 'Parlatuvier', 'Plymouth', 'Prospect',
      'Riseland', 'Roxborough', 'Samaan Grove', 'Scarborough', 'Sherwood Park',
      'Shirvan Road', 'Signal Hill', 'Speyside', 'Tobago Plantations'
    ]
  }
}

// Property Types
export const propertyTypes = [
  'House',
  'Apartment',
  'Condo',
  'Townhouse',
  'Villa',
  'Estate',
  'Land',
  'Commercial',
  'Warehouse',
  'Office',
  'Retail'
]

// Listing Types
export const listingTypes = ['For Sale', 'For Rent', 'Short Term Rental']

// User Roles
export const userRoles = {
  admin: 'admin',
  agency: 'agency',
  agent: 'agent',
  owner: 'owner',
  serviceProvider: 'service_provider'
}

// Subscription Plans
export const subscriptionPlans = {
  agent: {
    name: 'Agent',
    price: 100,
    currency: 'TTD',
    interval: 'month',
    features: ['Unlimited listings', 'AI assistant', 'Analytics dashboard']
  },
  agency: {
    name: 'Agency',
    price: 1000,
    currency: 'TTD',
    interval: 'month',
    maxAgents: 15,
    features: ['Up to 15 agents', 'Team management', 'Agency branding', 'Priority support']
  },
  serviceProvider: {
    name: 'Service Provider',
    price: 50,
    currency: 'TTD',
    interval: 'month',
    features: ['Business profile', 'Lead generation', 'Service listings']
  },
  owner: {
    name: 'Property Owner',
    price: 0,
    currency: 'TTD',
    interval: 'month',
    features: ['List your own properties', 'Basic analytics']
  }
}
