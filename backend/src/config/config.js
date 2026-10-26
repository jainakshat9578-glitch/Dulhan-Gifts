import dotenv from "dotenv"
dotenv.config()

if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined in env")
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in env")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("GOOGLE_CLIENT_SECRET is not defiend in env")
}

if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("GOOGLE_CLIENT_ID is not defiend in env")
}

if (!process.env.GMAIL_REFRESH_TOKEN) {
  throw new Error("GMAIL_REFRESH_TOKEN is missing in .env");
}

if (!process.env.GMAIL_USER) {
  throw new Error("GMAIL_USER is missing in .env");
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN,
    GMAIL_USER: process.env.GMAIL_USER,
    NODE_ENV: process.env.NODE_ENV || "development"
}