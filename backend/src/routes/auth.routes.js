import {Router} from "express"
import {validateLoginUser, validateRegisterUser} from "../validators/auth.validator.js"
import { Login, register } from "../controllers/auth.controller.js"

const router = Router()

router.post("/register",validateRegisterUser,register)

router.post("/login",validateLoginUser,Login)

export default router