export class User{

    constructor(
        private userId : number,
        private username : string,
        private email : string,
        private role : string,
        private creationTime : Date,
        private isActive : boolean,
        private lastLogin : Date | null,
        private password? : string,
        private firstName? : string,
        private lastName? : string,
    ){}

    getUserId() : number{
        return this.userId;
    }

    getUsername() : string{
        return this.username;
    }

    getEmail() : string{
        return this.email;
    }

    getFirstName() : string{
        return this.firstName;
    }

    getLastName() : string{
        return this.lastName;
    }

    getRole() : string{
        return this.role;
    }

    getCreationTime() : Date{
        return this.creationTime;
    }

    userActive() : boolean{
        return this.isActive;
    }

    getLastLogin() : Date{
        return this.lastLogin;
    }

}