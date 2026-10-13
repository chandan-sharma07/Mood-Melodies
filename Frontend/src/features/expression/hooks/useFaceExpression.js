import { useEffect, useRef, useState } from "react";

import { startWebcam, stopWebcam } from "../services/webcam";

import {
  initializeDetector,
  detectExpression,
} from "../services/detector";

const useFaceExpression = () => {
  const videoRef = useRef(null);
  const animationRef = useRef(null);
  const lastSampleRef = useRef(0);

  const [expression, setExpression] = useState("Loading...");

  useEffect(() => {
    let stream = null;

    const run = async () => {
      try {
        // 1. Start Webcam
        stream = await startWebcam(videoRef);

        // 2. Initialize MediaPipe
        await initializeDetector();

        // 3. Detection Loop (~5 fps / ~200ms)
        const SAMPLE_INTERVAL_MS = 200;
        const detect = (timestamp) => {
          if (!lastSampleRef.current || timestamp - lastSampleRef.current >= SAMPLE_INTERVAL_MS) {
            lastSampleRef.current = timestamp;
            detectExpression(
              videoRef.current,
              setExpression
            );
          }

          animationRef.current =
            requestAnimationFrame(detect);
        };

        animationRef.current = requestAnimationFrame(detect);
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