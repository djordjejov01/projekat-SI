export interface EventResourceApiResponse {
  id?: number; // Backend JSON uses 'id', not 'ID'
  supplierID: number;
  eventID: number;
  resourceID: number; // <-- Fix this capitalization
  quantity: number;
  isReservable: boolean;
  status: number;
  startDateTimeBooked?: Date;
  endDateTimeBooked?: Date;
}