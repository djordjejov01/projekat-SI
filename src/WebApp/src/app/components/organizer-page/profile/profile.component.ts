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
import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service';
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
    private translate: TranslateService,
    private confirmationDialogService : ConfirmationDialogService
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
  this.selectedFile = null;
  this.apiService.changeOrganizerPicture(formData).subscribe({

        next:(response : any) => {
          //console.log(response);
          this.previewUrl = this.currOrganizer.getImage();
          this.getOrganizerCall();
          this.sharedService.notifyProfileImageChanged();
        },
        error:(errorResponse) =>{
          this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('ERROR'),
              detail: errorResponse.message,
              life: 3000 });
        }

      })
    
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
      next:(response : OrganizerDto) => {
          this.currOrganizer = response;
          this.previewUrl = this.currOrganizer.getImage();
          //console.log(response);
              this.nameS = this.currOrganizer.getName();
              this.username5S = this.currOrganizer.getUsername();
              this.emailS = this.currOrganizer.getEmail();
              this.phoneS = this.currOrganizer.getPhoneNumber();
        },
        error:(errorResponse) =>{
          this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorResponse.message,
              life: 3000 });
        }
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
  nameS : string;
  username5S : string;
  emailS : string;
  phoneS : string;

  check(){
    let name = (document.getElementById('name') as HTMLInputElement).value;
    let username5 = (document.getElementById('username5') as HTMLInputElement).value;
    let email = (document.getElementById('email') as HTMLInputElement).value;
    let phone = (document.getElementById('phone') as HTMLInputElement).value;
    let dugme = document.getElementById('upp1') as HTMLButtonElement;
    if(this.nameS != name || this.username5S != username5 || this.emailS != email || this.phoneS != phone)
    {
      dugme.disabled = false;
      dugme.classList.remove("disBut");
    }
    else{
      dugme.disabled = true;
      dugme.classList.add("disBut");
    }
  }
  regexIme: RegExp = /^[a-zA-Z]*$/;
  update() {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const username5 = (document.getElementById('username5') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const phone = (document.getElementById('phone') as HTMLInputElement).value;
    if(this.regexIme.test(name) == false)
    {
      this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: "Name must contain only letters.",
              life: 3000 });
      return;
    }
    const toUpdate = new OrganizerDto(this.authService.getUserId(),name,username5,email,phone,"");
    //console.log(toUpdate)
    this.apiService.updateOrg(toUpdate).subscribe({
      next:(response : string) =>{
        this.nameS = name;
        this.username5S = username5;
        this.emailS = email;
        this.phoneS = phone;
        this.check();
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

  async deletePic(){
    const confirmed = await this.confirmationDialogService.confirm(
      `Are you sure you want to remove the picture?`,
      `Remove picture`
    )
    if(!confirmed) return;

    this.apiService.removePicture().subscribe({
      next:(response : any) =>{
        this.previewUrl = this.currOrganizer.getImage();
          this.getOrganizerCall();
          this.sharedService.notifyProfileImageChanged();
        this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.message,
              life: 3000 });
        },
        error:(errorResponse) =>{
          this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorResponse.message,
              life: 3000 });
      }
    })
  }
}
