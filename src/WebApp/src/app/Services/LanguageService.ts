import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  // A private signal to hold the current language.
  private _language = signal(localStorage.getItem('user-language') || 'en');

  // A public, readonly signal for components and other services to read the current language.
  public readonly language = this._language.asReadonly();

  constructor() {
    // This constructor is not strictly needed as the signal is initialized on the same line,
    // but it's a good place for future initialization logic if needed.
  }

  /**
   * Sets the new language and persists it to localStorage.
   * @param lang The language code (e.g., 'en', 'sr').
   */
  setLanguage(lang: string): void {
    this._language.set(lang);
    localStorage.setItem('user-language', lang);
    //console.log(`Language changed to: ${lang}`);
  }
}
