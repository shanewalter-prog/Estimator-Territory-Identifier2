// Local test script - run with: node test-territories.js
// This tests the point-in-polygon logic without needing Google Maps API

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

function pointInPolygon(point, polygon) {
  const [x, y] = point;
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

function findTerritory(lng, lat) {
  for (const territory of territories) {
    if (pointInPolygon([lng, lat], territory.polygon)) {
      return territory;
    }
  }
  return null;
}

// Test cases with known Colorado locations
const testLocations = [
  { name: "Fort Collins (Downtown)", lng: -105.0844, lat: 40.5853, expected: "A" },
  { name: "Loveland", lng: -105.0749, lat: 40.3977, expected: "B" },
  { name: "Longmont", lng: -105.1019, lat: 40.1672, expected: "B" },
  { name: "Boulder", lng: -105.2705, lat: 40.0150, expected: "C" },
  { name: "Westminster", lng: -105.0372, lat: 39.8366, expected: "C" },
  { name: "Denver (Downtown)", lng: -104.9903, lat: 39.7392, expected: "C or D" },
  { name: "Centennial", lng: -104.8769, lat: 39.5807, expected: "D" },
  { name: "Los Angeles (Outside)", lng: -118.2437, lat: 34.0522, expected: "None" },
];

console.log("Territory Lookup Test Results");
console.log("=============================\n");

testLocations.forEach(loc => {
  const result = findTerritory(loc.lng, loc.lat);
  const territory = result ? result.name : "None";
  const status = territory === loc.expected || loc.expected.includes(territory) ? "✓" : "?";
  
  console.log(`${status} ${loc.name}`);
  console.log(`  Coordinates: ${loc.lat}, ${loc.lng}`);
  console.log(`  Territory: ${territory}`);
  console.log(`  Expected: ${loc.expected}`);
  if (result) {
    console.log(`  Description: ${result.description}`);
  }
  console.log("");
});

console.log("=============================");
console.log("Test complete! If results look correct, your territories are set up properly.");
