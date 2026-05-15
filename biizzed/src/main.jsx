// main.jsx (Biizzed only)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store.js";
import { Analytics } from "@vercel/analytics/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Layout & screens (Biizzed only)
import BiizzedLayout from "./screens/BiizzedLayout.jsx";
import BiizzedScreen from "./screens/BiizzedScreen.jsx";
import BiizzedLogin from "./screens/BiizzedLogin.jsx";
import BiizzedSignup from "./screens/BiizzedSignup.jsx";
import BiizzedFeed from "./screens/BiizzedFeed.jsx";
import BiizzedCreateVideo from "./screens/BiizzedCreateVideo.jsx";
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

// Push notifications hook
import usePushNotifications from "./hooks/usePushNotifications";

// ==================== ROUTES (Biizzed only) ====================
const router = createBrowserRouter([
  { path: "/", element: <BiizzedScreen /> },
  {path: "*", element: <NotFound />},
  {
    path: "/biizzed",
    element: <BiizzedLayout />,
    children: [
      {index: true, element: <BiizzedScreen />},
      { path: "login", element: <BiizzedLogin /> },
      { path: "signup", element: <BiizzedSignup /> },
      { path: "feed", element: <BiizzedFeed /> },
      { path: "create-video", element: <BiizzedCreateVideo /> },
      { path: "create-article", element: <BiizzedCreateArticle /> },
      { path: "create-magazine", element: <BiizzedCreateMagazine /> },
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