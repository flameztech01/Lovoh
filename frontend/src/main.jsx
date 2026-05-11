// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider, Navigate, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store.js";
import { Analytics } from "@vercel/analytics/react";

import UserPrivateRoute from "./components/UserPrivateRoute.jsx";
import BizzzedLayout from "./screens/BizzzedLayout.jsx";
import UduuaLayout from "./screens/UduuaLayout.jsx";

import Homepage from "./screens/Homepage.jsx";
import AdminDashboard from "./adminScreen/AdminDashboard.jsx";
import AdminProducts from "./adminScreen/AdminProducts.jsx";
import AdminProductDetail from "./adminScreen/AdminProductDetail.jsx";
import AdminAddProduct from "./adminScreen/AdminAddProduct.jsx";
import AdminEditProduct from "./adminScreen/AdminEditProduct.jsx";
import Adminauth from "./adminScreen/Adminauth.jsx";
import Viewmessage from "./adminScreen/Viewmessage.jsx";
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
import AdminAds from "./adminScreen/AdminAds.jsx";
import AdminAddAd from "./adminScreen/AdminAddAd.jsx";
import AdminEditAd from "./adminScreen/AdminEditAd.jsx";
import AdminAdDetail from "./adminScreen/AdminAdDetail.jsx";
import AdminVideos from "./adminScreen/AdminVideos.jsx";
import AdminAddVideos from "./adminScreen/AdminAddVideos.jsx";
import AdminEditVideo from "./adminScreen/AdminEditVideo.jsx";
import AdminSellers from "./adminScreen/AdminSellers.jsx";
import AdminSellerDetail from "./adminScreen/AdminSellerDetail.jsx";

import Aboutscreen from "./screens/Aboutscreen.jsx";
import Servicescreen from "./screens/Servicescreen.jsx";
import UduuaScreen from "./screens/UduuaScreen.jsx";
import PuulsScreen from "./screens/PuulsScreen.jsx";
import TheFruiitScreen from "./screens/TheFruiitScreen.jsx";
import PrivateRoute from "./adminComponents/Privateroute.jsx";
import BizzzedScreen from "./screens/BizzzedScreen.jsx";
import MagazineStoryDetail from "./screens/MagazineStoryDetail.jsx";
import BizzzedMagazines from "./screens/BizzzedMagazines.jsx";
import BizzzedArticlesScreen from "./screens/BizzzedArticlesScreen.jsx";
import BizzzedArticleDetails from "./screens/BizzzedArticleDetails.jsx";
import CreateInstituteScreen from "./screens/CreateInstituteScreen.jsx";
import EventsScreen from "./screens/EventScreen.jsx";
import EventDetail from "./screens/EventDetail.jsx";
import AllEvents from "./screens/AllEvents.jsx";
import ContactUsScreen from "./screens/ContactUsScreen.jsx";
import StartProjectForm from "./screens/StartProjectForm.jsx";

import Work from "./screens/Work.jsx";

import UduuaShop from "./screens/UduuaShop.jsx";
import UduuaSignup from "./screens/UduuaSignup.jsx";
import UduuaLogin from "./screens/UduuaLogin.jsx";
import UduuaCart from "./screens/UduuaCart.jsx";
import UduuaProductDetail from "./screens/UduuaProductDetail.jsx";
import UduuaCheckout from "./screens/UduuaCheckout";
import UduuaOrders from "./screens/UduuaOrders";
import UduuaOrderId from "./screens/UduuaOrderId";
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

//Event imports
import EventLogin from "./screens/EventLogin.jsx";
import EventSignup from "./screens/EventSignup.jsx";
import EventDashboard from "./screens/EventDashboard.jsx";
import EventDashboardEvents from "./screens/EventDashboardEvents.jsx";
import EventDashboardCreateEvent from "./screens/EventDashboardCreateEvent.jsx";
import EventDashboardRegistrations from "./screens/EventDashboardRegistrations.jsx";
import EventDashboardWallet from "./screens/EventDashboardWallet.jsx";
import EventDashboardAnalytics from "./screens/EventDashboardAnalytics.jsx";
import EventDashboardEventDetail from "./screens/EventDashboardEventDetail.jsx";
import EventDashboardEventRegistrations from "./screens/EventDashboardEventRegistrations.jsx";
import EventDashboardEditEvent from "./screens/EventDashboardEditEvent.jsx";
import EventRegistration from "./screens/EventRegistration.jsx";

import BizzzedLogin from "./screens/BizzzedLogin.jsx";
import BizzzedSignup from "./screens/BizzzedSignup.jsx";
import BizzzedFeed from "./screens/BizzzedFeed.jsx";
import BizzzedCreateVideo from "./screens/BizzzedCreateVideo.jsx";
import BizzzedCreateArticle from "./screens/BizzzedCreateArticle.jsx";
import BizzzedCreateMagazine from "./screens/BizzzedCreateMagazine.jsx";
import BizzzedProfile from "./screens/BizzzedProfile.jsx";
import BizzzedFollowers from "./screens/BizzzedFollowers.jsx";
import BizzzedVideos from "./screens/BizzzedVideos.jsx";
import BizzzedVideoDetail from "./screens/BizzzedVideoDetail.jsx";
import BizzzedSearch from "./screens/BizzzedSearch.jsx";
import BizzzedResubscribeScreen from "./screens/BizzzedResubscribeScreen.jsx";
import BizzzedSettings from "./screens/BizzzedSettings.jsx";
import BizzzedNotifications from "./screens/BizzzedNotifications.jsx";

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

// Google OAuth Provider Component
import { GoogleOAuthProvider } from "@react-oauth/google";
import AdminForms from "./adminScreen/AdminForms.jsx";

// ====== PUSH NOTIFICATIONS (web‑push) ======
import usePushNotifications from "./hooks/usePushNotifications";

// ==================== SUBDOMAIN DETECTION ====================
const hostname = window.location.hostname;

const getSubdomain = () => {
  if (hostname === 'uduua.lovohcreate.com') return 'uduua';
  if (hostname === 'biizzed.lovohcreate.com') return 'biizzed';
  if (hostname === 'event-room.lovohcreate.com') return 'events';
  return 'main';
};

const currentSubdomain = getSubdomain();
console.log('Current subdomain:', currentSubdomain, '| Hostname:', hostname);

// ==================== AUTO-RELOAD COMPONENT ====================
// This catches any unmatched route with subdomain prefix and reloads
const AutoReloadOnPrefix = () => {
  const location = useLocation();
  const path = location.pathname;

  let cleanPath = null;

  if (currentSubdomain === 'biizzed' && path.startsWith('/biizzed/')) {
    cleanPath = path.replace('/biizzed/', '/') + location.search + location.hash;
  } else if (currentSubdomain === 'uduua' && path.startsWith('/uduua/')) {
    cleanPath = path.replace('/uduua/', '/') + location.search + location.hash;
  } else if (currentSubdomain === 'events' && path.startsWith('/events/')) {
    cleanPath = path.replace('/events/', '/') + location.search + location.hash;
  }

  if (cleanPath) {
    window.location.replace(cleanPath);
    return null; // Nothing renders, browser is already navigating
  }

  // If we get here, it's truly a 404 — show nothing or your actual 404 page
  return null;
};

// ==================== CLIENT-SIDE SUBDOMAIN REDIRECT ====================
const SubdomainRedirect = () => {
  const location = useLocation();
  const path = location.pathname;

  if (currentSubdomain === 'biizzed' && path.startsWith('/biizzed/')) {
    const newPath = path.replace('/biizzed/', '/') + location.search + location.hash;
    console.log('Client redirect:', path, '→', newPath);
    return <Navigate to={newPath} replace />;
  }

  if (currentSubdomain === 'uduua' && path.startsWith('/uduua/')) {
    const newPath = path.replace('/uduua/', '/') + location.search + location.hash;
    console.log('Client redirect:', path, '→', newPath);
    return <Navigate to={newPath} replace />;
  }

  if (currentSubdomain === 'events' && path.startsWith('/events/')) {
    const newPath = path.replace('/events/', '/') + location.search + location.hash;
    console.log('Client redirect:', path, '→', newPath);
    return <Navigate to={newPath} replace />;
  }

  return <Outlet />;
};

// ==================== ROUTE DEFINITIONS ====================

// --- Biizzed routes ---
const biizzedRoutes = [
  {
    element: <SubdomainRedirect />,
    children: [
      {
        path: "/",
        element: <BizzzedLayout />,
        children: [
          { index: true, element: <BizzzedScreen /> },
          { path: "login", element: <BizzzedLogin /> },
          { path: "signup", element: <BizzzedSignup /> },
          { path: "feed", element: <BizzzedFeed /> },
          { path: "create-video", element: <BizzzedCreateVideo /> },
          { path: "create-article", element: <BizzzedCreateArticle /> },
          { path: "create-magazine", element: <BizzzedCreateMagazine /> },
          { path: "profile", element: <BizzzedProfile /> },
          { path: "followers", element: <BizzzedFollowers /> },
          { path: "videos", element: <BizzzedVideos /> },
          { path: "videos/:id", element: <BizzzedVideoDetail /> },
          { path: "magazines", element: <BizzzedMagazines /> },
          { path: "articles", element: <BizzzedArticlesScreen /> },
          { path: "articles/:slug", element: <BizzzedArticleDetails /> },
          { path: ":slug", element: <MagazineStoryDetail /> },
          { path: "search", element: <BizzzedSearch /> },
          { path: "feed/resubscribe", element: <BizzzedResubscribeScreen /> },
          { path: "settings", element: <BizzzedSettings /> },
          { path: "notifications", element: <BizzzedNotifications /> },
          // Catch-all: any remaining path with prefix gets reloaded
          { path: "*", element: <AutoReloadOnPrefix /> },
        ],
      },
    ],
  },
];

// --- Uduua routes ---
const uduuaRoutes = [
  {
    element: <SubdomainRedirect />,
    children: [
      {
        path: "/",
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
          // Catch-all: any remaining path with prefix gets reloaded
          { path: "*", element: <AutoReloadOnPrefix /> },
        ],
      },
    ],
  },
];

// --- Event routes ---
const eventRoutes = [
  {
    element: <SubdomainRedirect />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          { index: true, element: <EventsScreen /> },
          { path: ":id", element: <EventDetail /> },
          { path: "all-events", element: <AllEvents /> },
          { path: ":id/register", element: <EventRegistration /> },
          { path: "login", element: <EventLogin /> },
          { path: "signup", element: <EventSignup /> },
          {
            element: <UserPrivateRoute />,
            children: [
              { path: "dashboard", element: <EventDashboard /> },
              { path: "dashboard/events", element: <EventDashboardEvents /> },
              { path: "dashboard/events/new", element: <EventDashboardCreateEvent /> },
              { path: "dashboard/registrations", element: <EventDashboardRegistrations /> },
              { path: "dashboard/wallet", element: <EventDashboardWallet /> },
              { path: "dashboard/analytics", element: <EventDashboardAnalytics /> },
              { path: "dashboard/events/:id", element: <EventDashboardEventDetail /> },
              { path: "dashboard/events/:id/registrations", element: <EventDashboardEventRegistrations /> },
              { path: "dashboard/events/:id/edit", element: <EventDashboardEditEvent /> },
            ],
          },
          // Catch-all: any remaining path with prefix gets reloaded
          { path: "*", element: <AutoReloadOnPrefix /> },
        ],
      },
    ],
  },
];

// --- Main domain routes ---
const mainRoutes = [
  { index: true, element: <Homepage /> },
  { path: "admin/login", element: <Adminauth /> },
  { path: "/about", element: <Aboutscreen /> },
  { path: "/services", element: <Servicescreen /> },
  { path: "/puuls", element: <PuulsScreen /> },
  { path: "/thefruiit", element: <TheFruiitScreen /> },
  { path: "/createinstitute", element: <CreateInstituteScreen /> },
  {
    path: "/biizzed",
    element: <BizzzedLayout />,
    children: [
      { index: true, element: <BizzzedScreen /> },
      { path: "login", element: <BizzzedLogin /> },
      { path: "signup", element: <BizzzedSignup /> },
      { path: "feed", element: <BizzzedFeed /> },
      { path: "create-video", element: <BizzzedCreateVideo /> },
      { path: "create-article", element: <BizzzedCreateArticle /> },
      { path: "create-magazine", element: <BizzzedCreateMagazine /> },
      { path: "profile", element: <BizzzedProfile /> },
      { path: "followers", element: <BizzzedFollowers /> },
      { path: "videos", element: <BizzzedVideos /> },
      { path: "videos/:id", element: <BizzzedVideoDetail /> },
      { path: "magazines", element: <BizzzedMagazines /> },
      { path: "articles", element: <BizzzedArticlesScreen /> },
      { path: "articles/:slug", element: <BizzzedArticleDetails /> },
      { path: ":slug", element: <MagazineStoryDetail /> },
      { path: "search", element: <BizzzedSearch /> },
      { path: "feed/resubscribe", element: <BizzzedResubscribeScreen /> },
      { path: "settings", element: <BizzzedSettings /> },
      { path: "notifications", element: <BizzzedNotifications /> },
    ],
  },
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
  { path: "/events", element: <EventsScreen /> },
  { path: "/events/:id", element: <EventDetail /> },
  { path: "/events/all-events", element: <AllEvents /> },
  { path: "/events/:id/register", element: <EventRegistration /> },
  { path: "/contact", element: <ContactUsScreen /> },
  { path: "/work", element: <Work /> },
  { path: "/start-project", element: <StartProjectForm /> },
  { path: "/events/login", element: <EventLogin /> },
  { path: "/events/signup", element: <EventSignup /> },
  {
    element: <UserPrivateRoute />,
    children: [
      { path: "/events/dashboard", element: <EventDashboard /> },
      { path: "/events/dashboard/events", element: <EventDashboardEvents /> },
      { path: "/events/dashboard/events/new", element: <EventDashboardCreateEvent /> },
      { path: "/events/dashboard/registrations", element: <EventDashboardRegistrations /> },
      { path: "/events/dashboard/wallet", element: <EventDashboardWallet /> },
      { path: "/events/dashboard/analytics", element: <EventDashboardAnalytics /> },
      { path: "/events/dashboard/events/:id", element: <EventDashboardEventDetail /> },
      { path: "/events/dashboard/events/:id/registrations", element: <EventDashboardEventRegistrations /> },
      { path: "/events/dashboard/events/:id/edit", element: <EventDashboardEditEvent /> },
    ],
  },
  { path: "/custom-form/login", element: <CustomFormLogin /> },
  { path: "/custom-form/signup", element: <CustomFormSignup /> },
  { path: "/custom-form/dashboard", element: <CustomFormDashboard /> },
  { path: "/custom-form/create", element: <CustomFormCreate /> },
  { path: "/custom-form/:id", element: <CustomFormDetail /> },
  { path: "/form/:slug", element: <PublicFormView /> },
  { path: "/custom-form/my-forms", element: <CustomFormMyForms /> },
  { path: "/custom-form/:id/edit", element: <CustomFormEdit /> },
  { path: "/custom-form/submissions", element: <CustomFormSubmissions /> },
  { path: "/custom-form/:id/submissions/:submissionId", element: <CustomFormSubmissionDetail /> },
  { path: "/custom-form/analytics", element: <CustomFormAnalytics /> },
  { path: "/custom-form/templates", element: <CustomFormTemplates /> },
  { path: "/custom-form/team", element: <CustomFormTeam /> },
  {
    path: "admin",
    element: <PrivateRoute />,
    children: [
      { path: "message", element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "messages/:id", element: <Viewmessage /> },
      { path: "products", element: <AdminProducts /> },
      { path: "products/:id", element: <AdminProductDetail /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "products/new", element: <AdminAddProduct /> },
      { path: "products/edit/:id", element: <AdminEditProduct /> },
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
      { path: "events/:id/registrations", element: <AdminEventRegistration /> },
      { path: "forms", element: <AdminForms /> },
      { path: "ads", element: <AdminAds /> },
      { path: "ads/new", element: <AdminAddAd /> },
      { path: "ads/edit/:id", element: <AdminEditAd /> },
      { path: "ads/:id", element: <AdminAdDetail /> },
      { path: "events/:id", element: <AdminEventDetail /> },
      { path: "videos", element: <AdminVideos /> },
      { path: "videos/new", element: <AdminAddVideos /> },
      { path: "videos/edit/:id", element: <AdminEditVideo /> },
      { path: "sellers", element: <AdminSellers /> },
      { path: "sellers/:id", element: <AdminSellerDetail /> },
    ],
  },
];

// ==================== BUILD ROUTER ====================
let routes;

if (currentSubdomain === 'biizzed') {
  routes = biizzedRoutes;
} else if (currentSubdomain === 'uduua') {
  routes = uduuaRoutes;
} else if (currentSubdomain === 'events') {
  routes = eventRoutes;
} else {
  routes = [
    {
      path: "/",
      element: <App />,
      children: mainRoutes,
    },
  ];
}

const router = createBrowserRouter(routes);

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// Register service workers
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