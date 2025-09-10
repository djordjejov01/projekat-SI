import { UserDto } from "./UserDto";

export class RegResponseDto{
    constructor(
        private message: string,
        private user: UserDto,
        private requiresEmailVerification: boolean
    ) {}

    getMessage(): string{
        return this.message;
    }
    getUser(): UserDto{
        return this.user;
    }
    getRequiresEmailVerification(): boolean{
        return this.requiresEmailVerification;
    }
}