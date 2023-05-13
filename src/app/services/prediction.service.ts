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
  // private materialModel!: tf.GraphModel;
  // private materialFormModel!: tf.GraphModel;
  //comento y anyado para leak
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



  async setFoto(fotoCapturada:String) {
    this.fotoResiduo = fotoCapturada;
  }

  getFoto(): String {
    return this.fotoResiduo;
  }

  async cargarModelo(modelPath: string) {
    console.log("🚀 ~ file: prediction.service.ts:62 ~ PredictionService ~ cargarModelo ~ modelPath:", modelPath)
    tf.env().set('WEBGL_PACK', false);
    await tf.setBackend('webgl');

    console.log("🚀 ~ file: prediction.service.ts:66 ~ PredictionService ~ cargarModelo ~ tf.ENV.getBool('WEBGL_RENDER_FLOAT32_CAPABLE'):", tf.ENV.getBool('WEBGL_RENDER_FLOAT32_CAPABLE'))
    try {
      console.log("🚀 ~ file: prediction.service.ts:62 ~ PredictionService ~ cargarModelo ~ cargarModelo:")

      let model = await tf.loadGraphModel(modelPath);
      console.log(`El modelo de ${modelPath} se ha cargado`);
      // this.materialModel = model;

      let inputShape = model.inputs[0].shape;
      if (inputShape) {
        this.imgHeight = inputShape[1];
        this.imgWidth = inputShape[2];
      }

      console.log('Al cargar el modelo numTensors : ' + tf.memory().numTensors);
      console.log('Al cargar el modelo numBytes : ' + tf.memory().numBytes);
      tf.disposeVariables();
      return model;
    } catch (err) {
      console.error('Error en la carga del modelo: ', err);
      return null;
    }

  }

  // checkModels(): Boolean {
  //   let cargados = false;
  //   if(this.materialFormModel&&this.materialModel){
  //     cargados = true;
  //   }
  //   return cargados;
  // }

  // async normalizarImagen(img:tf.Tensor3D) {
  //   let normalizadaFinal = await tf.tidy(()=> {
  //     let imgDividida = img.div(tf.scalar(255));

  //     //valores de media del dataset ImageNet usado en el entrenamiento del modelo
  //     let mediaRGB = {red: 0.485, green: 0.456, blue: 0.406}
  //     //valores de desviacion estandar del dataset ImageNet usado en el entrenamiento del modelo
  //     let desviacionRGB = {red: 0.229, green: 0.224, blue: 0.225}

  //     let indices = [tf.tensor1d([0],'int32'), tf.tensor1d([1],'int32'), tf.tensor1d([2],'int32')];

  //     //separar tensor en 3 canales y normalizar por separado
  //     let canalesNormalizados = {
  //         red: tf.gather(imgDividida,indices[0],2)
  //                 .sub(tf.scalar(mediaRGB.red))
  //                 .div(tf.scalar(desviacionRGB.red))
  //                 .reshape([this.imgHeight,this.imgWidth]),

  //         green: tf.gather(imgDividida,indices[1],2)
  //                 .sub(tf.scalar(mediaRGB.green))
  //                 .div(tf.scalar(desviacionRGB.green))
  //                 .reshape([this.imgHeight,this.imgWidth]),

  //         blue: tf.gather(imgDividida,indices[2],2)
  //                 .sub(tf.scalar(mediaRGB.blue))
  //                 .div(tf.scalar(desviacionRGB.blue))
  //                 .reshape([this.imgHeight,this.imgWidth]),
  //     }

  //     //combinar canales normalizados
  //     let imgNormalizada = tf.stack([canalesNormalizados.red, canalesNormalizados.green, canalesNormalizados.blue]);

  //     return imgNormalizada;
  //   });
  //   return normalizadaFinal;
  // }

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

  async crearCanvas(img: HTMLImageElement, canvasWidth: number, canvasHeight: number): Promise<HTMLCanvasElement>{
    let canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let ctx = canvas.getContext('2d');

    //calculo nuevas dimensiones img para redimensionar
    let aspectRatio = img.width / img.height;
    let newWidth, newHeight;
    if (canvasWidth / aspectRatio > canvasHeight) {
      newWidth = canvasHeight * aspectRatio;
      newHeight = canvasHeight;
    }else {
      newWidth = canvasWidth;
      newHeight = canvasWidth/aspectRatio;
    }

    let x = (canvasWidth - newWidth) / 2;
    let y = (canvasHeight - newHeight) / 2;

    if(ctx){
      //Pintar el canvas de negro
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      //Dibujar la imagen en el centro del canvas
      ctx.drawImage(img, x, y, newWidth, newHeight);
    }

    return canvas;
  }

  async imagenPreprocesada() {
    //cargar la imagen como elemento de html
    let response = document.getElementById('fotoCapturada') as HTMLImageElement;
    //hacerla un canvas
    let canvas = await this.crearCanvas(response, this.imgWidth, this.imgHeight);
    console.log(canvas.width, canvas.height);
    let finalImageTensor = await tf.tidy(() => {
      console.log("🚀 ~ file: prediction.service.ts:109 ~ PredictionService ~ imagenPreprocesada ~ imagenPreprocesada:");
      console.log()
      // Create a tensor from the image data
      let img = tf.browser.fromPixels(canvas, 3);
      // // Get the height and width of the tensor
      // let [height, width] = img.shape.slice(0, 2);

      // console.log(`Tengo la imagen de tamaño H x W: ${height} x ${width}`);

      // //redimensionarla
      // img = tf.image.resizeBilinear(img, [this.imgHeight, this.imgWidth]);

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
      tf.dispose(img);
      tf.dispose(imgDividida);
      tf.dispose(indices);
      tf.dispose(transposedTensor);
      tf.dispose(imgNormalizada);
      tf.dispose(canalesNormalizados);

      tf.disposeVariables();

      console.log('Al devolver imagen preprocesada: ' + tf.memory().numTensors);
      console.log('Al devolver imagen preprocesada : ' + tf.memory().numBytes);
      return reshapedTensor;
    });

    tf.disposeVariables();
    return finalImageTensor;
  }

  async predict() {
    let prediccion = '';
    console.log("🚀 ~ file: prediction.service.ts:141 ~ PredictionService ~ predict ~ predict:");
    try{
      //revisitar esto, no se como lo voy a hacer al final
      // if(!this.materialModel){
      //   await this.cargarModelo(environment.material_model_path);
      //   console.log('entro a cargar modelo');
      // }
      let modelo = await this.cargarModelo(environment.material_model_path);
      //comento y cambio para leak
      let finalImageTensor = await this.imagenPreprocesada();
      console.log("🚀 ~ file: prediction.service.ts:139 ~ PredictionService ~ predict ~ finalImageTensor:", finalImageTensor);

      console.log('Calculo el resultado con el primer modelo');
      if(modelo){
        //no quiero memory leak
        // let resultado = await modelo.executeAsync(finalImageTensor) as tf.Tensor[];
        modelo.dispose();
        // tf.dispose(resultado);
      }

      tf.dispose(finalImageTensor);
      tf.disposeVariables();
      tf.nextFrame();
      console.log('Antes del return: ' + tf.memory().numTensors);
      console.log('Antes del return : ' + tf.memory().numBytes);

      //comento linea para pruebas de la leak
      // let resultado = await this.materialModel.executeAsync(finalImageTensor) as tf.Tensor[];
      return 'prueba';
      //comento bloque para leak
      // if(modelo){
      //   let resultado = await modelo.executeAsync(finalImageTensor) as tf.Tensor[]
      //   modelo.dispose();
      //   finalImageTensor.dispose();
      //   console.log("🚀 ~ file: prediction.service.ts:251 ~ PredictionService ~ predict ~ resultado:", resultado)

      //   // let resultado: tf.Tensor[] | undefined;
      //   // let ejecutar = await tf.tidy(() => {
      //   //   resultado = this.materialModel.executeAsync(finalImageTensor) as unknown as tf.Tensor[];
      //   // });

      //   // console.log("🚀 ~ file: prediction.service.ts:306 ~ PredictionService ~ ejecutar ~ resultado:", resultado)
      //   // let num_detections, detection_scores, detection_classes;

      //   // if (resultado) {
      //   //   num_detections = resultado[3] ? await resultado[3].data() : null;
      //   //   detection_scores = resultado[4] ? await resultado[4].data() : null;
      //   //   detection_classes = resultado[5] ? await resultado[5].data() : null;
      //   //   resultado[0] ? resultado[0].dispose() : null;
      //   //   resultado[1] ? resultado[1].dispose() : null;
      //   //   resultado[2] ? resultado[2].dispose() : null;
      //   //   resultado[3] ? resultado[3].dispose() : null;
      //   //   resultado[4] ? resultado[4].dispose() : null;
      //   //   resultado[5] ? resultado[5].dispose() : null;

      //   // }

      //   let num_detections =  await resultado[3].data()
      //   let detection_scores = await resultado[4].data()
      //   let detection_classes = await resultado[5].data()

      //   console.log('Tras prediccion numTensors : ' + tf.memory().numTensors);
      //   console.log('Tras prediccion numBytes : ' + tf.memory().numBytes);
      //   // console.log(resultado[5].array());
      //   // resultado[5].array().then(data => console.log('Detection classes como array: '+data));

      //   // console.log('Image info: '+image_info);
      //   // console.log('Detection Masks: '+detection_masks);
      //   // console.log('Detection boxes: '+detection_boxes);
      //   // los importantes:
      //   console.log('Detection Scores: '+detection_scores);
      //   console.log('Detection classes: '+detection_classes);
      //   console.log('Num detections: '+num_detections);
      //   resultado[0].dispose();
      //   resultado[1].dispose();
      //   resultado[2].dispose();
      //   resultado[3].dispose();
      //   resultado[4].dispose();
      //   resultado[5].dispose();
      //   //elegir minimo de detection_scores ponerle
      //    // num_detectionsF[0]!==0 && detection_scoresF[0]<0.8
      //    if(num_detections&&detection_classes){
      //      if(num_detections[0]>0){
      //      prediccion = detection_classes[0].toString();
      //      //si es de las clases que podrian ser de varios materiales correr el segundo modelo
      //      }
      //    }
      //   //  tf.dispose(resultado);
      // }


      // if(resultado){
      //   // resultado.map((t: { dispose: () => any; }) => t.dispose());
      //   resultado[0].dispose();
      //   resultado[1].dispose();
      //   resultado[2].dispose();
      //   resultado[3].dispose();
      //   resultado[4].dispose();
      //   resultado[5].dispose();
      // }





      // finalImageTensor.dispose();
      // tf.dispose(finalImageTensor);
      // modelo?.dispose
      // tf.dispose(resultado);

      //else prediccion sera ''
      //leak
      //tf.disposeVariables();
      // this.materialModel.dispose();
      // tf.dispose(this.materialModel);
      // console.log("🚀 ~ file: prediction.service.ts:266 ~ PredictionService ~ predict ~ this.materialFormModel:", this.materialFormModel)

      //leak
      // tf.nextFrame();
      console.log('Al hacer el dispose numTensors : ' + tf.memory().numTensors);
      console.log('Al hacer el dispose numBytes : ' + tf.memory().numBytes);

    }catch(error){
      console.log("Error al ejecutar el modelo", error);
    }

    return prediccion;

  }



  // getResultado(): Observable<any> {
  //   let res = new Observable(subscriber => {
  //     setTimeout(() => {
  //       subscriber.next('He terminado de girar');
  //       subscriber.complete();
  //     }, 5000);
  //   })
  //   return res;
  // }

  // limpioTensores() {
  //   if(this.materialFormModel){
  //     this.materialFormModel.dispose();
  //   }
  //   if(this.materialModel) {
  //     this.materialModel.dispose();
  //   }
  // }

}

