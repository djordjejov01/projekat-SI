import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError, catchError, map } from "rxjs";
import { RegisterDto } from "../Models/RegisterDto";
import { LoginDto } from "../Models/LoginDto";
import { UserDto } from "../Models/UserDto";


interface UserDtoResponse{
  userId: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface TokenResponse{
    token : string;
}

@Injectable({
    providedIn: "root"
})
export class ApiService{
    
    private apiUrl = 'https://localhost:7269/api';

    constructor(private http: HttpClient) {}

    register(data : RegisterDto): Observable<UserDto>{

        return this.http.post<UserDtoResponse>(`${this.apiUrl}/User/register`, data).pipe(

            map(data => {
                console.log('Raw backend response Register:', data);
                return new UserDto(
                data.userId,
                data.username,
                data.email,
                data.role,
                data.isActive
            );
        }),
            

            catchError(this.handleError)
        );
    }

    login(data : LoginDto): Observable<string>{
        return this.http.post<TokenResponse>(`${this.apiUrl}/User/login`,data).pipe(
            map(data => data.token),
            catchError(this.handleError)
        );
    }

    //Observable<never> means: "This observable will never emit a real value, and only exists to throw an error."
    handleError(errorResponse : HttpErrorResponse) : Observable<never>{

        //Fallback
        let errorMsg = 'An unknown error occurred!';

        //Client side error (e.g no internet, DNS failure, frontend bug)
        if(errorResponse.error instanceof ErrorEvent) {
            errorMsg = `Error: ${errorResponse.error.message}`;
        }
        //If there is an error from backend and if that error has a message property use that
        else if (errorResponse.error && errorResponse.error.message){
            errorMsg = errorResponse.error.message;
        }
        //If there is no structured backend message this is a fallback that returns a status code with a generic message
        else{
            errorMsg = `Error Code: ${errorResponse.status}\n Message: ${errorResponse.message}`;
        }

        return throwError(()=> new Error(errorMsg))
    }
}