import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../pages/store/HomePage";
import CategoryPage from "../pages/store/CategoryPage";
import CartPage from "../pages/store/CartPage";

import CheckoutPage from "../pages/checkout/CheckoutPage";
import TransferPage from "../pages/checkout/TransferPage";
import OrderConfirmationPage from "../pages/checkout/OrderConfirmationPage";

import AdminLoginPage from "../pages/admin/AdminLoginPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminPaymentsPage from "../pages/admin/AdminPaymentsPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "../pages/admin/AdminOrderDetailPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminInventoryPage from "../pages/admin/AdminInventoryPage";
import AdminSuppliersPage from "../pages/admin/AdminSuppliersPage";

import ProtectedRoute from "./ProtectedRoute";

import { AdminAuthProvider } from "../context/AdminAuthContext";
import { AdminStatsProvider } from "../context/AdminStatsContext";


function AppRoutes() {
  return (
    <AdminAuthProvider>
      <AdminStatsProvider>

        <Routes>

          {/* Customer store */}

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/category/:categoryId"
            element={<CategoryPage />}
          />

          <Route
            path="/cart"
            element={<CartPage />}
          />

          <Route
            path="/checkout"
            element={<CheckoutPage />}
          />

          <Route
            path="/checkout/transferencia"
            element={<TransferPage />}
          />

          <Route
            path="/order-confirmation/:orderId"
            element={<OrderConfirmationPage />}
          />


          {/* Admin login */}

          <Route
            path="/admin/login"
            element={<AdminLoginPage />}
          />


          {/* Protected admin panel */}

          <Route element={<ProtectedRoute />}>

            <Route
              path="/admin"
              element={<AdminDashboardPage />}
            />

            <Route
              path="/admin/products"
              element={<AdminProductsPage />}
            />

            <Route
              path="/admin/categories"
              element={<AdminCategoriesPage />}
            />

            <Route
              path="/admin/payments"
              element={<AdminPaymentsPage />}
            />

            <Route
              path="/admin/orders"
              element={<AdminOrdersPage />}
            />

            <Route
              path="/admin/orders/:orderId"
              element={<AdminOrderDetailPage />}
            />

            <Route
              path="/admin/inventory"
              element={<AdminInventoryPage />}
            />

            <Route
              path="/admin/suppliers"
              element={<AdminSuppliersPage />}
            />

          </Route>


          {/* Unknown routes */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </AdminStatsProvider>
    </AdminAuthProvider>
  );
}

export default AppRoutes;