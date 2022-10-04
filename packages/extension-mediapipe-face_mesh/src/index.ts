import { FaceMesh } from "@mediapipe/face_mesh/face_mesh";
import autoBind from "auto-bind";
import { JsPsych, JsPsychExtension, JsPsychExtensionInfo } from "jspsych";

class MediapipeFacemeshExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "mediapipe-face_mesh",
  };

  constructor(private jsPsych: JsPsych) {
    autoBind(this);
    console.log("mediapipe-face_mesh: Constructor");

    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
  }

  private animationFrameId: number;
  public mediaStream: MediaStream;
  private videoElement: HTMLVideoElement;
  private canvasElement: HTMLCanvasElement;

  /**
   * The mediapipe facemesh reference.
   */
  private faceMesh: FaceMesh;

  initialize = async () => {};

  on_start = (): void => {
    console.log("mediapipe-face_mesh: On start");
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
        "The mediapipe-face_mesh extension is trying to start but the camera is not initialized. Do you need to run the initialize-camera plugin?"
      );
      return;
    }

    this.videoElement.srcObject = this.mediaStream;

    this.videoElement.onloadedmetadata = () => {
      // Stop animation frame to prevent performance leaks.
      this.stopAnimationFrame();
      this.animationFrameId = window.requestAnimationFrame(this.processFrame.bind(this));
    };

    this.videoElement.play();
  };

  on_load = () => {
    console.log("mediapipe-face_mesh: On load");
  };

  on_finish = (): Promise<any> => {
    return new Promise((resolve) => {
      this.stopAnimationFrame();
      resolve({ frame_id: this.animationFrameId });
    });
  };

  /**
   * Stop the current animation frame to prevent performance leakage.
   */
  private stopAnimationFrame(): void {
    window.cancelAnimationFrame(this.animationFrameId);
  }

  private processFrame(): void {
    console.log("Process frame");
    const canvasContext = this.canvasElement.getContext("2d");
    canvasContext.drawImage(this.videoElement, 0, 0);

    // const imageData = canvasContext.getImageData(0, 0, 1280, 720);

    // this.faceMesh.send({ image: this.canvasElement});

    this.animationFrameId = window.requestAnimationFrame(this.processFrame.bind(this));
  }
}

export default MediapipeFacemeshExtension;
