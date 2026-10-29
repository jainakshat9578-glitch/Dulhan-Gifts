import {createBrowserRouter} from "react-router"
import Register from "../features/auth/pages/Register"
import Login from "../features/auth/pages/Login"
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import CreateProduct from "../features/products/pages/CreateProduct";
import SellerProducts from "../features/products/pages/SellerProducts";
import SellerRouteGuard from "../features/products/components/SellerRouteGuard";
import Protected from "../features/auth/components/Protected";
import Home from "../features/products/pages/Home";
import ProductDetails from "../features/products/pages/ProductDetails";
import SellerProductDetails from "../features/products/pages/SellerProductDetails";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home />
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
        path: "/product/:productId",
        element: <ProductDetails />
    },
    {
        element: <SellerRouteGuard />,
        children: [
            { 
                path: "/seller/products", 
                element: <Protected role="seller"> 
                              <SellerProducts />
                          </Protected> 
            },
            { 
                path: "/seller/products/new", 
                element: <Protected role="seller"> 
                             <CreateProduct /> 
                         </Protected>
            },
            {
                path: "/seller/product/:productId", 
                element: <Protected role="seller">
                          <SellerProductDetails />
                        </Protected>
                }
        ]
    }
])
