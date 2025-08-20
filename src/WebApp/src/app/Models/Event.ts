import { User } from "./User";
import { environment } from "../../environments/environment";

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
        private category : number,
        private description : string ,
        private location : string,
        private startDateTime : Date,
        private endDateTime : Date,
        private capacity : number,
        private organizer : User | null,
        private image : string,
        private isFree : boolean,
        private status : number
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

  getCategoryId(): number {
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
    const backendBaseUrl = environment.backendBaseUrl;
    return `${backendBaseUrl}/${this.image}`;
  }
  
  setImage(url : string){
    this.image = url;
  }

  IsFree(): boolean {
    return this.isFree;
  }

  getStatus() : number{
    return this.status
  }

  getStatusLabel() : string{
    return StatusMap[this.status] || 'Unknown'
  }
}