import { User } from "./User";

export const CategoryMap: Record<number, string> = {
  0: 'Music',
  1: 'Sports',
  2: 'Entertainment',
  3: 'Protest',
  4: 'Charity',
  5: 'Business',
  6: 'Culture',
  7: 'Other'
};

export const StatusMap: Record<number, string> = {
  0: 'Draft',
  1: 'Published',
  2: 'Canceled',
};

export class Event
{
    constructor(
        private eventId : number,
        private organizerId : number,
        private title : string ,
        private category : string,
        private description : string ,
        private location : string,
        private startDateTime : Date,
        private endDateTime : Date,
        private capacity : number,
        private organizer : User | null,
        private image : string,
        private isFree : boolean,
        private status : string
    ){}

    getEventId(): number {
    return this.eventId;
  }

  getOrganizerId(): number {
    return this.organizerId;
  }

  getTitle(): string {
    return this.title;
  }

  getCategory(): string {
    return this.category;
  }

  getDescription(): string {
    return this.description;
  }

  getLocation(): string {
    return this.location;
  }

  getStartDateTime(): Date {
    return this.startDateTime;
  }

  getEndDateTime(): Date {
    return this.endDateTime;
  }

  getCapacity(): number {
    return this.capacity;
  }

  getOrganizer(): User{
    return this.organizer
  }

  getImage(): string {
    const backendBaseUrl = 'https://localhost:7269';
    return `${backendBaseUrl}/${this.image}`;
  }

  IsFree(): boolean {
    return this.isFree;
  }

  getStatus() : string{
    return this.status
  }
}