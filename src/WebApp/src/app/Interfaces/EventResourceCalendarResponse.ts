
import { EventResourceDto } from "../Models/EventResourceDto";

export class EventResourceCalendarResponse {
    
    constructor(private eventResource: EventResourceDto,
  private resourceName: string,
  private resourceCategory: number,
  private eventTitle: string,
  private resourceDescription: string,
  private eventStartDate: Date,
  private eventEndDate: Date){}

  get EventResource(): EventResourceDto {
  return this.eventResource;
}

get ResourceName(): string {
  return this.resourceName;
}

get ResourceCategory(): number {
  return this.resourceCategory;
}

get EventTitle(): string {
  return this.eventTitle;
}

get ResourceDescription(): string {
  return this.resourceDescription;
}

get EventStartDate(): Date {
  return this.eventStartDate;
}

get EventEndDate(): Date {
  return this.eventEndDate;
}
}