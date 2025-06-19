import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Proizvod {
  id: number;
  naziv: string;
  cena: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProizvodiService {

  private apiUrl = 'http://localhost:5222/api/proizvodi'; // Ovde stavi svoj backend URL

  constructor(private http: HttpClient) { }

  getProizvodi(): Observable<Proizvod[]> {
    return this.http.get<Proizvod[]>(this.apiUrl);
  }

  getProizvod(id: number): Observable<Proizvod> {
    return this.http.get<Proizvod>(`${this.apiUrl}/${id}`);
  }

  createProizvod(proizvod: Proizvod): Observable<Proizvod> {
    return this.http.post<Proizvod>(this.apiUrl, proizvod);
  }

  updateProizvod(id: number, proizvod: Proizvod): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, proizvod);
  }

  deleteProizvod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
