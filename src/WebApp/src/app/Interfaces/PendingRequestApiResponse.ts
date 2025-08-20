// src/app/Models/PendingRequest.ts
export interface PendingRequest {
  id: number;
  quantity: number;
  isReservable: boolean;
  startDateTimeBooked: string | null;
  endDateTimeBooked: string | null;
  resourceName: string;
  eventTitle: string;
  organizerUsername: string;
}