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
        private image : string,
        private imageFile : File,
        private category: string,
        private tickets : TicketDto[]
    ){}
}