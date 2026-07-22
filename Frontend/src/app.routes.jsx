import React, { Suspense, lazy } from "react";
import Protected from "./features/auth/components/protected";
import Spinner from "./features/shared/components/Spinner";

// Lazy loading pages to reduce initial loading time
const Home = lazy(() => import("./features/home/pages/Home"));
const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));

export function HomeRoute() {
    return (
        <Protected>
            <Suspense fallback={<Spinner />}>
                <Home />
            </Suspense>
        </Protected>
    );
}

export function LoginRoute() {
    return (
        <Suspense fallback={<Spinner />}>
            <Login />
        </Suspense>
    );
}

export function RegisterRoute() {
    return (
        <Suspense fallback={<Spinner />}>
            <Register />
        </Suspense>
    );
}
