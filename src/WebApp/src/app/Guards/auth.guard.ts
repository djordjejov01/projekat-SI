import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "../Services/auth.service";
import { MessageService } from "primeng/api";
import { firstValueFrom, catchError, of } from "rxjs";
import { ApiService } from "../Services/api.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
    providedIn: 'root'
})

export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router, private messageService: MessageService, private api: ApiService, private translate: TranslateService) {}

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
        if (!this.authService.isLoggedIn()) {
            return this.router.createUrlTree(['/login']);
        }

        const allowedRoles = (route.data['roles'] as string[] | undefined)?.map(r => r.toLowerCase());
        if (!allowedRoles || allowedRoles.length === 0) {
            return true;
        }

        try {
            const userRoleResponse = await firstValueFrom(
                this.api.getUserRole().pipe(
                    catchError(error => {
                        console.error('API call failed:', error);
                        return of(null);
                    })
                )
            );

            // Check if the API call failed and returned null
            if (!userRoleResponse) {
                sessionStorage.setItem('accessDenied', 'true');
                return this.router.createUrlTree(['/home']);
            }

            const userRole = userRoleResponse.role?.toLowerCase();

            if (!userRole || !allowedRoles.includes(userRole)) {
                if (this.router.url === '/home') {
                    this.messageService.add({
                        severity: 'warn',
                        summary: this.translate.instant('AUTH_GUARD.ACCESS_DENIED_SUMMARY'),
                        detail: this.translate.instant('AUTH_GUARD.ACCESS_DENIED_DETAIL'),
                        life: 3000
                    });
                    return false;
                } else {
                    sessionStorage.setItem('accessDenied', 'true');
                    return this.router.createUrlTree(['/home']);
                }
            }

            return true;
        } catch {
            return this.router.createUrlTree(['/login']);
        }
    }
}
