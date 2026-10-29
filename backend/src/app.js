import cookieParser from "cookie-parser"
import express from "express"
import morgan from "morgan"
import authRouter from "./routes/auth.routes.js"
import productRouter from "./routes/product.routes.js"
import cors from "cors"
import passport from "passport"
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import { config } from "./config/config.js"
import multer from "multer";

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true
}))

app.use(passport.initialize())

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},(accessToken, refreshToken, profile, done)=>{
   return done(null,profile)
}))

app.get("/",(req,res)=>{
    res.status(200).json({
        message: "server is running"
    })
})

app.use("/api/auth", authRouter)
app.use("/api/products", productRouter)

app.use((err, req, res, next) => {
    console.error(err);

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                success: false,
                message: "Each image must be 5 MB or smaller."
            });
        }

        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Maximum 7 images are allowed."
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err.message === "Only JPEG, PNG, and WebP images are allowed.") {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});


export default app
