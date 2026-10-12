import { createBrowserRouter, Navigate } from "react-router-dom";
import WebLayout from "../layouts/WebLayout";
import LandingPage from "../../pages/web/LandingPage";
import PricingPage from "../../pages/web/PricingPage";
import ContactPage from "../../pages/web/Contactpage";
import NotFoundPage from "../../pages/NotFoundPage";
import SignInPage from "../../pages/auth/SignInPage";
import AuthCallbackPage from "../../pages/auth/AuthCallbackPage";
import DashboardPage from "../../pages/DashboardPage";

export const router = createBrowserRouter([
    // Web Layout (Navbar and Footer always present, inside content changes dynamically)
    {
        element: <WebLayout />,
        children: [
            {
                path: "/",
                element: <LandingPage />
            },
            {
                path: "/pricing",
                element: <PricingPage />
            },
            {
                path: "/contact",
                element: <ContactPage />
            },
            // Not Found 404 inside WebLayout
            {
                path: "*",
                element: <NotFoundPage />
            }
        ]
    },

    // Auth Routes
    {
        path: "/signin",
        element: <SignInPage />
    },
    {
        path: "/auth",
        element: <Navigate to="/signin" replace />
    },
    {
        path: "/auth/callback",
        element: <AuthCallbackPage />
    },

    // Dashboard
    {
        path: "/dashboard",
        element: <DashboardPage />
    }
]);