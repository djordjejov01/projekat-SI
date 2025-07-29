import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { OrganizerDto } from '../../../Models/OrganizerDto';
import { MessageService } from 'primeng/api';
import { ChangePasswordDto } from '../../../Models/ChangePasswordDto';
import { DashboardMetrics } from '../../../Interfaces/DashboardMetricsResponse';
import { ViewChild } from '@angular/core';
import { SharedService } from '../../../Services/shared.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit {

defaultImage = 'assets/default-picture.png';
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile?: File;
  


  constructor(private apiService : ApiService, private authService : AuthService, private messageService : MessageService, private sharedService : SharedService){}
  
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

  this.apiService.changeOrganizerPicture(formData).subscribe({

        next:(response : any) => {
          console.log(response);
          this.previewUrl = this.currOrganizer.getImage();
          this.getOrganizerCall();
          this.sharedService.notifyProfileImageChanged();
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
  currOrganizer : OrganizerDto;
  allEvents : Event[];
  upcomingEvents : Event[];
  dashboardMetrics : DashboardMetrics;

  getOrganizerCall(){
    this.apiService.getOrganizer(this.authService.getUserId()).subscribe({

        next:(response : OrganizerDto) => {
          this.currOrganizer = response;
          if(this.currOrganizer.getImage()!="https://localhost:7269/")
          {
            this.previewUrl = this.currOrganizer.getImage();
          }
          console.log(response);
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

  ngOnInit(): void {
    console.log(this.authService.getUserId())
      this.getOrganizerCall();

      this.apiService.getOrganizerEvents(this.authService.getUserId()).subscribe({
      
            next: (response: any) => {
              this.allEvents = response;
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
      this.apiService.getUpcomingOrganizerEvents(this.authService.getUserId()).subscribe({
      
            next: (response: any) => {
              this.upcomingEvents = response;
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
      this.apiService.getDashboardMetrics().subscribe({
            next: (response: DashboardMetrics) => {
              this.dashboardMetrics = response;
              console.log(response);
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

  changePass : ChangePasswordDto;

  update() {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const phone = (document.getElementById('phone') as HTMLInputElement).value;

    const toUpdate = new OrganizerDto(this.authService.getUserId(),name,username,email,phone,"");

    this.apiService.updateOrg(toUpdate).subscribe({
      next:(response : string) =>{
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
  updatePass(){

    const currentPassword = (document.getElementById('cpass') as HTMLInputElement).value;
    const newPassword = (document.getElementById('npass') as HTMLInputElement).value;
    const confirmNewPassword = (document.getElementById('cnpass') as HTMLInputElement).value;
    
    if(newPassword != "" &&  newPassword == confirmNewPassword)
    {
      this.changePass = new ChangePasswordDto(currentPassword, newPassword);

      this.apiService.changeOrgPass(this.changePass).subscribe({
      next:(response : any) =>{
        (document.getElementById('cpass') as HTMLInputElement).value = "";
        (document.getElementById('npass') as HTMLInputElement).value = "";
        (document.getElementById('cnpass') as HTMLInputElement).value = "";
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

    if(newPassword != "" &&  newPassword != confirmNewPassword)
    {
      this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: "Šifre se ne poklapaju",
              life: 3000 });
    }
  }
}
