export interface FarmerProfileData {
  // Step 1: Farm Information
  profilePhoto: File | null
  farmName: string
  farmLocation: string
  farmSize: string
  yearEstablished: string
  farmDescription: string
  
  // Step 2: Animals & Crops
  animals: string[]
  customAnimals: string[]
  newAnimalInput: string
  crops: string[]
  customCrops: string[]
  newCropInput: string
  
  // Step 3: Activities
  activities: string[]
  customActivities: string[]
  newActivityInput: string
  newActivityCategory: string
  
  // Step 4: Facilities & Accommodation
  facilities: string[]
  customfacilities: string[]
  newFacilityInput: string
  accommodation: boolean
  accommodationDetails: string
  maxGuests: string
  
  // Step 5: Media
  farmPhotos: File[]
  photoUrls: string[]
  farmVideo: string
  
  // Step 6: Verification
  businessLicense: File | null
  insuranceDocs: File | null
  certifications: File[]
  nationalID: File | null
}

export const ANIMAL_OPTIONS = [
  'Cows', 'Goats', 'Sheep', 'Chickens', 'Pigs', 'Horses', 
  'Donkeys', 'Ducks', 'Geese', 'Turkeys', 'Rabbits', 'Bees',
  'Llamas', 'Alpacas', 'Fish'
] as const

export const CROP_OPTIONS = [
  'Maize', 'Beans', 'Potatoes', 'Tomatoes', 'Kale (Sukuma)',
  'Cabbage', 'Carrots', 'Onions', 'Spinach', 'Bananas',
  'Avocados', 'Mangoes', 'Oranges', 'Strawberries', 'Coffee',
  'Tea', 'Sunflowers', 'Wheat', 'Barley'
] as const

export const ACTIVITY_CATEGORIES = {
  'Tours & Education': [
    'Farm Tours', 'School Groups', 'Educational Workshops', 
    'Cooking Classes', 'Preserving & Canning Classes'
  ],
  'Animal Encounters': [
    'Animal Feeding', 'Petting Zoo', 'Horseback Riding', 
    'Animal Yoga', 'Animal Care'
  ],
  'Hands-on Farming': [
    'Harvesting', 'Planting', 'Fruit Picking', 'Vegetable Picking',
    'Egg Collecting', 'Beekeeping Demos', 'Honey Harvesting', 'U-Pick Operations'
  ],
  'Workshops & Crafts': [
    'Pottery Workshops', 'Woodworking', 'Basket Weaving',
    'Flower Arranging', 'Wreath Making', 'Soap Making',
    'Candle Making', 'Wool Spinning'
  ],
  'Events & Venues': [
    'Wedding Venue', 'Private Events', 'Birthday Parties',
    'Corporate Retreats', 'Team Building', 'Family Reunions', 'Picnic Areas'
  ],
  'Seasonal Fun': [
    'Pumpkin Patch', 'Christmas Tree Sales', 'Easter Egg Hunts',
    'Hayrides', 'Corn Maze', 'Sunflower Mazes', 'Sleigh Rides'
  ],
  'Food & Drink': [
    'Farm-to-Table Dinners', 'Wine Tastings', 'Cider Tastings',
    'Cheese Tastings', 'Breakfast on the Farm', 'Picnic Lunches', 'BBQ Nights'
  ],
  'Wellness & Nature': [
    'Yoga Retreats', 'Meditation Sessions', 'Forest Bathing',
    'Nature Walks', 'Bird Watching', 'Stargazing'
  ],
  'Unique Stays': [
    'Farm Stay Accommodation', 'Glamping', 'Camping'
  ],
  'Special Programs': [
    'Woofing (Willing Workers)', 'Volunteer Days',
    'CSA Pickup Events', 'Farmers Market on-site'
  ]
} as const

export const FACILITY_OPTIONS = [
  'Parking', 'Restrooms', 'Restaurant', 'Camping',
  'Wheelchair Access', 'Kids Play Area', 'Picnic Area',
  'BBQ Area', 'Fire Pit', 'Walking Trails'
] as const

export const FORM_STEPS = [
  { id: 1, name: 'Farm Info', required: ['farmName', 'farmLocation', 'farmDescription'] },
  { id: 2, name: 'Animals & Crops', required: [] },
  { id: 3, name: 'Activities', required: ['activities'] },
  { id: 4, name: 'Facilities', required: [] },
  { id: 5, name: 'Media', required: [] },
  { id: 6, name: 'Verification', required: [] }
] as const