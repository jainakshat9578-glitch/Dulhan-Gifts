
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
