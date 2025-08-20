import {Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../Services/auth.service";

@Injectable({
    providedIn: 'root'
})


export class GuestGuard implements CanActivate{


    constructor(private authService : AuthService, private router : Router){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        
        if(this.authService.isLoggedIn()) {
            
            const role = this.authService.getUserRole();
            switch(role){
                case 'Admin': this.router.navigate(['/admin']); break;
                case 'Organizer': this.router.navigate(['/organizer']); break;
                case 'Supplier': this.router.navigate(['/supplier']); break;
                default: this.router.navigate(['/']);
            }

            return false;
        }

        return true;
    }
}