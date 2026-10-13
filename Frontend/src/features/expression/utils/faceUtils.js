import { THRESHOLD } from "./constants";


export const getScore = (blendShapes, name) => {
  return (
    blendShapes.find((shape) => shape.categoryName === name)?.score || 0
  );
};

export const getExpression = (blendShapes) => {
  const smile =
    (getScore(blendShapes, "mouthSmileLeft") +
      getScore(blendShapes, "mouthSmileRight")) / 2;

  const blink =
    (getScore(blendShapes, "eyeBlinkLeft") +
      getScore(blendShapes, "eyeBlinkRight")) / 2;

  const mouthOpen = getScore(blendShapes, "jawOpen");

  const browUp = getScore(blendShapes, "browInnerUp");

  const pucker = getScore(blendShapes, "mouthPucker");

  const frown =
    (getScore(blendShapes, "mouthFrownLeft") +
      getScore(blendShapes, "mouthFrownRight")) / 2;

  const browDown =
    (getScore(blendShapes, "browDownLeft") +
      getScore(blendShapes, "browDownRight")) / 2;

  // -------- Expressions --------
  if (smile > THRESHOLD.SMILE) {
    return "happy";
  }

  if (mouthOpen > THRESHOLD.MOUTH_OPEN && browUp > THRESHOLD.BROW_UP) {
    return "surprised";
  }

  if (frown > 0.25) {
    return "sad";
  }

  if (browDown > 0.30) {
    return "angry";
  }

  return "neutral";
};

export const EXPRESSION_MOOD_MAP = {
  happy: "happy",
  surprised: "uplifting",
  sad: "sad",
  angry: "angry",
  neutral: "chill",
};

export const EXPRESSION_DISPLAY = {
  happy: "Happy",
  surprised: "Surprised",
  sad: "Sad",
  angry: "Angry",
  neutral: "Neutral",
  no_face: "No face in frame",
};

export const expressionToMoodTag = (expression) => {
  if (!expression) return "happy";
  return EXPRESSION_MOOD_MAP[expression] || "happy";
};