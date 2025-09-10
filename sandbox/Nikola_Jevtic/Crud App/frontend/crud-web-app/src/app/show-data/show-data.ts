import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Player } from '../Models/Player';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-show-data',
  imports: [CommonModule],
  templateUrl: './show-data.html',
  styleUrl: './show-data.css'
})
export class ShowData {

  constructor(private playerService : PlayerService) {}

  @Input() data? : Player[];
  currentEditable? : Player = undefined;

  callDeletePlayer(player : Player){
    if(player.id == null){
      console.error('Player ID is missing. Cannot delete.');
      return;
    }

    this.playerService.deletePlayer(player.id).subscribe({
      next: () => {
        window.location.reload();
      },

      error: (err) =>{
        ////console.log('Error when deleting player', err);
      }
    })
  }
}
