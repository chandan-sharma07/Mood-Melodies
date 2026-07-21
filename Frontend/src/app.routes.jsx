import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Protected from "./features/auth/components/protected";
import Spinner from "./features/shared/components/Spinner";
import ErrorPage from "./features/shared/pages/ErrorPage";

// Lazy loading pages to reduce initial loading time
const Home = lazy(() => import("./features/home/pages/Home"));
const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <Protected>
                <Suspense fallback={<Spinner />}>
                    <Home />
                </Suspense>
            </Protected>
        ),
        errorElement: <ErrorPage /> // Catch-all for any chunk loading or React crashes
    },
    {
        path: "/login",
        element: (
            <Suspense fallback={<Spinner />}>
                <Login />
            </Suspense>
        )
    },
    {
        path: "/register",
        element: (
            <Suspense fallback={<Spinner />}>
                <Register />
            </Suspense>
        )
    },
    {
        path: "*",
        element: <ErrorPage /> // 404 Not Found Handling
    }
]);

export default router;