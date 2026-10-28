import { Navigate, Outlet } from 'react-router'
import { useSelector } from 'react-redux'

export default function SellerRouteGuard() {
  const user = useSelector((state) => state.auth.user)
  // Session restoration is not available. Unknown sessions pass through so the
  // backend can validate the cookie instead of blocking a valid seller on refresh.
  if (user && user.role !== 'seller') return <Navigate to="/login" replace />
  return <Outlet />
}
