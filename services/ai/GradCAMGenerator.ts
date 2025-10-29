import * as tf from '@tensorflow/tfjs';

export class GradCAMGenerator {
  async generateGradCAM(
    model: tf.LayersModel,
    image: HTMLImageElement | HTMLCanvasElement,
    targetLayerName?: string
  ): Promise<string> {
    return tf.tidy(() => {
      // Preprocess image
      let tensor = tf.browser.fromPixels(image);
      tensor = tf.image.resizeBilinear(tensor, [640, 640]);
      tensor = tensor.expandDims(0).div(255.0);

      // Find the last convolutional layer if not specified
      const convLayers = model.layers.filter(layer => 
        layer.getClassName().toLowerCase().includes('conv')
      );
      const targetLayer = targetLayerName 
        ? model.getLayer(targetLayerName)
        : convLayers[convLayers.length - 1];

      if (!targetLayer) {
        throw new Error('No convolutional layer found');
      }

      // Create a model that outputs both predictions and conv layer activations
      const modelOutput = Array.isArray(model.output) ? model.output[0] : model.output;
      const layerOutput = Array.isArray(targetLayer.output) ? targetLayer.output[0] : targetLayer.output;
      const gradModel = tf.model({
        inputs: model.inputs,
        outputs: [modelOutput, layerOutput]
      });

      // Get predictions and activations
      const [preds, convOutput] = gradModel.predict(tensor) as tf.Tensor[];
      
      // Get the class with highest prediction
      const classIdx = preds.argMax(-1).dataSync()[0];
      
      // Compute gradients
      const grads = tf.grad((x: tf.Tensor) => {
        const [pred] = gradModel.predict(x) as tf.Tensor[];
        return pred.gather([classIdx], 1).squeeze();
      })(tensor);

      // Pool the gradients over all axes except the channel axis
      const pooledGrads = grads.mean([0, 1, 2]);

      // Weight the channels by the pooled gradients
      const convOutputData = convOutput.squeeze();
      const weightedConv = convOutputData.mul(pooledGrads);
      
      // Create heatmap
      let heatmap = weightedConv.sum(-1);
      heatmap = heatmap.relu();
      heatmap = heatmap.div(heatmap.max());

      // Resize heatmap to image size
      heatmap = tf.image.resizeBilinear(
        heatmap.expandDims(-1) as tf.Tensor3D,
        [image.height, image.width]
      ).squeeze();

      // Convert to canvas
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d')!;

      // Draw original image
      ctx.drawImage(image, 0, 0);

      // Apply heatmap overlay
      const heatmapData = heatmap.dataSync();
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < heatmapData.length; i++) {
        const intensity = heatmapData[i];
        const pixelIndex = i * 4;
        
        // Apply red-yellow heatmap
        imageData.data[pixelIndex] = Math.min(255, imageData.data[pixelIndex] + intensity * 255);
        imageData.data[pixelIndex + 1] = Math.min(255, imageData.data[pixelIndex + 1] + intensity * 200);
        imageData.data[pixelIndex + 3] = 255;
      }
      
      ctx.putImageData(imageData, 0, 0);

      return canvas.toDataURL('image/png');
    });
  }

  async generateSimpleHeatmap(
    image: HTMLImageElement | HTMLCanvasElement,
    defects: Array<{ location: { x: number; y: number; width: number; height: number }; confidence: number }>
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;

    // Draw original image
    ctx.drawImage(image, 0, 0);

    // Create heatmap overlay
    defects.forEach(defect => {
      const { x, y, width, height } = defect.location;
      const intensity = defect.confidence;

      // Create gradient for heatmap effect
      const gradient = ctx.createRadialGradient(
        x + width / 2, y + height / 2, 0,
        x + width / 2, y + height / 2, Math.max(width, height) / 2
      );
      
      gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity * 0.6})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 0, ${intensity * 0.4})`);
      gradient.addColorStop(1, `rgba(255, 255, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, width, height);
    });

    return canvas.toDataURL('image/png');
  }
}
