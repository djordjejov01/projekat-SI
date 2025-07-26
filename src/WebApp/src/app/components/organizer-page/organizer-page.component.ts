import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
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
import { OrganizerDto } from '../../Models/OrganizerDto';
import { SharedService } from '../../Services/shared.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-organizer-page',
  imports: [MenuBarComponent, RouterModule, ConfirmDialogModule, ToastModule, TranslateModule, Toast],
  templateUrl: './organizer-page.component.html',
  styleUrl: './organizer-page.component.css'
})
export class OrganizerPageComponent implements AfterContentInit, OnInit {

  constructor(
    private sessionService: SessionService,
    private translate: TranslateService,
    private messageService: MessageService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private categoryService: CategoryService,
    private apiService: ApiService,
    private sharedService: SharedService,
    private router : Router) { }

  currOrganizer: OrganizerDto;
  defaultImage = 'assets/default-picture.png';
  previewUrl: string | ArrayBuffer | null = null;
  username : string;
  getOrganizerCall() {
    this.apiService.getOrganizer(this.authService.getUserId()).subscribe({

      next: (response: OrganizerDto) => {
        this.currOrganizer = response;
        if (this.currOrganizer.getImage() != "https://localhost:7269/") {
          this.previewUrl = this.currOrganizer.getImage();
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



  ngOnInit(): void {
    this.username = this.authService.getUserName();

    this.sharedService.profileImageChanged$.subscribe(changed => {
      if (changed) {
        this.getOrganizerCall(); // metoda koja uzima novu sliku iz baze/backenda
      }
    });

    this.categoryService.loadCategories().subscribe();

    this.getOrganizerCall();
  }

  ngAfterContentInit(): void {
    this.cd.detectChanges(); // Ensure view is fully initialized

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


  onLogoutClick() {
    this.sessionService.logoutWithConfirmation();
  }

  changeLanguage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const lang = selectElement.value;
    this.translate.use(lang);
  }

  myProfile(){
    this.router.navigate(["/organizer/my-profile"],{
        queryParams: { showID: 4}
      });

  }
}
