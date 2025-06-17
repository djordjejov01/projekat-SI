import { Routes } from '@angular/router';
import { VideoGameListComponent } from './components/video-game-list/video-game-list';

export const routes: Routes = [
  { path: '', component: VideoGameListComponent },
  {
    path: 'dodaj',
    loadComponent: () => import('./components/video-game-form/video-game-form').then(m => m.VideoGameFormComponent)
  },
  {
    path: 'izmeni/:id',
  loadComponent: () => import('./components/video-game-form/video-game-form').then(m => m.VideoGameFormComponent)
  }
];
