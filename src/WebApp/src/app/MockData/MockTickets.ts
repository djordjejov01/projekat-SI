export interface Ticket {
  id: number;
  typeName: string;
  price: number;
  quota: number;
  validFrom: Date;
  validUntil: Date;
  description?: string;
}

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 1,
    typeName: 'General Admission',
    price: 20.00,
    quota: 500,
    validFrom: new Date('2025-08-01'),
    validUntil: new Date('2025-08-30'),
    description: 'Access to all general areas and activities.'
  },
  {
    id: 2,
    typeName: 'VIP Pass',
    price: 75.00,
    quota: 100,
    validFrom: new Date('2025-08-01'),
    validUntil: new Date('2025-08-30'),
    description: 'Includes backstage access and free drinks.'
  },
  {
    id: 3,
    typeName: 'Student Ticket',
    price: 10.00,
    quota: 200,
    validFrom: new Date('2025-08-15'),
    validUntil: new Date('2025-08-25'),
    description: 'Valid with student ID at entry.'
  },
  {
    id: 4,
    typeName: 'Early Bird',
    price: 15.00,
    quota: 150,
    validFrom: new Date('2025-07-01'),
    validUntil: new Date('2025-07-31'),
    description: 'Discounted ticket for early buyers.'
  }
];
