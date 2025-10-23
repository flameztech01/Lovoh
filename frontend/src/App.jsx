import React from 'react'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

const App = () => {
  return (
    <div>
      <ToastContainer position='bottom-right' />
      <Outlet />
    </div>
  )
}

export default App
