import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FlowerManage from './pages/FlowerManage'
import OrderManage from './pages/OrderManage'
import UserManage from './pages/UserManage'
import CategoryManage from './pages/CategoryManage'
import AnnouncementManage from './pages/AnnouncementManage'
import BannerManage from './pages/BannerManage'
import LogManage from './pages/LogManage'
import Profile from './pages/Profile'
import Password from './pages/Password'
import useStore from './store/useStore'

function PrivateRoute({ children, requiredRoles }) {
  const { user, token, role } = useStore()

  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles && !requiredRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="flowers" element={<FlowerManage />} />
          <Route path="orders" element={<OrderManage />} />

          <Route
            path="users"
            element={
              <PrivateRoute requiredRoles={['admin']}>
                <UserManage />
              </PrivateRoute>
            }
          />
          <Route
            path="categories"
            element={
              <PrivateRoute requiredRoles={['admin']}>
                <CategoryManage />
              </PrivateRoute>
            }
          />
          <Route
            path="announcements"
            element={
              <PrivateRoute requiredRoles={['admin']}>
                <AnnouncementManage />
              </PrivateRoute>
            }
          />
          <Route
            path="banners"
            element={
              <PrivateRoute requiredRoles={['admin']}>
                <BannerManage />
              </PrivateRoute>
            }
          />
          <Route
            path="logs"
            element={
              <PrivateRoute requiredRoles={['admin']}>
                <LogManage />
              </PrivateRoute>
            }
          />

          <Route path="profile" element={<Profile />} />
          <Route path="password" element={<Password />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
