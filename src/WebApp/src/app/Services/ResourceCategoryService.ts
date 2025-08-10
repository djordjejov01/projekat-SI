import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { ApiService } from "./api.service";

export interface ResourceCategory {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceCategoryService {
  private categoryMap = new Map<number, string>();
  private categories$ = new BehaviorSubject<ResourceCategory[]>([]);

  constructor(private apiService: ApiService) {}

  loadCategories(): Observable<ResourceCategory[]> {
    return this.apiService.getResourceCategories().pipe(
      tap(categories => {
        this.categoryMap.clear();
        categories.forEach(cat => this.categoryMap.set(cat.id, cat.name));
        this.categories$.next(categories);
      }),
      catchError(err => {
        console.error('Failed to load resource categories', err);
        this.categories$.next([]);
        return of([]);
      })
    );
  }

  loadCategoriesIfEmpty(): Observable<ResourceCategory[]> {
    if (this.categories$.getValue().length === 0) return this.loadCategories();
    return this.categories$;
  }

  getCategoryName(id: number): string {
    return this.categoryMap.get(id) ?? 'Unknown';
  }

  getCategories(): Observable<ResourceCategory[]> {
    return this.categories$.asObservable();
  }

  isValidCategory(id: number): boolean {
    return this.categoryMap.has(id);
  }
}
