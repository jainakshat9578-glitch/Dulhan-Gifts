import axios from "axios"

const authApiInstance = axios.create({
    baseURL: "/api/auth",
    withCredentials: true
})

export async function register({email,contact,password,fullName}){
    try {
        const response = await authApiInstance.post("/register",{
            email,
            contact,
            password,
            fullName,
        })
        return response.data
    } catch (error) {
        const responseData = error.response?.data
        const validationMessages = Array.isArray(responseData?.errors)
            ? responseData.errors.map(({ msg }) => msg).filter(Boolean)
            : []
        const message = validationMessages.length
            ? validationMessages.join(" ")
            : responseData?.message

        throw new Error(message || "Unable to create your account right now. Please try again.", { cause: error })
    }
}


export async function Login({email,password}){
    const response = await authApiInstance.post("/login",{
        email,
        password
    })
    return response.data
}


export async function forgotPassword({ email }) {
    const response = await authApiInstance.post("/forgot-password", {
        email
    });

    return response.data;
}

export async function resetPassword({ token, password }) {
    const response = await authApiInstance.post(
        `/reset-password/${encodeURIComponent(token)}`,
        { password }
    );

    return response.data;
}
