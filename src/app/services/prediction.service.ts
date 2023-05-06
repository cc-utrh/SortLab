import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as tf from '@tensorflow/tfjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

// acuerdate del jsontotypescript para pasar el objeto a interfaz
// export interface PredictionResult {
//   n_detections:
//   detection_classes:
//   etc:
// }

export class PredictionService {

  private fotoResiduo:String = '';
  private materialModel!: tf.GraphModel;
  private materialFormModel!: tf.GraphModel;
  private imgHeight!: number;
  private imgWidth!: number;

  constructor() {}

  // async initialize() {
  //   tf.env().set('WEBGL_PACK', false);
  //   // tf.env().set('WEBGL_CONV_IM2COL', false);

  //   const [model1, model2] = await Promise.all([
  //     tf.loadGraphModel(environment.material_form_model_path).catch(error => {
  //       console.error("Error al cargar material form: ", error);
  //       return null;
  //     }),
  //     tf.loadGraphModel(environment.material_model_path).catch(error => {
  //       console.error("Error al cargar material model: ", error);
  //       return null;
  //     })
  //   ])


  //   if(model1){
  //     this.materialFormModel = model1;
  //     const inputShape = model1.inputs[0].shape;
  //     if (inputShape) {
  //       this.imgHeight = inputShape[1];
  //       this.imgWidth = inputShape[2];
  //     }
  //     console.log("Se ha cargado material form model!");
  //   }

  //   if(model2){
  //     this.materialModel = model2;
  //     console.log("Se ha cargado material model!");
  //   }

  //   console.log('Al cargar el modelo numTensors : ' + tf.memory().numTensors);
  // }

  async cargarModelo(modelPath: string) {
    tf.env().set('WEBGL_PACK', false);

    const model = await tf.loadGraphModel(modelPath);
    console.log(`El modelo de ${modelPath} se ha cargado`);
    const inputShape = model.inputs[0].shape;
    if (inputShape) {
      this.imgHeight = inputShape[1];
      this.imgWidth = inputShape[2];
    }

    console.log('Al cargar el modelo numTensors : ' + tf.memory().numTensors);
    console.log('Al cargar el modelo numBytes : ' + tf.memory().numBytes);

    return model;
  }

  async setFoto(fotoCapturada:String) {
    this.fotoResiduo = fotoCapturada;
  }

  getFoto(): String {
    return this.fotoResiduo;
  }

  checkModels(): Boolean {
    let cargados = false;
    if(this.materialFormModel&&this.materialModel){
      cargados = true;
    }
    return cargados;
  }

  async normalizarImagen(img:tf.Tensor3D) {
    let normalizadaFinal = await tf.tidy(()=> {
      let imgDividida = img.div(tf.scalar(255));

      //valores de media del dataset ImageNet usado en el entrenamiento del modelo
      let mediaRGB = {red: 0.485, green: 0.456, blue: 0.406}
      //valores de desviacion estandar del dataset ImageNet usado en el entrenamiento del modelo
      let desviacionRGB = {red: 0.229, green: 0.224, blue: 0.225}

      let indices = [tf.tensor1d([0],'int32'), tf.tensor1d([1],'int32'), tf.tensor1d([2],'int32')];

      //separar tensor en 3 canales y normalizar por separado
      let canalesNormalizados = {
          red: tf.gather(imgDividida,indices[0],2)
                  .sub(tf.scalar(mediaRGB.red))
                  .div(tf.scalar(desviacionRGB.red))
                  .reshape([this.imgHeight,this.imgWidth]),

          green: tf.gather(imgDividida,indices[1],2)
                  .sub(tf.scalar(mediaRGB.green))
                  .div(tf.scalar(desviacionRGB.green))
                  .reshape([this.imgHeight,this.imgWidth]),

          blue: tf.gather(imgDividida,indices[2],2)
                  .sub(tf.scalar(mediaRGB.blue))
                  .div(tf.scalar(desviacionRGB.blue))
                  .reshape([this.imgHeight,this.imgWidth]),
      }

      //combinar canales normalizados
      let imgNormalizada = tf.stack([canalesNormalizados.red, canalesNormalizados.green, canalesNormalizados.blue]);

      return imgNormalizada;
    });
    return normalizadaFinal;
  }

  // async imagenPreprocesada() {
  //   console.log("🚀 ~ file: prediction.service.ts:109 ~ PredictionService ~ imagenPreprocesada ~ imagenPreprocesada:")

  //   return new Promise<tf.Tensor>((resolve, reject) => {
  //     //cargar la imagen como elemnento de html
  //     let response = document.getElementById('fotoCapturada') as HTMLImageElement;
  //     response.onload = async () => {
  //       console.log('Image loaded');
  //       // Create a tensor from the image data
  //       let img = tf.browser.fromPixels(response, 3);

  //       // Get the height and width of the tensor
  //       let [height, width] = img.shape.slice(0, 2);

  //       console.log(`Tengo la imagen de tamaño H x W: ${height} x ${width}`);
  //       //redimensionarla
  //       img = tf.image.resizeBilinear(img, [this.imgHeight, this.imgWidth]);

  //       //normalizarla con media de cero y varianza de uno
  //       let processedImg = await this.normalizarImagen(img);

  //       //modifico la forma del tensor para que coincida con [1, h, w, 3]
  //       let transposedTensor = tf.transpose(processedImg, [1, 2, 0]);
  //       let reshapedTensor = tf.expandDims(transposedTensor, 0);

  //       //compruebo que tiene la forma correcta
  //       console.log(reshapedTensor.shape);
  //       resolve(reshapedTensor)
  //     };
  //     response.onerror = () => {
  //       reject(new Error("Error cargando la imagen"));
  //     }
  //   });
  // }

  async imagenPreprocesada() {
    let finalImageTensor = await tf.tidy(() => {
      console.log("🚀 ~ file: prediction.service.ts:109 ~ PredictionService ~ imagenPreprocesada ~ imagenPreprocesada:");

      //cargar la imagen como elemnento de html
      let response = document.getElementById('fotoCapturada') as HTMLImageElement;

      // Create a tensor from the image data
      let img = tf.browser.fromPixels(response, 3);

      // Get the height and width of the tensor
      let [height, width] = img.shape.slice(0, 2);

      console.log(`Tengo la imagen de tamaño H x W: ${height} x ${width}`);

      //redimensionarla
      img = tf.image.resizeBilinear(img, [this.imgHeight, this.imgWidth]);

      //normalizarla con media de cero y varianza de uno
      let imgDividida = img.div(tf.scalar(255));

      //valores de media del dataset ImageNet usado en el entrenamiento del modelo
      let mediaRGB = {red: 0.485, green: 0.456, blue: 0.406}
      //valores de desviacion estandar del dataset ImageNet usado en el entrenamiento del modelo
      let desviacionRGB = {red: 0.229, green: 0.224, blue: 0.225}

      let indices = [tf.tensor1d([0],'int32'), tf.tensor1d([1],'int32'), tf.tensor1d([2],'int32')];

      //separar tensor en 3 canales y normalizar por separado
      let canalesNormalizados = {
          red: tf.gather(imgDividida,indices[0],2)
                  .sub(tf.scalar(mediaRGB.red))
                  .div(tf.scalar(desviacionRGB.red))
                  .reshape([this.imgHeight,this.imgWidth]),

          green: tf.gather(imgDividida,indices[1],2)
                  .sub(tf.scalar(mediaRGB.green))
                  .div(tf.scalar(desviacionRGB.green))
                  .reshape([this.imgHeight,this.imgWidth]),

          blue: tf.gather(imgDividida,indices[2],2)
                  .sub(tf.scalar(mediaRGB.blue))
                  .div(tf.scalar(desviacionRGB.blue))
                  .reshape([this.imgHeight,this.imgWidth]),
      }

      //combinar canales normalizados
      let imgNormalizada = tf.stack([canalesNormalizados.red, canalesNormalizados.green, canalesNormalizados.blue]);

      //modifico la forma del tensor para que coincida con [1, h, w, 3]
      let transposedTensor = tf.transpose(imgNormalizada, [1, 2, 0]);
      let reshapedTensor = tf.expandDims(transposedTensor, 0);

      //compruebo que tiene la forma correcta
      // console.log(reshapedTensor.shape);

      return reshapedTensor;
    });
    return finalImageTensor;
  }

  async predict() {
      console.log("🚀 ~ file: prediction.service.ts:141 ~ PredictionService ~ predict ~ predict:");
    try{
      if(!this.materialFormModel){
        this.materialFormModel = await this.cargarModelo(environment.material_form_model_path);
      }

      let finalImageTensor = await this.imagenPreprocesada();
      console.log("🚀 ~ file: prediction.service.ts:139 ~ PredictionService ~ predict ~ finalImageTensor:", finalImageTensor);

      console.log('Calculo el resultado con el primer modelo');
      const resultadoForma = await this.materialFormModel.executeAsync(finalImageTensor) as tf.Tensor[];

      //TODO: Buscar si hay diferencia entre data y array
      // const image_info = await resultado[0].data();
      // const detection_boxes = await resultado[1].data();
      // const detection_masks = await resultado[2].data();
      const num_detectionsF = await resultadoForma[3].array();
      const detection_scoresF = await resultadoForma[4].array();
      const detection_classesF = await resultadoForma[5].array();

      // console.log(resultado[5].array());
      // resultado[5].array().then(data => console.log('Detection classes como array: '+data));

      // console.log('Image info: '+image_info);
      console.log('Detection Scores: '+detection_scoresF);
      // console.log('Detection Masks: '+detection_masks);
      console.log('Detection classes: '+detection_classesF);
      // console.log('Detection boxes: '+detection_boxes);
      console.log('Num detections: '+num_detectionsF);

      console.log('Antes del dispose numTensors : ' + tf.memory().numTensors);
      console.log('Antes del dispose numBytes : ' + tf.memory().numBytes);

      resultadoForma.map((t: { dispose: () => any; }) => t.dispose());

      finalImageTensor.dispose();
      tf.dispose(resultadoForma);
      tf.disposeVariables();
      // this.materialFormModel.dispose();
      // console.log("🚀 ~ file: prediction.service.ts:266 ~ PredictionService ~ predict ~ this.materialFormModel:", this.materialFormModel)

      tf.nextFrame();
      // this.materialModel.dispose();
      console.log('Al hacer el dispose numTensors : ' + tf.memory().numTensors);
      console.log('Al hacer el dispose numBytes : ' + tf.memory().numBytes);

    }catch(error){
      console.log("Error al ejecutar el modelo", error);
    }

  }



  getResultado(): Observable<any> {
    const res = new Observable(subscriber => {
      setTimeout(() => {
        subscriber.next('He terminado de girar');
        subscriber.complete();
      }, 5000);
    })
    return res;
  }



}

