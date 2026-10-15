import {body,validationResult} from "express-validator"

function validateRequest(req,res,next){
 
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        })
    }
    next()
}


export const validateRegisterUser = [
    body("email").isEmail().withMessage("Email is not valid"),
    body("contact").isLength({min: 10, max: 10}).withMessage("Contact number is not valid").matches(/^[0-9]+$/).withMessage("Contact number must be numeric"),
    // matches me jo regex hai wo ye check karega ki contact number me sirf numbers hi ho, aur koi letters ya special characters na ho
    body("password").isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
    body("fullName").isLength({min: 3, max: 100}).withMessage("Full name must be between 3 and 100 characters long"),

    validateRequest
]