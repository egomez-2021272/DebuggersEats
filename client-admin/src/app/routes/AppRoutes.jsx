import { Routes, Route, Navigate } from "react-router-dom"
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx"
import { Menus } from "../../features/menus/components/Menus.jsx"
import { ResetPasswordPage } from "../../features/auth/pages/ResetPasswordPage.jsx"
import { DashboardPage } from "../layouts/DashboardPage.jsx"
import { ProtectedRoutes } from "./ProtectedRoutes.jsx"
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx'
import { Restaurants } from "../../features/restaurants/components/Restaurants.jsx"
import { RestaurantMenus } from "../../features/menus/components/RestaurantMenu.jsx"
import { Users } from "../../features/users/components/Users.jsx"
import { RoleGuard } from "./RoleGuard.jsx"
import { UserPage } from "../../features/users/pages/UserPage.jsx"
import { UserHome } from "../../features/users/pages/UserHome.jsx"
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx'
import { Review } from "../../features/review/components/Review.jsx"
import { Events } from "../../features/events/components/Events.jsx"
import { Reservations } from "../../features/reservations/components/Reservation.jsx"
import { Tables } from "../../features/tables/components/Tables.jsx"
import { MyReviews } from "../../features/users/pages/MyReviews.jsx"
import { UserEventsSection } from "../../features/events/components/UserEventsSection.jsx"

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<AuthPage />} />
      <Route path='/unauthorized' element={<UnauthorizedPage />} />
      <Route path='/debuggersEatsAdmin/v1/auth/activate/:token' element={<VerifyEmailPage />} />
      <Route path='/debuggersEatsAdmin/v1/auth/reset-password/:token' element={<ResetPasswordPage />} />

      {/* Vista para USER_ROLE */}
      <Route
        path="/home"
        element={
          <ProtectedRoutes>
            <RoleGuard allowedRoles={["USER_ROLE"]}>
              <UserPage />
            </RoleGuard>
          </ProtectedRoutes>
        }
      >
        <Route index element={<UserHome />} />
        <Route path="restaurantes" element={<Restaurants />} />
        <Route path="restaurantes/:restaurantId/menu" element={<RestaurantMenus />} />
        <Route path="eventos" element={<UserEventsSection />} />
        <Route path="reservaciones" element={<Reservations />} />
        <Route path="resenas" element={<MyReviews />} />
        <Route path="ordenes" element={<div style={{ color: '#fff', padding: 24 }}>Mis Órdenes</div>} />
      </Route>

      <Route path="restaurantes/:restaurantId/menu" element={<RestaurantMenus />} />

      {/* Vista para ADMIN_ROLE y RES_ADMIN_ROLE */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoutes>
            <RoleGuard allowedRoles={["ADMIN_ROLE", "RES_ADMIN_ROLE"]}>
              <DashboardPage />
            </RoleGuard>
          </ProtectedRoutes>
        }
      >
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="users" element={<RoleGuard allowedRoles={["ADMIN_ROLE"]}><Users /></RoleGuard>} />
        <Route path="tables" element={<RoleGuard allowedRoles={["RES_ADMIN_ROLE"]}><Tables /></RoleGuard>} />
        <Route path="reviews" element={<RoleGuard allowedRoles={["RES_ADMIN_ROLE"]}><Review /></RoleGuard>} />
        <Route path="events" element={<RoleGuard allowedRoles={["RES_ADMIN_ROLE"]}><Events /></RoleGuard>} />
        <Route path="menu" element={<Menus />} />
        <Route path="restaurantes/:restaurantId/menu" element={<RestaurantMenus />} />
        <Route path="reservations" element={<RoleGuard allowedRoles={["RES_ADMIN_ROLE"]}><Reservations /></RoleGuard>} />
      </Route>
    </Routes>
  )
}