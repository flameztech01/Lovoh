// main.jsx – Main LovoCreate website
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

      // 404 – catch all unmatched routes
      { path: "*", element: <NotFound /> },
    ],
  },
]);

// Google OAuth client ID
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

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