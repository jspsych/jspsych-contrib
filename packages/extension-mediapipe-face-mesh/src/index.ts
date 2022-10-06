import "@mediapipe/face_mesh";

import autoBind from "auto-bind";
import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";
import { Euler, Matrix4, Vector3 } from "three";

class MediapipeFacemeshExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "mediapipe-face-mesh",
  };

  private recordedChunks = [];
  private animationFrameId: number;
  public mediaStream: MediaStream;
  private videoElement: HTMLVideoElement;
  private canvasElement: HTMLCanvasElement;
  private faceMesh: FaceMesh;

  constructor(private jsPsych: JsPsych) {
    autoBind(this);
  }

  initialize = (): Promise<void> => {
    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    // Set the options for the face mesh tracking
    this.faceMesh.setOptions({
      maxNumFaces: 1,
      // can not be used together with refineLandmarks
      enableFaceGeometry: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      // can not be used together with enableFaceGeometry
      refineLandmarks: false,
    });

    return new Promise((resolve, reject) => {
      this.faceMesh.initialize().then(resolve, reject);
    });
  };

  on_start = (): void => {
    this.canvasElement?.remove();
    this.videoElement?.remove();

    // Create Canvas
    this.canvasElement = document.createElement("canvas");
    this.canvasElement.width = 1280;
    this.canvasElement.height = 720;

    this.videoElement = document.createElement("video");
    this.videoElement.muted = true;

    this.mediaStream = this.jsPsych.pluginAPI.getCameraStream();

    if (!this.mediaStream) {
      console.warn(
        "The mediapipe-face-mesh extension is trying to start but the camera is not initialized. Do you need to run the initialize-camera plugin?"
      );
      return;
    }

    this.videoElement.srcObject = this.mediaStream;

    this.videoElement.onloadedmetadata = () => {
      // Stop animation frame to prevent performance leaks.
      this.stopAnimationFrame();
      this.animationFrameId = window.requestAnimationFrame(this.processFrame.bind(this));
    };

    this.faceMesh.onResults(this.onMediaPipeResult.bind(this));
    this.videoElement.play();
  };

  on_load = () => {
    this.recordedChunks = [];
  };

  on_finish = (): Promise<any> => {
    console.log("face_mesh tracked chunks: " + this.recordedChunks.length);
    return new Promise((resolve) => {
      this.stopAnimationFrame();
      resolve({ face_mesh: this.recordedChunks });
    });
  };

  /**
   * Stop the current animation frame to prevent performance leakage.
   */
  private stopAnimationFrame(): void {
    window.cancelAnimationFrame(this.animationFrameId);
  }

  private processFrame(): void {
    const canvasContext = this.canvasElement.getContext("2d");
    canvasContext.drawImage(this.videoElement, 0, 0);

    // const imageData = canvasContext.getImageData(0, 0, 1280, 720);

    this.faceMesh.send({ image: this.canvasElement });

    this.animationFrameId = window.requestAnimationFrame(this.processFrame.bind(this));
  }

  private onMediaPipeResult(results: Results): void {
    if (results.multiFaceGeometry[0] !== undefined) {
      const transformationMatrix = results.multiFaceGeometry[0]
        .getPoseTransformMatrix()
        .getPackedDataList();
      const rotation = new Euler().setFromRotationMatrix(
        new Matrix4().fromArray(transformationMatrix)
      );
      const translation = new Vector3().setFromMatrixPosition(
        new Matrix4().fromArray(transformationMatrix)
      );
      this.recordedChunks.push({
        frame_id: this.animationFrameId,
        transformation: transformationMatrix,
        rotation: rotation,
        translation: translation,
      });
    }
  }
}

export default MediapipeFacemeshExtension;
