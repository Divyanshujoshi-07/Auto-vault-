/* ═══════════════════════════════════════════════
   AutoVault 3D — Car Data (10 Cars)
   bodyShape: 'sedan' | 'suv' | 'compact_suv' | 'offroad'
═══════════════════════════════════════════════ */

const CARS = [
  {
    id: 'bmw-m4',
    name: 'M4 Competition',
    brand: 'BMW',
    bodyType: 'Sedan',
    bodyShape: 'sedan',
    badge: 'Performance',
    price: 9500000,
    colors: ['#0C1B33','#1A1A1A','#FFFFFF','#C0392B','#2980B9','#C8A900'],
    defaultColor: '#0C1B33',
    specs: {
      engine: '3.0L i6 Biturbo',
      horsepower: '503 hp',
      torque: '650 Nm',
      fuelType: 'Petrol',
      mileage: '7 km/l',
      topSpeed: '290 km/h',
      acceleration: '3.9 sec',
      transmission: '8-Spd M Steptronic',
      seats: 4,
      safety: ['6 Airbags','Lane Assist','Blind Spot','Park Sensors','ABS','ESC']
    },
    features: [
      'Adaptive M Suspension',
      'Carbon Fibre Roof',
      'Harman Kardon Audio',
      'Heated Sport Seats',
      'Wireless Charging',
      'Head-Up Display',
      'M Traction Control',
      'Active Exhaust System'
    ],
    description: 'The BMW M4 Competition is the pinnacle of sports car performance — a road-legal race car that delivers 503 hp with razor-sharp dynamics and driver-focused refinement.'
  },
  {
    id: 'bmw-x5',
    name: 'X5 xDrive50e',
    brand: 'BMW',
    bodyType: 'SUV',
    bodyShape: 'suv',
    badge: 'Plug-in Hybrid',
    price: 12500000,
    colors: ['#2C3E50','#ECF0F1','#1A1A1A','#8B4513','#1E5799','#2D7D2D'],
    defaultColor: '#2C3E50',
    specs: {
      engine: '3.0L i6 + Electric',
      horsepower: '489 hp',
      torque: '700 Nm',
      fuelType: 'Hybrid',
      mileage: '14 km/l',
      topSpeed: '250 km/h',
      acceleration: '4.4 sec',
      transmission: '8-Spd Steptronic',
      seats: 5,
      safety: ['8 Airbags','Active Cruise','Lane Keep','ABS','ESC','Night Vision']
    },
    features: [
      'Panoramic Sunroof',
      '40km Electric Range',
      'Bowers & Wilkins Audio',
      'Massaging Front Seats',
      'Rear Entertainment',
      '4-Zone Climate Control',
      'Gesture Control',
      'Air Suspension'
    ],
    description: 'The BMW X5 xDrive50e merges electrified performance with luxury SUV versatility — 40km of pure electric range paired with a muscular inline-six hybrid powertrain.'
  },
  {
    id: 'toyota-camry',
    name: 'Camry Hybrid',
    brand: 'Toyota',
    bodyType: 'Sedan',
    bodyShape: 'sedan',
    badge: 'Hybrid',
    price: 4600000,
    colors: ['#FFFFFF','#1A1A1A','#C0C0C0','#DC143C','#000080','#2E8B57'],
    defaultColor: '#FFFFFF',
    specs: {
      engine: '2.5L 4-Cyl Hybrid',
      horsepower: '218 hp',
      torque: '221 Nm',
      fuelType: 'Hybrid',
      mileage: '19 km/l',
      topSpeed: '180 km/h',
      acceleration: '8.3 sec',
      transmission: 'e-CVT',
      seats: 5,
      safety: ['8 Airbags','Toyota Safety Sense','Auto Emergency Braking','Lane Departure Alert','Pre-Collision','Adaptive Cruise']
    },
    features: [
      'Toyota Safety Sense 3.0',
      '9-inch Touchscreen',
      'JBL Premium Audio',
      'Ventilated Front Seats',
      'Wireless Apple CarPlay',
      'Digital Rear-View Mirror',
      'Panoramic Moonroof',
      'Hybrid Battery Warranty'
    ],
    description: 'The Toyota Camry Hybrid delivers outstanding fuel economy without compromise — a near-silent highway cruiser wrapped in premium interior quality and packed with Toyota Safety Sense technology.'
  },
  {
    id: 'toyota-fortuner',
    name: 'Fortuner Legender',
    brand: 'Toyota',
    bodyType: 'SUV',
    bodyShape: 'suv',
    badge: 'Legend',
    price: 4800000,
    colors: ['#1A1A1A','#F5F5F5','#8B0000','#708090','#2F4F4F','#D4A017'],
    defaultColor: '#1A1A1A',
    specs: {
      engine: '2.8L 4-Cyl Turbodiesel',
      horsepower: '204 hp',
      torque: '500 Nm',
      fuelType: 'Diesel',
      mileage: '14 km/l',
      topSpeed: '180 km/h',
      acceleration: '9.1 sec',
      transmission: '6-Spd Automatic',
      seats: 7,
      safety: ['7 Airbags','VSC','DAC','ATRC','Pre-Collision','Crawl Control']
    },
    features: [
      '4WD with Crawl Control',
      'Bi-LED Headlights',
      '8-inch Touchscreen',
      'JBL 11-Speaker System',
      'Power Adjustable Seats',
      'Sunroof',
      'Multi-Terrain Select',
      'Hill Start Assist'
    ],
    description: 'The Toyota Fortuner Legender is India\'s ultimate family SUV — bulletproof reliability, go-anywhere capability, and commanding road presence, powered by a 204 hp diesel engine with 500 Nm of torque.'
  },
  {
    id: 'tata-nexon-ev',
    name: 'Nexon EV Max',
    brand: 'Tata',
    bodyType: 'Compact SUV',
    bodyShape: 'compact_suv',
    badge: 'Electric',
    price: 1990000,
    colors: ['#1E3A5F','#FFFFFF','#2E4D2E','#CC3333','#333333','#8B6914'],
    defaultColor: '#1E3A5F',
    specs: {
      engine: '40.5 kWh Battery',
      horsepower: '143 hp',
      torque: '250 Nm',
      fuelType: 'Electric',
      mileage: '437 km/charge',
      topSpeed: '150 km/h',
      acceleration: '8.9 sec',
      transmission: 'Single-Speed Auto',
      seats: 5,
      safety: ['6 Airbags','ABS','EBD','ESC','TPMS','Corner Stability Control']
    },
    features: [
      '437 km ARAI Range',
      'DC Fast Charging (50kW)',
      'Zconnect Connected Tech',
      'Cruise Control',
      'Ambient Lighting',
      '10.25-inch Floating Display',
      'Regenerative Braking Modes',
      'V2L (Vehicle to Load)'
    ],
    description: 'The Tata Nexon EV Max is India\'s best-selling electric SUV — offering class-leading range, smart connected features, and 5-star safety in an affordable, future-ready package.'
  },
  {
    id: 'tata-harrier',
    name: 'Harrier Dark',
    brand: 'Tata',
    bodyType: 'SUV',
    bodyShape: 'suv',
    badge: 'Dark Edition',
    price: 2600000,
    colors: ['#0A0A0A','#1A1A2E','#4A0000','#1E3A5F','#2D2D2D','#3D1E0F'],
    defaultColor: '#0A0A0A',
    specs: {
      engine: '2.0L Kryotec Diesel',
      horsepower: '170 hp',
      torque: '350 Nm',
      fuelType: 'Diesel',
      mileage: '16 km/l',
      topSpeed: '180 km/h',
      acceleration: '9.5 sec',
      transmission: '6-Spd Automatic (Hydrex)',
      seats: 5,
      safety: ['6 Airbags','EBA','Corner Stability','AHC','TPMS','360° Cameras']
    },
    features: [
      'Dark Edition Styling',
      'Panoramic Sunroof',
      'iRA Connected Tech',
      '10.25" Infotainment',
      'JBL 9-Speaker System',
      'Terrain Modes (5)',
      'Leatherette Dark Interior',
      'Wireless Charging'
    ],
    description: 'The Tata Harrier Dark Edition is a bold, blacked-out statement — commanding 5-star NCAP safety, a 170 hp diesel engine, and premium Omega ARC architecture that redefines what \'Made in India\' means.'
  },
  {
    id: 'mahindra-xuv700',
    name: 'XUV700 AX7',
    brand: 'Mahindra',
    bodyType: 'SUV',
    bodyShape: 'suv',
    badge: 'Flagship',
    price: 2900000,
    colors: ['#1C1C1C','#FFFFFF','#8B2500','#1E3A5F','#C0C0C0','#2D5016'],
    defaultColor: '#1C1C1C',
    specs: {
      engine: '2.2L mHawk Turbodiesel',
      horsepower: '185 hp',
      torque: '420 Nm',
      fuelType: 'Diesel',
      mileage: '15 km/l',
      topSpeed: '200 km/h',
      acceleration: '8.5 sec',
      transmission: '6-Spd Torque Converter AT',
      seats: 7,
      safety: ['7 Airbags','ADAS Level 2','AEB','Lane Keep Assist','Driver Drowsiness','Blind Spot Detection']
    },
    features: [
      'ADAS Level 2 (60+ features)',
      'Dual 10.25" Screens',
      'Sony 3D Sound System',
      'Leatherette + Suede Interior',
      'Smart Pilot Assist',
      'Auto Parking',
      'All-Wheel Drive (AWD)',
      'AdrenoX Connected Suite'
    ],
    description: 'The Mahindra XUV700 AX7 is India\'s technology flagship — packing 60+ ADAS features, class-leading interior space, a Sony 3D audio system, and AWD capability into an unbeatable value proposition.'
  },
  {
    id: 'mahindra-thar',
    name: 'Thar ROXX',
    brand: 'Mahindra',
    bodyType: 'Off-Road',
    bodyShape: 'offroad',
    badge: 'Iconic',
    price: 2200000,
    colors: ['#1A3A1A','#1A1A1A','#8B1A1A','#3B3B3B','#D4A017','#2E4D7B'],
    defaultColor: '#1A3A1A',
    specs: {
      engine: '2.2L mHawk 4-Cyl',
      horsepower: '175 hp',
      torque: '370 Nm',
      fuelType: 'Diesel',
      mileage: '12 km/l',
      topSpeed: '160 km/h',
      acceleration: '11.2 sec',
      transmission: '6-Spd Automatic 4WD',
      seats: 4,
      safety: ['6 Airbags','ABS','ESC','Rollover Mitigation','Hill Descent','Electronic Locking Diff']
    },
    features: [
      '4x4 with Low Range',
      'Wading Depth 650mm',
      'Rock Crawl Mode',
      'Convertible Soft-Top Option',
      '10.25" Infotainment',
      'Dual-Tone Interior',
      'Tubular Side Steps',
      'Adventure Statistics Display'
    ],
    description: 'The Mahindra Thar ROXX is India\'s most iconic off-roader — a 4-door adventure machine with go-anywhere 4WD capability, 650mm wading depth, and the soul of the legendary Thar bloodline.'
  },
  {
    id: 'mercedes-c',
    name: 'C-Class AMG Line',
    brand: 'Mercedes',
    bodyType: 'Sedan',
    bodyShape: 'sedan',
    badge: 'Luxury',
    price: 7200000,
    colors: ['#FFFFFF','#1A1A1A','#C0C0C0','#3B1A5A','#1A2F4A','#8B4513'],
    defaultColor: '#FFFFFF',
    specs: {
      engine: '1.5L 4-Cyl + EQ Boost',
      horsepower: '204 hp',
      torque: '300 Nm',
      fuelType: 'Petrol',
      mileage: '14 km/l',
      topSpeed: '240 km/h',
      acceleration: '7.3 sec',
      transmission: '9G-TRONIC Auto',
      seats: 5,
      safety: ['9 Airbags','Active Brake Assist','Attention Assist','Lane Keep','Blind Spot','360° Camera']
    },
    features: [
      '12.3" MBUX Cockpit',
      '11.9" Vertical Touchscreen',
      'Burmester Surround Sound',
      'Ambient Lighting (64-colour)',
      'AIRMATIC Air Suspension',
      'AMG Sport Package',
      'Augmented Reality Nav',
      'Digital Light Headlamps'
    ],
    description: 'The Mercedes-Benz C-Class AMG Line is the definitive luxury sedan — blending cutting-edge MBUX technology, opulent materials, and AMG Sport aesthetics in a package that sets the benchmark for the segment.'
  },
  {
    id: 'hyundai-creta',
    name: 'Creta N Line',
    brand: 'Hyundai',
    bodyType: 'Compact SUV',
    bodyShape: 'compact_suv',
    badge: 'N Line',
    price: 2000000,
    colors: ['#CC0000','#1A1A1A','#FFFFFF','#1E3A5F','#2D5016','#8B6914'],
    defaultColor: '#CC0000',
    specs: {
      engine: '1.5L 4-Cyl Turbo',
      horsepower: '160 hp',
      torque: '253 Nm',
      fuelType: 'Petrol',
      mileage: '14 km/l',
      topSpeed: '185 km/h',
      acceleration: '8.5 sec',
      transmission: '7-Spd DCT',
      seats: 5,
      safety: ['6 Airbags','ADAS Level 2','AEB','Lane Keeping','Driver Attention Alert','Blind Spot Collision Warning']
    },
    features: [
      'N Line Sport Styling',
      '10.25" Infotainment',
      'Bose 8-Speaker Premium Sound',
      'Panoramic Sunroof',
      'Ventilated Front Seats',
      'ADAS Level 2',
      'Digital Key 2.0',
      'Wireless Android Auto/CarPlay'
    ],
    description: 'The Hyundai Creta N Line is India\'s sporty compact SUV — featuring N Line red accents, a tuned 160 hp turbocharged engine, ADAS Level 2 safety, and premium Bose audio in a driver-focused package.'
  }
];

// Helper: format price in Indian system
function formatPrice(p) {
  if (p >= 10000000) return `₹${(p/10000000).toFixed(2)} Cr`;
  if (p >= 100000)   return `₹${(p/100000).toFixed(2)} L`;
  return `₹${p.toLocaleString('en-IN')}`;
}
