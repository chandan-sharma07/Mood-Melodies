import { createBrowserRouter } from "react-router-dom";
import React from "react";
import ErrorPage from "./features/shared/pages/ErrorPage";
import { HomeRoute, LoginRoute, RegisterRoute } from "./app.routes.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeRoute />,
        errorElement: <ErrorPage />
    },
    {
        path: "/login",
        element: <LoginRoute />
    },
    {
        path: "/register",
        element: <RegisterRoute />
    },
    {
        path: "*",
        element: <ErrorPage /> // 404 Not Found Handling
    }
]);

export default router;
