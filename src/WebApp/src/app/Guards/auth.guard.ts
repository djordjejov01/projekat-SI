import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate,GuardResult,MaybeAsync,Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../Services/auth.service";
import { MessageService } from "primeng/api";

@Injectable({
    providedIn: 'root'
})

export class AuthGuard implements CanActivate{

    constructor(private authService: AuthService, private router: Router, private messageService: MessageService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        
        if(!this.authService.isLoggedIn()){
            return this.router.createUrlTree(['/login']);
        }

        const allowedRoles = (route.data['roles'] as string[] | undefined)?.map(r => r.toLowerCase());
        const userRole = this.authService.getUserRole()?.toLowerCase();


        //console.log(userRole, allowedRoles)

        if(allowedRoles && allowedRoles.length > 0){
            if(!userRole || !allowedRoles.includes(userRole))
            {
                if(this.router.url === '/home'){
                    this.messageService.add({
                    severity: 'warn',
                    summary: 'Access Denied',
                    detail: 'You do not have permission to view that page.',
                    life: 3000
                    });

                    return false;
                }
                else{
                    sessionStorage.setItem('accessDenied', 'true')
                    return this.router.createUrlTree(['/home']);
                }
                
            }
        }

        return true;

    }
}
