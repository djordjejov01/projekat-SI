import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VideoGame {
  id: number;
  naziv: string;
  opis: string;
  godina: number;
}

@Injectable({
  providedIn: 'root'
})
export class VideoGameService {
  private apiUrl = 'http://localhost:5222/api/VideoGames'; // izmeni ako ti je drugačiji port

  constructor(private http: HttpClient) { }

  getAll(): Observable<VideoGame[]> {
    return this.http.get<VideoGame[]>(this.apiUrl);
  }

  get(id: number): Observable<VideoGame> {
    return this.http.get<VideoGame>(`${this.apiUrl}/${id}`);
  }

  create(game: VideoGame): Observable<VideoGame> {
    return this.http.post<VideoGame>(this.apiUrl, game);
  }

  update(game: VideoGame): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${game.id}`, game);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
