import cookieParser from "cookie-parser"
import express from "express"
import morgan from "morgan"
import authRouter from "./routes/auth.routes.js"

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get("/",(req,res)=>{
    res.status(200).json({
        message: "server is running"
    })
})

app.use("/api/auth", authRouter)

export default app