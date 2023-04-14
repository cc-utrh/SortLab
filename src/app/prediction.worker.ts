/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  // const response = `worker response to ${data}`;
  // postMessage(response);
  predict();
  // getPrediccion().then(result => {postMessage(result)});
});


// Import TF and Model
import * as tf from '@tensorflow/tfjs';
import { environment } from 'src/environments/environment';
tf.env().set('WEBGL_PACK', false);

let modelo:tf.GraphModel;
let imgHeight: number;
let imgWidth: number;


tf.loadGraphModel(environment.material_model_path)
  .then(model => {
    modelo = model;
    let inputShape = model.inputs[0].shape
    if(inputShape){
      imgHeight = inputShape[1];
      imgWidth = inputShape[2];
    }
    console.log("El modelo se ha cargado!");
  })
  .catch(error =>{
    console.error("Error al cargar modelo: ", error);
  })

async function normalizarImagen(img:tf.Tensor3D) {
  //mean of natural image
  let meanRgb = {  red : 0.485,  green: 0.456,  blue: 0.406 }
  //standard deviation of natural image
  let stdRgb = { red: 0.229,  green: 0.224,  blue: 0.225 }

  let indices = [
              tf.tensor1d([0], "int32"),
              tf.tensor1d([1], "int32"),
              tf.tensor1d([2], "int32")
  ];

  /* sperating tensor channelwise and applying normalization to each chanel seperately */
  let centeredRgb = {
      red: tf.gather(img,indices[0],2)
              .sub(tf.scalar(meanRgb.red))
              .div(tf.scalar(stdRgb.red))
              .reshape([imgHeight,imgWidth]),

      green: tf.gather(img,indices[1],2)
              .sub(tf.scalar(meanRgb.green))
              .div(tf.scalar(stdRgb.green))
              .reshape([imgHeight,imgWidth]),

      blue: tf.gather(img,indices[2],2)
              .sub(tf.scalar(meanRgb.blue))
              .div(tf.scalar(stdRgb.blue))
              .reshape([imgHeight,imgWidth]),
  }

  /* combining seperate normalized channels*/
  let processedImg = tf.stack([
    centeredRgb.red, centeredRgb.green, centeredRgb.blue
  ]);
  return processedImg;
}

async function imagenPreprocesada(){

  //cargar la imagen y convertirla a imgdata
  let response = await fetch('../assets/sample_images/image_1.jpg');
  let blob = await response.blob();
  let imageBitmap = await createImageBitmap(blob);

  console.log('Tengo la imagen de tamaño H x W: '+imageBitmap.height+' x '+imageBitmap.width);

  //convertirla a tensor con 3 canales
  let img = tf.browser.fromPixels(imageBitmap, 3);

  //redimensionarla
  img = tf.image.resizeBilinear(img, [imgHeight, imgWidth]).div(tf.scalar(255));

  let processedImg= await normalizarImagen(img);

  //modifico la forma del tensor para que coincida con [1, 512, 1024, 3]
  let transposedTensor = tf.transpose(processedImg, [1, 2, 0]);
  let reshapedTensor = tf.expandDims(transposedTensor, 0);

  //compruebo que tiene la forma correcta
  console.log(reshapedTensor.shape);

 return reshapedTensor;
}

async function predict(){

  let finalImageTensor = await imagenPreprocesada();
  // finalImageTensor.print();

  try{
    console.log('Voy a calcular el resultado');
    if(finalImageTensor){
      const resultado = await modelo.executeAsync(finalImageTensor) as tf.Tensor[];

      //TODO: Buscar si hay diferencia entre data y array
      // const image_info = await resultado[0].data();
      // const detection_boxes = await resultado[1].data();
      // const detection_masks = await resultado[2].data();
      const num_detections = await resultado[3].array();
      const detection_scores = await resultado[4].array();
      const detection_classes = await resultado[5].array();

      // console.log(resultado[5].array());
      // resultado[5].array().then(data => console.log('Detection classes como array: '+data));

      // console.log('Image info: '+image_info);
      console.log('Detection Scores: '+detection_scores);
      // console.log('Detection Masks: '+detection_masks);
      console.log('Detection classes: '+detection_classes);
      // console.log('Detection boxes: '+detection_boxes);
      console.log('Num detections: '+num_detections);

      resultado.map((t: { dispose: () => any; }) => t.dispose());

      tf.nextFrame();

    }else{
      console.log('No tengo input');
    }

  }catch(error){
    console.log("Error al ejecutar el modelo", error);
  }
}

