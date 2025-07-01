import { Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { RegisterForm } from './components/register-form/register-form.component';
import { LoginForm } from './components/login-form/login-form.component';
import { OrganizerPageComponent } from './components/organizer-page/organizer-page.component';

export const routes: Routes = [
    {path: '', component: LandingPage},
    {path: 'Home', component: LandingPage},
    {path: 'Register', component: RegisterForm},
    {path: 'Login', component: LoginForm},
    {path: 'organizer', component: OrganizerPageComponent}
];
