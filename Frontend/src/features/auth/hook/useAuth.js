import { setUser } from "../state/auth.slice";
import { Login, forgotPassword, register, resetPassword } from "../service/auth.api";
import { useDispatch } from "react-redux";

export const useAuth = ()=>{

    const dispatch = useDispatch()

    async function handleRegister({email,contact,fullName,password}){
        const data = await register({email,contact,fullName,password})
        
        dispatch(setUser(data.user))
    }

    async function handleLogin({email,password}){
        const data = await Login({email,password})

        dispatch(setUser(data.user))
    }

    async function handleForgotPassword({ email }) {
        return forgotPassword({ email })
    }

    async function handleResetPassword({ token, password }) {
        return resetPassword({ token, password })
    }

    return {handleRegister,handleLogin,handleForgotPassword,handleResetPassword}
}
