import React from "react";
import { useRouteError, Link } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "var(--space-4)",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-lg)",
          fontWeight: "var(--weight-medium)",
          marginBottom: "var(--space-2)",
          color: "var(--text)",
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          fontSize: "var(--font-sm)",
          color: "var(--text-muted)",
          marginBottom: "var(--space-4)",
          maxWidth: "400px",
        }}
      >
        {error?.statusText || "The requested page does not exist."}
      </p>
      <Link
        to="/"
        style={{
          padding: "var(--space-2) var(--space-4)",
          backgroundColor: "var(--accent)",
          color: "var(--accent-contrast)",
          borderRadius: "var(--radius)",
          fontSize: "var(--font-sm)",
          fontWeight: "var(--weight-medium)",
        }}
      >
        Return to listen
      </Link>
    </div>
  );
};

export default ErrorPage;
