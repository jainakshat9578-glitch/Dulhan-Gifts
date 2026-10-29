
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

export async function addProductVariant(req,res){

    const productId = req.params.productId

    const product = await productModel.findOne({
        _id: productId,
        seller: req.user._id
    })

    if(!product){
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }
    
    const files = req.files

    const images = []
    if(files || files.length !== 0){
        (await Promise.all(files.map(async(file)=>{
            const image = await uploadFile({
               buffer: file.buffer,
               fileName: file.originalname 
            })
            return image
        }))).map(image => images.push(image))
    }

    const price = req.body.priceAmount
    const stock = req.body.stock
    const attributes = JSON.parse(req.body.attributes || "{}")
}