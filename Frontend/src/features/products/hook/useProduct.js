import { useCallback } from "react";
import { createProduct,getSellerProducts, getAllProducts, getProductById, getSellerProductById, } from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts, setProducts, setProductsLoading, setProductsError, productDetailsRequested, productDetailsReceived, productDetailsFailed } from "../state/product.slice";

export function filterSellerProducts(products, category) {
    if (category === "All Products") return products
    return products.filter((product) => product.category === category)
}

export const useProduct = ()=>{

    const dispatch = useDispatch()

   const handleCreateProduct = useCallback(async ({ title, description, category, priceAmount, priceCurrency, images }) => {
    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('category', category)
    formData.append('priceAmount', priceAmount)
    formData.append('priceCurrency', priceCurrency)
    images.forEach((image) => formData.append('images', image))
    const data = await createProduct(formData)
    return data.product
   }, [])

   const handleGetSellerProduct = useCallback(async () => {
    const data = await getSellerProducts()
     
    dispatch(setSellerProducts(data.products))
    return data.products
    
   }, [dispatch])

   const handleGetAllProducts = useCallback(async () => {
    dispatch(setProductsLoading(true))
    dispatch(setProductsError(null))
    try {
      const data = await getAllProducts()
      dispatch(setProducts(data.products))
      return data.products
    } catch (error) {
      dispatch(setProductsError(error.response?.data?.message || 'We could not load the collection. Please try again.'))
      return null
    }
   }, [dispatch])

   const handleGetProductById = useCallback(async (productId) => {
    dispatch(productDetailsRequested(productId))
    try {
      if (!productId || !/^[a-f\d]{24}$/i.test(productId)) {
        const error = new Error('This product link is invalid. Please return to the collection and choose a product.')
        error.status = 400
        throw error
      }
      const data = await getProductById(productId)
      if (data?.success !== true || !data.product || String(data.product._id).toLowerCase() !== productId.toLowerCase()) {
        const error = new Error('The product response was incomplete. Please try again.')
        error.status = 502
        throw error
      }
      dispatch(productDetailsReceived({ productId, product: data.product }))
      return data.product
    } catch (error) {
      dispatch(productDetailsFailed({
        productId,
        status: error.status || error.response?.status || null,
        message: error.response?.data?.message || error.message || 'We could not load this product. Please try again.'
      }))
      return null
    }
   }, [dispatch])

   const handleGetSellerProductById = useCallback(async (productId) => {
    dispatch(productDetailsRequested(productId))
    try {
      if (!productId || !/^[a-f\d]{24}$/i.test(productId)) {
        const error = new Error('This product link is invalid. Please return to My products and choose a product.')
        error.status = 400
        throw error
      }
      const data = await getSellerProductById(productId)
      if (data?.success !== true || !data.product || String(data.product._id).toLowerCase() !== productId.toLowerCase()) {
        const error = new Error('The product response was incomplete. Please try again.')
        error.status = 502
        throw error
      }
      dispatch(productDetailsReceived({ productId, product: data.product }))
      return data.product
    } catch (error) {
      dispatch(productDetailsFailed({
        productId,
        status: error.status || error.response?.status || null,
        message: error.response?.data?.message || error.message || 'We could not load this product. Please try again.'
      }))
      return null
    }
   }, [dispatch])

   return {handleCreateProduct, handleGetSellerProduct, handleGetAllProducts, handleGetProductById, handleGetSellerProductById}
}
