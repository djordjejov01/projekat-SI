import { environment } from "../../environments/environment";

export class SupplierDto {

    constructor(
        private id: number,
        private username: string,
        private companyName: string,
        private email: string,
        private phoneNumber: string,
        private website: string,
        private companyBio: string,
        private image: string) { }


    getId(): number {
        return this.id;
    }

    getUsername(): string {
        return this.username;
    }
    getWebsite(): string {
        return this.website;
    }
    getCompanyBio(): string {
        return this.companyBio;
    }
    getEmail(): string {
        return this.email;
    }

    getCompanyName(): string {
        return this.companyName;
    }

    getPhoneNumber(): string {
        return this.phoneNumber;
    }

    getImage(): string {
        const backendBaseUrl = environment.backendBaseUrl;
        return `${backendBaseUrl}/${this.image}`;
    }
}