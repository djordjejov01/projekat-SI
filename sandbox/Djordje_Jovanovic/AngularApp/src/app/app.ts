import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from './user.service';
import { User } from './user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Korisnici</h1>

    <form (ngSubmit)="submitForm()">
      <input [(ngModel)]="user.email" name="email" placeholder="Email" required />
      <input [(ngModel)]="user.mobile" name="mobile" placeholder="Telefon" required />
      <input [(ngModel)]="user.city" name="city" placeholder="Grad" required />
      <input [(ngModel)]="user.state" name="state" placeholder="Država" required />
      <input [(ngModel)]="user.address" name="address" placeholder="Adresa" />
      <button type="submit">{{ user.userId ? 'Sačuvaj izmene' : 'Dodaj korisnika' }}</button>
      <button type="button" *ngIf="user.userId" (click)="resetForm()">Otkaži</button>
    </form>

    <ul>
      <li *ngFor="let u of users">
        {{ u.email }} - {{ u.mobile }}
        <button (click)="editUser(u)">Izmeni</button>
        <button (click)="deleteUser(u.userId!)">Obriši</button>
      </li>
    </ul>
  `
})
export class App {
  users: User[] = [];
  user: User = {
    email: '',
    mobile: '',
    city: '',
    state: '',
    address: ''
  };

  constructor(private userService: UserService) {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(data => this.users = data);
  }

  submitForm() {
    if (this.user.userId) {
      // Izmena
      this.userService.updateUser(this.user.userId, this.user).subscribe(() => {
        this.loadUsers();
        this.resetForm();
      });
    } else {
      // Dodavanje
      this.userService.createUser(this.user).subscribe(newUser => {
        this.users.push(newUser);
        this.resetForm();
      });
    }
  }

  editUser(u: User) {
    this.user = { ...u }; // kopiraj podatke u formu
  }

  deleteUser(id: number) {
    if (confirm('Da li ste sigurni da želite da obrišete korisnika?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(u => u.userId !== id);
        if (this.user.userId === id) this.resetForm();
      });
    }
  }

  resetForm() {
    this.user = {
      email: '',
      mobile: '',
      city: '',
      state: '',
      address: ''
    };
  }
}
