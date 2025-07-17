import { UserApiResponse } from "./UserApiResponse";

export interface EventApiResponse {
  eventID: number;
  organizerID: number;
  title: string;
  category: number;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  numberOfPeople: number;
  organizer: UserApiResponse | null;
  imageUrl: string;
  isFree: boolean;
}