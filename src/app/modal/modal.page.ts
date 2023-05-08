import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ResultadoPage } from '../resultado/resultado.page';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ModalPage implements OnInit {

  prediccion: String | undefined;
  @Input() prediccionObtenida:String | undefined;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.prediccion = this.prediccionObtenida;
  }

  close() {
    this.modalCtrl.dismiss();
  }

}
