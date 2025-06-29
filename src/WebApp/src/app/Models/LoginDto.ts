export class LoginDto{

    constructor(private email : string, private  password){}

    getEmail() : string {
        return this.email;
    }
    
    getPassword() : string {
        return this.password;
    }
}