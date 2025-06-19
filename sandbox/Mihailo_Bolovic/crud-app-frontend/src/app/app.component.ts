import { Component } from '@angular/core';
import { UserFormComponent } from './users/user-form/user-form.component';
import { UserListComponent } from './users/user-list/user-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserFormComponent, UserListComponent], // ⬅️ Add this
  templateUrl: './app.component.html',
})
export class AppComponent {}
