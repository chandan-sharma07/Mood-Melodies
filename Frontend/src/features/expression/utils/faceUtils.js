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
    return "😊 Happy";
  }

  if (
    mouthOpen > THRESHOLD.MOUTH_OPEN &&
    browUp > THRESHOLD.BROW_UP
  ) {
    return "😲 Surprise";
  }

  if (mouthOpen > THRESHOLD.MOUTH_OPEN) {
    return "😮 Mouth Open";
  }

  if (blink > THRESHOLD.BLINK) {
    return "😉 Blink";
  }

  if (pucker > THRESHOLD.PUCKER) {
    return "😘 Kiss";
  }

  if (frown > 0.25) {
    return "😢 Sad";
  }

  if (browDown > 0.30) {
    return "😠 Angry";
  }

  return "😐 Neutral";
};

export const EXPRESSION_MOOD_MAP = {
  "😊 Happy": "happy",
  "😢 Sad": "sad",
  "😠 Angry": "angry",
  "😲 Surprise": "uplifting",
  "😮 Mouth Open": "energetic",
  "😉 Blink": "playful",
  "😘 Kiss": "romantic",
  "😐 Neutral": "chill",
};

export const expressionToMoodTag = (expression) => {
  if (!expression) return "happy";
  return EXPRESSION_MOOD_MAP[expression] || "happy";
};