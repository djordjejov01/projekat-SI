import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../Services/auth.service';
import { LanguageService } from '../../../Services/LanguageService';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header-bar',
  imports: [RouterLink, TranslateModule,CommonModule,FormsModule],
  templateUrl: './header-bar.html',
  styleUrl: './header-bar.css'
})
export class HeaderBar implements OnInit{
   constructor(private translate: TranslateService,private authService : AuthService, private languageService : LanguageService) {}

   public currentLanguage : string;
   isLoggedIn : boolean = false;
   role : string | null = null;

   ngOnInit(): void {
        const savedLang = this.languageService.language();
    this.currentLanguage = savedLang || 'en';
     this.checkLogin();
   }

   checkLogin(){

    this.isLoggedIn = this.authService.isLoggedIn();

    if(this.isLoggedIn){
      this.role = this.authService.getUserRole();
    }else{
      this.role = null;
    }

   }

   get dashboardRoute(){

    const role = this.role ? this.role.toLowerCase() : null;

    switch(role){
      case 'admin': return '/admin';
      case 'organizer': return '/organizer';
      case 'supplier': return '/supplier';  
      default: return '/home'
    }

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
}
