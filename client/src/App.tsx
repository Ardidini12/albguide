import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { RequireAdmin } from './components/RequireAdmin'
import { RequireAuth } from './components/RequireAuth'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminDestinationsPage } from './pages/AdminDestinationsPage'
import { AdminPackageAvailabilityPage } from './pages/AdminPackageAvailabilityPage'
import { AdminPackagesPage } from './pages/AdminPackagesPage'
import { AdminReviewsPage } from './pages/AdminReviewsPage'
import { AdminServicesPage } from './pages/AdminServicesPage'
import { AdminSupportPage } from './pages/AdminSupportPage'
import { DestinationsDetailsPage } from './pages/DestinationsDetailsPage'
import { DestinationsPage } from './pages/DestinationsPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PackageDetailsPage } from './pages/PackageDetailsPage'
import { PackagesPage } from './pages/PackagesPage'
import { RegisterPage } from './pages/RegisterPage'
import { ServicesPage } from './pages/ServicesPage'
import { SimpleInfoPage } from './pages/SimpleInfoPage'
import { SupportPage } from './pages/SupportPage'
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
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/support" element={<SupportPage />} />

        <Route path="/terms" element={<SimpleInfoPage title="Terms of Use" />} />
        <Route path="/privacy" element={<SimpleInfoPage title="Privacy and Cookies Statement" />} />
        <Route path="/cookie-consent" element={<SimpleInfoPage title="Cookie Consent" />} />
        <Route path="/sitemap" element={<SimpleInfoPage title="Site Map" />} />
        <Route path="/how-it-works" element={<SimpleInfoPage title="How the site works" />} />
        <Route path="/contact" element={<SimpleInfoPage title="Contact us" />} />
        <Route path="/accessibility" element={<SimpleInfoPage title="Accessibility Statement" />} />
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
          path="/admin/services"
          element={
            <RequireAdmin>
              <AdminServicesPage />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/support"
          element={
            <RequireAdmin>
              <AdminSupportPage />
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
