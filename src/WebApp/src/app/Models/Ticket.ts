export class Ticket {

  constructor(  
  private ticketID: number,
  private eventID: number,
  private typeName: string,
  private description: string,
  private price: number,
  private quota: number,
  private validFrom: Date, // ISO date string, or Date if you want
  private validUntil: Date) {}

  // Getters
  getTicketID(): number {
    return this.ticketID;
  }

  getEventID(): number {
    return this.eventID;
  }

  getTypeName(): string {
    return this.typeName;
  }

  getDescription(): string {
    return this.description;
  }

  getPrice(): number {
    return this.price;
  }

  getQuota(): number {
    return this.quota;
  }

  getValidFrom(): Date {
    return this.validFrom;
  }

  getValidUntil(): Date {
    return this.validUntil;
  }
}
