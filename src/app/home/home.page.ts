import { Component, OnInit, NgZone } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class HomePage {
  public result="";
  public modelo:any;
  public titulo = "Prueba carga modelo";
  public prediccion = "Ninguna todavia";
  public worker;

  constructor(public ngZone: NgZone) {

    if (typeof Worker !== 'undefined') {
      // Create a new worker
      this.worker = new Worker(new URL('../prediction.worker', import.meta.url));
    }
  }

  public prediceWebWorker(){
    if(this.worker!=undefined){
      this.worker.postMessage("Pido predicción desde la app")
    }
  }
}
