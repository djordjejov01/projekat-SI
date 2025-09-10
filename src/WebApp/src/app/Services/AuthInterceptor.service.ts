import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor{
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        //////console.log("TEST")
        const token = localStorage.getItem('access_token');

        if (token){
            const cloned = req.clone({headers: req.headers.set('Authorization', `Bearer ${token}`)});
            ////console.log('AuthInterceptor: adding token', token, 'to request', req.url);
            return next.handle(cloned);
        }

        else {
            ////console.log('AuthInterceptor: no token found for request', req.url);
            return next.handle(req);
        }
    }
}