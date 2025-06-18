import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { App } from './app';
import { ProizvodiComponent } from './proizvodi/proizvodi.component';

@NgModule({
  imports: [
    BrowserModule,
    App,
    ProizvodiComponent
  ],
  bootstrap: [App]
})
export class AppModule { }
