export const PinTypeMap: { [key: number]: string } = {
  0: 'Stage',
  1: 'Booth',
  2: 'Info',
  3: 'First Aid',
  4: 'Food',
  5: 'Water',
  6: 'Entrance',
  7: 'Exit'
};


export class PinDataDto{
    
    constructor(
        private lat: number,
        private lon: number,
        private title : string,
        private type : number,
        private datePinned : Date,
        private description? : string | null
    ){}

    getLat(): number {
        return this.lat;
    }

    getLon(): number {
        return this.lon;
    }

    getTitle(): string {
        return this.title;
    }

    getType(): number {
        return this.type;
    }

    getDatePinned(): Date {
        return this.datePinned;
    }

    getDescription(): string | null | undefined {
        return this.description;
    }
}