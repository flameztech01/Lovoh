// src/utils/subdomainRouter.js
// Drop-in replacement for react-router-dom's Link and useNavigate
// Automatically strips /biizzed/, /uduua/, /events/ prefixes when on subdomains

// Use the actual file path to bypass the Vite alias (avoids circular dependency)
import {
  Link as RouterLink,
  useNavigate as useRouterNavigate,
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
  useParams,
  useSearchParams,
  useMatch,
  useResolvedPath,
  useHref,
  useInRouterContext,
  useNavigationType,
  useLinkClickHandler,
  NavLink,
  Form,
  ScrollRestoration,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  useOutletContext,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData,
  useActionData,
  useFetcher,
  useSubmit,
  useFormAction,
  useRouteLoaderData,
  UNSAFE_useScrollRestoration,
  UNSAFE_DataRouterContext,
  UNSAFE_DataRouterStateContext,
  UNSAFE_NavigationContext,
  UNSAFE_LocationContext,
  UNSAFE_RouteContext,
  UNSAFE_useRouteId,
  createSearchParams,
  generatePath,
  matchPath,
  matchRoutes,
  renderMatches,
  resolvePath,
  createPath,
  parsePath,
  stripBasename,
  getPathContributingMatches,
  shouldProcessLinkClick,
} from '../../../node_modules/react-router-dom/dist/index.js';

const hostname = window.location.hostname;

const isBiizzed = hostname === 'biizzed.lovohcreate.com';
const isUduua = hostname === 'uduua.lovohcreate.com';
const isEvent = hostname === 'event-room.lovohcreate.com';

// Strip section prefix when on subdomain
const normalizePath = (to) => {
  if (typeof to !== 'string') return to;
  
  if (isBiizzed && to.startsWith('/biizzed/')) return to.replace('/biizzed/', '/');
  if (isUduua && to.startsWith('/uduua/')) return to.replace('/uduua/', '/');
  if (isEvent && to.startsWith('/events/')) return to.replace('/events/', '/');
  
  return to;
};

// Drop-in replacement for Link
export const Link = ({ to, ...props }) => {
  return <RouterLink to={normalizePath(to)} {...props} />;
};

// Drop-in replacement for useNavigate
export const useNavigate = () => {
  const navigate = useRouterNavigate();
  
  return (to, options) => {
    if (typeof to === 'number') {
      navigate(to);
    } else if (typeof to === 'string') {
      navigate(normalizePath(to), options);
    } else if (to && typeof to === 'object') {
      navigate({ ...to, pathname: normalizePath(to.pathname) }, options);
    } else {
      navigate(to, options);
    }
  };
};

// Re-export everything else
export {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
  useParams,
  useSearchParams,
  useMatch,
  useResolvedPath,
  useHref,
  useInRouterContext,
  useNavigationType,
  useLinkClickHandler,
  NavLink,
  Form,
  ScrollRestoration,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  useOutletContext,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData,
  useActionData,
  useFetcher,
  useSubmit,
  useFormAction,
  useRouteLoaderData,
  UNSAFE_useScrollRestoration,
  UNSAFE_DataRouterContext,
  UNSAFE_DataRouterStateContext,
  UNSAFE_NavigationContext,
  UNSAFE_LocationContext,
  UNSAFE_RouteContext,
  UNSAFE_useRouteId,
  createSearchParams,
  generatePath,
  matchPath,
  matchRoutes,
  renderMatches,
  resolvePath,
  createPath,
  parsePath,
  stripBasename,
  getPathContributingMatches,
  shouldProcessLinkClick,
};