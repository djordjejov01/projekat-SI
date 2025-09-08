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
import { environment } from '../../../environments/environment';
import { LanguageService } from '../../Services/LanguageService';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-supplier-page',
  imports: [RouterModule, ConfirmDialogModule, ToastModule, TranslateModule, Toast, MenuBarComponent,FormsModule],
  templateUrl: './supplier-page.component.html',
  styleUrl: './supplier-page.component.css'
})
export class SupplierPageComponent implements OnInit{
  defaultImage = `${environment.backendBaseUrl}/images/default-pfp.png`;
  previewUrl: string | ArrayBuffer | null = null;
  username : string;
  public currentLanguage: string;
  constructor(
    private sessionService: SessionService,
    private translate: TranslateService,
    private messageService: MessageService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private categoryService: CategoryService,
    private apiService: ApiService,
    private sharedService: SharedService,
    private router: Router,
    private languageService : LanguageService) { }

    currSupplier : SupplierDto;
    getSupplierCall() {
        this.apiService.getSupplier().subscribe({
    
          next: (response: SupplierDto) => {
            this.currSupplier = response;
              this.previewUrl = this.currSupplier.getImage();
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
       const savedLang = this.languageService.language();
      this.currentLanguage = savedLang || 'en';
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

   // Update the currentLanguage property
    this.currentLanguage = lang;

  // 1. Tell the LanguageService to save the new language to localStorage
  this.languageService.setLanguage(lang);

  // 2. Tell the frontend translation service to switch languages for the UI
  this.translate.use(lang);
}

  myProfile(){
    this.router.navigate(["/supplier/my-profile"],{
        queryParams: { showID: 2}
      });

  }
}
