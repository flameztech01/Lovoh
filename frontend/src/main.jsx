// main.jsx – Main LovohCreate website (no sub‑brands, redirects to subdomains)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics } from "@vercel/analytics/react";

import store from "./store.js";
import "./index.css";

// Main domain screens
import App from "./App.jsx";
import Homepage from "./screens/Homepage.jsx";
import Aboutscreen from "./screens/Aboutscreen.jsx";
import Servicescreen from "./screens/Servicescreen.jsx";
import Work from "./screens/Work.jsx";
import ContactUsScreen from "./screens/ContactUsScreen.jsx";
import PuulsScreen from "./screens/PuulsScreen.jsx";
import TheFruiitScreen from "./screens/TheFruiitScreen.jsx";
import CreateInstituteScreen from "./screens/CreateInstituteScreen.jsx";
import StartProjectForm from "./screens/StartProjectForm.jsx";
import NotFound from "./screens/NotFound.jsx";

// Custom forms
import CustomFormLogin from "./screens/CustomFormLogin.jsx";
import CustomFormSignup from "./screens/CustomFormSignup.jsx";
import CustomFormDashboard from "./screens/CustomFormDashboard.jsx";
import CustomFormCreate from "./screens/CustomFormCreate.jsx";
import CustomFormDetail from "./screens/CustomFormDetail.jsx";
import PublicFormView from "./screens/PublicFormView.jsx";
import CustomFormMyForms from "./screens/CustomFormMyForms.jsx";
import CustomFormEdit from "./screens/CustomFormEdit.jsx";
import CustomFormSubmissions from "./screens/CustomFormSubmissions.jsx";
import CustomFormSubmissionDetail from "./screens/CustomFormSubmissionDetail.jsx";
import CustomFormAnalytics from "./screens/CustomFormAnalytics.jsx";
import CustomFormTemplates from "./screens/CustomFormTemplates.jsx";
import CustomFormTeam from "./screens/CustomFormTeam.jsx";

// Admin (protected)
import PrivateRoute from "./adminComponents/Privateroute.jsx";
import Adminauth from "./adminScreen/Adminauth.jsx";
import AdminDashboard from "./adminScreen/AdminDashboard.jsx";
import Viewmessage from "./adminScreen/Viewmessage.jsx";
import AdminProducts from "./adminScreen/AdminProducts.jsx";
import AdminProductDetail from "./adminScreen/AdminProductDetail.jsx";
import AdminAddProduct from "./adminScreen/AdminAddProduct.jsx";
import AdminEditProduct from "./adminScreen/AdminEditProduct.jsx";
import AdminOrders from "./adminScreen/AdminOrders.jsx";
import AdminMagazines from "./adminScreen/AdminMagazines.jsx";
import AdminAddMagazine from "./adminScreen/AdminAddMagazine.jsx";
import AdminMagazineDetail from "./adminScreen/AdminMagazineDetail.jsx";
import AdminEditMagazine from "./adminScreen/AdminEditMagazine.jsx";
import AdminArticles from "./adminScreen/AdminArticles.jsx";
import AdminAddArticle from "./adminScreen/AdminAddArticle.jsx";
import AdminEditArticle from "./adminScreen/AdminEditArticle.jsx";
import AdminEvents from "./adminScreen/AdminEvents.jsx";
import AdminAddEvent from "./adminScreen/AdminAddEvent.jsx";
import AdminEditEvent from "./adminScreen/AdminEditEvent.jsx";
import AdminEventDetail from "./adminScreen/AdminEventDetail.jsx";
import AdminEventRegistration from "./adminScreen/AdminEventRegistration.jsx";
import AdminForms from "./adminScreen/AdminForms.jsx";
import AdminAds from "./adminScreen/AdminAds.jsx";
import AdminAddAd from "./adminScreen/AdminAddAd.jsx";
import AdminEditAd from "./adminScreen/AdminEditAd.jsx";
import AdminAdDetail from "./adminScreen/AdminAdDetail.jsx";
import AdminVideos from "./adminScreen/AdminVideos.jsx";
import AdminAddVideos from "./adminScreen/AdminAddVideos.jsx";
import AdminEditVideo from "./adminScreen/AdminEditVideo.jsx";
import AdminSellers from "./adminScreen/AdminSellers.jsx";
import AdminSellerDetail from "./adminScreen/AdminSellerDetail.jsx";

// No sub‑brand routes or push notifications on the main site (optional)
// import usePushNotifications from "./hooks/usePushNotifications";

// ==================== SUBDOMAIN REDIRECTS ====================
const SUBDOMAIN_MAP = {
  "/biizzed": "https://biizzed.lovohcreate.com",
  "/uduua": "https://uduua.lovohcreate.com",
  "/events": "https://eventroom.lovohcreate.com",
};

// Component that redirects to the corresponding subdomain
const RedirectToSubdomain = () => {
  const pathname = window.location.pathname;
  for (const [path, subdomainUrl] of Object.entries(SUBDOMAIN_MAP)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      // Preserve the rest of the path
      const rest = pathname.slice(path.length);
      window.location.href = `${subdomainUrl}${rest}${window.location.search}${window.location.hash}`;
      return null;
    }
  }
  // Fallback – should not happen
  return <Navigate to="/" replace />;
};

// ==================== ROUTER ====================
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public main pages
      { index: true, element: <Homepage /> },
      { path: "about", element: <Aboutscreen /> },
      { path: "services", element: <Servicescreen /> },
      { path: "work", element: <Work /> },
      { path: "contact", element: <ContactUsScreen /> },
      { path: "puuls", element: <PuulsScreen /> },
      { path: "thefruiit", element: <TheFruiitScreen /> },
      { path: "createinstitute", element: <CreateInstituteScreen /> },
      { path: "start-project", element: <StartProjectForm /> },

      // Custom forms
      { path: "custom-form/login", element: <CustomFormLogin /> },
      { path: "custom-form/signup", element: <CustomFormSignup /> },
      { path: "custom-form/dashboard", element: <CustomFormDashboard /> },
      { path: "custom-form/create", element: <CustomFormCreate /> },
      { path: "custom-form/:id", element: <CustomFormDetail /> },
      { path: "form/:slug", element: <PublicFormView /> },
      { path: "custom-form/my-forms", element: <CustomFormMyForms /> },
      { path: "custom-form/:id/edit", element: <CustomFormEdit /> },
      { path: "custom-form/submissions", element: <CustomFormSubmissions /> },
      { path: "custom-form/:id/submissions/:submissionId", element: <CustomFormSubmissionDetail /> },
      { path: "custom-form/analytics", element: <CustomFormAnalytics /> },
      { path: "custom-form/templates", element: <CustomFormTemplates /> },
      { path: "custom-form/team", element: <CustomFormTeam /> },

      // Admin login (unprotected)
      { path: "admin/login", element: <Adminauth /> },

      // Protected admin section
      {
        path: "admin",
        element: <PrivateRoute />,
        children: [
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "message", element: <AdminDashboard /> },
          { path: "messages/:id", element: <Viewmessage /> },
          { path: "products", element: <AdminProducts /> },
          { path: "products/:id", element: <AdminProductDetail /> },
          { path: "products/new", element: <AdminAddProduct /> },
          { path: "products/edit/:id", element: <AdminEditProduct /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "magazines", element: <AdminMagazines /> },
          { path: "magazines/new", element: <AdminAddMagazine /> },
          { path: "magazines/:id", element: <AdminMagazineDetail /> },
          { path: "magazines/edit/:id", element: <AdminEditMagazine /> },
          { path: "articles", element: <AdminArticles /> },
          { path: "articles/new", element: <AdminAddArticle /> },
          { path: "articles/edit/:id", element: <AdminEditArticle /> },
          { path: "events", element: <AdminEvents /> },
          { path: "events/new", element: <AdminAddEvent /> },
          { path: "events/edit/:id", element: <AdminEditEvent /> },
          { path: "events/:id", element: <AdminEventDetail /> },
          { path: "events/:id/registrations", element: <AdminEventRegistration /> },
          { path: "forms", element: <AdminForms /> },
          { path: "ads", element: <AdminAds /> },
          { path: "ads/new", element: <AdminAddAd /> },
          { path: "ads/edit/:id", element: <AdminEditAd /> },
          { path: "ads/:id", element: <AdminAdDetail /> },
          { path: "videos", element: <AdminVideos /> },
          { path: "videos/new", element: <AdminAddVideos /> },
          { path: "videos/edit/:id", element: <AdminEditVideo /> },
          { path: "sellers", element: <AdminSellers /> },
          { path: "sellers/:id", element: <AdminSellerDetail /> },
        ],
      },

      // Redirect sub‑brand paths to their subdomains
      { path: "biizzed/*", element: <RedirectToSubdomain /> },
      { path: "uduua/*", element: <RedirectToSubdomain /> },
      { path: "events/*", element: <RedirectToSubdomain /> },

      // 404 – catch all unmatched routes
      { path: "*", element: <NotFound /> },
    ],
  },
]);

// Google OAuth client ID (only needed if main site uses Google login)
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// No service worker / push notifications on the main marketing site (optional)
// if ("serviceWorker" in navigator) { ... }

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <RouterProvider router={router} />
        <Analytics />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);