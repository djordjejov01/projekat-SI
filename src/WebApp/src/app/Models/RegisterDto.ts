export class RegisterDto{

    constructor(
        private username : string,
        private email : string,
        private password : string,
        private confirmPassword : string,
        private role? : string
    ) {}

    getUsername() : string {
        return this.username;
    }

    getEmail() : string{
        return this.email;
    }

    getPassword() : string{
        return this.password;
    }

    getConfirmPassword() : string{
        return this.confirmPassword;
    }

    getRole() : string{
        return this.role;
    }

}