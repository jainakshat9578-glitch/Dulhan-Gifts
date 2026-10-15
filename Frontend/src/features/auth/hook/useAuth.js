import { setError,setLoading,setUser } from "../state/auth.slice";
import { Login, register } from "../service/auth.api";
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

    return {handleRegister,handleLogin}
}