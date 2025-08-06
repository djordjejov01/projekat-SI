import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterBar } from '../landing-page/footer-bar/footer-bar';
import { SessionService } from '../../Services/session.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { CategoryService } from '../../Services/EventCategoryService';
import { ApiService } from '../../Services/api.service';
import { SharedService } from '../../Services/shared.service';
import { Router } from '@angular/router';
import { MenuBarComponent } from '../organizer-page/menu-bar/menu-bar.component';
import { SupplierDto } from '../../Models/SupplierDto';

@Component({
  selector: 'app-supplier-page',
  imports: [RouterModule, ConfirmDialogModule, ToastModule, TranslateModule, Toast, MenuBarComponent],
  templateUrl: './supplier-page.component.html',
  styleUrl: './supplier-page.component.css'
})
export class SupplierPageComponent implements OnInit{
  defaultImage = 'assets/default-picture.png';
  previewUrl: string | ArrayBuffer | null = null;
  username : string;
  constructor(
    private sessionService: SessionService,
    private translate: TranslateService,
    private messageService: MessageService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private categoryService: CategoryService,
    private apiService: ApiService,
    private sharedService: SharedService,
    private router: Router) { }

    currSupplier : SupplierDto;
    getSupplierCall() {
        this.apiService.getSupplier().subscribe({
    
          next: (response: SupplierDto) => {
            this.currSupplier = response;
            if (this.currSupplier.getImage() != "https://localhost:7269/") {
              this.previewUrl = this.currSupplier.getImage();
            }
          },
          error: (errorResponse) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorResponse.message,
              life: 3000
            });
          }
    
        })
      }
      ngAfterContentInit(): void {
    this.cd.detectChanges();
    const shouldShowWelcome = sessionStorage.getItem('showWelcome') === 'true';
    if (shouldShowWelcome) {
      const name = this.authService.getUserName();
      if (name) {
        this.messageService.add({
          severity: 'success',
          summary: 'Welcome',
          detail: `Welcome back, ${name}!`,
          life: 3000
        });
      }
      sessionStorage.removeItem('showWelcome');
    }
  }
    ngOnInit(): void {
        this.username = this.authService.getUserName();
        this.getSupplierCall();

        this.sharedService.currentUsername$.subscribe(username => {
          this.getSupplierCall();
  });
        this.sharedService.profileImageChanged$.subscribe(changed => {
      if (changed) {
        this.getSupplierCall();
      }
    });
    }
  onLogoutClick() {
    this.sessionService.logoutWithConfirmation();
  }

  changeLanguage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const lang = selectElement.value;
    this.translate.use(lang);
  }

  myProfile(){
    this.router.navigate(["/supplier/my-profile"],{
        queryParams: { showID: 2}
      });

  }
}
