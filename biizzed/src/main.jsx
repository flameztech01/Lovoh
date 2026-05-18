// main.jsx (Biizzed only) – Fixed routing order, catch‑all * at the end
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics } from "@vercel/analytics/react";
import store from "./store.js";
import "./index.css";

// Layout & screens (Biizzed)
import BiizzedLayout from "./screens/BiizzedLayout.jsx";
import BiizzedScreen from "./screens/BiizzedScreen.jsx";
import BiizzedLogin from "./screens/BiizzedLogin.jsx";
import BiizzedSignup from "./screens/BiizzedSignup.jsx";
import BiizzedFeed from "./screens/BiizzedFeed.jsx";
import BiizzedCreateVideo from "./screens/BiizzedCreateVideo.jsx";
import BiizzedEditVideo from "./screens/BiizzedEditVideo.jsx";
import BiizzedEditArticle from "./screens/BiizzedEditArticle.jsx";
import BiizzedEditMagazine from "./screens/BiizzedEditMagazine.jsx";
import BiizzedCreateArticle from "./screens/BiizzedCreateArticle.jsx";
import BiizzedCreateMagazine from "./screens/BiizzedCreateMagazine.jsx";
import BiizzedProfile from "./screens/BiizzedProfile.jsx";
import BiizzedFollowers from "./screens/BiizzedFollowers.jsx";
import BiizzedVideos from "./screens/BiizzedVideos.jsx";
import BiizzedVideoDetail from "./screens/BiizzedVideoDetail.jsx";
import BiizzedMagazines from "./screens/BiizzedMagazines.jsx";
import BiizzedArticlesScreen from "./screens/BiizzedArticlesScreen.jsx";
import BiizzedArticleDetails from "./screens/BiizzedArticleDetails.jsx";
import MagazineStoryDetail from "./screens/MagazineStoryDetail.jsx";
import BiizzedSearch from "./screens/BiizzedSearch.jsx";
import BiizzedResubscribeScreen from "./screens/BiizzedResubscribeScreen.jsx";
import BiizzedSettings from "./screens/BiizzedSettings.jsx";
import BiizzedNotifications from "./screens/BiizzedNotifications.jsx";
import NotFound from "./screens/NotFound.jsx";

// Admin screens
import AdminLogin from "./adminScreen/AdminLogin.jsx";
import AdminDashboard from "./adminScreen/AdminDashboard.jsx";
import AdminAds from "./adminScreen/AdminAds.jsx";
import AdminSubscribers from "./adminScreen/AdminSubscribers.jsx";
import AdminArticles from "./adminScreen/AdminArticles.jsx";
import AdminMagazines from "./adminScreen/AdminMagazines.jsx";
import AdminVideos from "./adminScreen/AdminVideos.jsx";
import AdminAnalytics from "./adminScreen/AdminAnalytics.jsx";

// Admin components
import AdminLayout from "./adminComponents/AdminLayout.jsx";
import PrivateAdminRoute from "./adminComponents/PrivateAdminRoute.jsx";

// Push notifications hook
import usePushNotifications from "./hooks/usePushNotifications";

// Detect if running in Capacitor native app
const isNativeApp = () => {
  return window.Capacitor !== undefined || 
         /Capacitor/.test(navigator.userAgent) ||
         (typeof window !== 'undefined' && window.AndroidBridge !== undefined);
};

const native = isNativeApp();

// ==================== ROUTES ====================
const router = createBrowserRouter([
  // Redirect /biizzed to homepage (optional, kept for compatibility)
  { path: "/biizzed", element: <BiizzedScreen /> },

  // Main Biizzed routes
  {
    path: "/",
    element: <BiizzedLayout />,
    children: [
      // Web: homepage at / | Native app: redirect to /feed
      { index: true, element: native ? <Navigate to="/feed" replace /> : <BiizzedScreen /> },
      { path: "login", element: <BiizzedLogin /> },
      { path: "signup", element: <BiizzedSignup /> },
      { path: "feed", element: <BiizzedFeed /> },
      { path: "create-video", element: <BiizzedCreateVideo /> },
      { path: "edit-video/:id", element: <BiizzedEditVideo /> },
      { path: "create-article", element: <BiizzedCreateArticle /> },
      { path: "edit-article/:id", element: <BiizzedEditArticle /> },
      { path: "create-magazine", element: <BiizzedCreateMagazine /> },
      { path: "edit-magazine/:id", element: <BiizzedEditMagazine /> },
      { path: "profile", element: <BiizzedProfile /> },
      { path: "followers", element: <BiizzedFollowers /> },
      { path: "videos", element: <BiizzedVideos /> },
      { path: "videos/:id", element: <BiizzedVideoDetail /> },
      { path: "magazines", element: <BiizzedMagazines /> },
      { path: "articles", element: <BiizzedArticlesScreen /> },
      { path: "articles/:slug", element: <BiizzedArticleDetails /> },
      { path: ":slug", element: <MagazineStoryDetail /> },
      { path: "search", element: <BiizzedSearch /> },
      { path: "feed/resubscribe", element: <BiizzedResubscribeScreen /> },
      { path: "settings", element: <BiizzedSettings /> },
      { path: "notifications", element: <BiizzedNotifications /> },
      { path: "not-found", element: <NotFound /> },
    ],
  },

  // Admin routes (protected by PrivateAdminRoute)
  {
    path: "/admin",
    element: <PrivateAdminRoute />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "ads", element: <AdminAds /> },
          { path: "subscribers", element: <AdminSubscribers /> },
          { path: "articles", element: <AdminArticles /> },
          { path: "magazines", element: <AdminMagazines /> },
          { path: "videos", element: <AdminVideos /> },
          { path: "analytics", element: <AdminAnalytics /> },
        ],
      },
    ],
  },

  // Admin login (standalone)
  { path: "/admin/login", element: <AdminLogin /> },

  // Catch‑all – must be the last route
  { path: "*", element: <NotFound /> },
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