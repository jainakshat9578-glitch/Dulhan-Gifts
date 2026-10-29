import express from 'express'
import { authenticateSeller } from '../middlewares/auth.middleware.js'
import { createProduct, getAllProducts, getSellerProducts, getProductDetails, getSellerProductDetails, addProductVariant } from '../controllers/product.controller.js'
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

/**
 * @route GET /api/products/seller/:id
 * @description Get details for a product owned by the authenticated seller
 * @access Private (Seller only)
 */
router.get("/seller/:id", authenticateSeller, getSellerProductDetails)

/**
 * @route GET /api/products
 * @description Get all products
 * @access Public
 */
router.get("/",getAllProducts)

/**
 * @route GET /api/product/detail/:id
 * @description Get product details by ID
 * @access Public
 */
router.get("/detail/:id", getProductDetails)

/**
 * @route post /api/products/:productId/variants
 * @description Add a new variant to a product
 * @access Private (Seller Only)
 */
router.post("/:productId/variants", authenticateSeller, upload.array('images',7),createProductValidator,addProductVariant)

export default router
