export class EventPinDto{

    constructor(
        private eventId : number,
        private latitude: number,
        private longitude: number,
        private label : string,
        private pinnedAt : Date,
        private pinCategory : number,
        private description? : string | null,
        private id? : number | null
    ){}

    getId(): number {
    return this.id;
  }

  getEventId(): number {
    return this.eventId;
  }

  getLatitude(): number {
    return this.latitude;
  }

  getLongitude(): number {
    return this.longitude;
  }

  getLabel(): string {
    return this.label;
  }

  getPinnedAt(): Date {
    return this.pinnedAt;
  }

  getPinCategory(): number {
    return this.pinCategory;
  }

  getDescription(): string | null | undefined {
    return this.description;
  }
}