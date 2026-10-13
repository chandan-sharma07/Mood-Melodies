import { createBrowserRouter } from "react-router-dom";
import React from "react";
import ErrorPage from "./features/shared/pages/ErrorPage";
import {
  ProtectedLayoutRoute,
  ListenRoute,
  InsightsRoute,
  HistoryRoute,
  SettingsRoute,
  LoginRoute,
  RegisterRoute,
} from "./app.routes.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedLayoutRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ListenRoute />,
      },
      {
        path: "insights",
        element: <InsightsRoute />,
      },
      {
        path: "history",
        element: <HistoryRoute />,
      },
      {
        path: "settings",
        element: <SettingsRoute />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/register",
    element: <RegisterRoute />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default router;
