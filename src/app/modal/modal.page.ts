import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})

export class ModalPage implements OnInit {

  @Input() titulo:string | undefined;
  @Input() imagen:string | undefined;
  @Input() texto:string | undefined;

  @Input() indicaciones:Boolean | undefined;
  @Input() resultado:Boolean | undefined;

  @Input() ejemplos:Boolean | undefined;
  @Input() contenedor:Boolean | undefined;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {

    if(this.imagen){
      let img  = document.querySelector('#img-modal') as HTMLImageElement;
      if(img) {
        img.src = this.imagen;
      }
    }

    // if(this.resultado===true) {
    //   let modal = document.querySelector('app-modal>ion-content');
    //   let h3 = document.createElement('h3');
    //   h3.textContent = 'Debes depositarlo en';
    //   h3.style.color = 'black';
    //   h3.style.textAlign = 'center';

    //   modal?.appendChild(h3);
    //   //tengo que poner subtitulo de ejemplos o en text
    //   //subtitulo de debes depositarlo en
    //   //texto contenedor

    // }

  }

  close() {
    this.modalCtrl.dismiss();
  }

}
