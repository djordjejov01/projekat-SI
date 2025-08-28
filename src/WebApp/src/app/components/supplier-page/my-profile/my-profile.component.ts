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

@Component({
  selector: 'app-my-profile',
  imports: [FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit {

  defaultImage = `${environment.backendBaseUrl}/images/default-pfp.png`;
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile?: File;
  constructor(private apiService: ApiService, private authService: AuthService, private messageService: MessageService, private sharedService: SharedService,
    private confirmationDialogService : ConfirmationDialogService
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
          //console.log(response);
          this.previewUrl = this.currSupplier.getImage();
          this.getSupplierCall();
          this.sharedService.notifyProfileImageChanged();
          this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: "Uspešno promenjena slika",
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
  resources : ResourceDto[];
  freeResources : ResourceDto[];
  bookedResources : ResourceDto[];
  username : string;
  ngOnInit(): void {
    //console.log(this.authService.getUserId())
    this.username = this.authService.getUserName();
    this.getSupplierCall();

    this.apiService.getResources(this.authService.getUserId()).subscribe({

        next:(response : ResourceDto[]) => {
          this.resources = response;
          this.bookedResources = this.resources.filter(resource => resource.getIsAvailable() == 1);
          this.freeResources = this.resources.filter(resource => resource.getIsAvailable() == 0);
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
  currSupplier : SupplierDto;
  changePass: ChangePasswordDto;
  getSupplierCall(){
    this.apiService.getSupplier().subscribe({

        next:(response : SupplierDto) => {
          this.currSupplier = response;
          this.previewUrl = this.currSupplier.getImage();
          //console.log(response);
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
  update() {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const username1 = (document.getElementById('username1') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const phone = (document.getElementById('phone') as HTMLInputElement).value;
    const bio = (document.getElementById('bio') as HTMLInputElement).value;
    const website = (document.getElementById('website') as HTMLInputElement).value;
    const toUpdate = new UpdateSupplierDto(username1,name,email,phone,website,bio);
    //console.log("SALJEM: ");
    //console.log(toUpdate);
    this.apiService.updateSupplier(toUpdate).subscribe({
      next:(response : string) =>{
        this.getSupplierCall();
        this.sharedService.updateUsername(this.currSupplier.getUsername());
        this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response,
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
  updatePass() {

    const currentPassword = (document.getElementById('cpass') as HTMLInputElement).value;
    const newPassword = (document.getElementById('npass') as HTMLInputElement).value;
    const confirmNewPassword = (document.getElementById('cnpass') as HTMLInputElement).value;

    if (newPassword != "" && newPassword == confirmNewPassword) {
      this.changePass = new ChangePasswordDto(currentPassword, newPassword);

      this.apiService.changeUserPass(this.changePass).subscribe({
        next: (response: any) => {
          (document.getElementById('cpass') as HTMLInputElement).value = "";
          (document.getElementById('npass') as HTMLInputElement).value = "";
          (document.getElementById('cnpass') as HTMLInputElement).value = "";
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response,
            life: 3000
          });
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

    if (newPassword != "" && newPassword != confirmNewPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: "Šifre se ne poklapaju",
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
        this.previewUrl = this.currSupplier.getImage();
          this.getSupplierCall();
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
