import { Component, OnInit, Resource } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { OrganizerDto } from '../../../Models/OrganizerDto';
import { MessageService } from 'primeng/api';
import { ChangePasswordDto } from '../../../Models/ChangePasswordDto';
import { DashboardMetrics } from '../../../Interfaces/DashboardMetricsResponse';
import { ViewChild } from '@angular/core';
import { SharedService } from '../../../Services/shared.service';
import { Select } from 'primeng/select';
import { SupplierDto } from '../../../Models/SupplierDto';
import { UpdateSupplierDto } from '../../../Models/UpdateSupplierDto';
import { ResourceDto } from '../../../Models/ResourceDto';
import { environment } from '../../../../environments/environment';
import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service';
import { TranslateModule,TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-my-profile',
  imports: [TranslateModule,FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  defaultImage = `${environment.backendBaseUrl}/images/default-pfp.png`;
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile?: File;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private confirmationDialogService: ConfirmationDialogService,
    private translate: TranslateService
  ) { }

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

  @ViewChild('fileInput') fileInput;

  triggerFileUpload() {
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('Image', this.selectedFile);
    formData.append('Id', this.authService.getUserId().toString());
    this.selectedFile = null;
    this.apiService.changeSupplierPicture(formData).subscribe({
      next:(response : any) => {
        this.previewUrl = this.currSupplier.getImage();
        this.getSupplierCall();
        this.sharedService.notifyProfileImageChanged();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SUCCESS'),
          detail: this.translate.instant('PROFILE.SUCCESS_PICTURE_CHANGE'),
          life: 3000
        });
      },
      error:(errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    })
  }

  resources : ResourceDto[];
  freeResources : ResourceDto[];
  bookedResources : ResourceDto[];
  username : string;

  ngOnInit(): void {
    this.username = this.authService.getUserName();
    this.getSupplierCall();

    this.apiService.getResources(this.authService.getUserId()).subscribe({
      next:(response : ResourceDto[]) => {
        this.resources = response;
        this.bookedResources = this.resources.filter(resource => resource.getIsAvailable() == 1);
        this.freeResources = this.resources.filter(resource => resource.getIsAvailable() == 0);
      },
      error:(errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('PROFILE.ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    })
  }

  currSupplier : SupplierDto;
  changePass: ChangePasswordDto;
  nameS : string;
  username1S : string;
  emailS : string;
  phoneS : string;
  bioS : string;
  websiteS : string;

  getSupplierCall(){
    this.apiService.getSupplier().subscribe({
      next:(response : SupplierDto) => {
        this.currSupplier = response;
        this.previewUrl = this.currSupplier.getImage();
        this.nameS = this.currSupplier.getCompanyName();
        this.username1S = this.currSupplier.getUsername();
        this.emailS = this.currSupplier.getEmail();
        this.phoneS = this.currSupplier.getPhoneNumber();
        this.bioS = this.currSupplier.getCompanyBio();
        this.websiteS = this.currSupplier.getWebsite();
      },
      error:(errorResponse) =>{
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('PROFILE.ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    })
  }

  check(){
    let name = (document.getElementById('name') as HTMLInputElement).value;
    let username1 = (document.getElementById('username1') as HTMLInputElement).value;
    let email = (document.getElementById('email') as HTMLInputElement).value;
    let phone = (document.getElementById('phone') as HTMLInputElement).value;
    let bio = (document.getElementById('bio') as HTMLInputElement).value;
    let website = (document.getElementById('website') as HTMLInputElement).value;
    let dugme = document.getElementById('upp1') as HTMLButtonElement;
    if(this.nameS != name || this.username1S != username1 || this.emailS != email || this.phoneS != phone || this.bioS != bio || this.websiteS != website) {
      dugme.disabled = false;
      dugme.classList.remove("disBut");
    } else {
      dugme.disabled = true;
      dugme.classList.add("disBut");
    }
  }

  regexIme: RegExp = /^[a-zA-Z]*$/;
  update() {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const username1 = (document.getElementById('username1') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const phone = (document.getElementById('phone') as HTMLInputElement).value;
    const bio = (document.getElementById('bio') as HTMLInputElement).value;
    const website = (document.getElementById('website') as HTMLInputElement).value;
    const toUpdate = new UpdateSupplierDto(username1,name,email,phone,website,bio);

    if(!this.regexIme.test(name)) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('ERROR'),
        detail: this.translate.instant('PROFILE.ERROR_NAME_ONLY_LETTERS'),
        life: 3000
      });
      return;
    }

    this.apiService.updateSupplier(toUpdate).subscribe({
      next:(response : string) =>{
        this.getSupplierCall();
        this.sharedService.updateUsername(this.currSupplier.getUsername());
        this.nameS = name;
        this.username1S = username1;
        this.emailS = email;
        this.phoneS = phone;
        this.bioS = bio;
        this.websiteS = website;
        this.check();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SUCCESS'),
          detail: this.translate.instant('PROFILE.SUCCESS_UPDATE_PROFILE'),
          life: 3000
        });
      },
      error:(errorResponse) =>{
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    })
  }

  updatePass() {
    const currentPassword = (document.getElementById('cpass') as HTMLInputElement).value;
    const newPassword = (document.getElementById('npass') as HTMLInputElement).value;
    const confirmNewPassword = (document.getElementById('cnpass') as HTMLInputElement).value;

    if (newPassword && newPassword === confirmNewPassword) {
      this.changePass = new ChangePasswordDto(currentPassword, newPassword);
      this.apiService.changeUserPass(this.changePass).subscribe({
        next: (response: any) => {
          (document.getElementById('cpass') as HTMLInputElement).value = "";
          (document.getElementById('npass') as HTMLInputElement).value = "";
          (document.getElementById('cnpass') as HTMLInputElement).value = "";
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('SUCCESS'),
            detail: response.message,
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
      })
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('PROFILE.ERROR'),
        detail: this.translate.instant('PROFILE.ERROR_PASSWORD_MISMATCH'),
        life: 3000
      });
    }
  }

  async deletePic(){
    const confirmed = await this.confirmationDialogService.confirm(
      this.translate.instant('PROFILE.CONFIRM_REMOVE_PICTURE'),
      this.translate.instant('PROFILE.REMOVE_PICTURE_TITLE')
    )
    if(!confirmed) return;

    this.apiService.removePicture().subscribe({
      next:(response : any) =>{
        this.previewUrl = this.currSupplier.getImage();
        this.getSupplierCall();
        this.sharedService.notifyProfileImageChanged();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('SUCCESS'),
          detail: response.message,
          life: 3000
        });
      },
      error:(errorResponse) =>{
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: errorResponse.message,
          life: 3000
        });
      }
    })
  }
}
