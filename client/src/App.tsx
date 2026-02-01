import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { RequireAdmin } from './components/RequireAdmin'
import { RequireAuth } from './components/RequireAuth'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminDestinationsPage } from './pages/AdminDestinationsPage'
import { AdminPackageAvailabilityPage } from './pages/AdminPackageAvailabilityPage'
import { AdminPackagesPage } from './pages/AdminPackagesPage'
import { AdminReviewsPage } from './pages/AdminReviewsPage'
import { DestinationsDetailsPage } from './pages/DestinationsDetailsPage'
import { DestinationsPage } from './pages/DestinationsPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PackageDetailsPage } from './pages/PackageDetailsPage'
import { PackagesPage } from './pages/PackagesPage'
import { RegisterPage } from './pages/RegisterPage'
import { UserDashboard } from './pages/UserDashboard'
import { UserBookingsPage } from './pages/UserBookingsPage'
import { UserFavoritesPage } from './pages/UserFavoritesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/:slug" element={<PackageDetailsPage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/destinations/:slug" element={<DestinationsDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/user"
          element={
            <RequireAuth>
              <UserDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/user/bookings"
          element={
            <RequireAuth>
              <UserBookingsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/user/favorites"
          element={
            <RequireAuth>
              <UserFavoritesPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/destinations"
          element={
            <RequireAdmin>
              <AdminDestinationsPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/packages"
          element={
            <RequireAdmin>
              <AdminPackagesPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/packages/:id/availability"
          element={
            <RequireAdmin>
              <AdminPackageAvailabilityPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <RequireAdmin>
              <AdminReviewsPage />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
