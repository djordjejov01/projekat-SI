import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface ResourceAvailability {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceAvailabilityService {
  private availabilityMap = new Map<number, string>();
  private availabilities$ = new BehaviorSubject<ResourceAvailability[]>([]);

  constructor(private apiService: ApiService) {}

  loadAvailabilities(): Observable<ResourceAvailability[]> {
    return this.apiService.getResourceAvailabilities().pipe(
      tap(availabilities => {
        this.availabilityMap.clear();
        availabilities.forEach(a => this.availabilityMap.set(a.id, a.name));
        this.availabilities$.next(availabilities);
      }),
      catchError(err => {
        console.error('Failed to load resource availabilities', err);
        this.availabilities$.next([]);
        return of([]);
      })
    );
  }

  loadAvailabilitiesIfEmpty(): Observable<ResourceAvailability[]> {
    if (this.availabilities$.getValue().length === 0) return this.loadAvailabilities();
    return this.availabilities$;
  }

  getAvailabilityName(id: number): string {
    return this.availabilityMap.get(id) ?? 'Unknown';
  }

  getAvailabilities(): Observable<ResourceAvailability[]> {
    return this.availabilities$.asObservable();
  }

  isValidAvailability(id: number): boolean {
    return this.availabilityMap.has(id);
  }
}
