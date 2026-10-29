import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        products: [],
        productsLoading: true,
        productsError: null,
        selectedProduct: null,
        selectedProductId: null,
        productDetailsLoading: false,
        productDetailsError: null,
        productDetailsStatus: null
    },
    reducers:{
        setSellerProducts: (state,action)=>{
            state.sellerProducts = action.payload
        },
        setProducts: (state,action)=>{
            state.products = action.payload
            state.productsLoading = false
            state.productsError = null
        },
        setProductsLoading: (state, action)=>{
            state.productsLoading = action.payload
        },
        setProductsError: (state, action)=>{
            state.productsError = action.payload
            state.productsLoading = false
        },
        productDetailsRequested: (state, action) => {
            state.selectedProductId = action.payload
            state.selectedProduct = null
            state.productDetailsLoading = true
            state.productDetailsError = null
            state.productDetailsStatus = null
        },
        productDetailsReceived: (state, action) => {
            if (state.selectedProductId !== action.payload.productId) return
            state.selectedProduct = action.payload.product
            state.productDetailsLoading = false
        },
        productDetailsFailed: (state, action) => {
            if (state.selectedProductId !== action.payload.productId) return
            state.productDetailsLoading = false
            state.productDetailsError = action.payload.message
            state.productDetailsStatus = action.payload.status
        }
    }
})

export const {setSellerProducts,setProducts,setProductsLoading,setProductsError,productDetailsRequested,productDetailsReceived,productDetailsFailed} = productSlice.actions
export default productSlice.reducer
