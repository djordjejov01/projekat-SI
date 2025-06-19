import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:5039/api/Users';

  constructor(private http: HttpClient) {}

  createUser(user: any) {
    return this.http.post(this.apiUrl, user);
  }

  getUsers() {
    return this.http.get<any[]>(this.apiUrl);
  }
  deleteUser(id: number) {
  return this.http.delete(`${this.apiUrl}/${id}`);
}

}
