export interface EventPinApiResponse {
  id: number;
  eventId: number;
  latitude: number;
  longitude: number;
  label: string;
  pinnedAt: Date;
  pinCategory: number;
  description?: string | null;
}