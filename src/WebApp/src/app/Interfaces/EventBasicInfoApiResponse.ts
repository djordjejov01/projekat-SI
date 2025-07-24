export interface EventBasicInfoApiResponse {
  eventID: number,
  title: string;
  description: string;
  location: string;
  startDate: string;  // ISO string from API
  endDate: string;
  category: number;
  capacity: number;
  attendingCount: number;
  imageUrl: string;
  status : number
  parentEventId: number | null;
}