import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerService } from './services/player.service';
import { Player } from './Models/Player';
import { ShowData } from './show-data/show-data';
import { EditData } from './edit-data/edit-data';
import { AddData } from './add-data/add-data';

@Component({
  selector: 'app-root',
  imports: [ShowData,EditData,AddData],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected title = 'crud-web-app';
  players: Player[] = [];

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.playerService.getPlayers().subscribe(data => {
      this.players = data;
    });
  }

}
