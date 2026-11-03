import { createBrowserRouter, Navigate } from "react-router-dom";
import WebLayout from "../layouts/WebLayout";
import LandingPage from "../../pages/web/LandingPage";
import PricingPage from "../../pages/web/PricingPage";
import ContactPage from "../../pages/web/Contactpage";
import NotFoundPage from "../../pages/NotFoundPage";
import SignInPage from "../../pages/auth/SignInPage";
import AuthCallbackPage from "../../pages/auth/AuthCallbackPage";
import CountrySetupPage from "../../pages/auth/CountrySetupPage";
import Account from "../../pages/saas/Account";
import Transaction from "../../pages/saas/Transaction";
import Category from "../../pages/saas/Category";
import Calendar from "../../pages/saas/Calendar";
import FinArtLayout from "../layouts/FinArtLayout";
import { PublicOnlyRoute, ProtectedRoute } from "./routeGuards";
import DashboardRoute from "./DashboardRoute";

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
    {
        path: "/country-setup",
        element: (
            <ProtectedRoute>
                <CountrySetupPage />
            </ProtectedRoute>
        )
    },

    // SaaS App (Sidebar on left, page on right)
    {
        element: <FinArtLayout />,
        children: [
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute>
                        <DashboardRoute />
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
            },
            {
                path: "/transactions",
                element: (
                    <ProtectedRoute>
                        <Transaction />
                    </ProtectedRoute>
                )
            },
            {
                path: "/categories",
                element: (
                    <ProtectedRoute>
                        <Category />
                    </ProtectedRoute>
                )
            },
            {
                path: "/calendar",
                element: (
                    <ProtectedRoute>
                        <Calendar />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);
