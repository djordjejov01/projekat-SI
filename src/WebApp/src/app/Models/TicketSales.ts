import { BuyerDto } from './BuyerDto';

export class TicketSales {
  ticketId!: number;
  typeName!: string;
  price!: number;
  quota!: number;
  sold!: number;
  unsold!: number;
  revenue!: number;
  buyers!: BuyerDto[];
}