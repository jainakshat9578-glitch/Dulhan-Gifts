import {createBrowserRouter} from "react-router"
import Register from "../features/auth/pages/Register"
import Login from "../features/auth/pages/Login"
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import CreateProduct from "../features/products/pages/CreateProduct";
import SellerProducts from "../features/products/pages/SellerProducts";
import SellerRouteGuard from "../features/products/components/SellerRouteGuard";
import Protected from "../features/auth/components/Protected";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <h1>Hello World</h1>
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
         path: "/forgot-password",
        element: <ForgotPassword />
    },
    {
         path: "/reset-password/:token",
         element: <ResetPassword />
    },
    {
        element: <SellerRouteGuard />,
        children: [
            { path: "/seller/products", element: <Protected role="seller"> <SellerProducts /></Protected> },
            { path: "/seller/products/new", element: <Protected role="seller"> <CreateProduct /> </Protected>}
        ]
    }
])
