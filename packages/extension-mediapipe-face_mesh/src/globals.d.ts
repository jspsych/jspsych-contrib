import { FaceMesh as MediapipeFaceMesh } from "@mediapipe/face_mesh";

declare global {
  export type FaceMesh = MediapipeFaceMesh;
  export const FaceMesh: typeof MediapipeFaceMesh;
}
