
import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res, next) {
    try {
        const {
            title,
            description,
            category,
            priceAmount,
            priceCurrency
        } = req.body;

        const seller = req.user;

        // At least one image is required
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one product image is required."
            });
        }

        const images = await Promise.all(
            req.files.map(async (file) => {
                const result = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                });

                return {
                    url: result.url
                };
            })
        );

        const product = await productModel.create({
            title,
            description,
            category,
            price: {
                amount: Number(priceAmount),
                currency: priceCurrency || "INR"
            },
            images,
            seller: seller._id
        });

        return res.status(201).json({
            message: "Product created successfully",
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
}

export async function getSellerProducts(req, res, next) {
    try {
        const seller = req.user;

        const products = await productModel
            .find({ seller: seller._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            products
        });
    } catch (error) {
        next(error);
    }
}


export async function getAllProducts(req,res){
    const products = await productModel.find()

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getProductDetails(req,res){
    const {id} = req.params

    if (!/^[a-f\d]{24}$/i.test(id)) {
        return res.status(400).json({
            message: "Invalid product ID",
            success: false
        })
    }

    const product = await productModel.findById(id)

    if(!product){
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product
    })
}

export async function getSellerProductDetails(req, res, next) {
    try {
        const { id } = req.params;

        if (!/^[a-f\d]{24}$/i.test(id)) {
            return res.status(400).json({
                message: "Invalid product ID",
                success: false
            });
        }

        const product = await productModel.findOne({
            _id: id,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Product details fetched successfully",
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
}


export async function addProductVariant(req, res, next) {
    try {
        const { productId } = req.params;

        // 1. Validate product ID
        if (!/^[a-f\d]{24}$/i.test(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Find product owned by authenticated seller
        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 3. Upload variant images (if provided)
        const files = req.files || [];

        const images = await Promise.all(
            files.map(async (file) => {
                const result = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                });

                return {
                    url: result.url
                };
            })
        );

        // 4. Prepare variant data
        const priceAmount = req.body.priceAmount;
        const stock = req.body.stock;
        const attributes = req.body.attributes
            ? JSON.parse(req.body.attributes)
            : {};

        // 5. Add variant to product
        product.variants.push({
            images,
            price: {
                amount: priceAmount
                    ? Number(priceAmount)
                    : product.price.amount,

                currency: req.body.priceCurrency
                    || product.price.currency
            },
            stock: stock !== undefined && stock !== ""
                ? Number(stock)
                : 0,
            attributes
        });

        // 6. Save updated product
        await product.save();

        return res.status(201).json({
            message: "Product variant added successfully",
            success: true,
            product
        });

    } catch (error) {
        next(error);
    }
}
