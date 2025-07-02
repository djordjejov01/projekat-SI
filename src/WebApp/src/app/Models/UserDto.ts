export class UserDto{

    constructor(
        private userId : number,
        private username : string,
        private email : string,
        private role : string,
        private isActive : boolean) {}


        getUserId() : number{
            return this.userId;
        }

        getUsername() : string {
            return this.username;
        }

        getEmail() : string {
            return this.email;
        }

        getRole() : string {
            return this.role;
        }

        userActive() : boolean{
            return this.isActive;
        }
}