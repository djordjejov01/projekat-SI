import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ConfirmationDialogService } from './confirmation-dialog.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmationDialog: ConfirmationDialogService,
    private translate: TranslateService
  ) {}

  async logoutWithConfirmation() {
    // Preuzmi prevedene tekstove
    const message = this.translate.instant('LOGOUT_CONFIRM_MSG'); 
    const title = this.translate.instant('LOGOUT_CONFIRM_TITLE'); 

    const confirmed = await this.confirmationDialog.confirm(message, title);

    if (confirmed) {
      this.authService.setIsLogginOut(true);
      this.authService.logout();
      this.router.navigate(['home']).then(() => {
        this.authService.setIsLogginOut(false);
      });
    }
  }
}
