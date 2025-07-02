import { Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { RegisterForm } from './components/register-form/register-form.component';
import { LoginForm } from './components/login-form/login-form.component';
import { OrganizerPageComponent } from './components/organizer-page/organizer-page.component';

export const routes: Routes = [
    {path: '', component: LandingPage},
    {path: 'Home', component: LandingPage},
<<<<<<< src/WebApp/src/app/app.routes.ts
=======
    {path: 'organizer', component: OrganizerPageComponent},
    {path: 'Register', component: RegisterForm, canDeactivate: [(comp: RegisterForm) => comp.canExit()]},
    {path: 'Login', component: LoginForm, canDeactivate: [(comp: LoginForm) => comp.canExit()]}
>>>>>>> src/WebApp/src/app/app.routes.ts
];
