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
    private _isLoggingOut = false;

    constructor()
    {
        const token = localStorage.getItem(this.tokenKey);
        if(token){
            try{
                const decoded = jwtDecode<JwtPayload>(token);
                this.decodedToken = decoded;
            }catch(err){
                console.error('Failed to decode token on init:', err);
                this.decodedToken = null;
                localStorage.removeItem(this.tokenKey);
            }
        }
    }

    setToken(token : string) : "ok" | 'unauthorized' | 'error'{

        try{
            const decoded = jwtDecode<JwtPayload>(token);
            const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase();
            const validRoles = ['admin', 'organizer', 'supplier'];
            
            if(!validRoles.includes(role)) return 'unauthorized';

            localStorage.setItem(this.tokenKey, token);
            this.decodedToken = decoded;
            return 'ok';
        }
        catch (err) {
            console.error('Token decoding failed: ', err)
            return 'error'
        }

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

    getUserId(): number | null {
    const sub = this.decodedToken?.sub;
    if (!sub) return null;

    const userId = Number(sub);
    return isNaN(userId) ? null : userId;
    }

    setIsLogginOut(value: boolean) : void{
        this._isLoggingOut = value;
    }

    isLoggingOut(): boolean{
        return this._isLoggingOut;
    }

}