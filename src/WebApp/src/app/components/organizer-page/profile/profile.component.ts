import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
defaultImage = 'assets/default-picture.png'; // možeš postaviti neki default
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile?: File;

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
user = {
  username: 'test', 
  email: '',
  phone: ''
};
}
