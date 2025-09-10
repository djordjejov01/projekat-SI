import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class SharedService {
  private profileImageChanged = new BehaviorSubject<boolean>(false);
  profileImageChanged$ = this.profileImageChanged.asObservable();
  private langChangeSource = new Subject<void>();
  langChange$ = this.langChangeSource.asObservable();


  notifyProfileImageChanged() {
    this.profileImageChanged.next(true);
  }
  notifyLangChange(): void {
    this.langChangeSource.next();
  }
  private usernameSource = new BehaviorSubject<string | null>(null);
  currentUsername$ = this.usernameSource.asObservable();

  updateUsername(newUsername: string) {
    this.usernameSource.next(newUsername);
  }
}