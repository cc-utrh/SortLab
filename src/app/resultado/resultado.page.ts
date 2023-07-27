import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ModalController } from '@ionic/angular';
import { PredictionService } from '../services/prediction.service';
import { ModalPage } from '../modal/modal.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resultado',
  templateUrl: './resultado.page.html',
  styleUrls: ['./resultado.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ResultadoPage {
  public fotoCapturada: String;
  private loaderActive = false;
  confirmed = false;

  textoCarga = '';
  textos = ['detectando residuo...', 'identificando material...', 'buscando el mejor contenedor...', '¡el planeta te da las gracias!']
  indice = 0;
  idTimeOut: any;

  public titulo: String = '';
  public mensaje: String = '';
  public haFuncionado: Boolean = true;
  public ejemplos: String = '';
  public contenedor: String = '';
  public img: String = '';

  constructor(private predictionService:PredictionService, private navCtrl:NavController, private router:Router, private modalCtrl: ModalController) {
    this.fotoCapturada = this.predictionService.getFoto();
  }

  async confirmImage(){
    let response = document.getElementById('fotoCapturada') as HTMLImageElement;
    if(response){
      let confirmar = await this.setConfirmed();
      if(confirmar)
        this.rotacionTextos();
        this.hacerInferencia();

    }
  }

  rotacionTextos(){
    this.textoCarga = this.textos[this.indice];
    this.indice = (this.indice + 1) % this.textos.length;
    this.idTimeOut = setTimeout(() => this.rotacionTextos(), 4000);
  }

  pararTextos() {
    clearTimeout(this.idTimeOut);
  }


  setConfirmed() {
    this.confirmed = true;
    return this.confirmed;
  }

  async hacerInferencia() {
    console.log("🚀 ~ file: resultado.page.ts:34 ~ ResultadoPage ~ hacerInferencia ~ hacerInferencia:")

    let res = await this.predictionService.predict();
    if(typeof res === 'number') {
      this.haFuncionado = false;
      this.titulo = 'Algo ha salido mal...';
      if(res===-1){
        this.mensaje = 'He detectado más de un residuo en la imagen. ';
      }else if(res===0){
        this.mensaje = 'No he detectado un residuo en la imagen. ';
      }
      this.mensaje += 'Prueba otra vez.'
    }else{
      this.mensaje = res.name
      this.ejemplos = res.examples;
      this.contenedor = res.container;
      this.img = res.icon;
    }

    await this.finishLoading();
    this.presentModal();

  }

  goBack(){
    console.log('hago click en atrás')
    this.navCtrl.back();
  }

  finishLoading() {
    let loader = document.querySelector<HTMLElement>('.loaderDiv')
    if(loader){
      loader.style.display = 'none';
    }
    this.pararTextos();
  }

  async presentModal() {
    let titulo = this.titulo;
    let texto = this.mensaje;
    let imagen = '../../assets/material_icons/'
    let resultado = this.haFuncionado;
    let ejemplos = this.ejemplos;
    let contenedor = this.contenedor;

    if(!this.haFuncionado){
      imagen += 'error.png';
    }else{
      imagen += this.img;
    }

    const modal = await this.modalCtrl.create({
      component: ModalPage,
      breakpoints: [0, 0.55, 0.7],
      initialBreakpoint: 0.55,
      handle: true,
      componentProps: {
        titulo,
        texto,
        imagen,
        resultado,
        ejemplos,
        contenedor
      },
      cssClass: 'custom-modal',
    });
    await modal.present();
    this.finishLoading();

    modal.onDidDismiss().then((_ => {
      this.router.navigate(['/home']);
    }));
  }

  ngOnDestroy() {

    if(this.loaderActive) {
      this.finishLoading();
    }

    this.mensaje = "";
  }

}
