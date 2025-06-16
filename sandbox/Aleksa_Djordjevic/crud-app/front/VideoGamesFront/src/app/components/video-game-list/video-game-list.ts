import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoGame, VideoGameService } from '../../services/video-game.service';

@Component({
  selector: 'app-video-game-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-game-list.html',
  styleUrls: ['./video-game-list.css']
})
export class VideoGameListComponent implements OnInit {
  videoGames: VideoGame[] = [];

  constructor(private videoGameService: VideoGameService) {}

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.videoGameService.getAll().subscribe(data => {
      this.videoGames = data;
    });
  }

  deleteGame(id: number): void {
    this.videoGameService.delete(id).subscribe(() => {
      this.loadGames();
    });
  }
}
