import { Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { RegisterForm } from './components/register-form/register-form.component';
import { LoginForm } from './components/login-form/login-form.component';
import { AdminPage } from './components/admin-page/admin-page.component';
import { OrganizerPageComponent } from './components/organizer-page/organizer-page.component';
import { AuthGuard } from './Guards/auth.guard';
import { SupplierPageComponent } from './components/supplier-page/supplier-page.component';
import { OverviewComponent } from './components/organizer-page/overview/overview.component';
import { EventsComponent } from './components/organizer-page/events/events.component';
import { ProfileComponent } from './components/organizer-page/profile/profile.component';
import { CalendarComponent } from './components/organizer-page/calendar/calendar.component';
import { CreateEventComponent } from './components/organizer-page/create-event/create-event.component';


export const routes: Routes = [
    {path: '', component: LandingPage},
    {path: 'home', component: LandingPage},
    {path: 'organizer', component: OrganizerPageComponent, canActivate: [AuthGuard], data : { roles: ['Organizer']},
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full'},
      { path: 'overview', component: OverviewComponent, canActivate: [AuthGuard], data : {roles: ['Organizer']} },
      { path: 'my-profile', component: ProfileComponent, canActivate: [AuthGuard], data : {roles: ['Organizer']} },
      { path: 'events', component: EventsComponent, canActivate: [AuthGuard], data : {roles: ['Organizer']} },
      { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard], data : {roles: ['Organizer']} },
      { path: 'create-event', component: CreateEventComponent, canActivate: [AuthGuard], data : {roles: ['Organizer']} }
    ]},
    {path: 'register', component: RegisterForm, canDeactivate: [(comp: RegisterForm) => comp.canExit()]},
    {path: 'login', component: LoginForm, canDeactivate: [(comp: LoginForm) => comp.canExit()]},
    {path: 'admin', component: AdminPage, canActivate: [AuthGuard], data : { roles: ['Admin']}},
    {path: 'supplier', component: SupplierPageComponent, canActivate: [AuthGuard], data : { roles: ['Supplier']}}
];
