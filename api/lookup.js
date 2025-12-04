// Territory Lookup API for Go High Level Integration
// This endpoint accepts an address and returns which territory it falls into

const territories = [
  {
    name: "A",
    description: "Northern portion of Northern Territory",
    polygon: [
      [-105.308075, 40.7561],
      [-105.306337, 40.427836],
      [-104.625185, 40.423654],
      [-104.766998, 40.75506],
      [-105.308075, 40.7561]
    ]
  },
  {
    name: "B",
    description: "Southern portion of Northern Territory",
    polygon: [
      [-105.306337, 40.4278355],
      [-105.3085229, 40.0884907],
      [-105.2032807, 40.0876649],
      [-104.9095815, 40.0879562],
      [-104.9006555, 40.0795506],
      [-104.6603316, 40.0811241],
      [-104.6431658, 40.0716663],
      [-104.6129535, 40.0721915],
      [-104.609477, 40.182881],
      [-104.608105, 40.386644],
      [-104.6251846, 40.4236539],
      [-105.306337, 40.4278355]
    ]
  },
  {
    name: "C",
    description: "Northern portion of Southern Territory",
    polygon: [
      [-105.2445389, 39.7269568],
      [-104.6211826, 39.7247472],
      [-104.6129535, 40.0721915],
      [-104.6431658, 40.0716663],
      [-104.6603316, 40.0811241],
      [-104.9006555, 40.0795506],
      [-104.9095815, 40.0879562],
      [-105.308523, 40.088491],
      [-105.317451, 39.990711],
      [-105.272136, 39.783122],
      [-105.2445389, 39.7269568]
    ]
  },
  {
    name: "D",
    description: "Southern portion of Southern Territory",
    polygon: [
      [-105.2445389, 39.7269568],
      [-105.124853, 39.518518],
      [-104.8416145, 39.5142774],
      [-104.8416139, 39.5359925],
      [-104.6253226, 39.5410208],
      [-104.6211826, 39.7247472],
      [-105.2445389, 39.7269568]
    ]
  }
];

// Ray-casting algorithm to check if point is inside polygon
function pointInPolygon(point, polygon) {
  const [x, y] = point; // [longitude, latitude]
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

// Find which territory contains the given coordinates
function findTerritory(lng, lat) {
  for (const territory of territories) {
    if (pointInPolygon([lng, lat], territory.polygon)) {
      return {
        found: true,
        territory: territory.name,
        description: territory.description
      };
    }
  }
  return {
    found: false,
    territory: null,
    description: "Address is outside all service territories"
  };
}

// Geocode an address using Google Maps API
async function geocodeAddress(address, apiKey) {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === 'OK' && data.results.length > 0) {
    const location = data.results[0].geometry.location;
    return {
      success: true,
      lat: location.lat,
      lng: location.lng,
      formatted_address: data.results[0].formatted_address
    };
  }
  
  return {
    success: false,
    error: data.status,
    message: data.error_message || 'Unable to geocode address'
  };
}

// Main API handler
export default async function handler(req, res) {
  // Enable CORS for Go High Level
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Accept both GET and POST
  const address = req.method === 'POST' 
    ? req.body?.address 
    : req.query?.address;
  
  if (!address) {
    return res.status(400).json({
      error: true,
      message: 'Missing required parameter: address',
      example: '/api/lookup?address=123 Main St, Denver, CO 80202'
    });
  }
  
  // Get API key from environment variable
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({
      error: true,
      message: 'Server configuration error: Missing Google Maps API key'
    });
  }
  
  try {
    // Step 1: Geocode the address
    const geocodeResult = await geocodeAddress(address, apiKey);
    
    if (!geocodeResult.success) {
      return res.status(400).json({
        error: true,
        message: 'Could not find address',
        details: geocodeResult.message,
        input_address: address
      });
    }
    
    // Step 2: Find which territory contains this point
    const territoryResult = findTerritory(geocodeResult.lng, geocodeResult.lat);
    
    // Step 3: Return the result
    return res.status(200).json({
      error: false,
      input_address: address,
      formatted_address: geocodeResult.formatted_address,
      coordinates: {
        latitude: geocodeResult.lat,
        longitude: geocodeResult.lng
      },
      territory: territoryResult.territory,
      territory_found: territoryResult.found,
      territory_description: territoryResult.description
    });
    
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Internal server error',
      details: error.message
    });
  }
}
