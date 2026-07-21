// Start Webcam
export const startWebcam = async (videoRef) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: 640,
      height: 480,
    },
    audio: false,
  });

  if (videoRef.current) {
    videoRef.current.srcObject = stream;

    await new Promise((resolve) => {
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        resolve();
      };
    });
  }

  return stream;
};

// Stop Webcam
export const stopWebcam = (stream) => {
  if (!stream) return;

  stream.getTracks().forEach((track) => track.stop());
};