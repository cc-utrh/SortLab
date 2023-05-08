import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ModalController } from '@ionic/angular';
import { PredictionService } from '../services/prediction.service';
import { ModalPage } from '../modal/modal.page';

@Component({
  selector: 'app-resultado',
  templateUrl: './resultado.page.html',
  styleUrls: ['./resultado.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ResultadoPage {
  public fotoCapturada: String;
  public resultado: String = "";
  private loaderActive = false;
  confirmed = false;

  constructor(private predictionService:PredictionService, private navCtrl:NavController, private modalCtrl: ModalController) {
    this.fotoCapturada = this.predictionService.getFoto();
  }

  async confirmImage(){
    let response = document.getElementById('fotoCapturada') as HTMLImageElement;
    if(response){
      let confirmar = await this.setConfirmed();
      if(confirmar)
        this.hacerInferencia();

    }
  }

  setConfirmed() {
    this.confirmed = true;
    return this.confirmed;
  }

  async hacerInferencia() {
    console.log("🚀 ~ file: resultado.page.ts:34 ~ ResultadoPage ~ hacerInferencia ~ hacerInferencia:")

    let res = await this.predictionService.predict();
    this.resultado = res;
    await this.finishLoading();
    this.presentModal();



    // this.predictionService.getResultado().subscribe((res) => {
    //   if(res){
    //     this.finishLoading();
    //     this.loaderActive = false;
    //   }
    //   console.log(res);
    //   this.resultado = res;
    // });
  }

  goBack(){
    console.log('hago click en atrás')
    this.navCtrl.back();
  }

  finishLoading() {
    let loader = document.getElementById('spinner')
    if(loader){
      loader.style.display = 'none';
    }
  }

  async presentModal() {
    let prediccionObtenida = this.resultado
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      breakpoints: [0, 0.3, 0.5],
      initialBreakpoint: 0.5,
      handle: true,
      componentProps: {
        prediccionObtenida
      },
      cssClass: 'custom-modal',
    });
    await modal.present();
  }

  ngOnDestroy() {
    if(this.loaderActive) {
      this.finishLoading();
    }
    this.resultado = '';
    // this.predictionService.limpioTensores();
    //aqui me deberia cargar todos los tensores si hay no? llamo al servicio y que se los cargue
  }

}
