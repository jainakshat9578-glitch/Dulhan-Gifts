import {createBrowserRouter} from "react-router"
import Register from "../features/auth/pages/Register"
import Login from "../features/auth/pages/Login"
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";

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
    }
])
