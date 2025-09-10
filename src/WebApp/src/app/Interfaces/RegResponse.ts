import { UserDtoResponse } from "./UserDtoResponse";
export interface RegResponse{
  message: string;
    user: UserDtoResponse;
    requiresEmailVerification: boolean;
  
}