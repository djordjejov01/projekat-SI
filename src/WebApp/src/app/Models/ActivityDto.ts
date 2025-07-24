export class ActivityDto{
    constructor(
        private eventId : number,
        private title : string,
        private startDate : string,
        private endDate : string,
        private description : string,
        private category: number
    ){}
}