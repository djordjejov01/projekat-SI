export enum ResourceType {
  Exhaustable = 'Exhaustable',
  Inexhaustable = 'Inexhaustable'
}

export enum ResourceAvailability {
  Available = 'Available',
  Unavailable = 'Unavailable',
  Booked = 'Booked'
}

export interface Resource {
  id: number,
  name: string;
  category: number;
  availability: ResourceAvailability;
  location: string;
  type: ResourceType;
  quantity: number;
  measure: string;
  description: string;
}

export const RESOURCE_CATEGORIES = {
  1: 'Staff',
  2: 'Equipment',
  3: 'Food & Beverage',
  4: 'Furniture',
  5: 'Sanitation',
  6: 'Security',
  7: 'Medical',
};

export const DUMMY_RESOURCES: Resource[] = [
  {
    id: 1,
    name: 'Security Guard Team A',
    category: 1,
    availability: ResourceAvailability.Booked,
    location: 'Main Entrance',
    type: ResourceType.Inexhaustable,
    quantity: 1,
    measure: 'team',
    description: 'Trained guards for entry point security.'
  },
  {
    id: 2,
    name: 'Stage Lighting Kit',
    category: 2,
    availability: ResourceAvailability.Available,
    location: 'Warehouse 3',
    type: ResourceType.Exhaustable,
    quantity: 5,
    measure: 'set',
    description: 'LED lighting set for stage setups.'
  },
  {
    id: 3,
    name: 'Plastic Chairs',
    category: 4,
    availability: ResourceAvailability.Unavailable,
    location: 'Storage Unit 5',
    type: ResourceType.Exhaustable,
    quantity: 0,
    measure: 'pcs',
    description: 'Standard event plastic chairs.'
  },
  {
    id: 4,
    name: 'Paramedic On Call',
    category: 7,
    availability: ResourceAvailability.Available,
    location: 'Medical Tent',
    type: ResourceType.Inexhaustable,
    quantity: 1,
    measure: 'person',
    description: 'Certified paramedic available for emergencies.'
  },
  {
    id: 5,
    name: 'Bottled Water',
    category: 3,
    availability: ResourceAvailability.Available,
    location: 'Catering Depot',
    type: ResourceType.Exhaustable,
    quantity: 120,
    measure: 'bottles',
    description: '500ml bottled water for event participants.'
  },
  {
    id: 6,
    name: 'Mobile Toilets',
    category: 5,
    availability: ResourceAvailability.Booked,
    location: 'Parking Lot Area',
    type: ResourceType.Exhaustable,
    quantity: 3,
    measure: 'units',
    description: 'Portable toilets with handwashing station.'
  },
  {
    id: 7,
    name: 'Table and Chairs Set',
    category: 4,
    availability: ResourceAvailability.Available,
    location: 'Furniture Storage',
    type: ResourceType.Exhaustable,
    quantity: 10,
    measure: 'sets',
    description: '1 table with 4 chairs per set.'
  },
  {
    id: 8,
    name: 'Walkie-Talkies',
    category: 6,
    availability: ResourceAvailability.Available,
    location: 'Equipment Room',
    type: ResourceType.Exhaustable,
    quantity: 15,
    measure: 'pieces',
    description: 'Two-way radios for event coordination.'
  },
  {
    id: 9,
    name: 'Event Staff - Volunteers',
    category: 1,
    availability: ResourceAvailability.Available,
    location: 'Various',
    type: ResourceType.Inexhaustable,
    quantity: 20,
    measure: 'people',
    description: 'General-purpose staff for on-site duties.'
  },
  {
    id: 10,
    name: 'First Aid Kit',
    category: 7,
    availability: ResourceAvailability.Unavailable,
    location: 'Medical Tent',
    type: ResourceType.Exhaustable,
    quantity: 0,
    measure: 'kit',
    description: 'Basic first aid supplies.'
  }
];

