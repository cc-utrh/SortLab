import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

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

  }

  close() {
    this.modalCtrl.dismiss();
  }

}
