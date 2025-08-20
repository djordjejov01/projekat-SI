export class ChangePasswordDto{
    constructor(
        private currentPassword : string,
        private newPassword : string
    ){}
}