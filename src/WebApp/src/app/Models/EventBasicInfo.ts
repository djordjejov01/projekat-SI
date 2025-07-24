import { StatusMap } from "./Event";

export class EventBasicInfo {
    constructor(
        private eventID: number,
        private title: string,
        private description: string,
        private location: string,
        private startDate: Date,
        private endDate: Date,
        private category: number,
        private capacity: number,
        private attendingCount: number,
        private imageUrl: string,
        private status: number,
        private parentEventId: number | null
    ) {}

    getEventID(){
        return this.eventID;
    }

    getTitle(): string {
        return this.title;
    }

    getDescription(): string {
        return this.description;
    }

    getLocation(): string {
        return this.location;
    }

    getStartDate(): Date {
        return this.startDate;
    }

    getEndDate(): Date {
        return this.endDate;
    }

    getCategory(): number {
        return this.category;
    }

    getCapacity(): number {
        return this.capacity;
    }

    getAttendingCount(): number {
        return this.attendingCount;
    }

    getImageUrl(): string {
        const backendBaseUrl = 'https://localhost:7269';
        return `${backendBaseUrl}/${this.imageUrl}`;
    }
    setImage(url : string){
        this.imageUrl = url;
    }

    getParentEventId(): number | null {
        return this.parentEventId;
    }

    getStatusLabel() : string{
        return StatusMap[this.status] || 'Unknown'
    }
}
