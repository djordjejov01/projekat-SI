import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private profileImageChanged = new BehaviorSubject<boolean>(false);
  profileImageChanged$ = this.profileImageChanged.asObservable();

  notifyProfileImageChanged() {
    this.profileImageChanged.next(true);
  }
}