export interface TicketApiResponse {
  ticketID: number;
  eventID: number;
  typeName: string;
  description: string;
  price: number;
  quota: number;
  validFrom: string;   // or Date if you want to parse it
  validUntil: string;
}