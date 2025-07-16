import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../Services/api.service';
import { AuthService } from '../../../Services/auth.service';
import { OrganizerDto } from '../../../Models/OrganizerDto';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
defaultImage = 'assets/default-picture.png'; // možeš postaviti neki default
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile?: File;
  constructor(private apiService : ApiService, private authService : AuthService, private messageService : MessageService){}
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
  }
  triggerFileUpload() {
  const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
  fileInput?.click();
}
  currOrganizer : OrganizerDto;

  ngOnInit(): void {
    console.log(this.authService.getUserId())
      this.apiService.getOrganizer(this.authService.getUserId()).subscribe({

        next:(response : OrganizerDto) => {
          this.currOrganizer = response;
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
  update() {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const phone = (document.getElementById('phone') as HTMLInputElement).value;

    const currentPassword = (document.getElementById('cpass') as HTMLInputElement).value;
    const newPassword = (document.getElementById('npass') as HTMLInputElement).value;
    const confirmNewPassword = (document.getElementById('cnpass') as HTMLInputElement).value;

    const toUpdate = new OrganizerDto(this.authService.getUserId(),name,username,email,phone,"");

    this.apiService.updateOrg(toUpdate, newPassword).subscribe({
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
}
