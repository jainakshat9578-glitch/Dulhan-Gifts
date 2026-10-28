import express from 'express'
import { authenticateSeller } from '../middlewares/auth.middleware.js'
import { createProduct, getSellerProducts } from '../controllers/product.controller.js'
import multer from "multer"
import { createProductValidator } from '../validators/product.validator.js'


const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB per image
        files: 7
    },

    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, and WebP images are allowed."));
        }
    }
});


const router = express.Router()

/**
 * @route POST /api/products
 * @description create a new product
 * @access Private (Seller only)
 */
router.post("/", authenticateSeller, upload.array('images',7),createProductValidator ,createProduct)

/**
 * @route GET /api/products/seller
 * @description Get all products of authenticate seller
 * @access Private (Seller only)
 */
router.get("/seller", authenticateSeller, getSellerProducts)

export default router
