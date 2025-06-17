import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VideoGameService, VideoGame } from '../../services/video-game.service';
import { CommonModule } from '@angular/common';
import { empty } from 'rxjs';


@Component({
  selector: 'app-video-game-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './video-game-form.html',
  styleUrls: ['./video-game-form.css']
})
export class VideoGameFormComponent implements OnInit {
  videoGame: VideoGame = {
    id: 0,
    naziv: '',
    opis: '',
    godina: null as any
  };

  isEditMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoGameService: VideoGameService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      const id = parseInt(idParam, 10);
      this.videoGameService.getById(id).subscribe(game => {
        this.videoGame = game;
      });
    }
  }

 onSubmit(): void {
  if (this.isEditMode) {
    this.videoGameService.updateGame(this.videoGame).subscribe(() => {
      window.location.href = '/';
    });
  } else {
    this.videoGameService.addGame(this.videoGame).subscribe(() => {
      window.location.href = '/';
    });
  }
}

}
