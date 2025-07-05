import { Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { RegisterForm } from './components/register-form/register-form.component';
import { LoginForm } from './components/login-form/login-form.component';
import { AdminPage } from './components/admin-page/admin-page.component';
import { OrganizerPageComponent } from './components/organizer-page/organizer-page.component';


export const routes: Routes = [
    {path: '', component: LandingPage},
    {path: 'home', component: LandingPage},
    {path: 'organizer', component: OrganizerPageComponent},
    {path: 'register', component: RegisterForm, canDeactivate: [(comp: RegisterForm) => comp.canExit()]},
    {path: 'login', component: LoginForm, canDeactivate: [(comp: LoginForm) => comp.canExit()]},
    {path: 'admin', component: AdminPage}
];
