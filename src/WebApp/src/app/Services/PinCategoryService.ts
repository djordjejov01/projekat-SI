import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";

export interface PinCategory {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PinCategoryService {
  private categoryMap = new Map<number, string>();
  private categories$ = new BehaviorSubject<PinCategory[]>([]);

  constructor(private apiService: ApiService) {}

  loadCategories(): Observable<PinCategory[]> {
    return this.apiService.getPinCategories().pipe(
      tap(categories => {
        this.categoryMap.clear();
        categories.forEach(cat => this.categoryMap.set(cat.id, cat.name));
        this.categories$.next(categories);
      }),
      catchError(err => {
        console.error('Failed to load pin categories', err);
        this.categories$.next([]);
        return of([]);
      })
    );
  }

  loadCategoriesIfEmpty(): Observable<PinCategory[]> {
    if (this.categories$.getValue().length === 0) return this.loadCategories();
    return this.categories$;
  }

  getCategoryName(id: number): string {
    return this.categoryMap.get(id) ?? 'Unknown';
  }

  getCategories(): Observable<PinCategory[]> {
    return this.categories$.asObservable();
  }

  isValidCategory(id: number): boolean {
    return this.categoryMap.has(id);
  }
}
