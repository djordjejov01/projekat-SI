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
import { Select } from 'primeng/select';
import { SupplierDto } from '../../../Models/SupplierDto';
import { UpdateSupplierDto } from '../../../Models/UpdateSupplierDto';


@Component({
  selector: 'app-my-profile',
  imports: [FormsModule, Select],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent implements OnInit {

  defaultImage = 'assets/default-picture.png';
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile?: File;
  selectedService: any;
  selectedCity: any;
  services = [{ name: 'Audiovisual & Production' },
  { name: 'Catering Services' },
  { name: 'Lighting & Effects' },
  { name: 'Stage & Set Design' },
  { name: 'Transportation & Logistics' },
  { name: 'Event Staffing' },
  { name: 'Photography & Videography' },
  { name: 'Decor & Styling' },
  { name: 'Security Services' },
  { name: 'Venue Rental' },
  { name: 'Entertainment Booking' },
  { name: 'Furniture & Equipment Rental' },
  { name: 'Mobile Toilets & Sanitation' },
  { name: 'Invitation & Ticketing Solutions' },
  { name: 'Digital Marketing & Promotion' },
  { name: 'Wi-Fi & Networking' },
  { name: 'Insurance & Legal Support' },
  { name: 'Event Consulting & Planning' },
  { name: 'Fireworks & Special Effects' },
  { name: 'Hostesses & Translators' }];

  cities = [
  { name: 'Aleksinac' },
  { name: 'Apatin' },
  { name: 'Aranđelovac' },
  { name: 'Bačka Palanka' },
  { name: 'Bajina Bašta' },
  { name: 'Bečej' },
  { name: 'Beograd' },
  { name: 'Bor' },
  { name: 'Čačak' },
  { name: 'Gornji Milanovac' },
  { name: 'Inđija' },
  { name: 'Jagodina' },
  { name: 'Kikinda' },
  { name: 'Kragujevac' },
  { name: 'Kraljevo' },
  { name: 'Leskovac' },
  { name: 'Loznica' },
  { name: 'Lazarevac' },
  { name: 'Mladenovac' },
  { name: 'Negotin' },
  { name: 'Novi Pazar' },
  { name: 'Novi Sad' },
  { name: 'Pančevo' },
  { name: 'Paraćin' },
  { name: 'Pirot' },
  { name: 'Požarevac' },
  { name: 'Prokuplje' },
  { name: 'Raška' },
  { name: 'Ruma' },
  { name: 'Senta' },
  { name: 'Smederevo' },
  { name: 'Sombor' },
  { name: 'Sremska Mitrovica' },
  { name: 'Subotica' },
  { name: 'Surdulica' },
  { name: 'Šabac' },
  { name: 'Temerin' },
  { name: 'Valjevo' },
  { name: 'Vranje' },
  { name: 'Vrbas' },
  { name: 'Vrnjačka Banja' },
  { name: 'Vršac' },
  { name: 'Zaječar' },
  { name: 'Zrenjanin' }
];
  constructor(private apiService: ApiService, private authService: AuthService, private messageService: MessageService, private sharedService: SharedService) { }

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

    this.apiService.changeSupplierPicture(formData).subscribe({

        next:(response : any) => {
          console.log(response);
          this.previewUrl = this.currSupplier.getImage();
          this.getSupplierCall();
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
  username : string;
  ngOnInit(): void {
    console.log(this.authService.getUserId())
    this.username = this.authService.getUserName();
    this.getSupplierCall();
  }
  currSupplier : SupplierDto;
  changePass: ChangePasswordDto;
  getSupplierCall(){
    this.apiService.getSupplier().subscribe({

        next:(response : SupplierDto) => {
          this.currSupplier = response;
          if(this.currSupplier.getImage()!="https://localhost:7269/")
          {
            this.previewUrl = this.currSupplier.getImage();
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
  update() {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const username1 = (document.getElementById('username1') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const phone = (document.getElementById('phone') as HTMLInputElement).value;
    const bio = (document.getElementById('bio') as HTMLInputElement).value;
    const website = (document.getElementById('website') as HTMLInputElement).value;
    const toUpdate = new UpdateSupplierDto(username1,name,email,phone,website,bio);
    console.log("SALJEM: ");
    console.log(toUpdate);
    this.apiService.updateSupplier(toUpdate).subscribe({
      next:(response : string) =>{
        this.getSupplierCall();
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
}
