export class UpdateSupplierDto {
    constructor(
        private username: string,
        private companyName: string,
        private email: string,
        private phoneNumber: string,
        private website: string,
        private companyBio: string,
    ) { }
}