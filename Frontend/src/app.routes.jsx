import React, { Suspense, lazy } from "react";
import Protected from "./features/auth/components/protected";
import AppLayout from "./features/shared/components/AppLayout";
import Spinner from "./features/shared/components/Spinner";

const ListenPage = lazy(() => import("./features/home/pages/ListenPage"));
const InsightsPage = lazy(() => import("./features/home/pages/InsightsPage"));
const HistoryPage = lazy(() => import("./features/home/pages/HistoryPage"));
const SettingsPage = lazy(() => import("./features/home/pages/SettingsPage"));
const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));

export function ProtectedLayoutRoute() {
  return (
    <Protected>
      <AppLayout />
    </Protected>
  );
}

export function ListenRoute() {
  return (
    <Suspense fallback={<Spinner />}>
      <ListenPage />
    </Suspense>
  );
}

export function InsightsRoute() {
  return (
    <Suspense fallback={<Spinner />}>
      <InsightsPage />
    </Suspense>
  );
}

export function HistoryRoute() {
  return (
    <Suspense fallback={<Spinner />}>
      <HistoryPage />
    </Suspense>
  );
}

export function SettingsRoute() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
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
