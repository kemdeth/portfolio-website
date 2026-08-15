import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DataProvider } from '@/context/DataContext'
import { ToastProvider } from '@/context/ToastContext'
import { BotGateProvider } from '@/context/BotGateContext'
import { AuthProvider } from '@/context/AuthContext'
import Home from '@/pages/Home'
import { DashboardLayout } from '@/pages/DashboardLayout'
import { RequireAuth } from '@/components/RequireAuth'

const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'))
const Overview = lazy(() => import('@/pages/admin/Overview'))
const ProfileSettings = lazy(() => import('@/pages/admin/ProfileSettings'))
const Certificates = lazy(() => import('@/pages/admin/Certificates'))
const Projects = lazy(() => import('@/pages/admin/Projects'))
const Skills = lazy(() => import('@/pages/admin/Skills'))
const Messages = lazy(() => import('@/pages/admin/Messages'))
const ChatWidget = lazy(() => import('@/components/ChatWidget').then((m) => ({ default: m.ChatWidget })))

function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <DataProvider>
        <BotGateProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/admin/login"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLogin />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RequireAuth>
                      <DashboardLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Suspense fallback={<PageLoader />}><Overview /></Suspense>} />
                  <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Overview /></Suspense>} />
                  <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfileSettings /></Suspense>} />
                  <Route path="certificates" element={<Suspense fallback={<PageLoader />}><Certificates /></Suspense>} />
                  <Route path="projects" element={<Suspense fallback={<PageLoader />}><Projects /></Suspense>} />
                  <Route path="skills" element={<Suspense fallback={<PageLoader />}><Skills /></Suspense>} />
                  <Route path="messages" element={<Suspense fallback={<PageLoader />}><Messages /></Suspense>} />
                  <Route path="dashboard/profile" element={<Navigate to="/admin/profile" replace />} />
                  <Route path="dashboard/certificates" element={<Navigate to="/admin/certificates" replace />} />
                  <Route path="dashboard/projects" element={<Navigate to="/admin/projects" replace />} />
                  <Route path="dashboard/skills" element={<Navigate to="/admin/skills" replace />} />
                  <Route path="dashboard/messages" element={<Navigate to="/admin/messages" replace />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Suspense fallback={null}>
                <ChatWidget />
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </BotGateProvider>
      </DataProvider>
    </ToastProvider>
  )
}

