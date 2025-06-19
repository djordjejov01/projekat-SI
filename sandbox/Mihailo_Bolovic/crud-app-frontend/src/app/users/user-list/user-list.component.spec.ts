import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  users: any[] = [];

  constructor(private userService: UserService) {}

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: data => this.users = data,
      error: () => alert('Failed to load users')
    });
  }
  deleteUser(id: number) {
  this.userService.deleteUser(id).subscribe({
    next: () => {
      this.users = this.users.filter(u => u.id !== id); // update list in UI
    },
    error: () => alert('Failed to delete user'),
  });
}

}
