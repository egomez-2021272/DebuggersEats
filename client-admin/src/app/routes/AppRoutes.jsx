import { Routes, Route } from "react-router-dom"
import { AuthPage } from "../../features/auth/pages/AuthPage.jsx"
import { ResetPasswordPage } from "../../features/auth/pages/ResetPasswordPage.jsx"
import { DashboardPage } from "../layouts/DashboardPage.jsx"
import { ProtectedRoutes } from "./ProtectedRoutes.jsx"
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx'
import { Restaurants } from "../../features/restaurants/components/Restaurants.jsx"
import { Users } from "../../features/users/components/Users.jsx"
import { RoleGuard } from "./RoleGuard.jsx"
import { UserPage } from "../../features/users/pages/UserPage.jsx"
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx'


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
      />

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
        <Route
          path="restaurants"
          element={<Restaurants />}
        />
        <Route
          path="users"
          element={
            <RoleGuard allowedRoles={["ADMIN_ROLE"]}>
              <Users />
            </RoleGuard>
          }
        />
      </Route>
    </Routes>
  )
}