import { Component,Input } from '@angular/core';
import { Player } from '../Models/Player';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-edit-data',
  imports: [CommonModule],
  templateUrl: './edit-data.html',
  styleUrl: './edit-data.css'
})
export class EditData {

  @Input() toEdit? : Player = undefined;

  constructor(private playerService : PlayerService) {}

  editPlayer(idInput : HTMLInputElement, nameInput : HTMLInputElement, teamInput : HTMLInputElement, positionInput : HTMLInputElement){

   const updatedPlayer : Player = {
    id: parseInt(idInput.value),
    name: nameInput.value.trim(),
    team: teamInput.value.trim(),
    position: positionInput.value.trim()
   }

   this.playerService.updatePlayer(updatedPlayer).subscribe({
    next: () => {
      window.location.reload();
    },
    error: (err : any) => {
      console.log('Update Failed', err);
    }
   });

  }
}
