import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-proizvodi',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './proizvodi.component.html',
  styleUrls: ['./proizvodi.component.css']
})
export class ProizvodiComponent {
  proizvodi: any[] = [];
  selectedProizvod: any = null;
  formProizvod = { naziv: '', cena: 0 };

  private apiUrl = 'http://localhost:5222/api/proizvodi';

  constructor(private http: HttpClient) {
    this.ucitajProizvode();
  }

ucitajProizvode() {
  this.http.get<any[]>(this.apiUrl).subscribe(data => {
    this.proizvodi = data;
  }, error => {
    console.error('Greška pri učitavanju proizvoda', error);
  });
}


  selectProizvod(proizvod: any) {
    this.selectedProizvod = proizvod;
    this.formProizvod = { ...proizvod };
  }

  cancelEdit() {
    this.selectedProizvod = null;
    this.formProizvod = { naziv: '', cena: 0 };
  }

  createProizvod() {
    this.http.post(this.apiUrl, this.formProizvod).subscribe(() => {
      this.ucitajProizvode();
      this.cancelEdit();
    });
  }

  updateProizvod() {
    if (!this.selectedProizvod) return;
    this.http.put(`${this.apiUrl}/${this.selectedProizvod.id}`, this.formProizvod).subscribe(() => {
      this.ucitajProizvode();
      this.cancelEdit();
    });
  }

  deleteProizvod(id: number) {
  this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
    this.ucitajProizvode();
    if (this.selectedProizvod?.id === id) this.cancelEdit();
  }, error => {
    console.error('Greška pri brisanju proizvoda', error);
  });
}

}
