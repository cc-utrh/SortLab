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


tf.loadGraphModel(environment.material_model_path)
  .then(model => {
    modelo = model;
    console.log("El modelo se ha cargado!");
  })
  .catch(error =>{
    console.error("Error al cargar modelo: ", error);
  })

async function predict(){
  let input = tf.zeros([1, 512, 1024, 3], 'float32');
  try{

    const result = await modelo.executeAsync(input) as tf.Tensor[];
    console.log(result);

    result.map((t: { dispose: () => any; }) => t.dispose());
    tf.nextFrame();

  }catch(error){
    console.log("Error al ejecutar el modelo", error);
  }
}

// export function you want to call to get predictions
export async function getPrediccion() {
  // check if model is loaded
  // sometime you might want to handle if function returns null
  if (!modelo) {
    return null;
  }


  // const pred = await tf.tidy(()=> {

  //   const resultado = await modelo.executeAsync(input);

  //   console.log('numTensors (in tidy) : '+ tf.memory().numTensors)
  // });

  tf.dispose();
  tf.disposeVariables();

  // Printing memory information
  console.log('numBytes : ' + tf.memory().numBytes);
  console.log('numTensors (outside tidy): ' + tf.memory().numTensors);
  console.log('numDataBuffers : ' + tf.memory().numDataBuffers);

  // run model
  // const result = await net.detect(image);
  // const boxes = result.map(boxInfo => [
    //   boxInfo.bbox[0],
    //   boxInfo.bbox[1],
    //   boxInfo.bbox[0] + boxInfo.bbox[2],
    //   boxInfo.bbox[1] + boxInfo.bbox[3],
    // ]);
    // const scores = result.map(boxInfo => boxInfo.score);
    // const classes = result.map(boxInfo => boxInfo.class);

    // // return data we need to print our boxes
  let mensaje = "he llegado al final de getPrediccion"
  return mensaje;
}

