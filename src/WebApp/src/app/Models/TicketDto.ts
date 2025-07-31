export class TicketDto{

    constructor(
        private name : string,
        private price : number,
        private description : string,
        private quota: number,
        private validFrom: Date,
        private validUntil : Date,
        private eventId? : number,
        private ticketId? : number
    ){}

    setTicketId(id : number){
        this.ticketId = id;
    }
}