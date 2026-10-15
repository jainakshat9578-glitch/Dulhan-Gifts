import {Router} from "express"
import {validateRegisterUser} from "../validators/auth.validator.js"

const router = Router()

router.post("/register",validateRegisterUser)

export default router