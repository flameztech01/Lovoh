// main.jsx (Fixed Web + App Routing)
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics } from "@vercel/analytics/react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

import store from "./store.js";
import "./index.css";

// ==================== BIIZZED SCREENS ====================
import BiizzedLayout from "./screens/BiizzedLayout.jsx";
import BiizzedScreen from "./screens/BiizzedScreen.jsx";
import BiizzedLogin from "./screens/BiizzedLogin.jsx";
import BiizzedSignup from "./screens/BiizzedSignup.jsx";
import BiizzedFeed from "./screens/BiizzedFeed.jsx";

import BiizzedCreateVideo from "./screens/BiizzedCreateVideo.jsx";
import BiizzedEditVideo from "./screens/BiizzedEditVideo.jsx";

import BiizzedCreateArticle from "./screens/BiizzedCreateArticle.jsx";
import BiizzedEditArticle from "./screens/BiizzedEditArticle.jsx";

import BiizzedCreateMagazine from "./screens/BiizzedCreateMagazine.jsx";
import BiizzedEditMagazine from "./screens/BiizzedEditMagazine.jsx";

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

import BiizzedContributorApply from "./screens/BiizzedContributorApply.jsx";

import BiizzedViewProfile from "./screens/BiizzedViewProfile.jsx";

import NotFound from "./screens/NotFound.jsx";

// ==================== ADMIN ====================
import AdminLogin from "./adminScreen/AdminLogin.jsx";
import AdminDashboard from "./adminScreen/AdminDashboard.jsx";
import AdminAds from "./adminScreen/AdminAds.jsx";
import AdminSubscribers from "./adminScreen/AdminSubscribers.jsx";
import AdminArticles from "./adminScreen/AdminArticles.jsx";
import AdminMagazines from "./adminScreen/AdminMagazines.jsx";
import AdminVideos from "./adminScreen/AdminVideos.jsx";
import AdminAnalytics from "./adminScreen/AdminAnalytics.jsx";
import AdminContributors from "./adminScreen/AdminContributors.jsx";

import AdminLayout from "./adminComponents/AdminLayout.jsx";
import PrivateAdminRoute from "./adminComponents/PrivateAdminRoute.jsx";

// ==================== PUSH ====================
import usePushNotifications from "./hooks/usePushNotifications";

// ==================== PLATFORM ====================
const native = Capacitor.isNativePlatform();

// ==================== DEEP LINK HANDLER ====================
function DeepLinkHandler() {
  useEffect(() => {
    if (!native) return;

    const listener = App.addListener("appUrlOpen", (event) => {
      if (!event?.url) return;

      try {
        const url = new URL(event.url);

        window.history.pushState({}, "", url.pathname + url.search);

        window.dispatchEvent(new PopStateEvent("popstate"));
      } catch (err) {
        console.error("Deep link error:", err);
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  return null;
}

// ==================== ROUTES ====================
const router = createBrowserRouter([
  {
    path: "/",
    element: <BiizzedLayout />,
    children: [
      // Homepage
      {
        index: true,
        element: native ? (
          <Navigate to="/feed" replace />
        ) : (
          <BiizzedScreen />
        ),
      },

      // Auth
      { path: "login", element: <BiizzedLogin /> },
      { path: "signup", element: <BiizzedSignup /> },

      // Feed
      { path: "feed", element: <BiizzedFeed /> },
      {
        path: "feed/resubscribe",
        element: <BiizzedResubscribeScreen />,
      },

      // Video
      { path: "videos", element: <BiizzedVideos /> },
      { path: "videos/:id", element: <BiizzedVideoDetail /> },

      { path: "create-video", element: <BiizzedCreateVideo /> },
      { path: "edit-video/:id", element: <BiizzedEditVideo /> },

      // Articles
      { path: "articles", element: <BiizzedArticlesScreen /> },
      {
        path: "articles/:slug",
        element: <BiizzedArticleDetails />,
      },

      { path: "create-article", element: <BiizzedCreateArticle /> },
      { path: "edit-article/:id", element: <BiizzedEditArticle /> },

      // Magazines
      { path: "magazines", element: <BiizzedMagazines /> },

      { path: "create-magazine", element: <BiizzedCreateMagazine /> },
      { path: "edit-magazine/:id", element: <BiizzedEditMagazine /> },

      // Magazine stories
      { path: "story/:slug", element: <MagazineStoryDetail /> },

      // User
      { path: "profile", element: <BiizzedProfile /> },
      { path: "subscribers", element: <BiizzedFollowers /> },
      { path: "user/:username", element: <BiizzedViewProfile /> },

      // Misc
      { path: "search", element: <BiizzedSearch /> },
      { path: "settings", element: <BiizzedSettings /> },
      {
        path: "notifications",
        element: <BiizzedNotifications />,
      },

      { path: "contributor/apply", element: <BiizzedContributorApply /> },

      // 404
      { path: "not-found", element: <NotFound /> },
    ],
  },

  // ==================== ADMIN ====================
  {
    path: "/super_user",
    element: <PrivateAdminRoute />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },

          { path: "dashboard", element: <AdminDashboard /> },
          { path: "ads", element: <AdminAds /> },
          { path: "subscribers", element: <AdminSubscribers /> },
          { path: "articles", element: <AdminArticles /> },
          { path: "magazines", element: <AdminMagazines /> },
          { path: "videos", element: <AdminVideos /> },
          { path: "analytics", element: <AdminAnalytics /> },
          { path: "contributors", element: <AdminContributors /> },
        ],
      },
    ],
  },

  // Admin Login
  {
    path: "/super_user/login",
    element: <AdminLogin />,
  },

  // Catch All
  {
    path: "*",
    element: <NotFound />,
  },
]);

// ==================== GOOGLE ====================
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// ==================== PWA / SERVICE WORKER ====================
// Register service worker for web push (only on web platform)
if (!native && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);
        
        // Check for existing subscription
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription) {
            console.log("Existing web push subscription found");
          } else {
            console.log("No existing web push subscription");
          }
        }).catch(err => {
          console.error("Error checking subscription:", err);
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

// ==================== APP ====================
function AppWithNotifications() {
  // Initialize push notifications (handles both web and native)
  usePushNotifications();

  return <RouterProvider router={router} />;
}

// ==================== RENDER ====================
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <DeepLinkHandler />

        <AppWithNotifications />

        <Analytics />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);