import { Component } from '@angular/core';
import { PlayerService } from '../services/player.service';
import { Player } from '../Models/Player';

@Component({
  selector: 'app-add-data',
  imports: [],
  templateUrl: './add-data.html',
  styleUrl: './add-data.css'
})
export class AddData {

  constructor(private playerService : PlayerService) {}
  
    addPlayer(nameInput : HTMLInputElement, teamInput : HTMLInputElement, positionInput : HTMLInputElement){
  
     const newPlayer : Player = {
      name: nameInput.value.trim(),
      team: teamInput.value.trim(),
      position: positionInput.value.trim()
     }
  
     this.playerService.addPlayer(newPlayer).subscribe({
      next: () => {
        window.location.reload()
      },
      error: (err) => {
        //console.log('Adding player failed',err);
      } 
     })

    }

}
