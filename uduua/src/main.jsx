// main.jsx (Uduua only – with PWA)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store.js";
import { Analytics } from "@vercel/analytics/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Layout & screens (Uduua only)
import UduuaLayout from "./screens/UduuaLayout.jsx";
import UduuaScreen from "./screens/UduuaScreen.jsx";
import UduuaShop from "./screens/UduuaShop.jsx";
import UduuaSignup from "./screens/UduuaSignup.jsx";
import UduuaLogin from "./screens/UduuaLogin.jsx";
import UduuaCart from "./screens/UduuaCart.jsx";
import UduuaProductDetail from "./screens/UduuaProductDetail.jsx";
import UduuaCheckout from "./screens/UduuaCheckout.jsx";
import UduuaOrders from "./screens/UduuaOrders.jsx";
import UduuaOrderId from "./screens/UduuaOrderId.jsx";
import UduuaConfirmOrder from "./screens/UduuaConfirmOrder.jsx";
import UduuaHelp from "./screens/UduuaHelp.jsx";
import UduuaServices from "./screens/UduuaServices.jsx";
import UduuaApplySeller from "./screens/UduuaApplySeller.jsx";
import UduuaAddProduct from "./screens/UduuaAddProduct.jsx";
import UduuaSellerDashboard from "./screens/UduuaSellerDashboard.jsx";
import UduuaSellerProducts from "./screens/UduuaSellerProducts.jsx";
import UduuaSellerOrders from "./screens/UduuaSellerOrders.jsx";
import UduuaSellerWallet from "./screens/UduuaSellerWallet.jsx";
import UduuaSellerPaymentHistory from "./screens/UduuaSellerPaymentHistory.jsx";
import UduuaPaymentVerify from "./screens/UduuaPaymentVerify.jsx";
import UduuaPaymentPage from "./screens/UduuaPaymentPage.jsx";

// Push notifications hook
import usePushNotifications from "./hooks/usePushNotifications";

// ==================== ROUTES (Uduua only) ====================
const router = createBrowserRouter([
  {path: "/", element: <UduuaScreen />},
  {
    path: "/uduua",
    element: <UduuaLayout />,
    children: [
      { index: true, element: <UduuaScreen /> },
      { path: "shop", element: <UduuaShop /> },
      { path: "shop/signup", element: <UduuaSignup /> },
      { path: "shop/login", element: <UduuaLogin /> },
      { path: "shop/cart", element: <UduuaCart /> },
      { path: "shop/product/:id", element: <UduuaProductDetail /> },
      { path: "checkout", element: <UduuaCheckout /> },
      { path: "shop/orders", element: <UduuaOrders /> },
      { path: "shop/orders/:id", element: <UduuaOrderId /> },
      { path: "shop/help", element: <UduuaHelp /> },
      { path: "shop/orders/:id/confirm", element: <UduuaConfirmOrder /> },
      { path: "shop/payment-verify", element: <UduuaPaymentVerify /> },
      { path: "shop/payment/:id", element: <UduuaPaymentPage /> },
      { path: "apply-seller", element: <UduuaApplySeller /> },
      { path: "seller/add-product", element: <UduuaAddProduct /> },
      { path: "seller/dashboard", element: <UduuaSellerDashboard /> },
      { path: "seller/products", element: <UduuaSellerProducts /> },
      { path: "seller/orders", element: <UduuaSellerOrders /> },
      { path: "seller/wallet", element: <UduuaSellerWallet /> },
      { path: "seller/payment-history", element: <UduuaSellerPaymentHistory /> },
      { path: "services", element: <UduuaServices /> },
    ],
  },
]);

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// Register service worker (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("PWA Service Worker registered:", registration);
      })
      .catch((error) => {
        console.error("PWA Service Worker registration failed:", error);
      });
  });
}

// Wrapper to activate web‑push subscription
const AppWithNotifications = () => {
  usePushNotifications();
  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppWithNotifications />
        <Analytics />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);