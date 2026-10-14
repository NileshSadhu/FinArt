import { createBrowserRouter, Navigate } from "react-router-dom";
import WebLayout from "../layouts/WebLayout";
import LandingPage from "../../pages/web/LandingPage";
import PricingPage from "../../pages/web/PricingPage";
import ContactPage from "../../pages/web/Contactpage";
import NotFoundPage from "../../pages/NotFoundPage";
import SignInPage from "../../pages/auth/SignInPage";
import AuthCallbackPage from "../../pages/auth/AuthCallbackPage";
import DashboardPage from "../../pages/DashboardPage";
import Account from "../../pages/saas/Account";
import FinArtLayout from "../layouts/FinArtLayout";
import { PublicOnlyRoute, ProtectedRoute } from "./routeGuards";

export const router = createBrowserRouter([
    // Web Layout (Navbar and Footer always present, inside content changes dynamically)
    {
        element: <WebLayout />,
        children: [
            {
                path: "/",
                element: (
                    <PublicOnlyRoute>
                        <LandingPage />
                    </PublicOnlyRoute>
                )
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
        element: (
            <PublicOnlyRoute>
                <SignInPage />
            </PublicOnlyRoute>
        )
    },
    {
        path: "/auth",
        element: <Navigate to="/signin" replace />
    },
    {
        path: "/auth/callback",
        element: <AuthCallbackPage />
    },

    // SaaS App (Sidebar on left, page on right)
    {
        element: <FinArtLayout />,
        children: [
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/accounts",
                element: (
                    <ProtectedRoute>
                        <Account />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);