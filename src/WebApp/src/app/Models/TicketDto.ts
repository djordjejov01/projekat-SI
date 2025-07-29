export class TicketDto{

    constructor(
        private name : string,
        private price : number,
        private description : string,
        private quota: number,
        private validFrom: Date,
        private validUntil : Date
    ){}
}