import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GlobalSettingsProvider } from './context/GlobalSettingsContext';
import { BrandingProvider } from './context/BrandingContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import SettingsLayout from './components/SettingsLayout';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ModuleSelectionPage from './pages/settings/ModuleSelectionPage';
import MaterialTypesPage from './pages/settings/MaterialTypesPage';
import MaterialTypeDetailPage from './pages/settings/MaterialTypeDetailPage';
import MaterialSettingsPage from './pages/settings/MaterialSettingsPage';
import ProductSettingsPage from './pages/settings/ProductSettingsPage';
import OrderSettingsPage from './pages/settings/OrderSettingsPage';
import CustomerSettingsPage from './pages/settings/CustomerSettingsPage';
import YearInReviewSettingsPage from './pages/settings/YearInReviewSettingsPage';
import LanguageRegionPage from './pages/settings/LanguageRegionPage';
import DashboardPage from './pages/DashboardPage';
import MaterialsPage from './pages/MaterialsPage';
import MaterialDetailPage from './pages/MaterialDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import YearReviewPage     from './pages/YearReviewPage';

// ── Protected route wrapper ───────────────────────────────────────────────────
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
}

// ── App shell ────────────────────────────────────────────────────────────────
function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Settings — own sidebar */}
            <Route
                path="/settings/*"
                element={
                    <ProtectedRoute>
                        <SettingsLayout>
                            <Routes>
                                <Route index element={<Navigate to="modules" replace />} />
                                <Route path="modules" element={<ModuleSelectionPage />} />
                                <Route path="material-types" element={<MaterialTypesPage />} />
                                <Route path="material-types/:id" element={<MaterialTypeDetailPage />} />
                                <Route path="materials" element={<MaterialSettingsPage />} />
                                <Route path="products" element={<ProductSettingsPage />} />
                                <Route path="orders" element={<OrderSettingsPage />} />
                                <Route path="customers" element={<CustomerSettingsPage />} />
                                <Route path="year-in-review" element={<YearInReviewSettingsPage />} />
                                <Route path="language-region" element={<LanguageRegionPage />} />
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </SettingsLayout>
                    </ProtectedRoute>
                }
            />

            {/* Main app — module sidebar */}
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Routes>
                                <Route index element={<DashboardPage />} />
                                <Route path="materials" element={<MaterialsPage />} />
                                <Route path="materials/:id" element={<MaterialDetailPage />} />
                                <Route path="products" element={<ProductsPage />} />
                                <Route path="products/:id" element={<ProductDetailPage />} />
                                <Route path="orders" element={<OrdersPage />} />
                                <Route path="orders/:id" element={<OrderDetailPage />} />
                                <Route path="customers" element={<CustomersPage />} />
                                <Route path="customers/:id" element={<CustomerDetailPage />} />
                                <Route path="year-review" element={<YearReviewPage />} />
                                <Route path="profile" element={<ProfilePage />} />
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default function App() {
    return (
        <GlobalSettingsProvider>
            <BrandingProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrandingProvider>
        </GlobalSettingsProvider>
    );
}
