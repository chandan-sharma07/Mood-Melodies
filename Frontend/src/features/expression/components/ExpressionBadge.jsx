
const expressionConfig = {
  "😊 Happy": {
    color: "#22c55e",
    bg: "#dcfce7",
    emoji: "😊",
  },
  "😐 Neutral": {
    color: "#2563eb",
    bg: "#dbeafe",
    emoji: "😐",
  },
  "😲 Surprise": {
    color: "#f97316",
    bg: "#ffedd5",
    emoji: "😲",
  },
  "😮 Mouth Open": {
    color: "#eab308",
    bg: "#fef9c3",
    emoji: "😮",
  },
  "😉 Blink": {
    color: "#8b5cf6",
    bg: "#ede9fe",
    emoji: "😉",
  },
  "😘 Kiss": {
    color: "#ec4899",
    bg: "#fce7f3",
    emoji: "😘",
  },
  "😢 Sad": {
    color: "#0ea5e9",
    bg: "#e0f2fe",
    emoji: "😢",
  },
  "😠 Angry": {
    color: "#ef4444",
    bg: "#fee2e2",
    emoji: "😠",
  },
};

const ExpressionBadge = ({ expression }) => {
  const style =
    expressionConfig[expression] ||
    expressionConfig["😐 Neutral"];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "20px",
        padding: "12px 24px",
        borderRadius: "50px",
        background: style.bg,
        color: style.color,
        fontWeight: "bold",
        fontSize: "22px",
        boxShadow: "0 4px 12px rgba(0,0,0,.15)",
      }}
    >
      <span style={{ fontSize: "30px" }}>{style.emoji}</span>
      <span>{expression.replace(/^.\s/, "")}</span>
    </div>
  );
};

export default ExpressionBadge;