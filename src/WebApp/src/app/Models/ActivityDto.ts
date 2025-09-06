export class ActivityDto{
    constructor(
        private eventId : number,
        private title : string,
        private startDate : string,
        private endDate : string,
        private description : string,
        private category: number,
        private activityId? : number
    ){}
    
    getEventId(): number {
        return this.eventId;
    }

    getTitle(): string {
        return this.title;
    }

    getStartDate(): string {
        return this.startDate;
    }

    getEndDate(): string {
        return this.endDate;
    }

    getDescription(): string {
        return this.description;
    }

    getCategory(): number {
        return this.category;
    }

    getActivityId(): number | undefined {
        return this.activityId;
    }
}