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


export const createVariantValidator = [
    body("priceAmount")
        .optional({ values: "falsy" })
        .isFloat({ gt: 0 })
        .withMessage("Variant price must be greater than zero")
        .toFloat(),

    body("priceCurrency")
        .optional({ values: "falsy" })
        .isIn(["USD", "EUR", "GBP", "JPY", "INR"])
        .withMessage("Invalid currency"),

    body("stock")
        .optional({ values: "falsy" })
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer")
        .toInt(),

    body("attributes")
        .optional({ values: "falsy" })
        .isString()
        .withMessage("Attributes must be a JSON string")
        .bail()
        .custom((value) => {
            let parsed;

            try {
                parsed = JSON.parse(value);
            } catch {
                throw new Error("Attributes must contain valid JSON");
            }

            if (
                parsed === null ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {
                throw new Error("Attributes must be a JSON object");
            }

            return true;
        }),

    validateRequest
];
