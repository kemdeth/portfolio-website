import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { ToastProvider } from '@/context/ToastContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ChatWidget } from '@/components/ChatWidget'
import Home from '@/pages/Home'
import AdminLogin from '@/pages/AdminLogin'
import { DashboardLayout } from '@/pages/DashboardLayout'
import Overview from '@/pages/admin/Overview'
import ProfileSettings from '@/pages/admin/ProfileSettings'
import Certificates from '@/pages/admin/Certificates'
import Projects from '@/pages/admin/Projects'
import Skills from '@/pages/admin/Skills'
import Messages from '@/pages/admin/Messages'

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Overview />} />
                  <Route path="profile" element={<ProfileSettings />} />
                  <Route path="certificates" element={<Certificates />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="skills" element={<Skills />} />
                  <Route path="messages" element={<Messages />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ChatWidget />
          </BrowserRouter>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  )
}
