export class ResourceDto {

  constructor(
    private resourceID: number,
    private name: string,
    private category: number,
    private isExhaustable: boolean,
    private isAvailable: number,
    private description: string,
    private supplierID: number,
    private quantity: number,
    private supplier: any
  ) {}

  getResourceID(): number {
    return this.resourceID;
  }

  getName(): string {
    return this.name;
  }

  getCategory(): number {
    return this.category;
  }

  getIsExhaustable(): boolean {
    return this.isExhaustable;
  }

  getIsAvailable(): number {
    return this.isAvailable;
  }

  getDescription(): string {
    return this.description;
  }

  getSupplierID(): number {
    return this.supplierID;
  }

  getQuantity(): number {
    return this.quantity;
  }


  getSupplier(): any {
    return this.supplier;
  }

}
