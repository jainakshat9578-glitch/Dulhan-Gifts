import {Router} from "express"
import {validateLoginUser, validateRegisterUser} from "../validators/auth.validator.js"
import { googleCallback, Login, register } from "../controllers/auth.controller.js"
import passport from "passport"
import { config } from "../config/config.js"

const router = Router()

router.post("/register",validateRegisterUser,register)

router.post("/login",validateLoginUser,Login)

router.get("/google",passport.authenticate("google",{scope: ["profile", "email"]}))

router.get("/google/callback", 
    passport.authenticate("google",
        {session: false, 
            failureRedirect: config.NODE_ENV=="development" ? "http://localhost:5173/login" : "/login"}),
    // this is responsible for exchanging user data from Auth code
    googleCallback
)

export default router