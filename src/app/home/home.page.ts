import { AfterViewInit, Component, NgZone, OnDestroy, Optional } from '@angular/core';
import { IonicModule, Platform, IonRouterOutlet } from '@ionic/angular';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions} from '@capacitor-community/camera-preview';
import { Camera, PermissionStatus, CameraPermissionState, CameraPluginPermissions } from '@capacitor/camera';
// import { PermissionsPlugin } from '@capacitor/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})

export class HomePage {

  public modelo:any;
  // public worker;

  image:any;
  cameraActive = false;
  flashActive = false;

  permisoActual:String;

  // resumeSubscription: Subscription;
  resumeListener: Subscription = new Subscription();
  // pauseListener: Subscription = new Subscription();

  constructor(public ngZone: NgZone, private platform: Platform,  @Optional() private routerOutlet?: IonRouterOutlet) {

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

    // this.platform.pause.subscribeWithPriority(-1, () => {
    //   // if (!this.routerOutlet?.canGoBack()) {
    //     App.exitApp();
    //   // }
    // });

    // this.pauseListener = this.platform.pause.subscribe(async () => {
    //   console.log('pause');
    //   // this.launchCamera();
    // });

  }

  async ngAfterViewInit(){
    console.log("🚀 ~ file: home.page.ts:53 ~ HomePage ~ ngOnInit:")
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
      lockAndroidOrientation: true
    };

    try {
      console.log('launching camera');
      this.cameraActive = true;
      await CameraPreview.start(cameraPreviewOptions);
    } catch (err) {
      console.log('Error iniciando preview de la camara: ', err);
      console.log('activa: '+this.cameraActive);
    }

  }


  //cuando vuelva
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
    console.log('Modal ayuda');
    // this.stopCamera();
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
      }

    } catch (error) {
      console.log('Error parando la cámara: '+error)
    }
  }

  async captureImage() {

    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 90
    };
    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    this.image = `data:image/jpeg;base64,${result.value}`;
    console.log(this.image);

  }
    // this.prediceWebWorker(this.image)


      //esto no lo tengo yo tan claro
      // this.stopCamera();
      // this.cameraActive = false;
    // }

  // public prediceWebWorker(){
  //   if(this.worker!=undefined){
  //     this.worker.postMessage(this.image)
  //   }
  // }

  ngOnDestroy(){
    console.warn("🚀 ~ file: home.page.ts:283 ~ ngOnDestroy ~ ngOnDestroy:")

    // this.stopCamera();
    this.resumeListener.unsubscribe();
    // this.pauseListener.unsubscribe();
  }

    // if(this.cameraActive){
    //   await this.stopCamera();
    //   !this.cameraActive;
    // }

    // console.log("🚀 ~ file: home.page.ts:77 ~ HomePage ~ cameBack ~ permissions:", permissions)
    // // console.log("🚀 ~ file: home.page.ts:72 ~ HomePage ~ cameBack ~ permissions:", permissions)
    // // console.log("🚀 ~ file: home.page.ts:80 ~ HomePage ~ cameBack ~ this.permisoActual!==permissions:", this.permisoActual!==permissions)
    // console.log("🚀 ~ file: home.page.ts:80 ~ HomePage ~ cameBack ~ permisoActual:", this.permisoActual);

    // console.log("🚀 ~ file: home.page.ts:82 ~ HomePage ~ cameBack ~ cameraActive:", this.cameraActive);




    // if(this.permisoActual!==permissions) {

    //   window.location.reload();
    // }
    // if(permissions==='granted'){
    //   console.log('granted');
    //   window.location.reload();
    // }
    // window.location.reload();
    // if(permissions==='granted'){
    //   window.location.reload();
    // }

    // let permissions = await this.checkPermissions();
    // console.log("🚀 ~ file: home.page.ts:51 ~ HomePage ~ ngAfterViewInit ~ permissions:", permissions)

    // if(permissions==='granted'){
    //   this.launchCamera();
    // }

    // if(permissions!=='granted'){
    //   let answer = await Camera.requestPermissions();
    //   console.log("🚀 ~ file: home.page.ts:71 ~ HomePage ~ cameBack ~ answer:", answer)
    //   if(answer.camera==='granted'){
    //     await this.launchCamera();
    //   }
    // }else{
    //   await this.launchCamera();
    // }

//}

  // async isCameraAvailable() {
  //   console.log('está disponible la cámara?');
  //   let available = false;
  //   const permissions = await Camera.checkPermissions();
  //   console.log(permissions.camera);
  //   if(permissions.camera==='granted'){
  //     available = true;
  //   }
  //   return available;
  // }
  // async ngOnInit() {
  //   try {
  //     const isCameraAvailable = await this.isCameraAvailable();

  //     if (isCameraAvailable) {
  //       console.log('hago launch');
  //       this.launchCamera();
  //     }else{
  //       const request = await Camera.requestPermissions();
  //       console.log(request);
  //       if(request.camera===){
  //         this.launchCamera();
  //       }
  //     }
  //   }catch (error) {
  //     console.error(error);
  //   }
  //   // await this.launchCamera();

  //   // try  {
  //   //   await this.launchCamera();
  //   // }catch (err) {
  //   //   console.error('Error iniciando preview de la camara: ', err)
  //   // }
  // }


  // ionViewWillEnter(){
  //   console.warn('did enter');
  // }

  // ionViewDidLeave(){
  //   console.warn('did leave');
  // }

  // async checkPermissionsChanged() {
  //   try {
  //     const isCameraAvailable = await this.isCameraAvailable();
  //     if (!this.cameraActive && isCameraAvailable) {
  //       console.log('llamo a launch desde check');
  //       this.launchCamera();
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
}
