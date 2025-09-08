import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  /**
   * Intercepts HTTP requests to add the 'Accept-Language' header.
   * This header is used by the backend to determine the response language.
   * The language value is retrieved from localStorage.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const language = localStorage.getItem('user-language');

    // Only add the header if a language is found in localStorage.
    if (language) {
      const clonedRequest = req.clone({
        headers: req.headers.set('Accept-Language', language)
      });
      // Log for debugging purposes to see the header being added
      console.log(`LanguageInterceptor: Adding 'Accept-Language' header with value: ${language}`);
      return next.handle(clonedRequest);
    } else {
      // If no language is found, pass the request on without changes.
      console.log('LanguageInterceptor: No language found in localStorage, skipping header.');
      return next.handle(req);
    }
  }
}
