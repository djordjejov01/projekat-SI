import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { OrganizerDto } from '../../../Models/OrganizerDto';
import { MessageService } from 'primeng/api';
import { ChangePasswordDto } from '../../../Models/ChangePasswordDto';
import { DashboardMetrics } from '../../../Interfaces/DashboardMetricsResponse';
import { SharedService } from '../../../Services/shared.service';
import { environment } from '../../../../environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [TranslateModule,FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  defaultImage = `${environment.backendBaseUrl}/images/default-pfp.png`;
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile?: File;

  @ViewChild('fileInput') fileInput;

  currOrganizer: OrganizerDto;
  allEvents: any[];
  upcomingEvents: any[];
  dashboardMetrics: DashboardMetrics;
  changePass: ChangePasswordDto;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getOrganizerCall();
    this.loadEvents();
    this.loadDashboardMetrics();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }

    this.triggerFileUpload();
  }

  triggerFileUpload() {
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) fileInput.click();
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('Image', this.selectedFile);
    formData.append('Id', this.authService.getUserId().toString());

    this.apiService.changeOrganizerPicture(formData).subscribe({
      next: (response: any) => {
        this.previewUrl = this.currOrganizer.getImage();
        this.getOrganizerCall();
        this.sharedService.notifyProfileImageChanged();
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    });
  }

  getOrganizerCall() {
    this.apiService.getOrganizer(this.authService.getUserId()).subscribe({
      next: (response: OrganizerDto) => {
        this.currOrganizer = response;
        this.previewUrl = this.currOrganizer.getImage();
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    });
  }

  loadEvents() {
    this.apiService.getOrganizerEvents(this.authService.getUserId()).subscribe({
      next: (response: any) => this.allEvents = response,
      error: () => {}
    });

    this.apiService.getUpcomingOrganizerEvents(this.authService.getUserId()).subscribe({
      next: (response: any) => this.upcomingEvents = response,
      error: () => {}
    });
  }

  loadDashboardMetrics() {
    this.apiService.getDashboardMetrics().subscribe({
      next: (response: DashboardMetrics) => this.dashboardMetrics = response,
      error: () => {}
    });
  }

  update() {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const username5 = (document.getElementById('username5') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const phone = (document.getElementById('phone') as HTMLInputElement).value;

    const toUpdate = new OrganizerDto(this.authService.getUserId(), name, username5, email, phone, "");

    this.apiService.updateOrg(toUpdate).subscribe({
      next: (response: string) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SUCCESS'),
          detail: response,
          life: 3000
        });
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    });
  }

  updatePass() {
    const currentPassword = (document.getElementById('cpass') as HTMLInputElement).value;
    const newPassword = (document.getElementById('npass') as HTMLInputElement).value;
    const confirmNewPassword = (document.getElementById('cnpass') as HTMLInputElement).value;

    if (newPassword !== "" && newPassword === confirmNewPassword) {
      this.changePass = new ChangePasswordDto(currentPassword, newPassword);

      this.apiService.changeUserPass(this.changePass).subscribe({
        next: (response: any) => {
          (document.getElementById('cpass') as HTMLInputElement).value = "";
          (document.getElementById('npass') as HTMLInputElement).value = "";
          (document.getElementById('cnpass') as HTMLInputElement).value = "";

          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('SUCCESS'),
            detail: response,
            life: 3000
          });
        },
        error: (errorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR'),
            detail: errorResponse.message,
            life: 3000
          });
        }
      });
    }

    if (newPassword !== "" && newPassword !== confirmNewPassword) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('ERROR'),
        detail: this.translate.instant('PASSWORDS_MISMATCH'),
        life: 3000
      });
    }
  }
}
