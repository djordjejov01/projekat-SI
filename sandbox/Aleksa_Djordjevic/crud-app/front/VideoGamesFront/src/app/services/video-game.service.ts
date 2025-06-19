import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface VideoGame {
  id?: number;
  naziv: string;
  opis: string;
  godina: number;
}

@Injectable({
  providedIn: 'root'
})
export class VideoGameService {
  private apiUrl = 'http://localhost:5222/api/VideoGames';
  private refreshNeeded = new Subject<void>();

  get refreshNeeded$() {
    return this.refreshNeeded.asObservable();
  }

  constructor(private http: HttpClient) {}

  getAll(): Observable<VideoGame[]> {
    return this.http.get<VideoGame[]>(this.apiUrl);
  }

  addGame(game: Omit<VideoGame, 'id'>): Observable<any> {
    return this.http.post(this.apiUrl, game).pipe(tap(() => {
      this.refreshNeeded.next(); 
    }));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getById(id: number): Observable<VideoGame> {
  return this.http.get<VideoGame>(`${this.apiUrl}/${id}`);
}

  updateGame(game: VideoGame): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${game.id}`, game);
  }
}
