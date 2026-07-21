import { useEffect, useRef, useState } from "react";

import { startWebcam, stopWebcam } from "../services/webcam";

import {
  initializeDetector,
  detectExpression,
} from "../services/detector";

const useFaceExpression = () => {
  const videoRef = useRef(null);
  const animationRef = useRef(null);

  const [expression, setExpression] = useState("Loading...");

  useEffect(() => {
    let stream = null;

    const run = async () => {
      try {
        // 1. Start Webcam
        stream = await startWebcam(videoRef);

        // 2. Initialize MediaPipe
        await initializeDetector();

        // 3. Detection Loop
        const detect = () => {
          detectExpression(
            videoRef.current,
            setExpression
          );

          animationRef.current =
            requestAnimationFrame(detect);
        };

        detect();
      } catch (error) {
        console.error(error);
        setExpression("❌ Camera Error");
      }
    };

    run();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      stopWebcam(stream);
    };
  }, []);

  return {
    videoRef,
    expression,
  };
};

export default useFaceExpression;