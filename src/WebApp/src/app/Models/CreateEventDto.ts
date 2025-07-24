import { TicketDto } from "./TicketDto";

export class CreatEventDto
{
    constructor(
        private title : string ,
        private description : string ,
        private location : string,
        private startDateTime : Date,
        private endDateTime : Date,
        private capacity : number,
        private category: string,
        private image? : string | null,
        private imageFile? : File | null,
        private tickets? : TicketDto[] | null,
        private parentId? : number | null,
    ){}
}