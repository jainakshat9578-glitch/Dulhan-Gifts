import React, { useEffect } from 'react'
import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './app.routes'
import { useSelector } from 'react-redux'
import { useAuth } from '../features/auth/hook/useAuth'

const App = () => {

  const {handleGetMe} = useAuth()

  const user = useSelector(state => state.auth.user)

  useEffect(()=>{
     handleGetMe()
  },[])
  
  return (
    <>
      <RouterProvider router={routes} />
    </>
  )
}

export default App
