import { useCallback } from "react";
import { createProduct,getSellerProducts } from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts } from "../state/product.slice";

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

   return {handleCreateProduct, handleGetSellerProduct}
}
