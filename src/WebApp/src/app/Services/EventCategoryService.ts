import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { EventCategoryApiResponse } from "../Interfaces/EventCategoryApiResponse";

@Injectable({
    providedIn: 'root'
})

export class CategoryService{
    private categoryMap = new Map<number, string>();
    private categories$ = new BehaviorSubject<EventCategoryApiResponse[]>([]);

    constructor(private apiService: ApiService){}

    loadCategories(): Observable<EventCategoryApiResponse[]>{

        return this.apiService.getEventCategories().pipe(
            tap(categories =>{
                this.categoryMap.clear();
                categories.forEach(cat => this.categoryMap.set(cat.id, cat.name));
                this.categories$.next(categories);
            }),
             catchError(err => {
            console.error('Failed to load categories', err);
            this.categories$.next([]); // emit empty list so subscribers don't hang
            return of([]);             // return fallback observable
            })
        );
    }

    loadCategoriesIfEmpty(): Observable<EventCategoryApiResponse[]>{
        if(this.categories$.getValue().length === 0) return this.loadCategories();
        return this.categories$;
    }

    getCategoryName(id : number) : string {
        return this.categoryMap.get(id) ?? 'Unknown';
    }

    getCategories(): Observable<EventCategoryApiResponse[]>{
        return this.categories$.asObservable();
    }
}