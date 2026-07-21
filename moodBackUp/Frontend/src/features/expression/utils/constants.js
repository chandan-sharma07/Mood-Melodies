// MediaPipe WASM
export const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";

// Face Landmarker Model
export const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// MediaPipe Options
export const FACE_OPTIONS = {
  runningMode: "VIDEO",
  numFaces: 1,
  outputFaceBlendshapes: true,
};

// Expression Thresholds
export const THRESHOLD = {
  SMILE: 0.45,
  BLINK: 0.75,
  MOUTH_OPEN: 0.45,
  BROW_UP: 0.45,
  PUCKER: 0.45,
};