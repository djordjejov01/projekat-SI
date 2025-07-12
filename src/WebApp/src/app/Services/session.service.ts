import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ConfirmationDialogService } from './confirmation-dialog.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmationDialog: ConfirmationDialogService
  ) {}

 async logoutWithConfirmation() {
  const confirmed = await this.confirmationDialog.confirm(
    'Are you sure you want to log out?',
    'Logout Confirmation'
  );

  if (confirmed) {
    this.authService.logout();
    this.router.navigate(['home']);
  }
}
}