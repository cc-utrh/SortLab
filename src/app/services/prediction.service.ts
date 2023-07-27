import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { environment } from 'src/environments/environment';
import * as labels from '../../assets/labels.json';

interface Material {
  name: string;
  examples: string;
  container: string;
  icon: string;
}

interface Materiales {
  [key: string]: Material;
}


@Injectable({
  providedIn: 'root'
})


export class PredictionService {

  private fotoResiduo:String = '';
  private materialModel!: tf.GraphModel;
  private imgHeight!: number;
  private imgWidth!: number;

  private materiales: Materiales = JSON.parse(JSON.stringify(labels));

  constructor() {}

  async setFoto(fotoCapturada:String) {
    this.fotoResiduo = fotoCapturada;

    // Imagenes con las que probar el funcionamiento de la aplicacion
    // this.fotoResiduo = '../assets/sample_images/image_1.jpg';
    // this.fotoResiduo = '../assets/sample_images/image_2.png';
    // this.fotoResiduo = '../assets/sample_images/image_3.jpg';
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
      this.materialModel = model;

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
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, x, y, newWidth, newHeight);
    }

    return canvas;
  }

  async imagenPreprocesada() {
    //cargar la imagen como elemento de html
    let response = document.getElementById('fotoCapturada') as HTMLImageElement;
    //convertirla en canvas
    let canvas = await this.crearCanvas(response, this.imgWidth, this.imgHeight);
    console.log(canvas.width, canvas.height);
    let finalImageTensor = await tf.tidy(() => {
      console.log("🚀 ~ file: prediction.service.ts:109 ~ PredictionService ~ imagenPreprocesada ~ imagenPreprocesada:");

      //crear tensor a partir del canvas
      let img = tf.browser.fromPixels(canvas, 3);

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

      tf.disposeVariables();

      console.log('Al devolver imagen preprocesada: ' + tf.memory().numTensors);
      console.log('Al devolver imagen preprocesada : ' + tf.memory().numBytes);
      return reshapedTensor;
    });

    tf.disposeVariables();
    return finalImageTensor;
  }

  async predict(): Promise<Material | number> {
    let prediccion: Material | number = 0;

    try{

      if(!this.materialModel){
        await this.cargarModelo(environment.material_model_path);
        console.log('entro a cargar modelo');
      }

      let finalImageTensor = await this.imagenPreprocesada();
      console.log("🚀 ~ file: prediction.service.ts:139 ~ PredictionService ~ predict ~ finalImageTensor:", finalImageTensor);

      let resultado = await this.materialModel.executeAsync(finalImageTensor) as tf.Tensor[];
      console.log("🚀 ~ file: prediction.service.ts:304 ~ PredictionService ~ predict ~ resultado:", resultado)


      let num_detections =  await resultado[3].data()
      let detection_scores = await resultado[4].data()
      let detection_classes = await resultado[5].data()

      console.log('Num detections: '+num_detections);
      console.log('Detection Scores: '+detection_scores);
      console.log('Detection classes: '+detection_classes);

      let nObjetos = num_detections[0];

      //comprobar que ha detectado solo un objeto
      // if(nObjetos>0){
      //   if(nObjetos===1){
      //     prediccion = this.materiales[detection_classes[0]];
      //   }else{
      //     prediccion = -1;
      //   }
      // }

      //comprobar que ha detectado al menos un objeto
      if(nObjetos>0){
        prediccion = this.materiales[detection_classes[0]];
      }

      resultado.map((t: { dispose: () => any; }) => t.dispose());

      tf.dispose(finalImageTensor);
      tf.disposeVariables();
      tf.nextFrame();

    }catch(error){
      console.log("Error al ejecutar el modelo", error);
    }

    return prediccion;

  }

}

