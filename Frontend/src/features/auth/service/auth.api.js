import axios from "axios"

const authApiInstance = axios.create({
    baseURL: "/api/auth",
    withCredentials: true
})

export async function register({email,contact,password,fullName}){
    const response = await authApiInstance.post("/register",{
        email,
        contact,
        password,
        fullName,
        
    })
    return response.data
}


export async function Login({email,password}){
    const response = await authApiInstance.post("/login",{
        email,
        password
    })
    return response.data
}