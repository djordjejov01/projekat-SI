export class UpdateEventDto{
    constructor(
        private title : string,
        private description : string,
        private location : string,
        private startDate : string,
        private endDate : string,
        private category : number,
        private capacity : number
    ){}
}