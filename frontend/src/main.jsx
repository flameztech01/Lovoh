import { Children, StrictMode } from 'react'
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

import PrivateRoute from './adminComponents/Privateroute.jsx';

const router = createBrowserRouter([
  {path: '/', element: <App />, children: [
    {index: true, element: <Homepage />},   // Landing 
    {path: 'admin/login', element: <Adminauth />},
    {element: <PrivateRoute />, children: [
      {path: 'admin/message', element: <Dashboard />},
      {path: 'admin/messages/:id', element: <Viewmessage />}
    ]}
  ]},
])

createRoot(document.getElementById('root')).render(
   <Provider store={store}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </Provider>
)
