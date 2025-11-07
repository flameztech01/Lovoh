import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import { Provider } from 'react-redux'
import store from './store.js'

import Homepage from './screens/Homepage.jsx'
import Dashboard from './adminScreen/Dashboard.jsx';
import Adminauth from './adminScreen/Adminauth.jsx';
import Viewmessage from './adminScreen/Viewmessage.jsx';
import Aboutscreen from './screens/Aboutscreen.jsx';
import Servicescreen from './screens/Servicescreen.jsx';
import UduuaScreen from './screens/UduuaScreen.jsx';
import PuulsScreen from './screens/PuulsScreen.jsx';
import TheFruiitScreen from './screens/TheFruiitScreen.jsx';
import PrivateRoute from './adminComponents/Privateroute.jsx';
import BizzzedScreen from './screens/BizzzedScreen.jsx';
import EventsScreen from './screens/EventScreen.jsx';

const router = createBrowserRouter([
  {
    path: '/', 
    element: <App />, 
    children: [
      { index: true, element: <Homepage /> },
      { path: 'admin/login', element: <Adminauth /> },
      {path: '/about', element: <Aboutscreen />},
      {path: '/services', element: <Servicescreen />},
      {path: '/uduua', element: <UduuaScreen />},
      {path: '/puuls', element: <PuulsScreen />},
      {path: '/thefruiit', element: <TheFruiitScreen />},
      {path: '/bizzzed', element: <BizzzedScreen />},
      {path: '/events', element: <EventsScreen />},

      
      { 
        path: 'admin',
        element: <PrivateRoute />,
        children: [
          { path: 'message', element: <Dashboard /> },
          { path: 'messages/:id', element: <Viewmessage /> }
        ]
      }
    ]
  },
])

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </Provider>
)