import useFaceExpression from "../hooks/useFaceExpression";
import ExpressionBadge from "./ExpressionBadge";
const FaceExpression = () => {
  const { videoRef, expression } = useFaceExpression();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111",
      }}
    >
      <div
        style={{
          width: "700px",
          padding: "20px",
          background: "#1c1c1c",
          borderRadius: "15px",
          boxShadow: "0 0 20px rgba(255,255,255,.1)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#fff",
            marginBottom: "20px",
          }}
        >
          Face Expression Detector
        </h1>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="640"
          height="480"
          style={{
            borderRadius: "15px",
            border: "3px solid #4caf50",
            objectFit: "cover",
          }}
        />

        <h2
          style={{
            color: "#fff",
            marginTop: "20px",
          }}
        >
          <ExpressionBadge expression={expression} />
        </h2>
      </div>
    </div>
  );
};

export default FaceExpression;