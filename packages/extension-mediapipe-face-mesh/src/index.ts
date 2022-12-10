import "@mediapipe/face_mesh";

import autoBind from "auto-bind";
import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";
import { Euler, Matrix4, Vector3 } from "three";

interface IFaceTrackingResult {
  frame_id: number;
  transformation: number[];
  rotation: Euler;
  translation: Vector3;
}

class MediapipeFacemeshExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "mediapipe-face-mesh",
  };

  private recordedChunks = new Array<IFaceTrackingResult>();
  private animationFrameId: number;
  public mediaStream: MediaStream;
  private videoElement: HTMLVideoElement;
  private canvasElement: HTMLCanvasElement;
  private faceMesh: FaceMesh;
  private onResultCallbacks = new Array<(ITrackingResult) => void>();
  private recordTracks = false;

  constructor(private jsPsych: JsPsych) {
    autoBind(this);
  }

  initialize = (params): Promise<void> => {
    this.faceMesh = new FaceMesh({
      locateFile:
        params?.locateFile ??
        function (file) {
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

  on_load = (params) => {
    this.recordedChunks = new Array<IFaceTrackingResult>();
    this.recordTracks = params?.record ?? false;
  };

  on_finish = () => {
    console.log("face_mesh tracked chunks: " + this.recordedChunks.length);
    this.stopAnimationFrame();
    this.recordTracks = false;
    return { face_mesh: this.recordedChunks };
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

    this.faceMesh.send({ image: this.canvasElement });

    this.animationFrameId = window.requestAnimationFrame(this.processFrame.bind(this));
  }

  public addTrackingResultCallback(callback: (ITrackingResult) => void) {
    this.onResultCallbacks.push(callback);
  }

  public removeTrackingResultCallback(callback: (ITrackingResult) => void) {
    this.onResultCallbacks.splice(this.onResultCallbacks.indexOf(callback), 1);
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
      const result = {
        frame_id: this.animationFrameId,
        transformation: transformationMatrix,
        rotation: rotation,
        translation: translation,
      };
      if (this.recordTracks) this.recordedChunks.push(result);
      this.onResultCallbacks.forEach((callback) => {
        callback(result);
      });
    }
  }
}

export default MediapipeFacemeshExtension;
