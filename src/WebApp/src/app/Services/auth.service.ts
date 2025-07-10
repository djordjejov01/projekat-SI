import { Injectable } from "@angular/core";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  exp: number;
  iss?: string;
  aud?: string;
}


@Injectable({
    providedIn: 'root'
})
export class AuthService{

    private readonly tokenKey = 'access_token';
    private decodedToken: JwtPayload | null = null;

    constructor(){
        this.loadToken()
    }

    private loadToken(){
        const token = localStorage.getItem(this.tokenKey);
        if(token){
            try{
                this.decodedToken = jwtDecode<JwtPayload>(token)
            }catch(error){
                console.error('Failed to decoted token', error);
                this.decodedToken = null;
            }
        }
    }

    setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
        this.loadToken()
    }


    getUserRole() : string | null{
        return this.decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    }

    isLoggedIn() : boolean {
        if(!this.decodedToken) return false;
        const now = Math.floor(Date.now() / 1000);
        const isExpired = this.decodedToken.exp <= now;

        if(isExpired) {
            this.logout()
            return false
        }

        return true;
    }

    logout() : void{
        localStorage.removeItem(this.tokenKey);
        this.decodedToken = null;
    }

    getDecodedToken() : JwtPayload | null{
        return this.decodedToken
    }

    getUserName(): string | null {
        return this.decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null;
    }

}