import { Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { RegisterForm } from './components/register-form/register-form.component';
import { LoginForm } from './components/login-form/login-form.component';
import { AdminPage } from './components/admin-page/admin-page.component';

export const routes: Routes = [
    {path: '', component: LandingPage},
    {path: 'Home', component: LandingPage},
    {path: 'Register', component: RegisterForm, canDeactivate: [(comp: RegisterForm) => comp.canExit()]},
    {path: 'Login', component: LoginForm, canDeactivate: [(comp: LoginForm) => comp.canExit()]},
    {path: 'Admin', component: AdminPage}
];
