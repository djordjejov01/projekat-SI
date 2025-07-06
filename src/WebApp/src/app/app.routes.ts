import { Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { RegisterForm } from './components/register-form/register-form.component';
import { LoginForm } from './components/login-form/login-form.component';
import { AdminPage } from './components/admin-page/admin-page.component';
import { OrganizerPageComponent } from './components/organizer-page/organizer-page.component';
import { OverviewComponent } from './components/organizer-page/overview/overview.component';
import { EventsComponent } from './components/organizer-page/events/events.component';
import { ProfileComponent } from './components/organizer-page/profile/profile.component';
import { CalendarComponent } from './components/organizer-page/calendar/calendar.component';
import { CreateEventComponent } from './components/organizer-page/create-event/create-event.component';


export const routes: Routes = [
    {path: '', component: LandingPage},
    {path: 'Home', component: LandingPage},
    {path: 'organizer', component: OrganizerPageComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'my-profile', component: ProfileComponent },
      { path: 'events', component: EventsComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'create-event', component: CreateEventComponent }
    ]},
    {path: 'Register', component: RegisterForm, canDeactivate: [(comp: RegisterForm) => comp.canExit()]},
    {path: 'Login', component: LoginForm, canDeactivate: [(comp: LoginForm) => comp.canExit()]},
    {path: 'Admin', component: AdminPage}
];
