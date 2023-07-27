import { Component, NgZone, Optional } from '@angular/core';
import { IonicModule, Platform, IonRouterOutlet, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera } from '@capacitor/camera';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions} from '@capacitor-community/camera-preview';
import { App } from '@capacitor/app';
import { PredictionService } from '../services/prediction.service';
import { Subscription } from 'rxjs';
import { ModalPage } from '../modal/modal.page';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})

export class HomePage {

  public modelo:any;

  image:any;
  cameraActive = false;
  flashActive = false;

  permisoActual:String;

  resumeListener: Subscription = new Subscription();

  constructor(public ngZone: NgZone, private predictionService:PredictionService, private platform: Platform, private router:Router, private modalCtrl: ModalController, @Optional() private routerOutlet?: IonRouterOutlet) {

    this.permisoActual = '';

    this.resumeListener = this.platform.resume.subscribe(async () => {
      console.log("🚀 ~ file: home.page.ts:37 ~ HomePage ~ this.resumeListener=this.platform.resume.subscribe ~ resume:")
      this.cameBack();
    });

    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (!this.routerOutlet?.canGoBack()) {
        App.exitApp();
      }
    });

  }

  async presentModal() {
    let titulo = 'Sobre SortLab'
    let texto = 'Consulta dónde reciclar un residuo a partir de su imagen';
    let imagen = '../../assets/material_icons/sortlab_bw.png';
    let indicaciones = true;

    const modal = await this.modalCtrl.create({
      component: ModalPage,
      breakpoints: [0, 0.9],
      initialBreakpoint: 0.9,
      handle: true,
      componentProps: {
        titulo,
        texto,
        imagen,
        indicaciones
      },
      cssClass: 'custom-modal',
    });
    await modal.present();
  }

  async ngAfterViewInit(){
    console.log("🚀 ~ file: home.page.ts:68 ~ HomePage ~ ngAfterViewInit:")
    let permissions = await this.comprobarPermisos();

    try {

      if(permissions==='granted') {
        this.permisoActual = 'granted';
        await this.launchCamera();

      }else {
        let answer = await Camera.requestPermissions();
        if(answer.camera==='granted'){
          await this.launchCamera()
        }
        this.permisoActual = answer.camera
      }

    } catch (error) {
      console.error(error);
    }
  }

  async launchCamera() {

    const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'rear',
      parent: 'cameraPreview',
      toBack: true,
      rotateWhenOrientationChanged: false,
      lockAndroidOrientation: true,
      enableZoom: true,
      enableHighResolution: true
    };

    try {
      console.log('launching camera');
      this.cameraActive = true;
      await CameraPreview.start(cameraPreviewOptions);
      document.querySelector('body')?.classList.add('camera-active');
    } catch (err) {
      console.log('Error iniciando preview de la camara: ', err);
      console.log('activa: '+this.cameraActive);
    }

  }


  //cuando vuelva a la aplicacion
  async cameBack(){
    console.log('resumo');

    try {
      let permissions = await this.comprobarPermisos();

      if(permissions!==this.permisoActual){
        if(permissions==='granted'){
          window.location.reload();
        }
      }

    } catch (error) {
      console.log(error);
    }

  }

  //comprueba permisos de la camara
  async comprobarPermisos(){
    const status = await Camera.checkPermissions();
    return status.camera;
  }

  showHelp(){
    this.presentModal();
  }


  async cambiarEstadoFlash(){
    console.log('Cambio flash');
    const flashMode = this.flashActive ? 'off':'torch';
    await CameraPreview.setFlashMode({flashMode});
    this.flashActive = !this.flashActive;
  }

  async stopCamera(){
    try {
      console.log('paro cámara');
      if(this.cameraActive){
        await CameraPreview.stop();
        this.cameraActive = false;
        document.querySelector('body')?.classList.remove('camera-active');
      }

    } catch (error) {
      console.log('Error parando la cámara: '+error)
    }
  }

  async captureImage() {
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 100
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    this.image = `data:image/jpeg;base64,${result.value}`;

    await this.predictionService.setFoto(this.image);

    if(this.flashActive){
      await this.cambiarEstadoFlash();
    }

    this.router.navigate(['/resultado']);
  }

  ngOnDestroy(){
    console.warn("🚀 ~ file: home.page.ts:283 ~ ngOnDestroy ~ ngOnDestroy:")
    this.resumeListener.unsubscribe();
  }

}
