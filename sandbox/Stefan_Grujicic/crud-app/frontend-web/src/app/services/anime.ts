import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface oneAnime {
  id?: number;
  name: string;
  type : string;
  episodes: string;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class Anime {
  private apiUrl = 'https://localhost:7035/api/Animes';
  
  constructor(private http: HttpClient) {}

  // GET all
  getAnimes(): Observable<oneAnime[]> {
    return this.http.get<oneAnime[]>(this.apiUrl);
  }

  // GET by id
  getAnime(id: number): Observable<oneAnime> {
    return this.http.get<oneAnime>(`${this.apiUrl}/${id}`);
  }

  // POST
  createProduct(product: oneAnime): Observable<oneAnime> {
    return this.http.post<oneAnime>(this.apiUrl, product);
  }

  // PUT
  updateProduct(product: oneAnime): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${product.id}`, product);
  }

  // DELETE
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
