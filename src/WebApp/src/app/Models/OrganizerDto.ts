export class OrganizerDto{

    constructor(
        private id : number,
        private name : string,
        private username : string,
        private email : string,
        private phoneNumber : string,
        private image : string) {}


        getId() : number{
            return this.id;
        }

        getUsername() : string {
            return this.username;
        }

        getEmail() : string {
            return this.email;
        }

        getName() : string {
            return this.name;
        }

        getPhoneNumber() : string{
            return this.phoneNumber;
        }

        getImage() : string {
            return this.image;
        }
}