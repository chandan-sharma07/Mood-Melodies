import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

import {
  WASM_PATH,
  MODEL_PATH,
  FACE_OPTIONS,
} from "../utils/constants";

import { getExpression } from "../utils/faceUtils";

let faceLandmarker = null;

// -----------------------------
// Initialize MediaPipe
// -----------------------------
export const initializeDetector = async () => {
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_PATH,
    },
    ...FACE_OPTIONS,
  });

  return faceLandmarker;
};

// -----------------------------
// Detect Face Expression
// -----------------------------
export const detectExpression = (
  videoElement,
  setExpression
) => {
  if (!faceLandmarker) return;

  if (
    !videoElement ||
    videoElement.readyState !== 4
  )
    return;

  const results = faceLandmarker.detectForVideo(
    videoElement,
    performance.now()
  );

  if (
    !results.faceBlendshapes ||
    results.faceBlendshapes.length === 0
  ) {
    setExpression("😐 No Face");
    return;
  }

  const blendShapes =
    results.faceBlendshapes[0].categories;

  const expression = getExpression(blendShapes);

  setExpression(expression);
};