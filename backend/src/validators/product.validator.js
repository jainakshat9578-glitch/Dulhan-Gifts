import {body, validationResult} from "express-validator"

function validateRequest(req,res,next){
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: errors.array()
        })
    }
    next()
}

export const createProductValidator = [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("description is required"),
    body("category")
    .isIn([
        "Cosmetics",
        "Photo Frames",
        "Home Decor",
        "Stationery",
        "Undergarments",
        "Toys",
        "Birthday Decor",
        "Gifts",
        "Food"
    ])
    .withMessage("Invalid product category"),
    body("priceAmount").isFloat({gt:0}).withMessage("priceAmount is required and must be greater than zero").toFloat(),
    
    body("priceCurrency")
    .optional({ values: "falsy" })
    .isIn(["USD", "EUR", "GBP", "JPY", "INR"])
    .withMessage("Invalid currency"),

    validateRequest
]