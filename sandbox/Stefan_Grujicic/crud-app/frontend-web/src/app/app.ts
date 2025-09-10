import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Button } from './components/button/button';
import { TextInput } from './components/text-input/text-input';
import { Anime, oneAnime } from './services/anime';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [Button, TextInput, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'crud-app';
  animes : oneAnime[] = [];
  constructor(private animeService: Anime) {}
  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.animeService.getAnimes().subscribe(data => {
      this.animes = data;
    });
  }
  inputIdRead: string = "";
  readID(id: string){
    let id2 = Number(id)
    this.animeService.getAnime(id2).subscribe(data => {
    });
  }
  nameA: string = '';
  typeA: string = '';
  episodesA: string = '';
  scoreA: string = '';
  addAnime(name1: string,type1 : string, episodes1: string, score1: string)
  {
    let sc = Number(score1)
    const newAnime: oneAnime = {name: name1, type : type1, episodes : episodes1, score : sc};
    this.animeService.createProduct(newAnime).subscribe(() => this.loadAll());
  }
  IDB: string = "";
  nameB: string = '';
  typeB: string = '';
  episodesB: string = '';
  scoreB: string = '';
  updateAnime(id1: string,name1: string,type1 : string, episodes1: string, score1: string)
  {
    let sc = Number(score1)
    let id2 = Number(id1)
    const updated: oneAnime = { id: id2, name: name1, type : type1, episodes : episodes1, score : sc };
    this.animeService.updateProduct(updated).subscribe(() => this.loadAll());
  }
  IDC: string = "";
  deleteAnime(id1: string)
  {
    let id2 = Number(id1)
    this.animeService.deleteProduct(id2).subscribe(() => this.loadAll());
  }

  readAll(){
    this.animeService.getAnimes().subscribe(data => {
      this.animes = data;
      ////console.log(data)
    });
    
  }
}
