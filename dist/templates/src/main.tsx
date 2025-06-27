import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import {
  createBrowserRouter,
  RouterProvider,
  RouteObject,
} from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router";
import { Home } from "./pages/home";
import ErrorPage from "./error-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthHandler from "./hooks/auth-handler.tsx";
import { AuthReadyProvider } from "./hooks/auth-provider.tsx";
import AuthLoadingWrapper from "./hooks/auth-loading-wrapper.tsx";
import Auth from "./Auth.tsx";

const queryClient = new QueryClient();

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <>
        <AuthHandler />
        <AuthReadyProvider>
          <App />
        </AuthReadyProvider>
      </>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: (
          <AuthLoadingWrapper>
            <Auth />
          </AuthLoadingWrapper>
        ),
        children: [
          {
            path: '/',
            element: <Home />,
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </NuqsAdapter>
  </StrictMode>
);
