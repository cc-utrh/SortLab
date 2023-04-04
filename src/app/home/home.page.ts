import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class HomePage implements OnInit{
  public modelo: any
  public titulo = "Prueba carga modelo";
  public prediccion = "Ninguna todavia";

  constructor() {}

  ngOnInit(): void {
    this.cargarModelo();
  }

  async cargarModelo(){
    this.modelo = await tf.loadGraphModel('../assets/material_model/model.json');
    this.titulo="Modelo cargado!";
  }

}
