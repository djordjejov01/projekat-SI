export class EventResourceDto
{
    constructor(
        private id : number,
        private supplierID : number,
        private eventID : number,
        private resourceID : number,
        private quantity : number,
        private isReservable : boolean,
        private status : number,
        private startDateTimeBooked : Date,
        private endDateTimeBooked : Date
    ){}


    getId(): number {
    return this.id;
  }

  getSupplierID(): number {
    return this.supplierID;
  }

  getEventID(): number {
    return this.eventID;
  }

  getResourceID(): number {
    return this.resourceID;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getIsReservable(): boolean {
    return this.isReservable;
  }

  getStatus(): number {
    return this.status;
  }

  getStartDateTimeBooked(): Date {
    return this.startDateTimeBooked;
  }

  getEndDateTimeBooked(): Date {
    return this.endDateTimeBooked;
  }

}