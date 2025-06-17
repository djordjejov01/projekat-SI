import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoGame, VideoGameService } from '../../services/video-game.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-video-game-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './video-game-list.html',
  styleUrls: ['./video-game-list.css']
})
export class VideoGameListComponent implements OnInit {
  videoGames: VideoGame[] = [];

  constructor(
    private videoGameService: VideoGameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGames();

    this.videoGameService.refreshNeeded$?.subscribe(() => {
      this.loadGames();
    });
  }

  loadGames(): void { 
  this.videoGameService.getAll().subscribe(data => {
    this.videoGames = data.sort((a, b) => {
      const idA = a.id ?? 0; // ako je null ili undefined, koristi 0
      const idB = b.id ?? 0;
      return idA - idB;
    });
  });
}

  deleteGame(id?: number): void {
    if (id !== undefined) {
      this.videoGameService.delete(id).subscribe(() => {
        window.location.href = '/';
      });
    }
  }

  editGame(id: number | undefined): void {
  if (typeof id === 'number') {
    window.location.href='/izmeni/'+id;
  }
  }
}
