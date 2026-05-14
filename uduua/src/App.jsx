import React from 'react'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

const App = () => {
  return (
    <div className='App'>
      <ToastContainer position='bottom-right' />
      <Outlet />
    </div>
  )
}

export default App
